import type {
  Anomaly,
  FaultInjection,
  FaultKey,
  FaultType,
  HealthResult,
  MissionPhase,
  ReadingStatus,
  SensorDef,
  SensorKey,
  SensorReading,
} from "./types";

export const SENSOR_DEFS: SensorDef[] = [
  {
    key: "rpm",
    label: "RPM",
    unit: "RPM",
    min: 0,
    max: 6000,
    nominal: 2800,
    cautionHigh: 5200,
    criticalHigh: 5600,
    decimals: 0,
  },
  {
    key: "engineLoad",
    label: "Engine Load",
    unit: "%",
    min: 0,
    max: 100,
    nominal: 60,
    cautionHigh: 90,
    criticalHigh: 97,
    decimals: 0,
  },
  {
    key: "cht",
    label: "Cylinder Head Temp",
    unit: "°C",
    min: 0,
    max: 300,
    nominal: 135,
    cautionHigh: 180,
    criticalHigh: 210,
    decimals: 0,
  },
  {
    key: "egt",
    label: "Exhaust Gas Temp",
    unit: "°C",
    min: 0,
    max: 1000,
    nominal: 640,
    cautionHigh: 820,
    criticalHigh: 880,
    decimals: 0,
  },
  {
    key: "oilPressure",
    label: "Oil Pressure",
    unit: "psi",
    min: 0,
    max: 100,
    nominal: 62,
    cautionHigh: 85,
    criticalHigh: 92,
    cautionLow: 35,
    criticalLow: 25,
    decimals: 1,
  },
  {
    key: "oilTemp",
    label: "Oil Temperature",
    unit: "°C",
    min: 0,
    max: 150,
    nominal: 88,
    cautionHigh: 115,
    criticalHigh: 130,
    decimals: 0,
  },
  {
    key: "vibration",
    label: "Vibration",
    unit: "g",
    min: 0,
    max: 5,
    nominal: 0.6,
    cautionHigh: 2.2,
    criticalHigh: 3.0,
    decimals: 2,
  },
  {
    key: "fuelFlow",
    label: "Fuel Flow",
    unit: "L/h",
    min: 0,
    max: 300,
    nominal: 120,
    cautionHigh: 240,
    criticalHigh: 270,
    decimals: 0,
  },
  {
    key: "boostPressure",
    label: "Boost Pressure",
    unit: "psi",
    min: 0,
    max: 25,
    nominal: 10,
    cautionHigh: 20,
    criticalHigh: 23,
    decimals: 1,
  },
  {
    key: "coolantTemp",
    label: "Coolant Temperature",
    unit: "°C",
    min: 0,
    max: 140,
    nominal: 95,
    cautionHigh: 115,
    criticalHigh: 125,
    decimals: 0,
  },
];

export const SENSOR_MAP: Record<SensorKey, SensorDef> = Object.fromEntries(
  SENSOR_DEFS.map((d) => [d.key, d]),
) as Record<SensorKey, SensorDef>;

export const MISSION_PHASES: MissionPhase[] = [
  { __kind__: "preLaunch" },
  { __kind__: "launch" },
  { __kind__: "ascent" },
  { __kind__: "orbit" },
  { __kind__: "reentry" },
  { __kind__: "landing" },
  { __kind__: "postLanding" },
];

export const PHASE_LABEL: Record<string, string> = {
  preLaunch: "Pre-Launch",
  launch: "Launch",
  ascent: "Ascent",
  orbit: "Orbit",
  reentry: "Re-entry",
  landing: "Landing",
  postLanding: "Post-Landing",
};

export const FAULT_LABEL: Record<FaultKey, string> = {
  overheating: "Overheating",
  lowOilPressure: "Low Oil Pressure",
  excessiveVibration: "Excessive Vibration",
  injectorFuel: "Injector/Fuel Fault",
  cooling: "Cooling Fault",
  bearingMechanical: "Bearing/Mechanical Fault",
  egtAnomaly: "EGT Anomaly",
  turboBoost: "Turbo/Boost Fault",
};

