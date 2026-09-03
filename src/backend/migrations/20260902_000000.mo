import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";

module {
  type UserRole = {
    #admin;
    #user;
    #guest;
  };

  type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  type FaultSource = {
    #injected;
    #detected;
  };

  type Severity = {
    #low;
    #medium;
    #high;
    #critical;
  };

  type FaultRecord = {
    id : Nat;
    timestamp : Int;
    faultType : Text;
    severity : Severity;
    maintenanceRecommendation : Text;
    source : FaultSource;
  };

  type MissionPhase = {
    #preLaunch;
    #launch;
    #ascent;
    #orbit;
    #reentry;
    #landing;
    #postLanding;
  };

  type MissionStatus = {
    #nominal;
    #degraded;
    #critical;
    #aborted;
  };

  type RiskLevel = {
    #low;
    #medium;
    #high;
    #critical;
  };

  type MissionState = {
    currentPhase : MissionPhase;
    status : MissionStatus;
    riskLevel : RiskLevel;
  };

  type HealthSnapshot = {
    timestamp : Int;
    healthScore : Float;
    rul : Float;
    predictedFault : ?Text;
    confidence : Float;
  };

  type EngineState = {
    var nextFaultId : Nat;
    faults : List.List<FaultRecord>;
    var missionState : ?MissionState;
    healthHistory : List.List<HealthSnapshot>;
    var latestHealth : ?HealthSnapshot;
  };

  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControlState;
    engineState : EngineState;
  };

  public func migration(_old : OldActor) : NewActor {
    {
      accessControlState = {
        var adminAssigned = false;
        userRoles = Map.empty();
      };
      engineState = {
        var nextFaultId = 0;
        faults = List.empty();
        var missionState = null;
        healthHistory = List.empty();
        var latestHealth = null;
      };
    };
  };
};
