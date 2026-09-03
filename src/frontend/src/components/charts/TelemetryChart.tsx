import type { TelemetryPoint } from "@/lib/types";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TelemetryChartProps {
  data: TelemetryPoint[];
  height?: number;
}

const SERIES: { key: keyof TelemetryPoint; label: string; color: string }[] = [
  { key: "rpm", label: "RPM", color: "oklch(0.72 0.14 195)" },
  { key: "cht", label: "CHT", color: "oklch(0.78 0.13 75)" },
  { key: "egt", label: "EGT", color: "oklch(0.62 0.2 25)" },
  { key: "oilTemp", label: "Oil Temp", color: "oklch(0.68 0.16 150)" },
  { key: "vibration", label: "Vibration", color: "oklch(0.7 0.1 250)" },
  { key: "fuelFlow", label: "Fuel Flow", color: "oklch(0.6 0.12 235)" },
];

export function TelemetryChart({ data, height = 240 }: TelemetryChartProps) {
  return (
    <div
      className="w-full"
      data-ocid="telemetry_chart"
      role="img"
      aria-label="Live scrolling telemetry graph for engine sensor channels"
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 0, left: -8 }}
        >
          <CartesianGrid
            stroke="oklch(0.26 0.02 240 / 0.4)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="t"
            stroke="oklch(0.55 0.015 240)"
            fontSize={10}
            tickFormatter={(t: number) => `${t}s`}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="oklch(0.55 0.015 240)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "oklch(0.17 0.015 240)",
              border: "1px solid oklch(0.26 0.02 240)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(t: number) => `t = ${t}s`}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {SERIES.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
