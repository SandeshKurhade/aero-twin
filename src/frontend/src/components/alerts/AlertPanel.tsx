import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FaultRecord, Severity } from "@/lib/types";
import { AlertTriangle, CheckCircle2, Wrench } from "lucide-react";

interface AlertPanelProps {
  faults: FaultRecord[];
}

const SEVERITY_STYLE: Record<Severity["__kind__"], string> = {
  low: "border-transparent bg-secondary text-secondary-foreground",
  medium: "border-transparent bg-amber-500/20 text-amber-300",
  high: "border-transparent bg-red-500/20 text-red-300",
  critical: "border-transparent bg-red-600/30 text-red-200",
};

function formatTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "--:--:--";
  return date.toLocaleTimeString([], { hour12: false });
}

export function AlertPanel({ faults }: AlertPanelProps) {
  return (
    <div className="flex h-full flex-col gap-3" data-ocid="alert_panel">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
          Active Faults
        </h3>
        <Badge variant="outline" className="font-mono">
          {faults.length} ACTIVE
        </Badge>
      </div>

      {faults.length === 0 ? (
        <div
          className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-center"
          data-ocid="alert_panel.empty_state"
        >
          <CheckCircle2 className="size-8 text-emerald-400" />
          <p className="text-sm font-medium text-foreground">
            All systems nominal
          </p>
          <p className="text-xs text-muted-foreground">
            No active faults detected. Engine health is within limits.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-full pr-3">
          <ul className="flex flex-col gap-2">
            {faults.map((fault, i) => (
              <li
                key={fault.id.toString()}
                data-ocid={`alert_panel.item.${i + 1}`}
                className="rounded-lg border border-border bg-card/60 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-red-400" />
                    <span className="text-sm font-medium text-foreground">
                      {fault.faultType}
                    </span>
                  </div>
                  <Badge
                    className={SEVERITY_STYLE[fault.severity.__kind__]}
                    data-ocid={`alert_panel.severity.${i + 1}`}
                  >
                    {fault.severity.__kind__.toUpperCase()}
                  </Badge>
                </div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {formatTime(fault.timestamp)}
                </div>
                <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                  <Wrench className="mt-0.5 size-3.5 shrink-0 text-cyan-300" />
                  <span>{fault.maintenanceRecommendation}</span>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}
