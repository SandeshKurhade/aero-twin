import type { SensorReading } from "@/lib/types";
import { Gauge, type GaugeStatus } from "./Gauge";

interface SensorGaugeProps {
  reading: SensorReading;
  size?: number;
}

export function SensorGauge({ reading, size }: SensorGaugeProps) {
  const status: GaugeStatus = reading.status;
  return (
    <Gauge
      value={reading.value}
      min={reading.min}
      max={reading.max}
      nominal={reading.nominal}
      unit={reading.unit}
      label={reading.label}
      status={status}
      decimals={reading.decimals}
      size={size}
    />
  );
}
