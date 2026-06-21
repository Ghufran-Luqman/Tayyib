import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowRight, Plus, Shield, ThumbsUp, TriangleAlert } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PageBody, PageHeader } from "@/components/foodfit/AppShell";
import { FoodFitScoreCard } from "@/components/foodfit/FoodFitScoreCard";
import { NutritionFactsCard } from "@/components/foodfit/NutritionFactsCard";
import { AllergenWarningCard } from "@/components/foodfit/AllergenWarningCard";
import { MedicalDisclaimerBanner } from "@/components/foodfit/MedicalDisclaimerBanner";
import { SourceAttribution } from "@/components/foodfit/SourceAttribution";
import { VerdictBadge } from "@/components/foodfit/VerdictBadge";
import { EmptyState } from "@/components/foodfit/EmptyState";
import { useFoodFitStore } from "@/lib/foodfit/store";
import { analyzeFood } from "@/lib/analysis/analyzeFood";
import { AiInsightCard } from "@/components/foodfit/AiInsightCard";
import { sumLogs, todaysLogs } from "@/lib/analysis/rules";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_app/analyze/$id")({
  head: () => ({ meta: [{ title: "Food analysis · Tayyib" }] }),
  component: AnalyzePage,
});

function AnalyzePage() {
  const { id } = useParams({ from: "/_app/analyze/$id" });
  const food = useFoodFitStore((s) => s.foodsCache[id]);
  const profile = useFoodFitStore((s) => s.profile);
  const mealLogs = useFoodFitStore((s) => s.mealLogs);
  const foods = useFoodFitStore((s) => s.foodsCache);
  const llmEnabled = useFoodFitStore((s) => s.settings.llmExplanationsEnabled);
  const halalStrictness = useFoodFitStore((s) => s.settings.halalStrictness);
  const language = useFoodFitStore((s) => s.settings.language);
  const { t } = useTranslation();

  const todayContext = useMemo(() => {
    const totals = sumLogs(todaysLogs(mealLogs), foods);
    if (!totals.count) return undefined;
    return `${totals.count} items, ${Math.round(totals.calories)} kcal, ${Math.round(
      totals.sodium,
    )}mg sodium, ${Math.round(totals.sugar)}g sugar`;
  }, [mealLogs, foods]);

  const analysis = useMemo(
    () => (food ? analyzeFood(food, profile, mealLogs, foods, halalStrictness) : null),
    [food, profile, mealLogs, foods, halalStrictness],
  );

  if (!food || !analysis) {
    return (
      <PageBody>
        <EmptyState
          title="Nothing to analyse"
          description="Pick a food first, then come back."
          action={
            <Button asChild>
              <Link to="/search">Find a food</Link>
            </Button>
          }
        />
      </PageBody>
    );
  }

  return (
    <>
      <PageHeader
        title={food.name}
        subtitle={`${food.brand ? food.brand + " · " : ""}${food.servingSize ?? ""}`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/search">Try another</Link>
            </Button>
            <Button asChild className="bg-fit-green hover:bg-fit-green/90">
              <Link to="/log" search={{ foodId: food.id } as any}>
                <Plus className="mr-2 h-4 w-4" /> Log this food
              </Link>
            </Button>
          </div>
        }
      />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <FoodFitScoreCard
              score={analysis.score}
              verdict={analysis.verdict}
              confidence={analysis.confidence}
            />

            {llmEnabled && (
              <AiInsightCard
                food={food}
                analysis={analysis}
                profile={profile}
                language={language}
                todayContext={todayContext}
                fallback={analysis.summary}
              />
            )}

            <div className="rounded-2xl border bg-card p-5">
              <h3 className="font-display text-base font-bold">Why this result?</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Section
                  icon={<TriangleAlert className="h-4 w-4 text-fit-red" />}
                  title="Key reasons"
                  items={analysis.keyReasons}
                  empty="No specific concerns flagged."
                />
                <Section
                  icon={<TriangleAlert className="h-4 w-4 text-fit-amber" />}
                  title="Watch-outs"
                  items={analysis.watchOuts}
                  empty="Nothing to watch right now."
                />
                <Section
                  icon={<ThumbsUp className="h-4 w-4 text-fit-green" />}
                  title="Positive factors"
                  items={analysis.positiveFactors}
                  empty="No standout nutritional positives found."
                />
                <Section
                  icon={<ArrowRight className="h-4 w-4 text-fit-blue" />}
                  title="Better alternatives"
                  items={analysis.alternativeSuggestions}
                  empty="This is already a reasonable choice."
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-muted/50 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Portion guidance
                  </div>
                  <p className="mt-1 text-sm">{analysis.portionSuggestion}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Frequency guidance
                  </div>
                  <p className="mt-1 text-sm">{analysis.frequencySuggestion}</p>
                </div>
              </div>
            </div>

            {analysis.ruleFlags.length > 0 && (
              <div className="rounded-2xl border bg-card p-5">
                <h3 className="font-display text-base font-bold">All flags</h3>
                <ul className="mt-3 space-y-2">
                  {analysis.ruleFlags.map((f) => (
                    <li
                      key={f.id}
                      className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
                        f.severity === "avoid"
                          ? "border-fit-red/30 bg-fit-red/5"
                          : f.severity === "watch"
                            ? "border-fit-amber/30 bg-fit-amber/5"
                            : "border-fit-blue/30 bg-fit-blue/5"
                      }`}
                    >
                      <Shield
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          f.severity === "avoid"
                            ? "text-fit-red"
                            : f.severity === "watch"
                              ? "text-fit-amber"
                              : "text-fit-blue"
                        }`}
                      />
                      <span>{f.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <MedicalDisclaimerBanner />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Verdict
                </span>
                <VerdictBadge verdict={analysis.verdict} />
              </div>
            </div>
            <AllergenWarningCard allergens={food.allergens} />
            <NutritionFactsCard nutrition={food.nutrition} servingSize={food.servingSize} />
            <div className="rounded-2xl border bg-card p-4">
              <h4 className="text-sm font-semibold">Ingredients</h4>
              <p className="mt-2 text-xs text-foreground/80">
                {food.ingredients || "Not available for this product."}
              </p>
              <SourceAttribution source={food.source} className="mt-3" />
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}

function Section({
  icon,
  title,
  items,
  empty,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {title}
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm">
          {items.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
