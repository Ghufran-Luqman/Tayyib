import { createServerFn } from "@tanstack/react-start";

// Context the client sends. Kept compact and non-identifying — no names, just
// the facts the model needs to reason about fit.
export interface InsightInput {
  food: {
    name: string;
    brand?: string;
    nutrition: Record<string, number | undefined>;
    novaGroup?: number;
    nutriscore?: string;
    dataConfidence: "high" | "medium" | "low";
  };
  analysis: {
    score: number;
    verdict: "green" | "amber" | "red";
    keyReasons: string[];
    watchOuts: string[];
    positiveFactors: string[];
  };
  profile: {
    track?: string;
    goal?: string;
    fitnessGoal?: string;
    conditions: string[];
    halalStrictness?: string;
  } | null;
  todayContext?: string;
  language: "en" | "ar" | "ur";
}

export interface InsightResult {
  text: string;
  source: "groq" | "fallback";
  model?: string;
}

const LANG_NAME: Record<string, string> = {
  en: "English",
  ar: "Arabic",
  ur: "Urdu",
};

function buildPrompt(input: InsightInput): string {
  const { food, analysis, profile, todayContext } = input;
  const n = food.nutrition;
  const nutritionLine = Object.entries(n)
    .filter(([, v]) => typeof v === "number")
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");

  return [
    `Food: ${food.name}${food.brand ? ` (${food.brand})` : ""}.`,
    `Nutrition per serving: ${nutritionLine || "limited data"}.`,
    food.novaGroup ? `NOVA processing group: ${food.novaGroup}.` : "",
    `Data confidence: ${food.dataConfidence}.`,
    `Rule-engine verdict: ${analysis.verdict.toUpperCase()} (score ${analysis.score}/100).`,
    analysis.keyReasons.length ? `Concerns: ${analysis.keyReasons.join("; ")}.` : "",
    analysis.positiveFactors.length ? `Positives: ${analysis.positiveFactors.join("; ")}.` : "",
    profile
      ? `User profile: track=${profile.track ?? "n/a"}, goal=${profile.fitnessGoal ?? profile.goal ?? "n/a"}, conditions=${profile.conditions.join(",") || "none"}, halal=${profile.halalStrictness ?? "off"}.`
      : "No user profile set.",
    todayContext ? `Today so far: ${todayContext}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

const SYSTEM = `You are the explanation layer of Tayyib, a halal-aware nutrition app.
Given a food and a user's health profile, write ONE short, specific, honest insight (2-4 sentences) about whether this food fits THIS user right now.
Rules:
- Be concrete: cite the actual numbers and the user's actual conditions/goals. Never be generic.
- Surface one non-obvious point if there is one (e.g. it's fine alone but stacks badly with what they've eaten today, or the data confidence is low so the verdict is uncertain).
- If data confidence is low, say the verdict is uncertain and why.
- This is educational, NOT medical advice. Do not diagnose or prescribe. No emojis. No markdown headings.
- Halal note only if relevant to the flags.`;

/**
 * Generates a personalised, profile-aware insight via Groq (LLaMA).
 * Runs ONLY on the server, so GROQ_API_KEY is never exposed to the browser.
 * Falls back cleanly to the deterministic summary if the key is missing or
 * the request fails — the app never breaks because the model is unavailable.
 */
export const generateInsight = createServerFn({ method: "POST" })
  .inputValidator((d: InsightInput) => d)
  .handler(async ({ data }): Promise<InsightResult> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return { text: "", source: "fallback" };

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const langName = LANG_NAME[data.language] ?? "English";

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12_000);
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          temperature: 0.4,
          max_tokens: 220,
          messages: [
            { role: "system", content: `${SYSTEM}\nReply in ${langName}.` },
            { role: "user", content: buildPrompt(data) },
          ],
        }),
      });
      clearTimeout(timeout);

      if (!res.ok) return { text: "", source: "fallback" };
      const json = await res.json();
      const text: string = json?.choices?.[0]?.message?.content?.trim() ?? "";
      if (!text) return { text: "", source: "fallback" };
      return { text, source: "groq", model };
    } catch {
      return { text: "", source: "fallback" };
    }
  });
