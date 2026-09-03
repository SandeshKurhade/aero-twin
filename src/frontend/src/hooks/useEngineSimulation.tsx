import {
  EMPTY_FAULTS,
  FAULT_LABEL,
  MISSION_PHASES,
  PHASE_LABEL,
  SENSOR_DEFS,
  SENSOR_MAP,
  classifyFault,
  computeHealth,
  detectAnomalies,
  generateReadings,
  healthColor,
} from "@/lib/simulation";
import type {
  Anomaly,
  FaultInjection,
  FaultKey,
  FaultRecord,
  HealthResult,
  MissionPhase,
  MissionState,
  SensorKey,
  SensorReading,
} from "@/lib/types";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface EngineSimulation {
  sensors: Record<SensorKey, number>;
  readings: SensorReading[];
  health: HealthResult;
  anomalies: Anomaly[];
  activeFaults: FaultRecord[];
  faults: FaultInjection;
  missionPhase: MissionPhase;
  missionState: MissionState;
  running: boolean;
  injectFault: (fault: FaultKey) => void;
  clearFaults: () => void;
  setMissionPhase: (phase: MissionPhase) => void;
  toggleRunning: () => void;
}

const TICK_MS = 1000;

const MAINTENANCE: Record<FaultKey, string> = {
  overheating:
    "Reduce throttle and inspect the cooling system, cylinder head gasket and coolant level.",
  lowOilPressure:
    "Land at the nearest suitable field. Check oil level and inspect the oil pump and pressure relief valve.",
  excessiveVibration:
    "Reduce RPM. Inspect engine mounts, propeller balance and main/rod bearings.",
  injectorFuel:
    "Check fuel injectors and fuel rail pressure; clean or replace suspect injectors.",
  cooling:
    "Inspect the radiator, coolant level and water pump for leaks or blockage.",
  bearingMechanical:
    "Inspect main and rod bearings; check oil for metallic contamination.",
  egtAnomaly:
    "Check the exhaust system for leaks and verify EGT sensor calibration.",
  turboBoost: "Inspect the turbocharger wastegate and boost control system.",
};

const EngineSimulationContext = createContext<EngineSimulation | null>(null);

export function EngineSimulationProvider({
  children,
}: { children: ReactNode }) {
  const [missionPhase, setMissionPhaseState] = useState<MissionPhase>({
    __kind__: "orbit",
  });
  const [faults, setFaults] = useState<FaultInjection>(EMPTY_FAULTS);
  const [running, setRunning] = useState(true);
  const [tick, setTick] = useState(0);
  const [readings, setReadings] = useState<SensorReading[]>(() =>
    generateReadings({ __kind__: "orbit" }, EMPTY_FAULTS, 0),
  );
  const [health, setHealth] = useState<HealthResult>({
    healthScore: 100,
    predictedFault: "Normal",
    confidence: 0.92,
    rul: 900,
  });
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [activeFaults, setActiveFaults] = useState<FaultRecord[]>([]);
  const healthRef = useRef(100);

  // Simulation clock — only advances while the engine is running.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [running]);

  // Full detection chain: sensor change -> anomaly -> AI classify -> health/RUL.
  useEffect(() => {
    const next = generateReadings(missionPhase, faults, tick);
    setReadings(next);
    const nextAnomalies = detectAnomalies(next);
    setAnomalies(nextAnomalies);
    const { predictedFault, confidence } = classifyFault(next);
    const nextHealth = computeHealth(
      healthRef.current,
      faults,
      nextAnomalies,
      predictedFault,
      confidence,
    );
    healthRef.current = nextHealth.healthScore;
    setHealth(nextHealth);
  }, [tick, missionPhase, faults]);

  // Derive active fault records (injected) with maintenance recommendations.
  useEffect(() => {
    const now = BigInt(Date.now()) * 1_000_000n;
    const records: FaultRecord[] = (Object.keys(faults) as FaultKey[])
      .filter((k) => faults[k])
      .map((k, i) => ({
        id: BigInt(i + 1),
        timestamp: now,
        faultType: FAULT_LABEL[k],
        severity: { __kind__: "high" },
        maintenanceRecommendation: MAINTENANCE[k],
        source: { __kind__: "injected" },
      }));
    setActiveFaults(records);
  }, [faults]);

  const sensors = Object.fromEntries(
    readings.map((r) => [r.key, r.value]),
  ) as Record<SensorKey, number>;

  const injectFault = useCallback((fault: FaultKey) => {
    setFaults((prev) => ({ ...prev, [fault]: true }));
  }, []);

  const clearFaults = useCallback(() => {
    setFaults(EMPTY_FAULTS);
  }, []);

  const setMissionPhase = useCallback((phase: MissionPhase) => {
    setMissionPhaseState(phase);
  }, []);

  const toggleRunning = useCallback(() => {
    setRunning((r) => !r);
  }, []);

  const missionState: MissionState = {
    currentPhase: missionPhase,
    status:
      health.healthScore >= 80
        ? { __kind__: "nominal" }
        : health.healthScore >= 55
          ? { __kind__: "degraded" }
          : { __kind__: "critical" },
    riskLevel:
      health.healthScore >= 80
        ? { __kind__: "low" }
        : health.healthScore >= 55
          ? { __kind__: "medium" }
          : { __kind__: "high" },
  };

  const value: EngineSimulation = {
    sensors,
    readings,
    health,
    anomalies,
    activeFaults,
    faults,
    missionPhase,
    missionState,
    running,
    injectFault,
    clearFaults,
    setMissionPhase,
    toggleRunning,
  };

  return (
    <EngineSimulationContext.Provider value={value}>
      {children}
    </EngineSimulationContext.Provider>
  );
}

export function useEngineSimulation(): EngineSimulation {
  const ctx = useContext(EngineSimulationContext);
  if (!ctx) {
    throw new Error(
      "useEngineSimulation must be used within an EngineSimulationProvider",
    );
  }
  return ctx;
}

// Re-export canonical simulation constants so importers resolve from one place.
export {
  EMPTY_FAULTS,
  FAULT_LABEL,
  MISSION_PHASES,
  PHASE_LABEL,
  SENSOR_DEFS,
  SENSOR_MAP,
  healthColor,
};
export type {
  Anomaly,
  FaultInjection,
  FaultKey,
  FaultRecord,
  HealthResult,
  MissionPhase,
  MissionState,
  SensorKey,
  SensorReading,
};
