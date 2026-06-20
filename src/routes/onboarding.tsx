import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dumbbell,
  HeartPulse,
  Leaf,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useFoodFitStore } from "@/lib/foodfit/store";
import { calcBmi } from "@/lib/foodfit/format";
import { MedicalDisclaimerBanner } from "@/components/foodfit/MedicalDisclaimerBanner";
import { BmiFigure } from "@/components/foodfit/BmiFigure";
import type {
  ActivityLevel,
  AgeRange,
  CautionLevel,
  DietaryPreference,
  ExerciseFrequency,
  FitnessGoal,
  HalalStrictness,
  HealthProfile,
  MedicalCondition,
  OnboardingTrack,
  Sex,
} from "@/lib/foodfit/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Build your health profile · Tayyib" },
      {
        name: "description",
        content:
          "Set up your Tayyib health profile in under a minute. One question at a time, all in your browser.",
      },
    ],
  }),
  component: Onboarding,
});

type StepId =
  | "track"
  | "nickname"
  | "ageRange"
  | "sex"
  | "height"
  | "weight"
  | "fitnessGoal"
  | "activity"
  | "exerciseFreq"
  | "struggle"
  | "condition"
  | "diagnosed"
  | "nutrientsWatch"
  | "caution"
  | "allergies"
  | "dietary"
  | "halal"
  | "halalStrict"
  | "consent";

const ageRanges: AgeRange[] = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];


const conditionOptions: { value: MedicalCondition; label: string }[] = [
  { value: "diabetes", label: "Diabetes or prediabetes" },
  { value: "hypertension", label: "High blood pressure" },
  { value: "high-cholesterol", label: "High cholesterol" },
  { value: "heart-disease", label: "Heart disease" },
  { value: "kidney-disease", label: "Kidney disease" },
  { value: "coeliac", label: "Coeliac / gluten-free" },
  { value: "ibs", label: "IBS" },
  { value: "gerd", label: "GERD / acid reflux" },
  { value: "lactose-intolerance", label: "Lactose intolerance" },
  { value: "pregnancy", label: "Pregnancy" },
  { value: "other", label: "Other" },
];

const dietOptions: { value: DietaryPreference; label: string }[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "gluten-free", label: "Gluten-free" },
  { value: "dairy-free", label: "Dairy-free" },
  { value: "low-sodium", label: "Low sodium" },
  { value: "low-sugar", label: "Low sugar" },
  { value: "high-protein", label: "High protein" },
];

const fitnessGoals: { value: FitnessGoal; label: string; emoji: string }[] = [
  { value: "lose-weight", label: "Lose weight", emoji: "⚖️" },
  { value: "gain-muscle", label: "Gain muscle", emoji: "💪" },
  { value: "maintain", label: "Maintain weight", emoji: "🌿" },
  { value: "improve-energy", label: "Improve energy", emoji: "⚡" },
  { value: "eat-cleaner", label: "Eat less processed food", emoji: "🥗" },
];

const struggles = [
  "Snacking",
  "Fizzy drinks",
  "Takeaways",
  "Portion sizes",
  "Sugar cravings",
  "Lack of time",
  "Eating late",
];

const nutrientChoices = [
  "Sugar",
  "Salt / sodium",
  "Saturated fat",
  "Calories",
  "Protein",
  "Fibre",
  "Additives",
  "Ultra-processed",
];

