import { useTranslation } from "react-i18next";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { eachDayOfInterval, format, startOfDay, subDays } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageBody, PageHeader } from "@/components/foodfit/AppShell";
import { EmptyState } from "@/components/foodfit/EmptyState";
import { useFoodFitStore } from "@/lib/foodfit/store";
import { isUltraProcessed } from "@/lib/analysis/rules";

export const Route = createFileRoute("/_app/insights")({
  head: () => ({ meta: [{ title: "Insights · Tayyib" }] }),
  component: InsightsPage,
});

function InsightsPage() {
  const { t } = useTranslation();
  const logs = useFoodFitStore((s) => s.mealLogs);
  const foods = useFoodFitStore((s) => s.foodsCache);

  const last7 = useMemo(() => {
    const end = startOfDay(new Date());
    const start = subDays(end, 6);
    const days = eachDayOfInterval({ start, end });
    return days.map((d) => {
      const k = startOfDay(d).getTime();
      const items = logs.filter((m) => {
        const t = startOfDay(new Date(m.loggedAt)).getTime();
        return t === k;
      });
      return {
        date: format(d, "EEE"),
        calories: Math.round(items.reduce((a, m) => a + m.calories, 0)),
        sugar: Math.round(items.reduce((a, m) => a + m.sugar, 0)),
        sodium: Math.round(items.reduce((a, m) => a + m.sodium, 0)),
        fibre: Math.round(items.reduce((a, m) => a + m.fibre, 0)),
        ultra: items.filter((m) => {
          const f = foods[m.foodId];
          return f && isUltraProcessed(f);
        }).length,
      };
    });
  }, [logs, foods]);

  const totals = useMemo(() => {
    const sum = (k: "calories" | "sugar" | "sodium" | "fibre") =>
      last7.reduce((a, d) => a + d[k], 0);
    return {
      avgCal: Math.round(sum("calories") / 7),
      avgSugar: Math.round(sum("sugar") / 7),
      avgSodium: Math.round(sum("sodium") / 7),
      avgFibre: Math.round(sum("fibre") / 7),
      ultraTotal: last7.reduce((a, d) => a + d.ultra, 0),
      mealsTotal: logs.filter((m) => {
        const t = startOfDay(new Date(m.loggedAt)).getTime();
        const start = startOfDay(subDays(new Date(), 6)).getTime();
        return t >= start;
      }).length,
    };
  }, [last7, logs]);

  const topFoods = useMemo(() => {
    const counts = new Map<string, { name: string; brand?: string; count: number }>();
    for (const m of logs) {
      const cur = counts.get(m.foodId) ?? {
        name: m.foodName,
        brand: m.brand,
        count: 0,
      };
      cur.count += 1;
      counts.set(m.foodId, cur);
    }
    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [logs]);

  const hasData = logs.length > 0;

  return (
    <>
      <PageHeader title={t("pages.insightsTitle")} subtitle={t("pages.insightsSubtitle")} />
      <PageBody>
        {!hasData ? (
          <EmptyState
            title="No data yet"
            description="Log a few meals to see your weekly trends."
          />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { l: "Avg calories", v: `${totals.avgCal}`, u: "kcal/day", tone: "text-foreground" },
                { l: "Avg sugar", v: `${totals.avgSugar}`, u: "g/day", tone: "text-fit-amber" },
                { l: "Avg sodium", v: `${totals.avgSodium}`, u: "mg/day", tone: "text-fit-red" },
                { l: "Avg fibre", v: `${totals.avgFibre}`, u: "g/day", tone: "text-fit-green" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border bg-card p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {s.l}
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className={`font-display text-2xl font-bold ${s.tone}`}>{s.v}</span>
                    <span className="text-xs text-muted-foreground">{s.u}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border bg-card p-4">
                <h3 className="font-display text-base font-bold">Calories per day</h3>
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={last7}>
                      <defs>
                        <linearGradient id="cal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--fit-green)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="var(--fit-green)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-muted)" />
                      <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                      <Area
                        type="monotone"
                        dataKey="calories"
                        stroke="var(--fit-green)"
                        strokeWidth={2}
                        fill="url(#cal)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-4">
                <h3 className="font-display text-base font-bold">Sugar & sodium</h3>
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last7}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-muted)" />
                      <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                      <Bar dataKey="sugar" fill="var(--fit-amber)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="sodium" fill="var(--fit-red)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border bg-card p-4">
                <h3 className="font-display text-base font-bold">Most-logged foods</h3>
                <ul className="mt-3 divide-y">
                  {topFoods.map((t) => (
                    <li key={t.name} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <div className="font-medium">{t.name}</div>
                        {t.brand && (
                          <div className="text-xs text-muted-foreground">{t.brand}</div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{t.count}×</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border bg-card p-4">
                <h3 className="font-display text-base font-bold">Ultra-processed foods</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  In the last 7 days you logged{" "}
                  <span className="font-semibold text-foreground">{totals.ultraTotal}</span>{" "}
                  ultra-processed item{totals.ultraTotal === 1 ? "" : "s"}.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  A long-term shift toward minimally processed foods is generally a
                  positive direction for most profiles.
                </p>
              </div>
            </div>
          </>
        )}
      </PageBody>
    </>
  );
}
