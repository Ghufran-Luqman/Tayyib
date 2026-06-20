import { cn } from "@/lib/utils";
import type { Nutrition } from "@/lib/foodfit/types";
import { fmt } from "@/lib/foodfit/format";

const rows: { key: keyof Nutrition; label: string; unit: string; digits?: number }[] = [
  { key: "calories", label: "Calories", unit: " kcal" },
  { key: "protein", label: "Protein", unit: " g", digits: 1 },
  { key: "carbs", label: "Carbohydrates", unit: " g", digits: 1 },
  { key: "sugar", label: "of which sugars", unit: " g", digits: 1 },
  { key: "fat", label: "Fat", unit: " g", digits: 1 },
  { key: "saturatedFat", label: "of which saturates", unit: " g", digits: 1 },
  { key: "fibre", label: "Fibre", unit: " g", digits: 1 },
  { key: "sodium", label: "Sodium", unit: " mg" },
];

export function NutritionFactsCard({
  nutrition,
  servingSize,
  className,
}: {
  nutrition: Nutrition;
  servingSize?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5", className)}>
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-base font-bold">Nutrition facts</h3>
        {servingSize && (
          <span className="text-xs text-muted-foreground">per {servingSize}</span>
        )}
      </div>
      <dl className="mt-3 divide-y">
        {rows.map((r) => {
          const indented = r.key === "sugar" || r.key === "saturatedFat";
          return (
            <div
              key={r.key}
              className="flex items-center justify-between py-2 text-sm"
            >
              <dt
                className={cn(
                  indented ? "pl-4 text-muted-foreground" : "font-medium",
                )}
              >
                {r.label}
              </dt>
              <dd className="tabular-nums">
                {fmt(nutrition[r.key], r.unit, r.digits ?? 0)}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
