import { cn } from "@/lib/utils";

export function NutrientProgressBar({
  label,
  value,
  target,
  unit = "",
  tone = "neutral",
  className,
}: {
  label: string;
  value: number;
  target?: number;
  unit?: string;
  tone?: "neutral" | "limit" | "good";
  className?: string;
}) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const over = target ? value > target : false;
  const color =
    tone === "limit"
      ? over
        ? "bg-fit-red"
        : pct >= 80
          ? "bg-fit-amber"
          : "bg-fit-green"
      : tone === "good"
        ? pct >= 80
          ? "bg-fit-green"
          : "bg-fit-blue"
        : "bg-fit-blue";
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {Math.round(value)}
          {unit}
          {target ? ` / ${target}${unit}` : ""}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${target ? pct : 0}%` }}
        />
      </div>
    </div>
  );
}
