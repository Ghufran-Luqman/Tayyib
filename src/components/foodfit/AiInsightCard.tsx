import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, ShieldAlert, Sparkles, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  generateInsight,
  type DietCheck,
  type InsightInput,
} from "@/lib/analysis/llmExplain";
import { cn } from "@/lib/utils";
import type { Food, FoodAnalysis, HealthProfile, AppLanguage } from "@/lib/foodfit/types";

const DIET_LABEL: Record<string, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  halal: "Halal",
  kosher: "Kosher",
  "gluten-free": "Gluten-free",
  "dairy-free": "Dairy-free",
  "low-sodium": "Low sodium",
  "low-sugar": "Low sugar",
  "high-protein": "High protein",
};
const COND_LABEL: Record<string, string> = {
  diabetes: "Diabetes",
  hypertension: "High blood pressure",
  "high-cholesterol": "High cholesterol",
  "heart-disease": "Heart disease",
  "kidney-disease": "Kidney disease",
  coeliac: "Coeliac (gluten)",
  "lactose-intolerance": "Lactose intolerance",
  pregnancy: "Pregnancy",
};

function buildRequirements(profile: HealthProfile | null, halal: string): string[] {
  if (!profile) return [];
  const reqs: string[] = [];
  const strictness = profile.halalStrictness && profile.halalStrictness !== "off" ? profile.halalStrictness : halal;
  if (strictness && strictness !== "off") reqs.push(`Halal (${strictness})`);
  for (const d of profile.dietaryPreferences ?? []) if (d !== "halal") reqs.push(DIET_LABEL[d] ?? d);
  for (const a of profile.allergies ?? []) reqs.push(`${a} allergy`);
  for (const c of profile.medicalConditions ?? []) reqs.push(COND_LABEL[c] ?? c);
  return reqs;
}

// Deterministic fallback when Groq is unavailable — derived from the rule engine
// so dietary/allergy warnings still appear (never silently permissive).
function fallbackChecks(analysis: FoodAnalysis): DietCheck[] {
  return analysis.ruleFlags
    .filter((f) => f.category === "allergy" || f.category === "diet" || f.category === "condition")
    .map((f) => ({
      requirement: f.category === "allergy" ? "Allergen" : f.category === "diet" ? "Dietary" : "Condition",
      status: (f.severity === "avoid" ? "violation" : "warning") as DietCheck["status"],
      evidence: null,
      note: f.message,
    }));
}

const STATUS_STYLE: Record<DietCheck["status"], { cls: string; Icon: typeof CheckCircle2 }> = {
  violation: { cls: "border-fit-red/40 bg-fit-red/5 text-fit-red", Icon: ShieldAlert },
  warning: { cls: "border-fit-amber/40 bg-fit-amber/5 text-fit-amber", Icon: TriangleAlert },
  pass: { cls: "border-fit-green/40 bg-fit-green/5 text-fit-green", Icon: CheckCircle2 },
};

export function AiInsightCard({
  food,
  analysis,
  profile,
  language,
  halalStrictness,
  todayContext,
  fallback,
}: {
  food: Food;
  analysis: FoodAnalysis;
  profile: HealthProfile | null;
  language: AppLanguage;
  halalStrictness: string;
  todayContext?: string;
  fallback: string;
}) {
  const { t } = useTranslation();
  const requirements = buildRequirements(profile, halalStrictness);

  const input: InsightInput = {
    food: {
      name: food.name,
      brand: food.brand,
      ingredients: food.ingredients,
      allergens: food.allergens,
      nutrition: food.nutrition as Record<string, number | undefined>,
      novaGroup: food.novaGroup,
      nutriscore: food.nutriscore,
      dataConfidence: food.dataConfidence,
    },
    analysis: {
      score: analysis.score,
      verdict: analysis.verdict,
      keyReasons: analysis.keyReasons,
      positiveFactors: analysis.positiveFactors,
    },
    requirements,
    todayContext,
    language,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["insight", food.id, analysis.verdict, analysis.score, language, requirements.join("|")],
    queryFn: () => generateInsight({ data: input }),
    staleTime: 1000 * 60 * 30,
    retry: false,
  });

  const isAi = data?.source === "groq";
  const text = isAi && data?.text ? data.text : fallback;
  const checks: DietCheck[] = isAi && data ? data.checks : fallbackChecks(analysis);
  const shortVerdict = isAi && data?.shortVerdict ? data.shortVerdict : "";

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-fit-green">
          <Sparkles className="h-3.5 w-3.5" /> {t("analysis.insightTitle")}
        </div>
        {isAi && (
          <span className="rounded-full bg-fit-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fit-green">
            {t("analysis.aiBadge")}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("analysis.thinking")}
        </div>
      ) : (
        <>
          {shortVerdict && (
            <p className="mt-2 font-display text-lg font-bold leading-snug">{shortVerdict}</p>
          )}
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{text}</p>

          {checks.length > 0 && (
            <div className="mt-4 space-y-2">
              {checks.map((c, i) => {
                const s = STATUS_STYLE[c.status];
                return (
                  <div key={i} className={cn("rounded-xl border p-3", s.cls)}>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <s.Icon className="h-4 w-4 shrink-0" />
                      {c.requirement}
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wider">
                        {c.status}
                      </span>
                    </div>
                    {c.note && <p className="mt-1 text-xs text-foreground/80">{c.note}</p>}
                    {c.evidence && (
                      <p className="mt-1 text-xs italic text-foreground/70">
                        Found in ingredients: &ldquo;{c.evidence}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
