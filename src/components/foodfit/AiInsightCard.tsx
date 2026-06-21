import { useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { generateInsight, type InsightInput } from "@/lib/analysis/llmExplain";
import type { Food, FoodAnalysis, HealthProfile, AppLanguage } from "@/lib/foodfit/types";

export function AiInsightCard({
  food,
  analysis,
  profile,
  language,
  todayContext,
  fallback,
}: {
  food: Food;
  analysis: FoodAnalysis;
  profile: HealthProfile | null;
  language: AppLanguage;
  todayContext?: string;
  fallback: string;
}) {
  const { t } = useTranslation();

  const input: InsightInput = {
    food: {
      name: food.name,
      brand: food.brand,
      nutrition: food.nutrition as Record<string, number | undefined>,
      novaGroup: food.novaGroup,
      nutriscore: food.nutriscore,
      dataConfidence: food.dataConfidence,
    },
    analysis: {
      score: analysis.score,
      verdict: analysis.verdict,
      keyReasons: analysis.keyReasons,
      watchOuts: analysis.watchOuts,
      positiveFactors: analysis.positiveFactors,
    },
    profile: profile
      ? {
          track: profile.track,
          goal: profile.goal,
          fitnessGoal: profile.fitnessGoal,
          conditions: profile.medicalConditions ?? [],
          halalStrictness: profile.halalStrictness,
        }
      : null,
    todayContext,
    language,
  };

  const { data, isLoading } = useQuery({
    // Re-run when the food, verdict, or language changes.
    queryKey: ["insight", food.id, analysis.verdict, analysis.score, language],
    queryFn: () => generateInsight({ data: input }),
    staleTime: 1000 * 60 * 30,
    retry: false,
  });

  const isAi = data?.source === "groq" && !!data.text;
  const body = isAi ? data!.text : fallback;

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
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
          {body}
        </p>
      )}
    </div>
  );
}
