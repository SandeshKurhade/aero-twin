import List "mo:core/List";

module {
  public type Timestamp = Int;

  public type FaultSource = {
    #injected;
    #detected;
  };

  public type Severity = {
    #low;
    #medium;
    #high;
    #critical;
  };

  public type FaultRecord = {
    id : Nat;
    timestamp : Timestamp;
    faultType : Text;
    severity : Severity;
    maintenanceRecommendation : Text;
    source : FaultSource;
  };

  public type MissionPhase = {
    #preLaunch;
    #launch;
    #ascent;
    #orbit;
    #reentry;
    #landing;
    #postLanding;
  };

  public type MissionStatus = {
    #nominal;
    #degraded;
    #critical;
    #aborted;
  };

  public type RiskLevel = {
    #low;
    #medium;
    #high;
    #critical;
  };

  public type MissionState = {
    currentPhase : MissionPhase;
    status : MissionStatus;
    riskLevel : RiskLevel;
  };

  public type HealthSnapshot = {
    timestamp : Timestamp;
    healthScore : Float;
    rul : Float;
    predictedFault : ?Text;
    confidence : Float;
  };

  public type EngineState = {
    var nextFaultId : Nat;
    faults : List.List<FaultRecord>;
    var missionState : ?MissionState;
    healthHistory : List.List<HealthSnapshot>;
    var latestHealth : ?HealthSnapshot;
  };
};
