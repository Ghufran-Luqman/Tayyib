import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBody, PageHeader } from "@/components/foodfit/AppShell";
import { NutritionFactsCard } from "@/components/foodfit/NutritionFactsCard";
import { AllergenWarningCard } from "@/components/foodfit/AllergenWarningCard";
import { UltraProcessedBadge } from "@/components/foodfit/UltraProcessedBadge";
import { SourceAttribution } from "@/components/foodfit/SourceAttribution";
import { EmptyState } from "@/components/foodfit/EmptyState";
import { useFoodFitStore } from "@/lib/foodfit/store";

export const Route = createFileRoute("/_app/food/$id")({
  head: () => ({ meta: [{ title: "Food details · Tayyib" }] }),
  component: FoodDetail,
});

function FoodDetail() {
  const { id } = useParams({ from: "/_app/food/$id" });
  const food = useFoodFitStore((s) => s.foodsCache[id]);

  if (!food) {
    return (
      <PageBody>
        <EmptyState
          title="Food not found"
          description="This item is no longer cached. Try searching or scanning again."
          action={
            <Button asChild>
              <Link to="/search">Back to search</Link>
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
        subtitle={food.brand ? `${food.brand}${food.servingSize ? ` · ${food.servingSize}` : ""}` : food.servingSize}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/log" search={{ foodId: food.id } as any}>
                <Plus className="mr-2 h-4 w-4" /> Log
              </Link>
            </Button>
            <Button asChild className="bg-fit-green hover:bg-fit-green/90">
              <Link to="/analyze/$id" params={{ id: food.id }}>
                <Sparkles className="mr-2 h-4 w-4" /> Analyse fit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        }
      />
      <PageBody>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="overflow-hidden rounded-2xl border bg-card">
              {food.imageUrl ? (
                <img src={food.imageUrl} alt={food.name} className="aspect-square w-full object-cover" />
              ) : (
                <div className="aspect-square w-full bg-gradient-to-br from-fit-green/15 to-fit-blue/15" />
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <UltraProcessedBadge nova={food.novaGroup} />
              {food.nutriscore && (
                <span className="inline-flex items-center rounded-full border bg-card px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide">
                  Nutri-Score {food.nutriscore.toUpperCase()}
                </span>
              )}
              <span className="inline-flex items-center rounded-full border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                Data: {food.dataConfidence}
              </span>
            </div>
            <SourceAttribution source={food.source} className="mt-3" />
          </div>

          <div className="space-y-4 md:col-span-2">
            <AllergenWarningCard allergens={food.allergens} />
            <NutritionFactsCard nutrition={food.nutrition} servingSize={food.servingSize} />
            <div className="rounded-2xl border bg-card p-5">
              <h3 className="font-display text-base font-bold">Ingredients</h3>
              <p className="mt-2 text-sm text-foreground/80">
                {food.ingredients || "Ingredient list not available for this product."}
              </p>
              {food.additives.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Additives
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {food.additives.map((a) => (
                      <span
                        key={a}
                        className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground/80"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}
