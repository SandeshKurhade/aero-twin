import { Button } from "@/components/ui/button";
import type { FaultInjection, FaultKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Eraser, Flame, Fuel, Gauge as GaugeIcon, Vibrate } from "lucide-react";

interface FaultInjectorProps {
  faults: FaultInjection;
  injectFault: (fault: FaultKey) => void;
  clearFaults: () => void;
}

const FAULT_OPTIONS: {
  key: FaultKey;
  label: string;
  icon: typeof Flame;
  activeClass: string;
}[] = [
  {
    key: "overheating",
    label: "Overheating",
    icon: Flame,
    activeClass: "border-red-500/60 bg-red-500/15 text-red-300",
  },
  {
    key: "lowOilPressure",
    label: "Low Oil Pressure",
    icon: GaugeIcon,
    activeClass: "border-amber-500/60 bg-amber-500/15 text-amber-300",
  },
  {
    key: "excessiveVibration",
    label: "Excessive Vibration",
    icon: Vibrate,
    activeClass: "border-violet-500/60 bg-violet-500/15 text-violet-300",
  },
  {
    key: "injectorFuel",
    label: "Injector Fault",
    icon: Fuel,
    activeClass: "border-cyan-500/60 bg-cyan-500/15 text-cyan-300",
  },
];

export function FaultInjector({
  faults,
  injectFault,
  clearFaults,
}: FaultInjectorProps) {
  return (
    <div className="flex flex-col gap-3" data-ocid="fault_injector">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
          Fault Injection
        </h3>
        <span className="font-mono text-[10px] text-muted-foreground">
          SIMULATION
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {FAULT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = faults[opt.key];
          return (
            <Button
              key={opt.key}
              type="button"
              variant="outline"
              size="sm"
              data-ocid={`fault_injector.${opt.key}`}
              aria-pressed={active}
              onClick={() => injectFault(opt.key)}
              className={cn(
                "justify-start border-border bg-card/60 text-muted-foreground hover:bg-accent/40",
                active && opt.activeClass,
              )}
            >
              <Icon className="size-4" />
              {opt.label}
            </Button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        data-ocid="fault_injector.clear"
        onClick={clearFaults}
        className="mt-1"
      >
        <Eraser className="size-4" />
        Clear / Reset Faults
      </Button>
    </div>
  );
}
