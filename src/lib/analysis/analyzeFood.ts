import type {
  Food,
  FoodAnalysis,
  HealthProfile,
  MealLog,
  RuleFlag,
  Verdict,
} from "../foodfit/types";
import {
  containsAllergen,
  conflictsWithDietaryPreference,
  exceedsDailyLimit,
  hasRepeatedFrequencyConcern,
  isHighCalorie,
  isHighSaturatedFat,
  isHighSodium,
  isHighSugar,
  isLowFibre,
  isUltraProcessed,
  sumLogs,
  todaysLogs,
} from "./rules";
import { checkHalal } from "./halal";

const DISCLAIMER =
  "Tayyib provides educational nutrition guidance based on your stated profile. It is not medical advice. For medical conditions, allergies, pregnancy, or medication interactions, please consult a qualified healthcare professional.";

function severityWeight(sev: RuleFlag["severity"]): number {
  if (sev === "unfit") return 80;
  if (sev === "avoid") return 35;
  if (sev === "watch") return 12;
  return 0;
}

export function analyzeFood(
  food: Food,
  profile: HealthProfile | null,
  mealLogs: MealLog[],
  foods: Record<string, Food>,
  halalStrictness: import("../foodfit/types").HalalStrictness = "off",
): FoodAnalysis {
  const flags: RuleFlag[] = [];
  const positives: string[] = [];
  const watchOuts: string[] = [];
  const reasons: string[] = [];
  const alternatives: string[] = [];

  const n = food.nutrition;
  const conds = new Set(profile?.medicalConditions ?? []);
  const prefs = profile?.dietaryPreferences ?? [];
  const goal = profile?.goal;
  const today = todaysLogs(mealLogs);
  const totalsToday = sumLogs(today, foods);

  // Allergy (avoid)
  if (profile) {
    const hit = containsAllergen(food, profile.allergies);
    if (hit) {
      flags.push({
        id: "allergen",
        severity: "avoid",
        category: "allergy",
        message: `Contains "${hit}" — this matches your allergy settings.`,
      });
      reasons.push(`Contains "${hit}", which you've listed as an allergen.`);
    }
  }

  // Halal / Tayyib ingredient scan
  const halalPref =
    profile?.halalStrictness && profile.halalStrictness !== "off"
      ? profile.halalStrictness
      : halalStrictness;
  if (halalPref && halalPref !== "off") {
    const hc = checkHalal(food, halalPref);
    if (hc.status === "haram") {
      flags.push({
        id: "halal-haram",
        severity: "unfit",
        category: "diet",
        message: `Contains ingredients you've asked to avoid (${hc.matches.join(", ")}) — not halal.`,
      });
      reasons.push("Contains haram ingredients per your preference.");
    } else if (hc.status === "doubtful") {
      flags.push({
        id: "halal-doubtful",
        severity: "watch",
        category: "diet",
        message: `Doubtful (mashbooh) ingredients: ${hc.matches.join(", ")}. Check the source.`,
      });
      watchOuts.push("Contains ingredients that may not be halal — verify the source.");
    }
  }

  // Coeliac / gluten
  if (conds.has("coeliac")) {
    const hit = containsAllergen(food, ["wheat", "gluten", "barley", "rye"]);
    if (hit) {
      flags.push({
        id: "coeliac-gluten",
        severity: "avoid",
        category: "condition",
        message: `Contains gluten source (${hit}) — not suitable for coeliac disease.`,
      });
      reasons.push("Contains gluten, which should be avoided with coeliac disease.");
    }
  }

  // Lactose intolerance
  if (conds.has("lactose-intolerance")) {
    const hit = containsAllergen(food, ["milk", "lactose", "dairy"]);
    if (hit) {
      flags.push({
        id: "lactose",
        severity: "watch",
        category: "condition",
        message: `Contains dairy/lactose (${hit}) — may cause discomfort.`,
      });
    }
  }

  // Diet preference
  if (profile) {
    const conflict = conflictsWithDietaryPreference(food, prefs);
    if (conflict) {
      flags.push({
        id: "diet-conflict",
        severity: "unfit",
        category: "diet",
        message: conflict,
      });
      reasons.push(conflict);
    }
  }

  // Sugar / diabetes
  if (isHighSugar(n)) {
    if (conds.has("diabetes")) {
      flags.push({
        id: "sugar-diabetes",
        severity: "avoid",
        category: "nutrient",
        message: `High sugar (${n.sugar}g) — may impact blood sugar control.`,
      });
      reasons.push("High sugar content combined with your diabetes/prediabetes profile.");
      alternatives.push("Unsweetened or low-sugar alternatives");
    } else {
      flags.push({
        id: "sugar-high",
        severity: "watch",
        category: "nutrient",
        message: `High sugar per serving (${n.sugar}g).`,
      });
      watchOuts.push(`High sugar: ${n.sugar}g per serving.`);
    }
  }

  // Sodium / hypertension, heart, kidney
  if (isHighSodium(n)) {
    if (conds.has("hypertension") || conds.has("heart-disease") || conds.has("kidney-disease")) {
      flags.push({
        id: "sodium-cardio",
        severity: "avoid",
        category: "nutrient",
        message: `High sodium (${n.sodium}mg) — may affect blood pressure / kidney load.`,
      });
      reasons.push("High sodium with your cardiovascular/kidney profile.");
      alternatives.push("Lower-sodium versions or homemade preparations");
    } else {
      flags.push({
        id: "sodium-high",
        severity: "watch",
        category: "nutrient",
        message: `High sodium per serving (${n.sodium}mg).`,
      });
      watchOuts.push(`High sodium: ${n.sodium}mg per serving.`);
    }
  }

  // Saturated fat
  if (isHighSaturatedFat(n)) {
    if (conds.has("high-cholesterol") || conds.has("heart-disease")) {
      flags.push({
        id: "satfat-cardio",
        severity: "avoid",
        category: "nutrient",
        message: `High saturated fat (${n.saturatedFat}g) — consider limiting for heart health.`,
      });
      reasons.push("High saturated fat with your heart/cholesterol profile.");
    } else {
      flags.push({
        id: "satfat",
        severity: "watch",
        category: "nutrient",
        message: `High saturated fat (${n.saturatedFat}g per serving).`,
      });
      watchOuts.push(`High saturated fat: ${n.saturatedFat}g.`);
    }
  }

  // Kidney general warning
  if (conds.has("kidney-disease")) {
    flags.push({
      id: "kidney-general",
      severity: "watch",
      category: "condition",
      message:
        "Kidney disease requires personalised nutrient targets (sodium, protein, potassium, phosphorus). Please confirm thresholds with your clinician.",
    });
  }

  // Pregnancy
  if (conds.has("pregnancy")) {
    flags.push({
      id: "pregnancy",
      severity: "watch",
      category: "condition",
      message:
        "During pregnancy, some ingredients and additives need extra caution. Please check with your clinician.",
    });
  }

  // Ultra-processed
  if (isUltraProcessed(food)) {
    if (goal === "reduce-ultra-processed" || conds.has("diabetes") || conds.has("hypertension")) {
      flags.push({
        id: "nova4",
        severity: "watch",
        category: "processed",
        message: "Classified as ultra-processed (NOVA 4) — best as an occasional choice.",
      });
      watchOuts.push("Ultra-processed (NOVA 4).");
      alternatives.push("A less processed, whole-food alternative");
    } else {
      flags.push({
        id: "nova4-info",
        severity: "info",
        category: "processed",
        message: "Ultra-processed (NOVA 4) — fine occasionally, watch frequency.",
      });
    }
  }

  // Cumulative intake escalation
  if (profile) {
    if (exceedsDailyLimit("sodium", totalsToday, food, profile)) {
      flags.push({
        id: "today-sodium",
        severity: "watch",
        category: "intake",
        message: `Adding this would push today's sodium past your ${profile.clinicianLimits.sodiumLimitMg}mg target.`,
      });
      reasons.push("Your sodium intake today is already close to your limit.");
    }
    if (exceedsDailyLimit("sugar", totalsToday, food, profile)) {
      flags.push({
        id: "today-sugar",
        severity: "watch",
        category: "intake",
        message: `Adding this would push today's sugar past your ${profile.clinicianLimits.sugarLimitG}g target.`,
      });
    }
    if (exceedsDailyLimit("saturatedFat", totalsToday, food, profile)) {
      flags.push({
        id: "today-satfat",
        severity: "watch",
        category: "intake",
        message: `Adding this would push today's saturated fat past your ${profile.clinicianLimits.saturatedFatLimitG}g target.`,
      });
    }
    const recent = hasRepeatedFrequencyConcern(food.id, mealLogs, 7);
    if (recent >= 3) {
      flags.push({
        id: "frequency",
        severity: "watch",
        category: "intake",
        message: `You've logged this ${recent} times in the past week — consider variety.`,
      });
    }
  }

  // Positives
  if ((n.protein ?? 0) >= 15) {
    positives.push(`Good source of protein (${n.protein}g).`);
    if (goal === "muscle-gain" || goal === "weight-loss") {
      flags.push({
        id: "protein-goal",
        severity: "info",
        category: "positive",
        message: `Protein content supports your ${goal.replace("-", " ")} goal.`,
      });
    }
  }
  if ((n.fibre ?? 0) >= 5) {
    positives.push(`High fibre (${n.fibre}g).`);
  } else if (isLowFibre(n)) {
    watchOuts.push("Low fibre — pair with vegetables or whole grains.");
  }
  if (food.nutriscore === "a" || food.nutriscore === "b") {
    positives.push(`Nutri-Score ${food.nutriscore.toUpperCase()}.`);
  }
  if (food.novaGroup === 1) {
    positives.push("Unprocessed / minimally processed food (NOVA 1).");
  }

  // Calorie note
  if (isHighCalorie(n) && goal === "weight-loss") {
    flags.push({
      id: "calorie-loss",
      severity: "watch",
      category: "nutrient",
      message: `${n.calories} kcal per serving — sizeable for a weight-loss target.`,
    });
  }

  // Score & verdict
  const hasAvoid = flags.some((f) => f.severity === "avoid");
  const isHaram = flags.some((f) => f.id === "halal-haram");

  let score = 80;
  for (const f of flags) score -= severityWeight(f.severity);
  score += Math.min(positives.length * 4, 16);
  score = Math.max(5, Math.min(100, score));

  // A haram ingredient is a categorical fail — showing a numeric "fit %" for
  // pork/alcohol is misleading and offensive in a halal context. Other hard
  // blocks (allergens, gluten for coeliac, diet conflicts) are capped low too.
  if (isHaram) score = 0;
  else if (hasAvoid) score = Math.min(score, 20);

  const watchCount = flags.filter((f) => f.severity === "watch").length;
  let verdict: Verdict = "green";
  if (hasAvoid || score < 45) verdict = "red";
  else if (watchCount >= 1 || score < 70) verdict = "amber";

  // Confidence inherits from food data quality
  const confidence = food.dataConfidence;

  // Portion / frequency copy
  const portion =
    verdict === "red"
      ? "Best avoided for your profile. If you do eat it, keep the portion small."
      : verdict === "amber"
        ? "A small portion is okay occasionally — stick to the listed serving size."
        : "Standard serving size fits well in your day.";
  const freq =
    verdict === "red"
      ? "Limit this week — consider an alternative."
      : verdict === "amber"
        ? "Occasional choice — a few times per week at most."
        : "Fine to include regularly as part of a balanced day.";

  if (!alternatives.length && verdict !== "green") {
    alternatives.push("A whole-food option with more fibre and less added sugar/sodium");
  }

  const verdictLine =
    isHaram
      ? "This isn't halal for your settings — it contains ingredients to avoid."
      : verdict === "red"
        ? "This may be a poor fit for your profile today."
        : verdict === "amber"
          ? "This looks like an occasional choice for your profile."
          : "This looks like a good fit for your profile.";

  const summary = profile
    ? `${verdictLine} Based on your stated profile${
        profile.medicalConditions.length
          ? ` (${profile.medicalConditions.slice(0, 2).join(", ")})`
          : ""
      }, ${reasons[0]?.toLowerCase() ?? "no specific red flags were found"}.`
    : `${verdictLine} Create a health profile for personalised guidance.`;

  return {
    foodId: food.id,
    score: Math.round(score),
    verdict,
    confidence,
    ruleFlags: flags,
    keyReasons: reasons,
    positiveFactors: positives,
    watchOuts,
    portionSuggestion: portion,
    frequencySuggestion: freq,
    alternativeSuggestions: alternatives,
    summary,
    medicalDisclaimer: DISCLAIMER,
    createdAt: new Date().toISOString(),
  };
}
