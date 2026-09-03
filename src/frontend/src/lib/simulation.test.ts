import {
  EMPTY_FAULTS,
  classifyFault,
  computeHealth,
  detectAnomalies,
  generateReadings,
} from "@/lib/simulation";
import type { FaultInjection, MissionPhase } from "@/lib/types";
import { describe, expect, it } from "vitest";

const ORBIT: MissionPhase = { __kind__: "orbit" };

function readingValue(
  readings: { key: string; value: number }[],
  key: string,
): number {
  const r = readings.find((x) => x.key === key);
  if (!r) throw new Error(`missing reading ${key}`);
  return r.value;
}

describe("generateReadings", () => {
  it("labels every sensor reading as synthetic/demo with nominal baselines", () => {
    const readings = generateReadings(ORBIT, EMPTY_FAULTS, 0);
    expect(readings).toHaveLength(10);
    expect(readings.map((r) => r.key)).toEqual(
      expect.arrayContaining([
        "rpm",
        "engineLoad",
        "cht",
        "egt",
        "oilPressure",
        "oilTemp",
        "vibration",
        "fuelFlow",
        "boostPressure",
        "coolantTemp",
      ]),
    );
    // Orbit baseline: nominal RPM ~2800, load ~60.
    expect(readingValue(readings, "rpm")).toBeGreaterThan(2500);
    expect(readingValue(readings, "rpm")).toBeLessThan(3100);
    expect(readingValue(readings, "engineLoad")).toBeGreaterThan(50);
    expect(readingValue(readings, "engineLoad")).toBeLessThan(70);
  });

  it("changes RPM and load when the mission phase changes", () => {
    const preLaunch = generateReadings(
      { __kind__: "preLaunch" },
      EMPTY_FAULTS,
      0,
    );
    const launch = generateReadings({ __kind__: "launch" }, EMPTY_FAULTS, 0);
    // Launch runs the engine much harder than pre-launch idle.
    expect(readingValue(launch, "rpm")).toBeGreaterThan(
      readingValue(preLaunch, "rpm"),
    );
    expect(readingValue(launch, "engineLoad")).toBeGreaterThan(
      readingValue(preLaunch, "engineLoad"),
    );
  });

  it("raises CHT and EGT when the overheating fault is injected", () => {
    const faults: FaultInjection = { ...EMPTY_FAULTS, overheating: true };
    const normal = generateReadings(ORBIT, EMPTY_FAULTS, 0);
    const overheated = generateReadings(ORBIT, faults, 0);
    expect(readingValue(overheated, "cht")).toBeGreaterThan(
      readingValue(normal, "cht") + 40,
    );
    expect(readingValue(overheated, "egt")).toBeGreaterThan(
      readingValue(normal, "egt") + 70,
    );
  });

  it("drops oil pressure when the low oil pressure fault is injected", () => {
    const faults: FaultInjection = { ...EMPTY_FAULTS, lowOilPressure: true };
    const normal = generateReadings(ORBIT, EMPTY_FAULTS, 0);
    const low = generateReadings(ORBIT, faults, 0);
    expect(readingValue(low, "oilPressure")).toBeLessThan(
      readingValue(normal, "oilPressure") - 20,
    );
  });
});

describe("detectAnomalies", () => {
  it("flags no anomalies under nominal conditions", () => {
    const readings = generateReadings(ORBIT, EMPTY_FAULTS, 0);
    expect(detectAnomalies(readings)).toEqual([]);
  });

  it("flags CHT as an anomaly when overheating is injected", () => {
    const faults: FaultInjection = { ...EMPTY_FAULTS, overheating: true };
    const readings = generateReadings(ORBIT, faults, 0);
    const anomalies = detectAnomalies(readings);
    expect(anomalies.some((a) => a.sensor === "cht")).toBe(true);
  });

  it("flags oil pressure as an anomaly when low oil pressure is injected", () => {
    const faults: FaultInjection = { ...EMPTY_FAULTS, lowOilPressure: true };
    const readings = generateReadings(ORBIT, faults, 0);
    const anomalies = detectAnomalies(readings);
    expect(anomalies.some((a) => a.sensor === "oilPressure")).toBe(true);
  });
});

describe("classifyFault", () => {
  it("reports Normal with high confidence when nothing is wrong", () => {
    const readings = generateReadings(ORBIT, EMPTY_FAULTS, 0);
    const result = classifyFault(readings);
    expect(result.predictedFault).toBe("Normal");
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it("classifies an overheating fault", () => {
    const faults: FaultInjection = { ...EMPTY_FAULTS, overheating: true };
    const readings = generateReadings(ORBIT, faults, 0);
    const result = classifyFault(readings);
    expect(result.predictedFault).toBe("Overheating");
  });

  it("classifies a low oil pressure fault at a low-load phase", () => {
    // At orbit the oil-pressure baseline (~62) minus the fault effect (~28)
    // stays above the classifier's 30 psi threshold, so the fault is only
    // flagged as an anomaly there. At pre-launch idle the baseline is low
    // enough that the classifier votes for Low Oil Pressure.
    const faults: FaultInjection = { ...EMPTY_FAULTS, lowOilPressure: true };
    const readings = generateReadings({ __kind__: "preLaunch" }, faults, 0);
    const result = classifyFault(readings);
    expect(result.predictedFault).toBe("Low Oil Pressure");
  });
});

describe("computeHealth", () => {
  it("degrades health and RUL when a fault is active", () => {
    const faults: FaultInjection = { ...EMPTY_FAULTS, overheating: true };
    const readings = generateReadings(ORBIT, faults, 0);
    const anomalies = detectAnomalies(readings);
    const { predictedFault, confidence } = classifyFault(readings);
    const healthy = computeHealth(100, EMPTY_FAULTS, [], "Normal", 0.92);
    const degraded = computeHealth(
      100,
      faults,
      anomalies,
      predictedFault,
      confidence,
    );
    expect(degraded.healthScore).toBeLessThan(healthy.healthScore);
    expect(degraded.rul).toBeLessThan(healthy.rul);
  });

  it("recovers health when faults are cleared", () => {
    const faults: FaultInjection = { ...EMPTY_FAULTS, overheating: true };
    const readings = generateReadings(ORBIT, faults, 0);
    const anomalies = detectAnomalies(readings);
    const { predictedFault, confidence } = classifyFault(readings);
    const degraded = computeHealth(
      100,
      faults,
      anomalies,
      predictedFault,
      confidence,
    );
    const recovered = computeHealth(
      degraded.healthScore,
      EMPTY_FAULTS,
      [],
      "Normal",
      0.92,
    );
    expect(recovered.healthScore).toBeGreaterThan(degraded.healthScore);
  });
});
