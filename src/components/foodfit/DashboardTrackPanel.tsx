import { Link } from "@tanstack/react-router";
import {
  Activity,
  Dumbbell,
  Flame,
  HeartPulse,
  ScanLine,
  Target,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { NutrientProgressBar } from "@/components/foodfit/NutrientProgressBar";
import { cn } from "@/lib/utils";
import type { HealthProfile } from "@/lib/foodfit/types";
import type { DailyTotals } from "@/lib/analysis/rules";

const FITNESS_GOAL_LABEL: Record<string, string> = {
  "lose-weight": "Lose weight",
  "gain-muscle": "Gain muscle",
  maintain: "Maintain weight",
  "improve-energy": "Improve energy",
  "eat-cleaner": "Eat less processed food",
};

const CONDITION_LABEL: Record<string, string> = {
  diabetes: "Diabetes",
  hypertension: "High blood pressure",
  "high-cholesterol": "High cholesterol",
  "heart-disease": "Heart disease",
  "kidney-disease": "Kidney disease",
  coeliac: "Coeliac",
  ibs: "IBS",
  gerd: "GERD",
  "lactose-intolerance": "Lactose intolerance",
  pregnancy: "Pregnancy",
  other: "Other",
};

function FitnessPanel({
  profile,
  totals,
}: {
  profile: HealthProfile;
  totals: DailyTotals;
}) {
  const { t } = useTranslation();
  const limits = profile.clinicianLimits ?? {};
  const goal = profile.fitnessGoal
    ? FITNESS_GOAL_LABEL[profile.fitnessGoal] ?? profile.fitnessGoal
    : undefined;

  return (
    <div className="rounded-2xl border bg-gradient-to-br from-fit-green/10 to-transparent p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-fit-green">
        <Dumbbell className="h-4 w-4" />
        {t("dashboard.goalProgress")}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {goal && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-fit-green/15 px-3 py-1 text-sm font-medium text-fit-green">
            <Target className="h-3.5 w-3.5" /> {goal}
          </span>
        )}
        {profile.exerciseFrequency && (
          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm text-muted-foreground">
            <Activity className="h-3.5 w-3.5" /> {profile.exerciseFrequency} days/week
          </span>
        )}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <NutrientProgressBar
          label="Protein"
          value={totals.protein}
          target={limits.proteinTargetG}
          unit="g"
          tone="good"
        />
        <NutrientProgressBar
          label="Calories"
          value={totals.calories}
          target={limits.calorieTarget}
          unit=" kcal"
          tone="limit"
        />
      </div>
      {profile.biggestStruggle && (
        <p className="mt-4 text-xs text-muted-foreground">
          Watching out for: <span className="font-medium">{profile.biggestStruggle}</span>
        </p>
      )}
    </div>
  );
}

function ConditionPanel({
  profile,
  totals,
}: {
  profile: HealthProfile;
  totals: DailyTotals;
}) {
  const { t } = useTranslation();
  const limits = profile.clinicianLimits ?? {};
  const conditions = profile.medicalConditions ?? [];

  return (
    <div className="rounded-2xl border border-fit-amber/30 bg-gradient-to-br from-fit-amber/10 to-transparent p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-fit-amber">
          <HeartPulse className="h-4 w-4" />
          {t("dashboard.conditionWatch")}
        </div>
        <Button asChild size="sm" variant="outline" className="h-8">
          <Link to="/scan">
            <ScanLine className="mr-1.5 h-3.5 w-3.5" /> {t("dashboard.scan")}
          </Link>
        </Button>
      </div>
      {conditions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {conditions.map((c) => (
            <span
              key={c}
              className="rounded-full bg-fit-amber/15 px-3 py-1 text-xs font-medium text-fit-amber"
            >
              {CONDITION_LABEL[c] ?? c}
            </span>
          ))}
        </div>
      )}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <NutrientProgressBar
          label="Sodium"
          value={totals.sodium}
          target={limits.sodiumLimitMg}
          unit="mg"
          tone="limit"
        />
        <NutrientProgressBar
          label="Sugar"
          value={totals.sugar}
          target={limits.sugarLimitG}
          unit="g"
          tone="limit"
        />
        <NutrientProgressBar
          label="Sat fat"
          value={totals.saturatedFat}
          target={limits.saturatedFatLimitG}
          unit="g"
          tone="limit"
        />
      </div>
      {(profile.nutrientsToWatch?.length ?? 0) > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          {t("dashboard.watchedNutrients")}:{" "}
          <span className="font-medium">{profile.nutrientsToWatch!.join(", ")}</span>
        </p>
      )}
    </div>
  );
}

/**
 * Renders a different dashboard hero panel depending on the onboarding track the
 * user chose (fitness / condition / both). Returns null when there's no profile
 * or no track, so the default dashboard layout shows through unchanged.
 */
export function DashboardTrackPanel({
  profile,
  totals,
  className,
}: {
  profile: HealthProfile | null;
  totals: DailyTotals;
  className?: string;
}) {
  if (!profile?.track) return null;

  const showFitness = profile.track === "fitness" || profile.track === "both";
  const showCondition = profile.track === "condition" || profile.track === "both";

  return (
    <div className={cn("grid gap-4", profile.track === "both" && "md:grid-cols-2", className)}>
      {showFitness && <FitnessPanel profile={profile} totals={totals} />}
      {showCondition && <ConditionPanel profile={profile} totals={totals} />}
    </div>
  );
}
