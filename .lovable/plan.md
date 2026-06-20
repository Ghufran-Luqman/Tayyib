## FoodFit — Frontend-only MVP

A polished, mobile-first React + TS + Tailwind + shadcn app. No Supabase yet — all state persists to `localStorage`. OpenFoodFacts is called directly from the browser (it's a public API). LLM analysis is mocked from the rule engine. Camera scanning via `@zxing/browser` with manual entry fallback.

### Pages (TanStack routes)
- `/` LandingPage — hero, features, disclaimer, CTAs
- `/onboarding` Multi-step HealthProfileForm (5 steps, progress bar, BMI auto-calc)
- `/dashboard` Today's nutrient cards, quick actions, recent foods, health flags
- `/scan` BarcodeScanner (camera + manual fallback) → OpenFoodFacts lookup
- `/search` Food search (OpenFoodFacts search endpoint) + demo foods
- `/food/$id` FoodDetail with NutritionFacts, ingredients, allergens, source
- `/analyze/$id` FoodAnalysisPage — FoodFit score, verdict badge, reasons, alternatives
- `/log` AddMealPage (serving, quantity, meal type, time, notes)
- `/history` MealHistoryPage (filter by date, edit/delete, CSV export)
- `/insights` Weekly trends, averages, top flagged foods (Recharts)
- `/profile` View/edit health profile
- `/settings` Targets, allergies, data export, clear data, LLM toggle
- `/privacy` Disclaimer page

Auth is stubbed (single local profile); a banner notes "Demo mode — sign in coming soon".

### State & persistence
- Zustand store, persisted to `localStorage`:
  - `profile`, `goals`, `mealLogs[]`, `foodsCache{}`, `analysesCache{}`, `settings`
- Demo seed: one profile (age 35, BMI 29, prediabetes + hypertension) + 5 demo foods loaded on first run unless cleared.

### Food data provider abstraction
`src/lib/foodProviders/` with:
- `types.ts` — internal `Food` shape
- `openFoodFacts.ts` — `getByBarcode`, `search`, mapper from OFF → internal
- `manual.ts` — user-entered foods
- `index.ts` — `FoodProvider` interface, registry; future USDA/Nutritionix slot in here
- Handles: not found, missing nutrition, API failure, incomplete-data confidence warning

### Rule engine (`src/lib/analysis/`)
- Threshold helpers: `isHighSugar`, `isHighSodium`, `isHighSaturatedFat`, `isHighCalorie`, `isLowFibre`, `containsAllergen`, `conflictsWithDietaryPreference`, `isUltraProcessed`, `exceedsDailyLimit`, `hasRepeatedFrequencyConcern`
- `analyzeFood(profile, food, todayIntake, history)` → returns:
  ```ts
  { score:0-100, verdict:'green'|'amber'|'red', confidence,
    keyReasons[], positiveFactors[], watchOuts[],
    portionSuggestion, frequencySuggestion, alternativeSuggestions[],
    ruleFlags[] }
  ```
- Condition-aware rules: diabetes/sugar, hypertension/sodium, cholesterol+heart/satfat, coeliac/gluten, lactose/dairy, kidney warning, allergies, vegan/veg conflicts, NOVA 4, cumulative-intake escalation, protein+muscle-gain positive, fibre/wholegrain positives.

### LLM mock (`src/lib/llm/generateAnalysis.ts`)
- Single function returning the structured JSON shape from the spec, built from the rule output with friendly templated copy and a medical disclaimer.
- Settings toggle "LLM explanations" controls whether the LLM-style narrative block is shown vs raw rules.
- Easy to swap to a real edge function later (same signature).

### Barcode scanner
- `@zxing/browser` (`BrowserMultiFormatReader`) in a dedicated component
- Permission denied / no-camera → manual barcode input
- On detect: call OFF, cache food, navigate to `/food/$id`

### Components (`src/components/foodfit/`)
HealthProfileForm, BarcodeScanner, FoodSearchBar, NutritionFactsCard, IngredientList, AllergenWarningCard, FoodFitScoreCard, VerdictBadge, MealLogForm, DailyNutrientSummary, NutrientProgressBar, WeeklyTrendChart, UltraProcessedBadge, MedicalDisclaimerBanner, SourceAttribution, EmptyState, LoadingSkeleton, AppShell (sidebar + mobile bottom nav).

### Design
Clean health-tech: near-white background, soft green primary, blue + amber accents, rounded-2xl cards, soft shadows, accessible contrast. Mobile-first with bottom nav; sidebar on desktop. Friendly empty states, skeletons, toasts (sonner), tone per spec ("may be worth limiting", never "bad food").

### Tone & safety
MedicalDisclaimerBanner on Landing, Onboarding consent step, every analysis page, and Settings. Wording follows section 22 verbatim where helpful.

### Demo data
5 seeded foods (cookies, fast-food burger, high-protein yoghurt, wholegrain salad, energy drink) so the app is explorable without any network call.

### Dependencies to add
`@zxing/browser`, `recharts` (likely already), `zustand`, `date-fns`.

### Out of scope (deferred)
Supabase auth/DB/RLS, real Edge Function + LLM call, account deletion, real fast-food API, restaurant menu scraping. Schema in spec is preserved in TS types so a future backend pass maps 1:1.

### Acceptance for this build
User can: complete onboarding → scan or search a food → see OFF data → get a personalised FoodFit score + verdict + reasons → log it → see today's nutrient totals + weekly insights → export CSV → reset data. All locally, no backend.