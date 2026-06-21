import { createServerFn } from "@tanstack/react-start";

// What the client sends. Includes the verbatim ingredient text so the model can
// quote exact evidence, and the user's active requirements so it can check each.
export interface InsightInput {
  food: {
    name: string;
    brand?: string;
    ingredients?: string;
    allergens: string[];
    nutrition: Record<string, number | undefined>;
    novaGroup?: number;
    nutriscore?: string;
    dataConfidence: "high" | "medium" | "low";
  };
  analysis: {
    score: number;
    verdict: "green" | "amber" | "red";
    keyReasons: string[];
    positiveFactors: string[];
  };
  requirements: string[];
  todayContext?: string;
  language: "en" | "ar" | "ur";
}

export interface DietCheck {
  requirement: string;
  status: "pass" | "warning" | "violation";
  evidence: string | null;
  note: string;
}

export interface InsightResult {
  source: "groq" | "fallback";
  text: string;
  shortVerdict: string;
  checks: DietCheck[];
  model?: string;
}

const LANG_NAME: Record<string, string> = { en: "English", ar: "Arabic", ur: "Urdu" };

const SYSTEM = `You are the dietary-verification engine of Tayyib, a halal-aware nutrition app. You must be STRICT and HONEST - people rely on you to avoid foods their faith, health, or allergies forbid.

You are given a product's verbatim ingredient list and a user's active dietary requirements. For EACH requirement, decide:
- "violation": the product clearly breaks it (e.g. pork/lard/alcohol for halal; any meat/fish/gelatine for vegetarian; any animal-derived item for vegan; wheat/barley/rye for gluten-free; milk/whey/casein for dairy-free; a listed allergen present).
- "warning": ambiguous or source-dependent (e.g. gelatine/mono- and diglycerides/"natural flavouring"/E471 of unknown origin for halal or vegan; "may contain" traces for an allergy). When unsure, prefer "warning" over "pass" - never wave something through.
- "pass": genuinely compliant.

CRITICAL accuracy rules - do NOT produce false positives:
- Match meaning, not letters. "graham" is a cracker, NOT ham. "eggplant" is a vegetable, NOT egg. "coconut milk", "cocoa butter", "shea butter", "peanut butter" are NOT dairy. "alcohol-free" / "0% alcohol" contains NO alcohol. "cream of tartar" is not dairy.
- "evidence" MUST be an exact substring copied verbatim from the ingredient list (so the user can see the proof). If you cannot quote an exact offending ingredient, you may not mark violation - use pass, or warning if the list is missing/unclear.
- If the ingredient list is empty or unavailable, mark each requirement "warning" with a note that you cannot verify, evidence null.

Then write:
- "shortVerdict": max 8 words, plain, honest (e.g. "Not halal - contains pork", "Suitable", "Check gelatine source").
- "insight": 2-3 sentences, specific to this user's numbers/requirements, no medical advice, no emojis.

Return ONLY valid JSON, no markdown:
{"shortVerdict": string, "insight": string, "checks": [{"requirement": string, "status": "pass"|"warning"|"violation", "evidence": string|null, "note": string}]}`;

function buildUser(input: InsightInput): string {
  const n = input.food.nutrition;
  const nut = Object.entries(n)
    .filter(([, v]) => typeof v === "number")
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
  return JSON.stringify({
    product: `${input.food.name}${input.food.brand ? ` (${input.food.brand})` : ""}`,
    ingredients: input.food.ingredients || "(not available)",
    allergens_listed: input.food.allergens,
    nutrition_per_serving: nut || "(limited)",
    data_confidence: input.food.dataConfidence,
    active_requirements: input.requirements.length ? input.requirements : ["General healthy eating"],
    today_so_far: input.todayContext ?? null,
  });
}

/**
 * Strict dietary verification via Groq (LLaMA), returning structured checks with
 * quoted evidence. Server-side only (GROQ_API_KEY never reaches the browser).
 * Returns source "fallback" when the key is missing or the call fails, so the
 * client can fall back to the deterministic rule engine - never silently permissive.
 */
export const generateInsight = createServerFn({ method: "POST" })
  .inputValidator((d: InsightInput) => d)
  .handler(async ({ data }): Promise<InsightResult> => {
    const apiKey = process.env.GROQ_API_KEY;
    const empty: InsightResult = { source: "fallback", text: "", shortVerdict: "", checks: [] };
    if (!apiKey) return empty;

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const langName = LANG_NAME[data.language] ?? "English";

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 14_000);
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 700,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: `${SYSTEM}\nWrite shortVerdict, insight and every note in ${langName}.` },
            { role: "user", content: buildUser(data) },
          ],
        }),
      });
      clearTimeout(timeout);
      if (!res.ok) return empty;

      const json = await res.json();
      const rawText: string = json?.choices?.[0]?.message?.content ?? "";
      if (!rawText) return empty;

      const parsed = JSON.parse(rawText);
      const checks: DietCheck[] = Array.isArray(parsed.checks)
        ? parsed.checks
            .filter((c: any) => c && typeof c.requirement === "string")
            .map((c: any) => ({
              requirement: String(c.requirement),
              status: ["pass", "warning", "violation"].includes(c.status) ? c.status : "warning",
              evidence: typeof c.evidence === "string" && c.evidence.trim() ? c.evidence.trim() : null,
              note: String(c.note ?? ""),
            }))
        : [];

      return {
        source: "groq",
        text: String(parsed.insight ?? ""),
        shortVerdict: String(parsed.shortVerdict ?? ""),
        checks,
        model,
      };
    } catch {
      return empty;
    }
  });
