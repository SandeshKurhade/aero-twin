import { AlertPanel } from "@/components/alerts/AlertPanel";
import { TelemetryChart } from "@/components/charts/TelemetryChart";
import { Engine3D } from "@/components/engine/Engine3D";
import { FaultInjector } from "@/components/faults/FaultInjector";
import { SensorGauge } from "@/components/gauges/SensorGauge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEngineSimulation } from "@/hooks/useEngineSimulation";
import { MISSION_PHASES, PHASE_LABEL, healthColor } from "@/lib/simulation";
import type { MissionPhase, SensorKey, TelemetryPoint } from "@/lib/types";
import {
  Activity,
  Gauge as GaugeIcon,
  Pause,
  Play,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const GAUGE_KEYS: SensorKey[] = [
  "rpm",
  "cht",
  "egt",
  "oilPressure",
  "oilTemp",
  "vibration",
  "fuelFlow",
];

const HISTORY_LENGTH = 60;

export default function DashboardPage() {
  const sim = useEngineSimulation();
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const historyRef = useRef<TelemetryPoint[]>([]);

  // Append a telemetry point each time the sensor snapshot changes.
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
  const healthColorValue = healthColor(sim.health.healthScore);

  const gaugeReadings = useMemo(() => {
    const map = new Map(sim.readings.map((r) => [r.key, r]));
    return GAUGE_KEYS.map((k) => map.get(k)).filter(
      (r): r is NonNullable<typeof r> => r !== undefined,
    );
  }, [sim.readings]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-subtle">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg gradient-telemetry shadow-elevated">
              <GaugeIcon className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight">
                MALE UAV · Engine Health
              </h1>
              <p className="text-xs text-muted-foreground">
                Four-cylinder piston engine · Digital twin telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="font-mono text-[10px] text-muted-foreground"
              data-ocid="demo_badge"
            >
              SYNTHETIC DEMO DATA
            </Badge>
            <Button
              type="button"
              variant={sim.running ? "secondary" : "default"}
              size="sm"
              data-ocid="engine_toggle"
              onClick={sim.toggleRunning}
            >
              {sim.running ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
              {sim.running ? "Pause" : "Run"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-4 px-6 py-5">
        {/* Mission phase selector */}
        <Tabs
          value={phaseKey}
          onValueChange={(v) =>
            sim.setMissionPhase({ __kind__: v as MissionPhase["__kind__"] })
          }
          data-ocid="mission_phase_tabs"
        >
          <TabsList className="w-full justify-start overflow-x-auto">
            {MISSION_PHASES.map((p) => (
              <TabsTrigger
                key={p.__kind__}
                value={p.__kind__}
                data-ocid={`mission_phase.${p.__kind__}`}
              >
                {PHASE_LABEL[p.__kind__]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Health summary row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="gradient-panel">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="size-4 text-cyan-300" />
                Engine Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <span
                  className="font-display text-5xl font-bold tabular-nums"
                  style={{
                    color: healthColorValue,
                    textShadow: `0 0 18px ${healthColorValue}`,
                  }}
                  data-ocid="health_score"
                >
                  {sim.health.healthScore.toFixed(1)}
                </span>
                <span className="pb-1 text-sm text-muted-foreground">
                  / 100
                </span>
              </div>
              <Progress
                value={sim.health.healthScore}
                className="mt-3 h-2.5"
                data-ocid="health_progress"
              />
            </CardContent>
          </Card>

          <Card className="gradient-panel">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Activity className="size-4 text-amber-300" />
                Predicted Fault
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="font-display text-2xl font-bold"
                data-ocid="predicted_fault"
              >
                {sim.health.predictedFault}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Confidence</span>
                <span
                  className="font-mono font-semibold text-cyan-300"
                  data-ocid="confidence"
                >
                  {(sim.health.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-panel">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <GaugeIcon className="size-4 text-emerald-300" />
                Remaining Useful Life
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span
                  className="font-display text-5xl font-bold tabular-nums"
                  style={{ color: healthColorValue }}
                  data-ocid="rul"
                >
                  {sim.health.rul.toFixed(1)}
                </span>
                <span className="pb-1 text-sm text-muted-foreground">hrs</span>
              </div>
              <div className="mt-2 font-mono text-xs text-muted-foreground">
                Mission: {PHASE_LABEL[phaseKey]} ·{" "}
                {sim.missionState.status.__kind__.toUpperCase()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3D engine + gauges */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                3D Engine Twin
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[420px] p-0">
              <Engine3D
                rpm={sim.sensors.rpm}
                running={sim.running}
                faults={sim.faults}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Live Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {gaugeReadings.map((r) => (
                  <SensorGauge key={r.key} reading={r} size={128} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart + alerts + faults */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Live Scrolling Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TelemetryChart data={history} height={260} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="h-[320px] pt-6">
              <AlertPanel faults={sim.activeFaults} />
            </CardContent>
          </Card>
        </div>

        {/* Fault injector */}
        <Card>
          <CardContent className="pt-6">
            <FaultInjector
              faults={sim.faults}
              injectFault={sim.injectFault}
              clearFaults={sim.clearFaults}
            />
          </CardContent>
        </Card>

        <footer className="border-t border-border pt-4 pb-2 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-cyan-300 hover:underline"
          >
            caffeine.ai
          </a>
          . Synthetic telemetry for demonstration only.
        </footer>
      </main>
    </div>
  );
}
