import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/engine";
import EngineLib "../lib/engine";

mixin (
  accessControlState : AccessControl.AccessControlState,
  engineState : Types.EngineState,
) {
  public shared ({ caller }) func recordFault(fault : Types.FaultRecord) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can record faults");
    };
    EngineLib.recordFault(engineState, fault);
  };

  public query ({ caller }) func getFaults() : async [Types.FaultRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view faults");
    };
    EngineLib.getFaults(engineState)
  };

  public shared ({ caller }) func setMissionState(state : Types.MissionState) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can set mission state");
    };
    EngineLib.setMissionState(engineState, state);
  };

  public query ({ caller }) func getMissionState() : async ?Types.MissionState {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view mission state");
    };
    EngineLib.getMissionState(engineState)
  };

  public shared ({ caller }) func recordHealthSnapshot(snapshot : Types.HealthSnapshot) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can record health snapshots");
    };
    EngineLib.recordHealthSnapshot(engineState, snapshot);
  };

  public query ({ caller }) func getHealthHistory() : async [Types.HealthSnapshot] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view health history");
    };
    EngineLib.getHealthHistory(engineState)
  };

  public query ({ caller }) func getLatestHealth() : async ?Types.HealthSnapshot {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view health");
    };
    EngineLib.getLatestHealth(engineState)
  };
};
