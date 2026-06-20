import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function MedicalDisclaimerBanner({
  variant = "default",
  className,
}: {
  variant?: "default" | "compact";
  className?: string;
}) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-start gap-2 rounded-lg border border-fit-blue/20 bg-fit-blue/5 p-3 text-xs text-muted-foreground",
          className,
        )}
      >
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fit-blue" />
        <span>
          Educational guidance only — not medical advice. For medical conditions,
          please consult a qualified healthcare professional.
        </span>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-fit-blue/20 bg-fit-blue/5 p-4",
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-fit-blue" />
      <div className="text-sm text-foreground/80">
        <p className="font-medium text-foreground">
          Tayyib is educational, not medical advice.
        </p>
        <p className="mt-0.5 text-muted-foreground">
          Results are based on your stated profile and publicly available
          nutrition data. For medical conditions, allergies, pregnancy, or
          medication interactions, please check with your clinician.
        </p>
      </div>
    </div>
  );
}
