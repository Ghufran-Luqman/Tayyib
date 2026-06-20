import { cn } from "@/lib/utils";
import type { Verdict } from "@/lib/foodfit/types";
import { verdictColorClasses } from "@/lib/foodfit/format";

export function FoodFitScoreCard({
  score,
  verdict,
  confidence,
  className,
}: {
  score: number;
  verdict: Verdict;
  confidence: "high" | "medium" | "low";
  className?: string;
}) {
  const c = verdictColorClasses(verdict);
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;
  const stroke =
    verdict === "green"
      ? "var(--fit-green)"
      : verdict === "amber"
        ? "var(--fit-amber)"
        : "var(--fit-red)";
  return (
    <div
      className={cn(
        "flex items-center gap-5 rounded-2xl border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="var(--color-muted)"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            fill="none"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-display text-3xl font-bold", c.text)}>{score}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Tayyib
          </span>
        </div>
      </div>
      <div className="flex-1">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Verdict
        </div>
        <div className={cn("mt-1 font-display text-2xl font-bold", c.text)}>
          {c.label}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {verdict === "green"
            ? "Based on your profile, this looks like a good fit."
            : verdict === "amber"
              ? "Okay occasionally — keep portions in check."
              : "May be worth limiting today based on your profile."}
        </p>
        <div className="mt-3 text-xs text-muted-foreground">
          Confidence:{" "}
          <span className="font-semibold text-foreground">{confidence}</span>
        </div>
      </div>
    </div>
  );
}
