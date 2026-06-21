import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Camera,
  ChevronRight,
  Flame,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBody, PageHeader } from "@/components/foodfit/AppShell";
import { MedicalDisclaimerBanner } from "@/components/foodfit/MedicalDisclaimerBanner";
import { NutrientProgressBar } from "@/components/foodfit/NutrientProgressBar";
import { EmptyState } from "@/components/foodfit/EmptyState";
import { VerdictBadge } from "@/components/foodfit/VerdictBadge";
import { useFoodFitStore } from "@/lib/foodfit/store";
import { sumLogs, todaysLogs } from "@/lib/analysis/rules";
import { DashboardTrackPanel } from "@/components/foodfit/DashboardTrackPanel";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard · Tayyib" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useTranslation();
  const profile = useFoodFitStore((s) => s.profile);
  const mealLogs = useFoodFitStore((s) => s.mealLogs);
  const foodsCache = useFoodFitStore((s) => s.foodsCache);
  const loadDemoData = useFoodFitStore((s) => s.loadDemoData);

  const today = useMemo(() => todaysLogs(mealLogs), [mealLogs]);
  const totals = useMemo(() => sumLogs(today, foodsCache), [today, foodsCache]);
  const limits = profile?.clinicianLimits ?? {};

  const subtitle =
    profile?.track === "fitness"
      ? t("dashboard.fitnessSubtitle")
      : profile?.track === "condition"
        ? t("dashboard.conditionSubtitle")
        : profile?.track === "both"
          ? t("dashboard.bothSubtitle")
          : t("dashboard.defaultSubtitle");

  const recentFoods = useMemo(() => {
    const seen = new Set<string>();
    const out = [] as { id: string; name: string; brand?: string }[];
    for (const m of mealLogs) {
      if (seen.has(m.foodId)) continue;
      seen.add(m.foodId);
      out.push({ id: m.foodId, name: m.foodName, brand: m.brand });
      if (out.length >= 5) break;
    }
    if (!out.length) {
      Object.values(foodsCache)
        .slice(0, 5)
        .forEach((f) => out.push({ id: f.id, name: f.name, brand: f.brand }));
    }
    return out;
  }, [mealLogs, foodsCache]);

  return (
    <>
      <PageHeader
        title={t("dashboard.greeting", { name: profile?.nickname ? `, ${profile.nickname}` : "" }) + " 👋"}
        subtitle={subtitle}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/scan">
                <Camera className="mr-2 h-4 w-4" /> {t("dashboard.scan")}
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-fit-green hover:bg-fit-green/90">
              <Link to="/search">
                <Plus className="mr-2 h-4 w-4" /> {t("dashboard.addFood")}
              </Link>
            </Button>
          </div>
        }
      />
      <PageBody>
        {!profile && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-fit-amber/30 bg-fit-amber/5 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-fit-amber" />
              <div>
                <div className="text-sm font-semibold">No profile yet</div>
                <p className="text-xs text-muted-foreground">
                  Create one for personalised verdicts, or load a demo profile to explore.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={loadDemoData}>
                Load demo
              </Button>
              <Button asChild size="sm" className="bg-fit-green hover:bg-fit-green/90">
                <Link to="/onboarding">Create profile</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Track-specific hero panel (fitness vs condition vs both) */}
        <DashboardTrackPanel profile={profile} totals={totals} className="mb-6" />

        {/* Top metric */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5 md:col-span-1">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Today's calories
              </div>
              <Flame className="h-4 w-4 text-fit-amber" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold">
                {Math.round(totals.calories)}
              </span>
              <span className="text-sm text-muted-foreground">
                / {limits.calorieTarget ?? 2000} kcal
              </span>
            </div>
            <div className="mt-4">
              <NutrientProgressBar
                label="Calories"
                value={totals.calories}
                target={limits.calorieTarget}
                unit=" kcal"
                tone="limit"
              />
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              {totals.count} item{totals.count === 1 ? "" : "s"} logged today
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5 md:col-span-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Nutrient targets
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NutrientProgressBar
                label="Protein"
                value={totals.protein}
                target={limits.proteinTargetG}
                unit="g"
                tone="good"
              />
              <NutrientProgressBar
                label="Carbs"
                value={totals.carbs}
                target={limits.carbTargetG}
                unit="g"
              />
              <NutrientProgressBar
                label="Sugar"
                value={totals.sugar}
                target={limits.sugarLimitG}
                unit="g"
                tone="limit"
              />
              <NutrientProgressBar
                label="Sodium"
                value={totals.sodium}
                target={limits.sodiumLimitMg}
                unit="mg"
                tone="limit"
              />
              <NutrientProgressBar
                label="Sat fat"
                value={totals.saturatedFat}
                target={limits.saturatedFatLimitG}
                unit="g"
                tone="limit"
              />
              <NutrientProgressBar
                label="Fibre"
                value={totals.fibre}
                target={limits.fibreTargetG}
                unit="g"
                tone="good"
              />
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: "/scan", icon: Camera, title: "Scan barcode", body: "Use your camera or type the code." },
            { to: "/search", icon: Search, title: "Search food", body: "Search Open Food Facts." },
            { to: "/log", icon: Plus, title: "Log a meal", body: "Custom meal or fast-food." },
            { to: "/insights", icon: Activity, title: "See insights", body: "Trends across your week." },
          ].map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fit-green/10 text-fit-green">
                  <q.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{q.title}</div>
                  <div className="text-xs text-muted-foreground">{q.body}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>

        {/* Recent foods */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Recent foods</h2>
            <Link to="/history" className="text-xs text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          {recentFoods.length === 0 ? (
            <EmptyState
              icon={<Plus className="h-5 w-5" />}
              title="No foods yet"
              description="Scan or search a food to get your first Tayyib verdict."
              action={
                <Button asChild className="bg-fit-green hover:bg-fit-green/90">
                  <Link to="/scan">Scan a food</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentFoods.map((f) => (
                <Link
                  key={f.id}
                  to="/food/$id"
                  params={{ id: f.id }}
                  className="flex items-center gap-3 rounded-2xl border bg-card p-3 transition-shadow hover:shadow-md"
                >
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-fit-green/15 to-fit-blue/15" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{f.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {f.brand ?? "—"}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <MedicalDisclaimerBanner variant="compact" />
        </div>
      </PageBody>
    </>
  );
}
