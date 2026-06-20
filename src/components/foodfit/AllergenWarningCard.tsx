import { AlertTriangle } from "lucide-react";

export function AllergenWarningCard({ allergens }: { allergens: string[] }) {
  if (!allergens.length) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-fit-red/30 bg-fit-red/5 p-4">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-fit-red" />
      <div>
        <div className="text-sm font-semibold text-fit-red">Allergen alert</div>
        <p className="mt-0.5 text-sm text-foreground/80">
          Contains: {allergens.map((a) => a).join(", ")}.
        </p>
      </div>
    </div>
  );
}