export const EMPTY_FAULTS: FaultInjection = {
  overheating: false,
  lowOilPressure: false,
  excessiveVibration: false,
  injectorFuel: false,
  cooling: false,
  bearingMechanical: false,
  egtAnomaly: false,
  turboBoost: false,
};

const PHASE_BASELINE: Record<string, Record<SensorKey, number>> = {
  preLaunch: {
    rpm: 800,
    engineLoad: 5,
    cht: 90,
    egt: 250,
    oilPressure: 55,
    oilTemp: 60,
    vibration: 0.3,
    fuelFlow: 15,
    boostPressure: 0,
    coolantTemp: 75,
  },
  launch: {
    rpm: 4200,
    engineLoad: 95,
    cht: 165,
    egt: 780,
    oilPressure: 70,
    oilTemp: 95,
    vibration: 1.2,
    fuelFlow: 220,
    boostPressure: 18,
    coolantTemp: 105,
  },
  ascent: {
    rpm: 3600,
    engineLoad: 85,
    cht: 152,
    egt: 720,
    oilPressure: 68,
    oilTemp: 92,
    vibration: 0.9,
    fuelFlow: 180,
    boostPressure: 15,
    coolantTemp: 100,
  },
  orbit: {
    rpm: 2800,
    engineLoad: 60,
    cht: 135,
    egt: 640,
    oilPressure: 62,
    oilTemp: 88,
    vibration: 0.6,
    fuelFlow: 120,
    boostPressure: 10,
    coolantTemp: 95,
  },
  reentry: {
    rpm: 3200,
    engineLoad: 75,
    cht: 145,
    egt: 700,
    oilPressure: 65,
    oilTemp: 90,
    vibration: 0.8,
    fuelFlow: 150,
    boostPressure: 12,
    coolantTemp: 98,
  },
  landing: {
    rpm: 2400,
    engineLoad: 50,
    cht: 125,
    egt: 580,
    oilPressure: 60,
    oilTemp: 85,
    vibration: 0.5,
    fuelFlow: 90,
    boostPressure: 8,
    coolantTemp: 90,
  },
  postLanding: {
    rpm: 900,
    engineLoad: 8,
    cht: 100,
    egt: 320,
    oilPressure: 50,
    oilTemp: 70,
    vibration: 0.3,
    fuelFlow: 20,
    boostPressure: 0,
    coolantTemp: 80,
  },
};

const FAULT_EFFECTS: Record<FaultKey, Partial<Record<SensorKey, number>>> = {
  overheating: { cht: 55, egt: 90, coolantTemp: 22, oilTemp: 18 },
  lowOilPressure: { oilPressure: -28 },
  excessiveVibration: { vibration: 1.9 },
  injectorFuel: { fuelFlow: 95, egt: 70, vibration: 0.5 },
  cooling: { cht: 40, coolantTemp: 25 },
  bearingMechanical: { vibration: 1.4, oilTemp: 22 },
  egtAnomaly: { egt: 120 },
  turboBoost: { boostPressure: -9, egt: 45 },
};

