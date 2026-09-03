import { TelemetryChart } from "@/components/charts/TelemetryChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  EMPTY_FAULTS,
  FAULT_LABEL,
  MISSION_PHASES,
  PHASE_LABEL,
  SENSOR_DEFS,
  SENSOR_MAP,
  useEngineSimulation,
} from "@/hooks/useEngineSimulation";
import type {
  FaultKey,
  MissionPhase,
  SensorKey,
  TelemetryPoint,
} from "@/lib/types";
import {
  Activity,
  AlertTriangle,
  CircleDot,
  Gauge,
  Pause,
  Play,
  Radio,
  ShieldAlert,
  Thermometer,
  Wrench,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STATUS_STYLES: Record<string, string> = {
  nominal: "border-transparent bg-success/20 text-success",
  degraded: "border-transparent bg-warning/20 text-warning",
  critical: "border-transparent bg-destructive/25 text-destructive",
  aborted: "border-transparent bg-destructive/30 text-destructive",
};

const RISK_STYLES: Record<string, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-warning",
  critical: "text-destructive",
};

const FAULT_KEYS: { key: FaultKey; label: string }[] = [
  { key: "overheating", label: "Overheating" },
  { key: "lowOilPressure", label: "Low Oil Pressure" },
  { key: "excessiveVibration", label: "Excessive Vibration" },
  { key: "injectorFuel", label: "Injector/Fuel Fault" },
  { key: "cooling", label: "Cooling Fault" },
  { key: "bearingMechanical", label: "Bearing Fault" },
  { key: "egtAnomaly", label: "EGT Anomaly" },
  { key: "turboBoost", label: "Turbo/Boost Fault" },
];

const TELEMETRY_KEYS: SensorKey[] = [
  "rpm",
  "cht",
  "egt",
  "oilPressure",
  "oilTemp",
  "vibration",
  "fuelFlow",
  "boostPressure",
];

const HISTORY_LENGTH = 60;

function formatValue(key: SensorKey, value: number): string {
  const def = SENSOR_MAP[key];
  return value.toFixed(def.decimals);
}

function HealthGauge({ score }: { score: number }) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = score >= 80 ? "#22d3ee" : score >= 55 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox="0 0 140 140"
        className="h-40 w-40 -rotate-90"
        role="img"
        aria-label={`Engine health ${Math.round(score)} percent`}
      >
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="oklch(0.26 0.02 240)"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-3xl font-bold text-foreground">
          {Math.round(score)}
        </span>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Health
        </span>
      </div>
    </div>
  );
}

