// Core Tayyib domain types

export type Sex = "male" | "female" | "other" | "prefer-not";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very-active";
export type Goal =
  | "general-health"
  | "weight-loss"
  | "weight-gain"
  | "muscle-gain"
  | "manage-blood-sugar"
  | "manage-blood-pressure"
  | "reduce-ultra-processed"
  | "allergy-avoidance"
  | "heart-health"
  | "digestive-health";

export type MedicalCondition =
  | "diabetes"
  | "hypertension"
  | "high-cholesterol"
  | "heart-disease"
  | "kidney-disease"
  | "liver-disease"
  | "coeliac"
  | "ibs"
  | "gerd"
  | "food-allergies"
  | "lactose-intolerance"
  | "pregnancy"
  | "other";

export type DietaryPreference =
  | "vegetarian"
  | "vegan"
  | "halal"
  | "kosher"
  | "gluten-free"
  | "dairy-free"
  | "low-sodium"
  | "low-sugar"
  | "high-protein";

export interface ClinicianLimits {
  calorieTarget?: number;
  sodiumLimitMg?: number;
  sugarLimitG?: number;
  saturatedFatLimitG?: number;
  proteinTargetG?: number;
  carbTargetG?: number;
  fibreTargetG?: number;
}

export type OnboardingTrack = "fitness" | "condition" | "both";
export type AgeRange = "13-17" | "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65+";
export type CautionLevel = "gentle" | "normal" | "strict";
export type HalalStrictness = "off" | "low" | "medium" | "strict";
export type ExerciseFrequency = "0" | "1-2" | "3-4" | "5+";
export type FitnessGoal =
  | "lose-weight"
  | "gain-muscle"
  | "maintain"
  | "improve-energy"
  | "eat-cleaner";

export interface HealthProfile {
  id: string;
  nickname: string;
  age?: number;
  ageRange?: AgeRange;
  sex?: Sex;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  activityLevel?: ActivityLevel;
  goal?: Goal;
  // New onboarding fields
  track?: OnboardingTrack;
  fitnessGoal?: FitnessGoal;
  exerciseFrequency?: ExerciseFrequency;
  biggestStruggle?: string;
  nutrientsToWatch?: string[];
  professionalDiagnosis?: "yes" | "no" | "prefer-not";
  cautionLevel?: CautionLevel;
  halalRequired?: boolean;
  halalStrictness?: HalalStrictness;
  medicalConditions: MedicalCondition[];
  otherCondition?: string;
  allergies: string[];
  dietaryPreferences: DietaryPreference[];
  clinicianLimits: ClinicianLimits;
  consentMedicalDataStored: boolean;
  createdAt: string;
  updatedAt: string;
}

// Nutrition per serving
export interface Nutrition {
  calories?: number; // kcal
  protein?: number; // g
  carbs?: number; // g
  sugar?: number; // g
  fat?: number; // g
  saturatedFat?: number; // g
  fibre?: number; // g
  sodium?: number; // mg
  salt?: number; // g
}

export type FoodSource = "openfoodfacts" | "manual" | "demo" | "fastfood";

export interface Food {
  id: string;
  source: FoodSource;
  sourceId?: string;
  barcode?: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  servingSize?: string;
  servingGrams?: number;
  nutrition: Nutrition;
  ingredients?: string;
  allergens: string[];
  additives: string[];
  nutriscore?: "a" | "b" | "c" | "d" | "e";
  novaGroup?: 1 | 2 | 3 | 4;
  dataConfidence: "high" | "medium" | "low";
  createdAt: string;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealLog {
  id: string;
  foodId: string;
  foodName: string;
  brand?: string;
  mealType: MealType;
  quantity: number;
  servingMultiplier: number;
  loggedAt: string; // ISO
  notes?: string;
  // Snapshot nutrition (computed)
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  sodium: number;
  saturatedFat: number;
  fibre: number;
}

export type Verdict = "green" | "amber" | "red";

export interface RuleFlag {
  id: string;
  severity: "info" | "watch" | "avoid";
  category: "allergy" | "condition" | "diet" | "nutrient" | "processed" | "intake" | "positive";
  message: string;
}

export interface FoodAnalysis {
  foodId: string;
  score: number; // 0-100
  verdict: Verdict;
  confidence: "high" | "medium" | "low";
  ruleFlags: RuleFlag[];
  keyReasons: string[];
  positiveFactors: string[];
  watchOuts: string[];
  portionSuggestion: string;
  frequencySuggestion: string;
  alternativeSuggestions: string[];
  summary: string;
  medicalDisclaimer: string;
  createdAt: string;
}

export interface AppSettings {
  llmExplanationsEnabled: boolean;
  hasSeenDisclaimer: boolean;
  experienceMode: "simple" | "detailed";
  largeText: boolean;
  halalStrictness: HalalStrictness;
  theme: "light" | "dark";
}


