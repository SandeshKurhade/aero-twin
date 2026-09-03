import Types "../types/engine";

module {
  public func recordFault(state : Types.EngineState, fault : Types.FaultRecord) {
    let record = { fault with id = state.nextFaultId };
    state.nextFaultId += 1;
    state.faults.add(record);
  };

  public func getFaults(state : Types.EngineState) : [Types.FaultRecord] {
    state.faults.toArray()
  };

  public func setMissionState(state : Types.EngineState, mission : Types.MissionState) {
    state.missionState := ?mission;
  };

  public func getMissionState(state : Types.EngineState) : ?Types.MissionState {
    state.missionState
  };

  public func recordHealthSnapshot(state : Types.EngineState, snapshot : Types.HealthSnapshot) {
    state.healthHistory.add(snapshot);
    state.latestHealth := ?snapshot;
  };

  public func getHealthHistory(state : Types.EngineState) : [Types.HealthSnapshot] {
    state.healthHistory.toArray()
  };

  public func getLatestHealth(state : Types.EngineState) : ?Types.HealthSnapshot {
    state.latestHealth
  };
};