export default function MissionPage() {
  const sim = useEngineSimulation();
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const historyRef = useRef<TelemetryPoint[]>([]);

  useEffect(() => {
    const point: TelemetryPoint = {
      t: historyRef.current.length,
      rpm: sim.sensors.rpm,
      cht: sim.sensors.cht,
      egt: sim.sensors.egt,
      oilTemp: sim.sensors.oilTemp,
      vibration: sim.sensors.vibration,
      fuelFlow: sim.sensors.fuelFlow,
    };
    const next = [...historyRef.current, point].slice(-HISTORY_LENGTH);
    historyRef.current = next;
    setHistory(next);
  }, [sim.sensors]);

  const phaseKey = sim.missionPhase.__kind__;
  const statusKey = sim.missionState.status.__kind__;
  const riskKey = sim.missionState.riskLevel.__kind__;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card shadow-subtle">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg gradient-telemetry shadow-elevated">
              <Zap className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
                MALE-UAV Mission Control
              </h1>
              <p className="text-xs text-muted-foreground">
                Medium-Altitude Long-Endurance · Engine Health Telemetry
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className="border-border bg-muted/40 font-mono text-[11px] text-muted-foreground"
              data-ocid="synthetic_data_badge"
            >
              <CircleDot className="size-3 text-warning" />
              SYNTHETIC / DEMO DATA
            </Badge>
            <Badge
              className={STATUS_STYLES[statusKey]}
              data-ocid="mission_status_badge"
            >
              <Activity className="size-3" />
              {statusKey.toUpperCase()}
            </Badge>
            <Button
              variant={sim.running ? "secondary" : "default"}
              size="sm"
              onClick={sim.toggleRunning}
              data-ocid="toggle_running_button"
            >
              {sim.running ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
              {sim.running ? "Pause" : "Resume"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-6 py-6">
        {/* Mission phase selector */}
        <Card data-ocid="mission_phase_panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Radio className="size-4 text-primary" />
              Mission Phase
            </CardTitle>
            <CardDescription>
              Current phase: {PHASE_LABEL[phaseKey]} · Synthetic telemetry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {MISSION_PHASES.map((phase) => {
                const active = phase.__kind__ === phaseKey;
                return (
                  <Button
                    key={phase.__kind__}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => sim.setMissionPhase(phase)}
                    data-ocid={`mission_phase_${phase.__kind__}`}
                    className={
                      active ? "gradient-telemetry text-primary-foreground" : ""
                    }
                  >
                    {PHASE_LABEL[phase.__kind__]}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top grid: health + telemetry */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Engine health */}
          <Card data-ocid="engine_health_panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Gauge className="size-4 text-primary" />
                Engine Health
              </CardTitle>
              <CardDescription>Predictive maintenance model</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-5">
              <HealthGauge score={sim.health.healthScore} />

              <div className="grid w-full grid-cols-2 gap-3">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Remaining Useful Life
                  </p>
                  <p className="font-mono text-xl font-bold text-foreground">
                    {sim.health.rul.toFixed(1)}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      hrs
                    </span>
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Model Confidence
                  </p>
                  <p className="font-mono text-xl font-bold text-foreground">
                    {(sim.health.confidence * 100).toFixed(0)}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      %
                    </span>
                  </p>
                </div>
              </div>

              <div className="w-full rounded-lg border bg-muted/30 p-3">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Predicted Fault
                </p>
                <p
                  className={`font-mono text-lg font-bold ${
                    sim.health.predictedFault === "Normal"
                      ? "text-success"
                      : "text-warning"
                  }`}
                >
                  {sim.health.predictedFault}
                </p>
              </div>

              <div className="w-full">
                <div className="mb-1 flex justify-between text-[11px] uppercase tracking-widest text-muted-foreground">
                  <span>Mission Risk</span>
                  <span
                    className={`font-mono font-bold ${RISK_STYLES[riskKey]}`}
                  >
                    {riskKey.toUpperCase()}
                  </span>
                </div>
                <Progress
                  value={
                    riskKey === "critical"
                      ? 95
                      : riskKey === "high"
                        ? 70
                        : riskKey === "medium"
                          ? 45
                          : 15
                  }
                  className="bg-muted"
                />
              </div>
            </CardContent>
          </Card>

          {/* Live telemetry graph */}
          <Card className="lg:col-span-2" data-ocid="telemetry_graph_panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Activity className="size-4 text-primary" />
                Live Telemetry
              </CardTitle>
              <CardDescription>
                Scrolling engine sensor trace ·{" "}
                {sim.running ? "streaming" : "paused"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TelemetryChart data={history} height={260} />
            </CardContent>
          </Card>
        </div>

        {/* Bottom grid: telemetry sensors + faults */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sensor grid */}
          <Card className="lg:col-span-2" data-ocid="sensor_grid_panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Thermometer className="size-4 text-primary" />
                Live Sensor Readout
              </CardTitle>
              <CardDescription>
                Current values by mission phase · synthetic telemetry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TELEMETRY_KEYS.map((key) => {
                  const anomaly = sim.anomalies.find((a) => a.sensor === key);
                  const value = sim.sensors[key];
                  const isCritical = anomaly?.severity === "critical";
                  const isCaution = anomaly?.severity === "caution";
                  return (
                    <div
                      key={key}
                      data-ocid={`sensor_${key}`}
                      className={`rounded-lg border p-3 transition-colors ${
                        isCritical
                          ? "border-destructive/50 bg-destructive/10"
                          : isCaution
                            ? "border-warning/40 bg-warning/10"
                            : "border bg-muted/20"
                      }`}
                    >
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                        {SENSOR_MAP[key].label}
                      </p>
                      <p
                        className={`font-mono text-xl font-bold ${
                          isCritical
                            ? "text-destructive"
                            : isCaution
                              ? "text-warning"
                              : "text-foreground"
                        }`}
                      >
                        {formatValue(key, value)}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          {SENSOR_MAP[key].unit}
                        </span>
                      </p>
                      {anomaly && (
                        <p className="mt-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-warning">
                          <AlertTriangle className="size-3" />
                          {anomaly.severity}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Active faults */}
          <Card data-ocid="active_faults_panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <ShieldAlert className="size-4 text-warning" />
                Active Faults
              </CardTitle>
              <CardDescription>
                {sim.activeFaults.length} fault
                {sim.activeFaults.length === 1 ? "" : "s"} logged
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sim.activeFaults.length === 0 ? (
                <div
                  className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-muted/20 p-6 text-center"
                  data-ocid="faults_empty_state"
                >
                  <ShieldAlert className="size-6 text-success" />
                  <p className="text-sm text-muted-foreground">
                    No active faults. Engine operating within nominal limits.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sim.activeFaults.map((fault) => (
                    <div
                      key={fault.id.toString()}
                      data-ocid={`fault_item_${fault.id}`}
                      className="rounded-lg border bg-muted/20 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-mono text-sm font-bold text-foreground">
                          {fault.faultType}
                        </p>
                        <Badge
                          variant="outline"
                          className="border-warning/40 bg-warning/10 text-warning"
                        >
                          {fault.severity.__kind__.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {fault.maintenanceRecommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fault injection */}
        <Card data-ocid="fault_injection_panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Wrench className="size-4 text-primary" />
              Fault Injection
            </CardTitle>
            <CardDescription>
              Simulate engine faults to observe health and risk response (demo)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            {FAULT_KEYS.map(({ key, label }) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => sim.injectFault(key)}
                disabled={sim.faults[key]}
                data-ocid={`inject_fault_${key}`}
              >
                <AlertTriangle className="size-4 text-warning" />
                {label}
              </Button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={sim.clearFaults}
              disabled={sim.activeFaults.length === 0}
              data-ocid="clear_faults_button"
            >
              Clear All Faults
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-xs text-muted-foreground">
          <span>
            MALE-UAV Mission Control · Synthetic telemetry for demonstration
          </span>
          <span>
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
