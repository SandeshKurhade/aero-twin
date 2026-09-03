import { cn } from "@/lib/utils";

export type GaugeStatus = "nominal" | "caution" | "critical";

interface GaugeProps {
  value: number;
  min: number;
  max: number;
  nominal: number;
  unit: string;
  label: string;
  status: GaugeStatus;
  decimals: number;
  size?: number;
}

const STATUS_COLOR: Record<GaugeStatus, string> = {
  nominal: "oklch(0.72 0.14 195)",
  caution: "oklch(0.78 0.13 75)",
  critical: "oklch(0.62 0.2 25)",
};

const STATUS_TEXT: Record<GaugeStatus, string> = {
  nominal: "text-cyan-300",
  caution: "text-amber-300",
  critical: "text-red-400",
};

// Polar helpers for the 270-degree arc (from -135deg to +135deg).
function polar(
  cx: number,
  cy: number,
  r: number,
  deg: number,
): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const [sx, sy] = polar(cx, cy, r, startDeg);
  const [ex, ey] = polar(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`;
}

export function Gauge({
  value,
  min,
  max,
  nominal,
  unit,
  label,
  status,
  decimals,
  size = 132,
}: GaugeProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const start = -135;
  const sweep = 270;
  const clamped = Math.max(min, Math.min(max, value));
  const frac = (clamped - min) / (max - min);
  const valueAngle = start + sweep * frac;
  const nominalFrac = (nominal - min) / (max - min);
  const nominalAngle = start + sweep * nominalFrac;

  const color = STATUS_COLOR[status];

  return (
    <div
      className="flex flex-col items-center gap-1"
      data-ocid="gauge"
      role="img"
      aria-label={`${label} ${value} ${unit}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        role="img"
        aria-label={`${label} ${value} ${unit}`}
      >
        {/* Track */}
        <path
          d={arcPath(cx, cy, r, start, start + sweep)}
          fill="none"
          stroke="oklch(0.26 0.02 240)"
          strokeWidth={7}
          strokeLinecap="round"
        />
        {/* Nominal marker */}
        <line
          x1={polar(cx, cy, r - 9, nominalAngle)[0]}
          y1={polar(cx, cy, r - 9, nominalAngle)[1]}
          x2={polar(cx, cy, r + 9, nominalAngle)[0]}
          y2={polar(cx, cy, r + 9, nominalAngle)[1]}
          stroke="oklch(0.55 0.015 240)"
          strokeWidth={2}
        />
        {/* Value arc */}
        <path
          d={arcPath(cx, cy, r, start, valueAngle)}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        {/* Value text */}
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          className="fill-foreground font-mono"
          style={{ fontSize: size * 0.16, fontWeight: 600 }}
        >
          {value.toFixed(decimals)}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          className="fill-muted-foreground font-mono"
          style={{ fontSize: size * 0.075 }}
        >
          {unit}
        </text>
      </svg>
      <div className="flex flex-col items-center leading-tight">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <span className={cn("font-mono text-[10px]", STATUS_TEXT[status])}>
          {status === "nominal"
            ? "NOMINAL"
            : status === "caution"
              ? "CAUTION"
              : "CRITICAL"}
        </span>
      </div>
    </div>
  );
}
