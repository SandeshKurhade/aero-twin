import { PocketIc, createIdentity } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";
// Set only on a converted project: the last pre-EM revision, whose schema this
// app's migration chain replays from. Installing the current wasm onto an empty
// canister there traps IC0503 before any test runs.
const BASELINE_WASM = process.env.BACKEND_WASM_BASELINE;

// Deterministic identities used as callers. The engine persistence methods are
// guarded by access control, so the caller must hold the `#user` role.
const operator = createIdentity("engine-operator");
const stranger = createIdentity("engine-stranger");

let pic: PocketIc | undefined;
let actor: _SERVICE;

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  if (BASELINE_WASM === undefined) {
    ({ actor } = await pic.setupCanister<_SERVICE>({ idlFactory, wasm: BACKEND_WASM }));
    return;
  }
  // `[baseline, current]`, the same install contract the hosted deploy uses for
  // a converted project. The upgrade replays the chain from the legacy schema.
  const installed = await pic.setupCanister<_SERVICE>({ idlFactory, wasm: BASELINE_WASM });
  await pic.upgradeCanister({ canisterId: installed.canisterId, wasm: BACKEND_WASM, arg: new Uint8Array() });
  actor = installed.actor;
});

afterAll(async () => {
  // `?.` because `beforeAll` may not have got that far. A failed
  // `PocketIc.create` otherwise stacks "Cannot read properties of undefined"
  // on top of the real error and buries the one line that explains the run.
  await pic?.tearDown();
});

// Promote the operator to admin. Admin holds the user role, so the engine
// persistence methods become callable. (Assigning the user role explicitly
// would overwrite the admin role, after which only admins may assign roles.)
async function grantUserRole() {
  actor.setIdentity(operator);
  await actor._initialize_access_control();
}

it("answers an empty-state read instead of trapping", async () => {
  await grantUserRole();
  await expect(actor.getFaults()).resolves.toEqual([]);
  await expect(actor.getHealthHistory()).resolves.toEqual([]);
  await expect(actor.getMissionState()).resolves.toEqual([]);
  await expect(actor.getLatestHealth()).resolves.toEqual([]);
});

it("round-trips a fault through the real canister", async () => {
  await grantUserRole();
  await actor.recordFault({
    id: 0n,
    timestamp: 1_700_000_000_000_000_000n,
    faultType: "Overheating",
    severity: { high: null },
    maintenanceRecommendation: "Inspect the cooling system.",
    source: { injected: null },
  });
  const faults = await actor.getFaults();
  expect(faults).toHaveLength(1);
  expect(faults[0]).toMatchObject({ faultType: "Overheating" });
});

it("round-trips a mission state through the real canister", async () => {
  await grantUserRole();
  await actor.setMissionState({
    currentPhase: { orbit: null },
    status: { nominal: null },
    riskLevel: { low: null },
  });
  const state = await actor.getMissionState();
  expect(state).toEqual([
    { currentPhase: { orbit: null }, status: { nominal: null }, riskLevel: { low: null } },
  ]);
});

it("round-trips a health snapshot through the real canister", async () => {
  await grantUserRole();
  await actor.recordHealthSnapshot({
    timestamp: 1_700_000_000_000_000_000n,
    healthScore: 92.5,
    rul: 830.0,
    predictedFault: ["Normal"],
    confidence: 0.92,
  });
  const history = await actor.getHealthHistory();
  expect(history).toHaveLength(1);
  expect(history[0]).toMatchObject({ healthScore: 92.5, rul: 830.0 });
  const latest = await actor.getLatestHealth();
  expect(latest).toEqual([history[0]]);
});

it("rejects a caller without the user role", async () => {
  actor.setIdentity(stranger);
  await expect(actor.getFaults()).rejects.toThrow();
});
