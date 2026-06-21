import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageBody, PageHeader } from "@/components/foodfit/AppShell";
import { EmptyState } from "@/components/foodfit/EmptyState";
import { useFoodFitStore } from "@/lib/foodfit/store";
import { openFoodFactsProvider } from "@/lib/foodProviders";
import type { Food } from "@/lib/foodfit/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/search")({
  head: () => ({ meta: [{ title: "Search foods · Tayyib" }] }),
  component: SearchPage,
});

function SearchPage() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Food[] | null>(null);
  const cached = useFoodFitStore((s) => s.foodsCache);
  const cacheFoods = useFoodFitStore((s) => s.cacheFoods);

  const cachedList = useMemo(() => Object.values(cached).slice(0, 20), [cached]);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const foods = await openFoodFactsProvider.searchProducts(q, 20);
      cacheFoods(foods);
      setResults(foods);
    } catch {
      toast.error("Search failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title={t("pages.searchTitle")}
        subtitle={t("pages.searchSubtitle")}
        action={
          <Button asChild variant="outline">
            <Link to="/log">
              <Plus className="mr-2 h-4 w-4" /> Custom meal
            </Link>
          </Button>
        }
      />
      <PageBody>
        <form onSubmit={onSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search e.g. greek yogurt, cookies, hummus…"
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={loading} className="bg-fit-green hover:bg-fit-green/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </form>

        <div className="mt-8">
          <h2 className="mb-3 font-display text-lg font-bold">
            {results ? "Results" : "Recent & demo foods"}
          </h2>
          {loading && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl border bg-muted" />
              ))}
            </div>
          )}
          {!loading && results && results.length === 0 && (
            <EmptyState
              icon={<Search className="h-5 w-5" />}
              title="No results"
              description="Try a different keyword, or scan the barcode instead."
            />
          )}
          {!loading && (results ?? cachedList).length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(results ?? cachedList).map((f) => (
                <Link
                  key={f.id}
                  to="/food/$id"
                  params={{ id: f.id }}
                  className="flex items-center gap-3 rounded-2xl border bg-card p-3 transition-shadow hover:shadow-md"
                >
                  {f.imageUrl ? (
                    <img
                      src={f.imageUrl}
                      alt={f.name}
                      className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-fit-green/15 to-fit-blue/15" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{f.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {f.brand ?? f.source}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PageBody>
    </>
  );
}