function Onboarding() {
  const navigate = useNavigate();
  const setProfile = useFoodFitStore((s) => s.setProfile);
  const setSettings = useFoodFitStore((s) => s.setSettings);
  const existing = useFoodFitStore((s) => s.profile);

  const [form, setForm] = useState<Partial<HealthProfile>>(
    existing ?? {
      nickname: "",
      track: undefined,
      medicalConditions: [],
      allergies: [],
      dietaryPreferences: [],
      nutrientsToWatch: [],
      halalRequired: false,
      halalStrictness: "off",
      cautionLevel: "normal",
      clinicianLimits: {
        calorieTarget: 2000,
        sodiumLimitMg: 2300,
        sugarLimitG: 50,
        saturatedFatLimitG: 20,
        proteinTargetG: 75,
        carbTargetG: 250,
        fibreTargetG: 28,
      },
      consentMedicalDataStored: false,
    },
  );
  const [allergyInput, setAllergyInput] = useState((existing?.allergies ?? []).join(", "));

  // Build the active step list based on the chosen track.
  const steps: StepId[] = useMemo(() => {
    const base: StepId[] = ["track", "nickname", "ageRange", "sex", "height", "weight"];
    const fitnessSteps: StepId[] = ["fitnessGoal", "activity", "exerciseFreq", "struggle"];
    const conditionSteps: StepId[] = ["condition", "diagnosed", "nutrientsWatch", "caution"];
    const tail: StepId[] = ["allergies", "dietary", "halal"];
    const halalTail: StepId[] = (form.halalRequired ? ["halalStrict"] : []) as StepId[];
    const end: StepId[] = ["consent"];
    switch (form.track) {
      case "fitness":
        return [...base, ...fitnessSteps, ...tail, ...halalTail, ...end];
      case "condition":
        return [...base, ...conditionSteps, ...tail, ...halalTail, ...end];
      case "both":
        return [...base, ...fitnessSteps, ...conditionSteps, ...tail, ...halalTail, ...end];
      default:
        return [...base, ...tail, ...halalTail, ...end];
    }
  }, [form.track, form.halalRequired]);


  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (idx >= steps.length) setIdx(steps.length - 1);
  }, [steps, idx]);
  const current: StepId = steps[idx] ?? "track";

  const bmi = useMemo(() => calcBmi(form.heightCm, form.weightKg), [form.heightCm, form.weightKg]);

  function canAdvance(): boolean {
    switch (current) {
      case "track":
        return !!form.track;
      case "nickname":
        return !!(form.nickname && form.nickname.trim().length > 0);
      case "consent":
        return !!form.consentMedicalDataStored;
      default:
        return true;
    }
  }

  function next() {
    if (!canAdvance()) {
      toast.error("Please answer this one before continuing.");
      return;
    }
    if (idx < steps.length - 1) setIdx(idx + 1);
    else save();
  }
  function back() {
    if (idx > 0) setIdx(idx - 1);
  }

  function save() {
    if (!form.consentMedicalDataStored) {
      toast.error("Please confirm consent to store your health information.");
      return;
    }
    const now = new Date().toISOString();
    const allergies = allergyInput
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    const profile: HealthProfile = {
      id: existing?.id ?? "local-profile",
      nickname: form.nickname || "Friend",
      age: form.age,
      ageRange: form.ageRange,
      sex: form.sex,
      heightCm: form.heightCm,
      weightKg: form.weightKg,
      bmi,
      activityLevel: form.activityLevel,
      goal: form.goal,
      track: form.track,
      fitnessGoal: form.fitnessGoal,
      exerciseFrequency: form.exerciseFrequency,
      biggestStruggle: form.biggestStruggle,
      nutrientsToWatch: form.nutrientsToWatch ?? [],
      professionalDiagnosis: form.professionalDiagnosis,
      cautionLevel: form.cautionLevel ?? "normal",
      halalRequired: form.halalRequired ?? false,
      halalStrictness: form.halalStrictness ?? "off",
      medicalConditions: form.medicalConditions ?? [],
      otherCondition: form.otherCondition,
      allergies,
      dietaryPreferences: form.dietaryPreferences ?? [],
      clinicianLimits: form.clinicianLimits ?? {},
      consentMedicalDataStored: true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    setProfile(profile);
    if (form.halalStrictness && form.halalStrictness !== "off") {
      setSettings({ halalStrictness: form.halalStrictness });
    }
    toast.success("Profile saved");
    navigate({ to: "/dashboard" });
  }

  const progress = ((idx + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fit-green/15 text-fit-green">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-bold">Tayyib</span>
          </Link>
          <div className="text-xs text-muted-foreground">
            Step {idx + 1} of {steps.length}
          </div>
        </div>
        <div className="h-1 w-full bg-muted">
          <div
            className="h-full bg-fit-green transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-xl flex-col px-4 py-8 md:py-14">
        <div className="flex-1">
          <StepView
            stepId={current}
            form={form}
            setForm={setForm}
            allergyInput={allergyInput}
            setAllergyInput={setAllergyInput}
            bmi={bmi}
            advance={() => {
              // Slight delay so users see the selection register
              window.setTimeout(() => next(), 180);
            }}
          />

        </div>

        <div className="mt-10 flex items-center justify-between gap-3">
          {idx > 0 ? (
            <Button variant="ghost" onClick={back} size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button
            onClick={next}
            size="lg"
            disabled={!canAdvance()}
            className="bg-fit-green px-6 hover:bg-fit-green/90"
          >
            {idx === steps.length - 1 ? "Save profile" : "Next"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}

// ---------- Step views ----------

interface StepProps {
  stepId: StepId;
  form: Partial<HealthProfile>;
  setForm: (p: Partial<HealthProfile>) => void;
  allergyInput: string;
  setAllergyInput: (s: string) => void;
  bmi: number | undefined;
  advance: () => void;
}

function StepView({ stepId, form, setForm, allergyInput, setAllergyInput, bmi, advance }: StepProps) {
  const update = (patch: Partial<HealthProfile>) => setForm({ ...form, ...patch });
  const pick = (patch: Partial<HealthProfile>) => {
    update(patch);
    advance();
  };

  switch (stepId) {

    case "track":
      return (
        <Question
          title="What do you want Tayyib to help you with?"
          hint="You can change this any time in Settings."
        >
          <div className="grid gap-3">
            {(
              [
                {
                  v: "fitness" as OnboardingTrack,
                  title: "Improve fitness / eat healthier",
                  desc: "Goals, habits, and cleaner choices.",
                  Icon: Dumbbell,
                },
                {
                  v: "condition" as OnboardingTrack,
                  title: "Manage a health condition",
                  desc: "Diabetes, blood pressure, cholesterol, allergies.",
                  Icon: HeartPulse,
                },
                {
                  v: "both" as OnboardingTrack,
                  title: "Both",
                  desc: "Combine fitness goals with condition-aware checks.",
                  Icon: Sparkles,
                },
              ] as const
            ).map((opt) => (
              <BigChoice
                key={opt.v}
                active={form.track === opt.v}
                onClick={() => pick({ track: opt.v })}
                icon={<opt.Icon className="h-5 w-5" />}
                title={opt.title}
                desc={opt.desc}
              />
            ))}
          </div>
        </Question>
      );

    case "nickname":
      return (
        <Question title="What should we call you?" hint="A friendly name we'll use in the app.">
          <Input
            autoFocus
            value={form.nickname ?? ""}
            onChange={(e) => update({ nickname: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (form.nickname ?? "").trim()) advance();
            }}
            placeholder="e.g. Alex"
            className="h-14 text-lg"
          />
        </Question>
      );

    case "ageRange":
      return (
        <Question title="What's your age range?" hint="Optional but helps us personalise.">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ageRanges.map((r) => (
              <PillChoice
                key={r}
                active={form.ageRange === r}
                onClick={() => pick({ ageRange: r })}
              >
                {r}
              </PillChoice>
            ))}
          </div>
        </Question>
      );

    case "sex":
      return (
        <Question
          title="Which body type should we show for your BMI?"
          hint="Only used to render a visual figure. You can pick 'Prefer not to say'."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ["male", "Male"],
                ["female", "Female"],
                ["other", "Other"],
                ["prefer-not", "Prefer not to say"],
              ] as [Sex, string][]
            ).map(([v, l]) => (
              <BigChoice
                key={v}
                active={form.sex === v}
                onClick={() => pick({ sex: v })}
                title={l}
              />
            ))}
          </div>
        </Question>
      );

    case "height":
      return (
        <Question title="How tall are you?" hint="Optional. Used for a rough BMI estimate only.">
          <div className="flex items-center gap-3">
            <Input
              autoFocus
              type="number"
              inputMode="numeric"
              value={form.heightCm ?? ""}
              onChange={(e) =>
                update({ heightCm: e.target.value ? +e.target.value : undefined })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") advance();
              }}
              placeholder="e.g. 170"
              className="h-14 text-lg"
            />
            <span className="text-sm text-muted-foreground">cm</span>
          </div>
        </Question>
      );

    case "weight":
      return (
        <Question title="And your weight?" hint="Optional.">
          <div className="flex items-center gap-3">
            <Input
              autoFocus
              type="number"
              value={form.weightKg ?? ""}
              onChange={(e) =>
                update({ weightKg: e.target.value ? +e.target.value : undefined })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") advance();
              }}
              placeholder="e.g. 70"
              className="h-14 text-lg"
            />
            <span className="text-sm text-muted-foreground">kg</span>
          </div>
          {bmi && (
            <BmiFigure
              bmi={bmi}
              sex={form.sex}
              className="mt-6"
            />
          )}
        </Question>
      );

    case "fitnessGoal":
      return (
        <Question title="What's your main fitness goal?">
          <div className="grid gap-2 sm:grid-cols-2">
            {fitnessGoals.map((g) => (
              <BigChoice
                key={g.value}
                active={form.fitnessGoal === g.value}
                onClick={() => pick({ fitnessGoal: g.value })}
                icon={<span className="text-lg">{g.emoji}</span>}
                title={g.label}
              />
            ))}
          </div>
        </Question>
      );

    case "activity":
      return (
        <Question title="How active are you usually?">
          <div className="grid gap-2">
            {(
              [
                ["sedentary", "Sedentary", "Mostly sitting"],
                ["light", "Lightly active", "Walks, light chores"],
                ["moderate", "Moderate", "Active most days"],
                ["active", "Active", "Regular workouts"],
                ["very-active", "Very active", "Daily training or physical job"],
              ] as [ActivityLevel, string, string][]
            ).map(([v, t, d]) => (
              <BigChoice
                key={v}
                active={form.activityLevel === v}
                onClick={() => pick({ activityLevel: v })}
                title={t}
                desc={d}
              />
            ))}
          </div>
        </Question>
      );



    case "exerciseFreq":
      return (
        <Question title="How many days a week do you exercise?">
          <div className="grid grid-cols-4 gap-2">
            {(["0", "1-2", "3-4", "5+"] as ExerciseFrequency[]).map((v) => (
              <PillChoice
                key={v}
                active={form.exerciseFrequency === v}
                onClick={() => pick({ exerciseFrequency: v })}
              >
                {v}
              </PillChoice>
            ))}
          </div>
        </Question>
      );

    case "struggle":
      return (
        <Question title="What's your biggest food struggle?" hint="Pick the one that fits most.">
          <div className="flex flex-wrap gap-2">
            {struggles.map((s) => (
              <PillChoice
                key={s}
                active={form.biggestStruggle === s}
                onClick={() => pick({ biggestStruggle: s })}
              >
                {s}
              </PillChoice>
            ))}
          </div>
        </Question>
      );

    case "condition": {
      const otherSelected = form.medicalConditions?.includes("other") ?? false;
      return (
        <Question
          title="Which condition should we consider?"
          hint="Select all that apply. This guidance is educational, not medical."
        >
          <MedicalDisclaimerBanner variant="compact" />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {conditionOptions.map((c) => {
              const active = form.medicalConditions?.includes(c.value) ?? false;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    const list = new Set(form.medicalConditions ?? []);
                    if (active) list.delete(c.value);
                    else list.add(c.value);
                    update({
                      medicalConditions: Array.from(list),
                      ...(c.value === "other" && active
                        ? { otherCondition: undefined }
                        : {}),
                    });
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-xl border bg-card px-3 py-3 text-left text-sm transition-colors",
                    active
                      ? "border-fit-green bg-fit-green/10 text-fit-green"
                      : "hover:bg-muted",
                  )}
                >
                  {c.label}
                  {active && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
          {otherSelected && (
            <div className="mt-4">
              <Label htmlFor="otherCondition" className="text-sm font-medium">
                Tell us about it
              </Label>
              <Input
                id="otherCondition"
                autoFocus
                value={form.otherCondition ?? ""}
                onChange={(e) => update({ otherCondition: e.target.value })}
                placeholder="e.g. PCOS, gout, IBD…"
                className="mt-1 h-12 text-base"
              />
            </div>
          )}
        </Question>
      );
    }

    case "diagnosed":
      return (
        <Question title="Was this diagnosed by a healthcare professional?">
          <div className="grid gap-2">
            {(
              [
                ["yes", "Yes, diagnosed"],
                ["no", "No, self-identified"],
                ["prefer-not", "Prefer not to say"],
              ] as [HealthProfile["professionalDiagnosis"], string][]
            ).map(([v, l]) => (
              <BigChoice
                key={v}
                active={form.professionalDiagnosis === v}
                onClick={() => pick({ professionalDiagnosis: v })}
                title={l!}
              />
            ))}
          </div>
        </Question>
      );


    case "nutrientsWatch":
      return (
        <Question
          title="Which nutrients should we watch for you?"
          hint="Tayyib will highlight these when you scan or log foods."
        >
          <div className="flex flex-wrap gap-2">
            {nutrientChoices.map((n) => {
              const active = form.nutrientsToWatch?.includes(n) ?? false;
              return (
                <PillChoice
                  key={n}
                  active={active}
                  onClick={() => {
                    const list = new Set(form.nutrientsToWatch ?? []);
                    if (active) list.delete(n);
                    else list.add(n);
                    update({ nutrientsToWatch: Array.from(list) });
                  }}
                >
                  {n}
                </PillChoice>
              );
            })}
          </div>
        </Question>
      );

    case "caution":
      return (
        <Question title="How strict should warnings be?">
          <div className="grid gap-2">
            {(
              [
                ["gentle", "Gentle", "Light nudges and softer language."],
                ["normal", "Normal", "Balanced flags and guidance."],
                ["strict", "Strict", "Warn strongly about risky foods."],
              ] as [CautionLevel, string, string][]
            ).map(([v, t, d]) => (
              <BigChoice
                key={v}
                active={form.cautionLevel === v}
                onClick={() => pick({ cautionLevel: v })}
                title={t}
                desc={d}
              />
            ))}
          </div>
        </Question>
      );

    case "allergies":
      return (
        <Question
          title="Any allergies or foods you must avoid?"
          hint="Comma-separated. Leave empty if none."
        >
          <Textarea
            autoFocus
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            placeholder="e.g. peanuts, shellfish, soy"
            rows={3}
            className="text-base"
          />
        </Question>
      );

    case "dietary":
      return (
        <Question title="Any dietary preferences?" hint="Pick any that apply.">
          <div className="flex flex-wrap gap-2">
            {dietOptions.map((d) => {
              const active = form.dietaryPreferences?.includes(d.value) ?? false;
              return (
                <PillChoice
                  key={d.value}
                  active={active}
                  onClick={() => {
                    const list = new Set(form.dietaryPreferences ?? []);
                    if (active) list.delete(d.value);
                    else list.add(d.value);
                    const patch: Partial<HealthProfile> = {
                      dietaryPreferences: Array.from(list),
                    };
                    // Picking Halal auto-enables strict halal scanning
                    if (d.value === "halal") {
                      if (!active) {
                        patch.halalRequired = true;
                        patch.halalStrictness = "strict";
                      } else {
                        patch.halalRequired = false;
                        patch.halalStrictness = "off";
                      }
                    }
                    update(patch);
                  }}
                >
                  {d.label}
                </PillChoice>

              );
            })}
          </div>
        </Question>
      );

    case "halal":
      return (
        <Question
          title="Do you follow halal dietary requirements?"
          hint="We can flag haram and doubtful (mashbooh) ingredients."
        >
          <div className="flex items-center justify-between rounded-2xl border bg-card p-4">
            <Label htmlFor="halal-switch" className="text-base font-medium">
              Yes, scan for halal-doubtful ingredients
            </Label>
            <Switch
              id="halal-switch"
              checked={form.halalRequired ?? false}
              onCheckedChange={(v) =>
                update({
                  halalRequired: v,
                  halalStrictness: v
                    ? form.halalStrictness && form.halalStrictness !== "off"
                      ? form.halalStrictness
                      : "medium"
                    : "off",
                })
              }
            />
          </div>
        </Question>
      );

    case "halalStrict":
      return (
        <Question title="How strict should the halal scan be?">
          <div className="grid gap-2">
            {(
              [
                ["low", "Low", "Flag obvious haram only (pork, alcohol)."],
                ["medium", "Medium", "Also flag gelatin and known animal additives."],
                ["strict", "Strict", "Flag every doubtful additive, including E-numbers."],
              ] as [HalalStrictness, string, string][]
            ).map(([v, t, d]) => (
              <BigChoice
                key={v}
                active={form.halalStrictness === v}
                onClick={() => pick({ halalStrictness: v })}
                title={t}
                desc={d}
              />
            ))}
          </div>
        </Question>
      );

    case "consent":
      return (
        <Question
          title="Ready to save your profile?"
          hint="Your data stays in this browser. Tayyib is educational, not medical advice."
        >
          <MedicalDisclaimerBanner variant="compact" />
          <button
            type="button"
            onClick={() =>
              update({ consentMedicalDataStored: !form.consentMedicalDataStored })
            }
            className={cn(
              "mt-4 flex w-full items-start gap-3 rounded-2xl border p-4 text-left text-sm transition-colors",
              form.consentMedicalDataStored
                ? "border-fit-green bg-fit-green/10"
                : "bg-card hover:bg-muted",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border",
                form.consentMedicalDataStored
                  ? "border-fit-green bg-fit-green text-white"
                  : "border-input",
              )}
            >
              {form.consentMedicalDataStored && <Check className="h-3.5 w-3.5" />}
            </span>
            <span className="text-muted-foreground">
              I understand Tayyib is educational, not medical advice, and I consent
              to storing this information in my browser for use in the app.
            </span>
          </button>
        </Question>
      );
  }
}

// ---------- Small primitives ----------

function Question({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
        {title}
      </h1>
      {hint && <p className="mt-2 text-sm text-muted-foreground md:text-base">{hint}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function BigChoice({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  title: string;
  desc?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-all",
        active
          ? "border-fit-green bg-fit-green/10 shadow-sm"
          : "hover:border-foreground/20 hover:bg-muted",
      )}
    >
      {icon && (
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            active ? "bg-fit-green/20 text-fit-green" : "bg-muted text-muted-foreground",
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1">
        <div className={cn("font-semibold", active && "text-fit-green")}>{title}</div>
        {desc && <div className="text-xs text-muted-foreground">{desc}</div>}
      </div>
      {active && <Check className="h-4 w-4 text-fit-green" />}
    </button>
  );
}

function PillChoice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-fit-green bg-fit-green/10 text-fit-green"
          : "bg-card hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