export function round(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

// Deterministic pseudo-random noise in [0, 1)
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function generateReadings(
  phase: MissionPhase,
  faults: FaultInjection,
  tick: number,
): SensorReading[] {
  const baseline = PHASE_BASELINE[phase.__kind__];
  const activeFaults = (Object.keys(faults) as FaultKey[]).filter(
    (k) => faults[k],
  );

  return SENSOR_DEFS.map((def) => {
    let value = baseline[def.key];
    const amp = (def.max - def.min) * 0.012;
    value += (noise(tick * 7 + def.key.length * 3) - 0.5) * 2 * amp;
    for (const fk of activeFaults) {
      const effect = FAULT_EFFECTS[fk][def.key];
      if (effect !== undefined) value += effect;
    }
    value = Math.max(def.min, Math.min(def.max, value));

    let status: ReadingStatus = "nominal";
    if (def.criticalLow !== undefined && value < def.criticalLow)
      status = "critical";
    else if (def.cautionLow !== undefined && value < def.cautionLow)
      status = "caution";
    else if (value > def.criticalHigh) status = "critical";
    else if (value > def.cautionHigh) status = "caution";

    return {
      key: def.key,
      label: def.label,
      unit: def.unit,
      value: round(value, def.decimals),
      min: def.min,
      max: def.max,
      nominal: def.nominal,
      status,
      decimals: def.decimals,
    };
  });
}

// Isolation Forest-style anomaly scoring: deviation from nominal relative to range.
export function detectAnomalies(readings: SensorReading[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  for (const r of readings) {
    if (r.status === "nominal") continue;
    const range = r.max - r.min;
    const deviation = Math.abs(r.value - r.nominal) / range;
    const score = Math.min(1, deviation * 3);
    anomalies.push({
      sensor: r.key,
      label: r.label,
      value: r.value,
      nominal: r.nominal,
      score: round(score, 2),
      severity: r.status === "critical" ? "critical" : "caution",
    });
  }
  return anomalies;
}

// Random Forest-style classifier: each heuristic "tree" votes for a fault class.
export function classifyFault(readings: SensorReading[]): {
  predictedFault: FaultType;
  confidence: number;
} {
  const get = (k: SensorKey) => readings.find((r) => r.key === k)?.value ?? 0;
  const votes: FaultType[] = [];
  const add = (fault: FaultType) => votes.push(fault);

  const rpm = get("rpm");
  const cht = get("cht");
  const egt = get("egt");
  const oilP = get("oilPressure");
  const vib = get("vibration");
  const fuel = get("fuelFlow");
  const cool = get("coolantTemp");
  const oilT = get("oilTemp");
  const boost = get("boostPressure");

  if (cht > 180) add("Overheating");
  if (cht > 170 && cool > 110) add("Cooling Fault");
  if (cool > 120) add("Cooling Fault");
  if (egt > 850) add("EGT Anomaly");
  if (egt > 800 && fuel > 240) add("Injector/Fuel Fault");
  if (oilP < 30) add("Low Oil Pressure");
  if (vib > 2.5) add("Excessive Vibration");
  if (vib > 1.8 && oilT > 110) add("Bearing/Mechanical Fault");
  if (fuel > 260) add("Injector/Fuel Fault");
  if (boost < 3 && rpm > 2000) add("Turbo/Boost Fault");
  if (oilT > 125) add("Bearing/Mechanical Fault");

  if (votes.length === 0) return { predictedFault: "Normal", confidence: 0.92 };

  const totals = new Map<FaultType, number>();
  for (const v of votes) totals.set(v, (totals.get(v) ?? 0) + 1);
  let best: FaultType = "Normal";
  let bestCount = 0;
  for (const [fault, count] of totals) {
    if (count > bestCount) {
      best = fault;
      bestCount = count;
    }
  }
  const confidence = Math.min(0.98, bestCount / votes.length + 0.35);
  return { predictedFault: best, confidence: round(confidence, 2) };
}

export function computeHealth(
  prevHealth: number,
  faults: FaultInjection,
  anomalies: Anomaly[],
  predictedFault: FaultType,
  confidence: number,
): HealthResult {
  const activeFaults = (Object.keys(faults) as FaultKey[]).filter(
    (k) => faults[k],
  );
  let target = 100;
  target -= activeFaults.length * 14;
  for (const a of anomalies) target -= a.severity === "critical" ? 6 : 3;
  target = Math.max(5, Math.min(100, target));
  const healthScore = round(prevHealth + (target - prevHealth) * 0.25, 1);
  const rul = round((healthScore / 100) * 900, 1);
  return { healthScore, predictedFault, confidence, rul };
}

export function healthColor(score: number): string {
  if (score >= 80) return "oklch(0.68 0.16 150)";
  if (score >= 55) return "oklch(0.78 0.13 75)";
  return "oklch(0.62 0.2 25)";
}
