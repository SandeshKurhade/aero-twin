// ---------------------------------------------------------------------------
// Backend persistence types — mirror the Motoko candid contract (types/engine.mo)
// ---------------------------------------------------------------------------

export type MissionPhase =
  | { __kind__: "preLaunch" }
  | { __kind__: "launch" }
  | { __kind__: "ascent" }
  | { __kind__: "orbit" }
  | { __kind__: "reentry" }
  | { __kind__: "landing" }
  | { __kind__: "postLanding" };

export type MissionStatus =
  | { __kind__: "nominal" }
  | { __kind__: "degraded" }
  | { __kind__: "critical" }
  | { __kind__: "aborted" };

export type RiskLevel =
  | { __kind__: "low" }
  | { __kind__: "medium" }
  | { __kind__: "high" }
  | { __kind__: "critical" };

export type Severity =
  | { __kind__: "low" }
  | { __kind__: "medium" }
  | { __kind__: "high" }
  | { __kind__: "critical" };

export type FaultSource = { __kind__: "injected" } | { __kind__: "detected" };

export interface FaultRecord {
  id: bigint;
  timestamp: bigint;
  faultType: string;
  severity: Severity;
  maintenanceRecommendation: string;
  source: FaultSource;
}

export interface MissionState {
  currentPhase: MissionPhase;
  status: MissionStatus;
  riskLevel: RiskLevel;
}

export interface HealthSnapshot {
  timestamp: bigint;
  healthScore: number;
  rul: number;
  predictedFault: string | null;
  confidence: number;
}

// ---------------------------------------------------------------------------
// UI simulation types
// ---------------------------------------------------------------------------

export type SensorKey =
  | "rpm"
  | "engineLoad"
  | "cht"
  | "egt"
  | "oilPressure"
  | "oilTemp"
  | "vibration"
  | "fuelFlow"
  | "boostPressure"
  | "coolantTemp";

export interface SensorDef {
  key: SensorKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  nominal: number;
  cautionHigh: number;
  criticalHigh: number;
  cautionLow?: number;
  criticalLow?: number;
  decimals: number;
}

export type ReadingStatus = "nominal" | "caution" | "critical";

export interface SensorReading {
  key: SensorKey;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  nominal: number;
  status: ReadingStatus;
  decimals: number;
}

export type FaultType =
  | "Normal"
  | "Overheating"
  | "Low Oil Pressure"
  | "Excessive Vibration"
  | "Injector/Fuel Fault"
  | "Cooling Fault"
  | "Bearing/Mechanical Fault"
  | "EGT Anomaly"
  | "Turbo/Boost Fault";

export type FaultKey =
  | "overheating"
  | "lowOilPressure"
  | "excessiveVibration"
  | "injectorFuel"
  | "cooling"
  | "bearingMechanical"
  | "egtAnomaly"
  | "turboBoost";

export type FaultInjection = Record<FaultKey, boolean>;

export interface Anomaly {
  sensor: SensorKey;
  label: string;
  value: number;
  nominal: number;
  score: number;
  severity: "caution" | "critical";
}

export interface HealthResult {
  healthScore: number;
  predictedFault: FaultType;
  confidence: number;
  rul: number;
}

export interface TelemetryPoint {
  t: number;
  rpm: number;
  cht: number;
  egt: number;
  oilTemp: number;
  vibration: number;
  fuelFlow: number;
}
