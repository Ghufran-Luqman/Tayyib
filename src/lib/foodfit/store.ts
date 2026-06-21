import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppSettings,
  Food,
  FoodAnalysis,
  HealthProfile,
  MealLog,
} from "./types";
import { demoFoods, demoProfile } from "./demoData";

interface FoodFitState {
  profile: HealthProfile | null;
  mealLogs: MealLog[];
  foodsCache: Record<string, Food>;
  analysesCache: Record<string, FoodAnalysis>;
  settings: AppSettings;
  seeded: boolean;

  setProfile: (p: HealthProfile | null) => void;
  updateProfile: (patch: Partial<HealthProfile>) => void;
  cacheFood: (f: Food) => void;
  cacheFoods: (fs: Food[]) => void;
  removeFood: (id: string) => void;
  cacheAnalysis: (a: FoodAnalysis) => void;
  addMealLog: (m: MealLog) => void;
  updateMealLog: (id: string, patch: Partial<MealLog>) => void;
  removeMealLog: (id: string) => void;
  setSettings: (patch: Partial<AppSettings>) => void;
  loadDemoData: () => void;
  resetAll: () => void;
}

const defaultSettings: AppSettings = {
  llmExplanationsEnabled: true,
  hasSeenDisclaimer: false,
  experienceMode: "detailed",
  largeText: false,
  halalStrictness: "off",
  theme: "light",
  language: "en",
};



export const useFoodFitStore = create<FoodFitState>()(
  persist(
    (set, get) => ({
      profile: null,
      mealLogs: [],
      foodsCache: {},
      analysesCache: {},
      settings: defaultSettings,
      seeded: false,

      setProfile: (profile) =>
        set({ profile: profile ? { ...profile, updatedAt: new Date().toISOString() } : null }),
      updateProfile: (patch) => {
        const p = get().profile;
        if (!p) return;
        set({ profile: { ...p, ...patch, updatedAt: new Date().toISOString() } });
      },
      cacheFood: (f) =>
        set((s) => ({ foodsCache: { ...s.foodsCache, [f.id]: f } })),
      cacheFoods: (fs) =>
        set((s) => {
          const next = { ...s.foodsCache };
          for (const f of fs) next[f.id] = f;
          return { foodsCache: next };
        }),
      removeFood: (id) =>
        set((s) => {
          const next = { ...s.foodsCache };
          delete next[id];
          return { foodsCache: next };
        }),
      cacheAnalysis: (a) =>
        set((s) => ({ analysesCache: { ...s.analysesCache, [a.foodId]: a } })),
      addMealLog: (m) => set((s) => ({ mealLogs: [m, ...s.mealLogs] })),
      updateMealLog: (id, patch) =>
        set((s) => ({
          mealLogs: s.mealLogs.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeMealLog: (id) =>
        set((s) => ({ mealLogs: s.mealLogs.filter((m) => m.id !== id) })),
      setSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      loadDemoData: () => {
        const cache: Record<string, Food> = { ...get().foodsCache };
        for (const f of demoFoods) cache[f.id] = f;
        set({
          profile: { ...demoProfile, updatedAt: new Date().toISOString() },
          foodsCache: cache,
          seeded: true,
        });
      },
      resetAll: () =>
        set({
          profile: null,
          mealLogs: [],
          foodsCache: {},
          analysesCache: {},
          settings: defaultSettings,
          seeded: false,
        }),
    }),
    {
      name: "foodfit-store-v1",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Backfill any settings keys added after a user's state was persisted
        // (e.g. `language`), so new features never read `undefined`.
        state.settings = { ...defaultSettings, ...state.settings };
        if (!state.seeded) {
          // Seed demo foods (not profile) so search/dashboard never look empty
          const cache: Record<string, Food> = { ...state.foodsCache };
          for (const f of demoFoods) cache[f.id] = f;
          state.foodsCache = cache;
          state.seeded = true;
        }
      },
    },
  ),
);
