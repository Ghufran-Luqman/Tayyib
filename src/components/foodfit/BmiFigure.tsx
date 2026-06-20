import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Props {
  bmi: number;
  sex?: "male" | "female" | "other" | "prefer-not";
  className?: string;
}

// Returns a body-width scale factor (0.75 - 1.6) based on BMI.
function widthScale(bmi: number): number {
  if (!bmi || bmi <= 0) return 1;
  // Underweight ~17 → 0.75, normal 22 → 1.0, overweight 28 → 1.25, obese 35+ → 1.55
  const clamped = Math.max(15, Math.min(45, bmi));
  if (clamped < 18.5) return 0.78 + ((clamped - 15) / (18.5 - 15)) * 0.17; // 0.78 → 0.95
  if (clamped < 25) return 0.95 + ((clamped - 18.5) / (25 - 18.5)) * 0.1; // 0.95 → 1.05
  if (clamped < 30) return 1.05 + ((clamped - 25) / 5) * 0.15; // 1.05 → 1.2
  return 1.2 + ((clamped - 30) / 15) * 0.4; // 1.2 → 1.6
}

function bmiBand(bmi: number): { label: string; color: string; pct: number } {
  const clamped = Math.max(14, Math.min(40, bmi));
  const pct = ((clamped - 14) / (40 - 14)) * 100;
  if (bmi < 18.5) return { label: "Underweight", color: "var(--fit-blue)", pct };
  if (bmi < 25) return { label: "Healthy range", color: "var(--fit-green)", pct };
  if (bmi < 30) return { label: "Overweight", color: "var(--fit-amber)", pct };
  return { label: "Obese range", color: "var(--fit-red)", pct };
}

export function BmiFigure({ bmi, sex, className }: Props) {
  const scale = useMemo(() => widthScale(bmi), [bmi]);
  const band = useMemo(() => bmiBand(bmi), [bmi]);
  const isFemale = sex === "female";

  return (
    <div className={cn("rounded-2xl border bg-card p-5", className)}>
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Estimated BMI
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold">{bmi.toFixed(1)}</span>
            <span className="text-sm font-medium" style={{ color: band.color }}>
              {band.label}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-center gap-8">
        {/* Reference figure (normal BMI 22) */}
        <FigureSvg scale={1} female={isFemale} muted />
        {/* User figure */}
        <FigureSvg scale={scale} female={isFemale} color={band.color} />
      </div>
      <div className="mt-2 flex justify-center gap-8 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="w-20 text-center">Healthy ref.</span>
        <span className="w-20 text-center">You</span>
      </div>

      {/* BMI scale bar */}
      <div className="mt-5">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, var(--fit-blue) 0%, var(--fit-blue) 17%, var(--fit-green) 17%, var(--fit-green) 42%, var(--fit-amber) 42%, var(--fit-amber) 62%, var(--fit-red) 62%, var(--fit-red) 100%)",
            }}
          />
          <div
            className="absolute -top-1 h-4.5 w-1 rounded-full bg-foreground shadow"
            style={{ left: `calc(${band.pct}% - 2px)`, height: "1.1rem" }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
          <span>14</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>40+</span>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        BMI is a rough indicator and doesn't capture muscle mass, body composition, or
        ethnicity. Use it as a general guide, not a diagnosis.
      </p>
    </div>
  );
}

function FigureSvg({
  scale,
  female,
  color,
  muted,
}: {
  scale: number;
  female?: boolean;
  color?: string;
  muted?: boolean;
}) {
  // Base widths in viewBox units
  const torsoW = 22 * scale;
  const hipW = (female ? 26 : 24) * scale;
  const shoulderW = (female ? 24 : 26) * scale;
  const limbW = 6 * scale;
  const fill = muted ? "var(--color-muted)" : color ?? "var(--fit-green)";
  const stroke = muted ? "var(--color-border)" : "transparent";

  return (
    <svg viewBox="-30 0 60 110" width={80} height={130} aria-hidden>
      {/* Head */}
      <circle cx="0" cy="10" r={female ? 7.5 : 8} fill={fill} stroke={stroke} />
      {female && (
        // hair hint
        <path d="M-8,10 Q-8,2 0,2 Q8,2 8,10 L7,12 Q0,6 -7,12 Z" fill={fill} />
      )}
      {/* Neck */}
      <rect x={-2.5} y={17} width={5} height={3} fill={fill} />
      {/* Shoulders/torso (trapezoid) */}
      <path
        d={`M${-shoulderW / 2},22 L${shoulderW / 2},22 L${torsoW / 2},45 L${-torsoW / 2},45 Z`}
        fill={fill}
        stroke={stroke}
      />
      {/* Waist/hips */}
      <path
        d={`M${-torsoW / 2},45 L${torsoW / 2},45 L${hipW / 2},60 L${-hipW / 2},60 Z`}
        fill={fill}
        stroke={stroke}
      />
      {/* Arms */}
      <rect
        x={-shoulderW / 2 - limbW + 1}
        y={23}
        width={limbW}
        height={28}
        rx={limbW / 2}
        fill={fill}
        stroke={stroke}
      />
      <rect
        x={shoulderW / 2 - 1}
        y={23}
        width={limbW}
        height={28}
        rx={limbW / 2}
        fill={fill}
        stroke={stroke}
      />
      {/* Legs */}
      <rect
        x={-hipW / 2 + 1}
        y={60}
        width={hipW / 2 - 2}
        height={40}
        rx={limbW / 2}
        fill={fill}
        stroke={stroke}
      />
      <rect
        x={1}
        y={60}
        width={hipW / 2 - 2}
        height={40}
        rx={limbW / 2}
        fill={fill}
        stroke={stroke}
      />
    </svg>
  );
}
