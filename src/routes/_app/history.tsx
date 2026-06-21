import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, startOfDay } from "date-fns";
import { Download, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageBody, PageHeader } from "@/components/foodfit/AppShell";
import { EmptyState } from "@/components/foodfit/EmptyState";
import { useFoodFitStore } from "@/lib/foodfit/store";
import type { MealLog } from "@/lib/foodfit/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/history")({
  head: () => ({ meta: [{ title: "Meal history · Tayyib" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { t } = useTranslation();
  const logs = useFoodFitStore((s) => s.mealLogs);
  const removeMealLog = useFoodFitStore((s) => s.removeMealLog);
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      logs.filter((l) =>
        q ? `${l.foodName} ${l.brand ?? ""}`.toLowerCase().includes(q.toLowerCase()) : true,
      ),
    [logs, q],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, MealLog[]>();
    for (const m of filtered) {
      const k = startOfDay(new Date(m.loggedAt)).toISOString();
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(m);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  function exportCsv() {
    if (!logs.length) {
      toast.error("Nothing to export yet.");
      return;
    }
    const headers = [
      "loggedAt",
      "mealType",
      "foodName",
      "brand",
      "servings",
      "calories",
      "protein",
      "carbs",
      "sugar",
      "fat",
      "saturatedFat",
      "fibre",
      "sodium",
      "notes",
    ];
    const rows = logs.map((m) => [
      m.loggedAt,
      m.mealType,
      m.foodName,
      m.brand ?? "",
      m.quantity,
      m.calories,
      m.protein,
      m.carbs,
      m.sugar,
      m.fat,
      m.saturatedFat,
      m.fibre,
      m.sodium,
      (m.notes ?? "").replace(/[\r\n,]+/g, " "),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `foodfit-meals-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title={t("pages.historyTitle")}
        subtitle={t("pages.historySubtitle")}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button asChild className="bg-fit-green hover:bg-fit-green/90">
              <Link to="/log">
                <Plus className="mr-2 h-4 w-4" /> New entry
              </Link>
            </Button>
          </div>
        }
      />
      <PageBody>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search logged foods…"
          className="max-w-sm"
        />

        {byDay.length === 0 ? (
          <EmptyState
            className="mt-8"
            title="No meals yet"
            description="Log your first meal to start tracking calories and nutrients."
            action={
              <Button asChild className="bg-fit-green hover:bg-fit-green/90">
                <Link to="/log">Log a meal</Link>
              </Button>
            }
          />
        ) : (
          <div className="mt-6 space-y-6">
            {byDay.map(([day, items]) => {
              const dayTotals = items.reduce(
                (acc, m) => ({
                  cal: acc.cal + m.calories,
                  protein: acc.protein + m.protein,
                  sugar: acc.sugar + m.sugar,
                  sodium: acc.sodium + m.sodium,
                }),
                { cal: 0, protein: 0, sugar: 0, sodium: 0 },
              );
              return (
                <section key={day}>
                  <div className="mb-2 flex items-end justify-between">
                    <h2 className="font-display text-base font-bold">
                      {format(new Date(day), "EEEE, d MMM")}
                    </h2>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(dayTotals.cal)} kcal · {Math.round(dayTotals.protein)}g protein ·{" "}
                      {Math.round(dayTotals.sugar)}g sugar · {Math.round(dayTotals.sodium)}mg sodium
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border bg-card">
                    {items.map((m, i) => (
                      <div
                        key={m.id}
                        className={`flex items-center gap-3 p-3 ${
                          i > 0 ? "border-t" : ""
                        }`}
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-xs font-semibold uppercase">
                          {m.mealType.slice(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">{m.foodName}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {format(new Date(m.loggedAt), "HH:mm")} ·{" "}
                            {m.quantity} serving{m.quantity === 1 ? "" : "s"}
                            {m.brand ? ` · ${m.brand}` : ""}
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <div className="font-semibold">{Math.round(m.calories)} kcal</div>
                          <div className="text-muted-foreground">
                            {Math.round(m.protein)}p · {Math.round(m.sugar)}s
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            removeMealLog(m.id);
                            toast.success("Entry removed");
                          }}
                          className="ml-2 text-muted-foreground hover:text-fit-red"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </PageBody>
    </>
  );
}
