import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageBody, PageHeader } from "@/components/foodfit/AppShell";
import { useFoodFitStore } from "@/lib/foodfit/store";
import type { Food, MealLog, MealType, Nutrition } from "@/lib/foodfit/types";
import { toast } from "sonner";

const searchSchema = z.object({ foodId: z.string().optional() });

export const Route = createFileRoute("/_app/log")({
  head: () => ({ meta: [{ title: "Log a meal · Tayyib" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: LogPage,
});

type Mode = "existing" | "custom";

function LogPage() {
  const navigate = useNavigate();
  const { foodId } = Route.useSearch();
  const foods = useFoodFitStore((s) => s.foodsCache);
  const addMealLog = useFoodFitStore((s) => s.addMealLog);
  const cacheFood = useFoodFitStore((s) => s.cacheFood);

  const initialFood = foodId ? foods[foodId] : undefined;
  const [mode, setMode] = useState<Mode>(initialFood ? "existing" : "custom");
  const [selectedId, setSelectedId] = useState<string | undefined>(initialFood?.id);
  const [mealType, setMealType] = useState<MealType>("snack");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [time, setTime] = useState(() => new Date().toISOString().slice(0, 16));

  // Custom meal fields
  const [customName, setCustomName] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [custom, setCustom] = useState<Nutrition>({});

  const foodList = useMemo(() => Object.values(foods), [foods]);
  const selected = selectedId ? foods[selectedId] : undefined;

  function buildCustomFood(): Food {
    return {
      id: `manual-${Date.now()}`,
      source: "manual",
      name: customName || "Custom meal",
      brand: customBrand || undefined,
      nutrition: custom,
      allergens: [],
      additives: [],
      dataConfidence: "low",
      createdAt: new Date().toISOString(),
    };
  }

  function save() {
    let food: Food | undefined = selected;
    if (mode === "custom") {
      if (!customName.trim()) {
        toast.error("Please give your meal a name.");
        return;
      }
      food = buildCustomFood();
      cacheFood(food);
    }
    if (!food) {
      toast.error("Pick a food or fill in a custom meal.");
      return;
    }
    const n = food.nutrition;
    const m: MealLog = {
      id: `log-${Date.now()}`,
      foodId: food.id,
      foodName: food.name,
      brand: food.brand,
      mealType,
      quantity,
      servingMultiplier: quantity,
      loggedAt: new Date(time).toISOString(),
      notes: notes || undefined,
      calories: (n.calories ?? 0) * quantity,
      protein: (n.protein ?? 0) * quantity,
      carbs: (n.carbs ?? 0) * quantity,
      fat: (n.fat ?? 0) * quantity,
      sugar: (n.sugar ?? 0) * quantity,
      sodium: (n.sodium ?? 0) * quantity,
      saturatedFat: (n.saturatedFat ?? 0) * quantity,
      fibre: (n.fibre ?? 0) * quantity,
    };
    addMealLog(m);
    toast.success("Meal logged");
    navigate({ to: "/dashboard" });
  }

  return (
    <>
      <PageHeader title="Log a meal" subtitle="Add a packaged food, recent item, or a custom meal." />
      <PageBody>
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="inline-flex rounded-xl border bg-card p-1 text-sm">
            <button
              onClick={() => setMode("existing")}
              className={`rounded-lg px-4 py-1.5 ${
                mode === "existing" ? "bg-fit-green text-white" : "text-muted-foreground"
              }`}
            >
              Pick a food
            </button>
            <button
              onClick={() => setMode("custom")}
              className={`rounded-lg px-4 py-1.5 ${
                mode === "custom" ? "bg-fit-green text-white" : "text-muted-foreground"
              }`}
            >
              Custom / fast-food
            </button>
          </div>

          {mode === "existing" && (
            <div className="space-y-2">
              <Label>Food</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a food…" />
                </SelectTrigger>
                <SelectContent>
                  {foodList.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                      {f.brand ? ` · ${f.brand}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selected && (
                <div className="rounded-xl border bg-card p-3 text-xs text-muted-foreground">
                  Per serving: {selected.nutrition.calories ?? "—"} kcal ·{" "}
                  {selected.nutrition.protein ?? "—"}g protein ·{" "}
                  {selected.nutrition.sugar ?? "—"}g sugar
                </div>
              )}
            </div>
          )}

          {mode === "custom" && (
            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Meal name</Label>
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Chicken wrap"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Brand / restaurant</Label>
                  <Input
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    placeholder="e.g. Local Café"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                {(
                  [
                    ["calories", "Calories (kcal)"],
                    ["protein", "Protein (g)"],
                    ["carbs", "Carbs (g)"],
                    ["sugar", "Sugar (g)"],
                    ["fat", "Fat (g)"],
                    ["saturatedFat", "Sat fat (g)"],
                    ["fibre", "Fibre (g)"],
                    ["sodium", "Sodium (mg)"],
                  ] as [keyof Nutrition, string][]
                ).map(([k, l]) => (
                  <div key={k} className="space-y-1.5">
                    <Label className="text-xs">{l}</Label>
                    <Input
                      type="number"
                      value={custom[k] ?? ""}
                      onChange={(e) =>
                        setCustom({
                          ...custom,
                          [k]: e.target.value ? +e.target.value : undefined,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                If you have the nutrition label from a restaurant page, paste the numbers above.
                You can save this as a recurring custom food after logging.
              </p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Meal type</Label>
              <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Servings</Label>
              <Input
                type="number"
                step="0.25"
                value={quantity}
                onChange={(e) => setQuantity(+e.target.value || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>When</Label>
              <Input
                type="datetime-local"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How it felt, who you ate with, anything memorable…"
              rows={2}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={save} className="bg-fit-green hover:bg-fit-green/90">
              Save to meal log
            </Button>
          </div>
        </div>
      </PageBody>
    </>
  );
}
