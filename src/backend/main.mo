import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import ListEntity "mo:caffeineai-oql/ListEntity";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import FloatValue "mo:caffeineai-oql/FloatValue";
import Iter "mo:core/Iter";
import Types "types/engine";
import EngineApi "mixins/engine-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let engineState : Types.EngineState;

  func severityToText(s : Types.Severity) : Text {
    switch (s) {
      case (#low) "low";
      case (#medium) "medium";
      case (#high) "high";
      case (#critical) "critical";
    };
  };

  func sourceToText(s : Types.FaultSource) : Text {
    switch (s) {
      case (#injected) "injected";
      case (#detected) "detected";
    };
  };

  func phaseToText(p : Types.MissionPhase) : Text {
    switch (p) {
      case (#preLaunch) "preLaunch";
      case (#launch) "launch";
      case (#ascent) "ascent";
      case (#orbit) "orbit";
      case (#reentry) "reentry";
      case (#landing) "landing";
      case (#postLanding) "postLanding";
    };
  };

  func statusToText(s : Types.MissionStatus) : Text {
    switch (s) {
      case (#nominal) "nominal";
      case (#degraded) "degraded";
      case (#critical) "critical";
      case (#aborted) "aborted";
    };
  };

  func riskToText(r : Types.RiskLevel) : Text {
    switch (r) {
      case (#low) "low";
      case (#medium) "medium";
      case (#high) "high";
      case (#critical) "critical";
    };
  };

  func optText(o : ?Text) : Text {
    switch (o) {
      case null "";
      case (?t) t;
    };
  };

  func missionIter() : Iter.Iter<Types.MissionState> {
    switch (engineState.missionState) {
      case (?m) { [m].values() };
      case null { ([] : [Types.MissionState]).values() };
    };
  };

  include MixinAuthorization(accessControlState, null);
  include EngineApi(accessControlState, engineState);
  include ApiDocMixin();
  include Expose({
    entities = [
      engineState.faults.toEntityManual("fault", "FaultRecord", "id")
        .sample({ id = 0; timestamp = 0; faultType = ""; severity = #low; maintenanceRecommendation = ""; source = #injected })
        .payload("id", func f = f.id)
        .payload("timestamp", func f = f.timestamp)
        .payload("faultType", func f = f.faultType)
        .payload("severity", func f = severityToText(f.severity))
        .payload("maintenanceRecommendation", func f = f.maintenanceRecommendation)
        .payload("source", func f = sourceToText(f.source))
        .controllerOnly()
        .build(),
      engineState.healthHistory.toEntityManual("health", "HealthSnapshot", "timestamp")
        .sample({ timestamp = 0; healthScore = 0.0; rul = 0.0; predictedFault = null; confidence = 0.0 })
        .payload("timestamp", func h = h.timestamp)
        .payload("healthScore", func h = h.healthScore)
        .payload("rul", func h = h.rul)
        .payload("predictedFault", func h = optText(h.predictedFault))
        .payload("confidence", func h = h.confidence)
        .controllerOnly()
        .build(),
      OQL.Entity.manual<Types.MissionState>("mission", missionIter, "MissionState", "id")
        .sample({ currentPhase = #preLaunch; status = #nominal; riskLevel = #low })
        .payload("id", func m = 0)
        .payload("currentPhase", func m = phaseToText(m.currentPhase))
        .payload("status", func m = statusToText(m.status))
        .payload("riskLevel", func m = riskToText(m.riskLevel))
        .controllerOnly()
        .build(),
    ];
  });
};
