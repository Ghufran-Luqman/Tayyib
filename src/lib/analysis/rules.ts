import type {
  Food,
  HealthProfile,
  MealLog,
  Nutrition,
  RuleFlag,
} from "../foodfit/types";

// Thresholds (per serving, WHO/EU front-of-pack-inspired but generic)
export const TH = {
  highSugarG: 22.5,
  highSodiumMg: 600,
  highSatFatG: 5,
  highCalorieKcal: 500,
  lowFibreG: 1.5,
};

export const isHighSugar = (n: Nutrition) =>
  (n.sugar ?? 0) >= TH.highSugarG;
export const isHighSodium = (n: Nutrition) =>
  (n.sodium ?? 0) >= TH.highSodiumMg;
export const isHighSaturatedFat = (n: Nutrition) =>
  (n.saturatedFat ?? 0) >= TH.highSatFatG;
export const isHighCalorie = (n: Nutrition) =>
  (n.calories ?? 0) >= TH.highCalorieKcal;
export const isLowFibre = (n: Nutrition) =>
  n.fibre !== undefined && n.fibre < TH.lowFibreG;
export const isUltraProcessed = (food: Food) => food.novaGroup === 4;

const GLUTEN_TOKENS = ["wheat", "gluten", "barley", "rye", "spelt", "kamut"];
const DAIRY_TOKENS = ["milk", "lactose", "dairy", "whey", "casein", "butter", "cheese"];
const ANIMAL_TOKENS = ["chicken", "beef", "pork", "fish", "gelatin", "lard", "tuna", "ham", "bacon"];
const ANIMAL_PRODUCT_TOKENS = [...ANIMAL_TOKENS, ...DAIRY_TOKENS, "egg", "honey"];

function textIncludes(haystack: string | undefined, tokens: string[]): string | null {
  if (!haystack) return null;
  const lower = haystack.toLowerCase();
  for (const t of tokens) {
    if (lower.includes(t)) return t;
  }
  return null;
}

export function containsAllergen(food: Food, allergies: string[]): string | null {
  if (!allergies.length) return null;
  const allTexts = [
    food.ingredients ?? "",
    food.allergens.join(" "),
  ]
    .join(" ")
    .toLowerCase();
  for (const a of allergies) {
    const tok = a.trim().toLowerCase();
    if (tok && allTexts.includes(tok)) return a;
  }
  return null;
}

export function conflictsWithDietaryPreference(
  food: Food,
  prefs: HealthProfile["dietaryPreferences"],
): string | null {
  const ing = food.ingredients?.toLowerCase() ?? "";
  const allergens = food.allergens.map((a) => a.toLowerCase()).join(" ");
  const txt = `${ing} ${allergens}`;
  if (prefs.includes("vegan")) {
    const t = textIncludes(txt, ANIMAL_PRODUCT_TOKENS);
    if (t) return `Contains ${t} (not vegan)`;
  }
  if (prefs.includes("vegetarian")) {
    const t = textIncludes(txt, ANIMAL_TOKENS);
    if (t) return `Contains ${t} (not vegetarian)`;
  }
  if (prefs.includes("gluten-free")) {
    const t = textIncludes(txt, GLUTEN_TOKENS);
    if (t) return `Contains ${t} (not gluten-free)`;
  }
  if (prefs.includes("dairy-free")) {
    const t = textIncludes(txt, DAIRY_TOKENS);
    if (t) return `Contains ${t} (not dairy-free)`;
  }
  return null;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  sodium: number;
  saturatedFat: number;
  fibre: number;
  count: number;
  ultraProcessedCount: number;
}

export function emptyTotals(): DailyTotals {
  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0,
    sodium: 0,
    saturatedFat: 0,
    fibre: 0,
    count: 0,
    ultraProcessedCount: 0,
  };
}

export function sumLogs(
  logs: MealLog[],
  foods: Record<string, Food>,
): DailyTotals {
  const t = emptyTotals();
  for (const m of logs) {
    t.calories += m.calories || 0;
    t.protein += m.protein || 0;
    t.carbs += m.carbs || 0;
    t.fat += m.fat || 0;
    t.sugar += m.sugar || 0;
    t.sodium += m.sodium || 0;
    t.saturatedFat += m.saturatedFat || 0;
    t.fibre += m.fibre || 0;
    t.count += 1;
    const food = foods[m.foodId];
    if (food && isUltraProcessed(food)) t.ultraProcessedCount += 1;
  }
  return t;
}

export function todaysLogs(logs: MealLog[]): MealLog[] {
  const today = new Date();
  return logs.filter((m) => {
    const d = new Date(m.loggedAt);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  });
}

export function exceedsDailyLimit(
  nutrient: keyof Pick<Nutrition, "sodium" | "sugar" | "saturatedFat" | "calories">,
  totalsToday: DailyTotals,
  food: Food,
  profile: HealthProfile,
): boolean {
  const limits = profile.clinicianLimits;
  const map = {
    sodium: limits.sodiumLimitMg,
    sugar: limits.sugarLimitG,
    saturatedFat: limits.saturatedFatLimitG,
    calories: limits.calorieTarget,
  } as const;
  const limit = map[nutrient];
  if (!limit) return false;
  const current =
    nutrient === "sodium"
      ? totalsToday.sodium
      : nutrient === "sugar"
        ? totalsToday.sugar
        : nutrient === "saturatedFat"
          ? totalsToday.saturatedFat
          : totalsToday.calories;
  const add = (food.nutrition[nutrient] ?? 0) as number;
  return current + add > limit;
}

export function hasRepeatedFrequencyConcern(
  foodId: string,
  logs: MealLog[],
  withinDays = 7,
): number {
  const since = Date.now() - withinDays * 24 * 60 * 60 * 1000;
  return logs.filter((m) => m.foodId === foodId && new Date(m.loggedAt).getTime() >= since).length;
}
