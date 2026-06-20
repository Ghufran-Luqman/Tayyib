import { cn } from "@/lib/utils";
import type { Verdict } from "@/lib/foodfit/types";
import { verdictColorClasses } from "@/lib/foodfit/format";

export function VerdictBadge({
  verdict,
  size = "md",
  className,
}: {
  verdict: Verdict;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const c = verdictColorClasses(verdict);
  const sizes = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wide",
        c.bg,
        c.text,
        c.border,
        sizes[size],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.text.replace("text-", "bg-"))} />
      {c.label}
    </span>
  );
}
