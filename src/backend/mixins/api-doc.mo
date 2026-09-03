mixin () {
  public query func getApiDoc() : async Text {
    "# Engine Telemetry Backend API

## Purpose

The Engine Telemetry backend is a Motoko canister that records and serves
synthetic aerospace engine telemetry for a dark dashboard demo. It stores
fault records, mission state, and health snapshots, and exposes them both
through typed public methods and through the OQL (Object Query Layer) query
endpoint so the Caffeine Data Intelligence agent can answer natural-language
questions over the stored data.

All data is synthetic/demo data and is labeled as such in the UI.

## Public Methods

### Authentication and registration

- `_internet_identity_sign_in_start : () -> async Blob`
  Issues a challenge blob used by the Internet Identity sign-in flow. No
  authorization required.

- `_internet_identity_sign_in_finish : () -> async Result<(), Verify.Error>`
  Completes an Internet Identity sign-in and registers the caller. The first
  caller to register becomes `#admin`; every subsequent caller becomes `#user`.
  Returns `#ok` on success or `#err` with a verification error.

- `_initialize_access_control : () -> async ()`
  Registers the signed-in caller directly (no II challenge). The first caller
  to register becomes `#admin`; every subsequent caller becomes `#user`.
  Anonymous callers are ignored. Call this once as a signed-in caller before
  any role-guarded call (guarded queries included).

- `getCallerUserRole : () -> async UserRole`
  Returns the caller's role: `#admin`, `#user`, or `#guest`. Anonymous callers
  always get `#guest`. A signed-in caller who has never registered traps with
  `\"User is not registered\"`.

- `assignCallerUserRole : (user : Principal, role : UserRole) -> async ()`
  Assigns a role to another principal. Admin-only; a non-admin caller traps
  with `\"Unauthorized: Only admins can assign user roles\"`.

- `isCallerAdmin : () -> async Bool`
  Returns whether the caller is `#admin`.

### Engine telemetry

- `recordFault : (fault : FaultRecord) -> async ()`
  Records a fault. Requires a signed-in caller with role `#user` or `#admin`;
  otherwise traps with `\"Unauthorized: Only users can record faults\"`. The
  backend assigns the fault's `id` (the provided `id` is ignored).

- `getFaults : () -> async [FaultRecord]`
  Returns all recorded faults in insertion order. Requires `#user` or `#admin`;
  otherwise traps with `\"Unauthorized: Only users can view faults\"`.

- `setMissionState : (state : MissionState) -> async ()`
  Sets the current mission state. Requires `#user` or `#admin`; otherwise traps
  with `\"Unauthorized: Only users can set mission state\"`.

- `getMissionState : () -> async ?MissionState`
  Returns the current mission state, or `null` if none has been set. Requires
  `#user` or `#admin`; otherwise traps with `\"Unauthorized: Only users can view
  mission state\"`.

- `recordHealthSnapshot : (snapshot : HealthSnapshot) -> async ()`
  Appends a health snapshot to the history and makes it the latest. Requires
  `#user` or `#admin`; otherwise traps with `\"Unauthorized: Only users can
  record health snapshots\"`.

- `getHealthHistory : () -> async [HealthSnapshot]`
  Returns all health snapshots in insertion order. Requires `#user` or
  `#admin`; otherwise traps with `\"Unauthorized: Only users can view health
  history\"`.

- `getLatestHealth : () -> async ?HealthSnapshot`
  Returns the most recently recorded health snapshot, or `null` if none has
  been recorded. Requires `#user` or `#admin`; otherwise traps with
  `\"Unauthorized: Only users can view health\"`.

### OQL querying

- `schema : () -> async Text`
  Returns the OQL schema describing the queryable entities. Controller-only
  entities are readable by the platform controller (the Data Intelligence
  agent) but not by end users.

- `execute : (qJson : Text) -> async Result`
  Executes an OQL query against the exposed entities. See the OQL schema for
  the available tables, fields, and query forms.

## Authentication and Authorization

Every public method that reads or writes engine data requires a signed-in
(non-anonymous) caller with role `#user` or `#admin`. Anonymous callers are
treated as `#guest` and are rejected by every role-guarded endpoint with the
trap messages quoted above. Admins pass every `#user` guard.

The app's frontend pins an Internet Identity derivation origin, published at
`/.well-known/ii-derivation-origin` when available. An agent already holding
the user's Internet Identity authorization derives the correct per-app
principal against that origin (for example
`icp identity link web <name> --app <host>`). Such a delegation acts with the
user's full authority in this app until it expires.

### Registration prerequisite

Access is gated on registration. A direct API caller must register before any
role-guarded call (guarded queries included) by calling
`_initialize_access_control` once as a signed-in caller (or by completing an
Internet Identity sign-in through `_internet_identity_sign_in_finish`). The
first caller to register receives `#admin`; every subsequent caller receives
`#user`. An unregistered or anonymous caller on a guarded endpoint traps with
the messages quoted above.

A caller can be unregistered even when the app already knows it: registration
happens only when a caller signs in through the app's own frontend, so a
principal that never did so is unregistered even when it belongs to the app's
owner. A signed-in caller derived against a different origin is a different
principal than the one the frontend registered.

## Units and Encodings

- `Timestamp : Int` — nanoseconds since the Unix epoch (the `Time.now()`
  convention).
- `FaultRecord.id : Nat` — assigned by the backend on `recordFault`; the value
  passed in is ignored.
- `FaultRecord.timestamp : Timestamp` — nanoseconds since epoch.
- `FaultRecord.severity : Severity` — variant `#low`, `#medium`, `#high`, or
  `#critical`.
- `FaultRecord.source : FaultSource` — variant `#injected` (synthetic/demo
  fault) or `#detected`.
- `HealthSnapshot.healthScore`, `rul`, `confidence : Float` — fractional values
  in the `0.0` to `1.0` range (health score, remaining useful life, and
  prediction confidence).
- `HealthSnapshot.predictedFault : ?Text` — optional predicted fault type;
  `null` when no fault is predicted.
- `MissionState.currentPhase : MissionPhase` — variant `#preLaunch`, `#launch`,
  `#ascent`, `#orbit`, `#reentry`, `#landing`, or `#postLanding`.
- `MissionState.status : MissionStatus` — variant `#nominal`, `#degraded`,
  `#critical`, or `#aborted`.
- `MissionState.riskLevel : RiskLevel` — variant `#low`, `#medium`, `#high`, or
  `#critical`.

## Lifecycle and Polling

- `getLatestHealth` returns the most recently recorded snapshot; poll it for
  the current health reading. `getHealthHistory` returns the full history in
  insertion order.
- `getMissionState` returns `null` until `setMissionState` has been called at
  least once.
- `getFaults` returns an empty array until the first `recordFault`.

## Mutation Retry Safety

- `recordFault` is **not** idempotent: each call appends a new fault record
  with a fresh backend-assigned `id`. Re-sending the same fault creates a
  duplicate.
- `setMissionState` is idempotent: the last write wins; re-sending the same
  state is harmless.
- `recordHealthSnapshot` is **not** idempotent: each call appends a new
  snapshot to the history and updates the latest. Re-sending the same snapshot
  creates a duplicate history entry.

## Errors, Traps, and Limits

- Authorization failures trap (reject) with the exact messages quoted above;
  they do not return error values.
- `getCallerUserRole` traps with `\"User is not registered\"` for a signed-in
  caller who has never registered.
- `assignCallerUserRole` traps with `\"Unauthorized: Only admins can assign
  user roles\"` for non-admin callers.
- OQL entities are `controllerOnly`: the platform controller (Data
  Intelligence agent) can read them, but end users cannot query them through
  `execute`.
- There is no pagination on `getFaults` or `getHealthHistory`; very large
  histories are returned in full."
  };
};
