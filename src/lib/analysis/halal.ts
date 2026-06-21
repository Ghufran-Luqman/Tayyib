import type { Food, HalalStrictness } from "../foodfit/types";
import { findTokens } from "./text";

// Lists are non-exhaustive heuristics for ingredient-string scanning.
// "doubtful" items are commonly questionable; "haram" items are clearly avoided.
const HARAM_TOKENS = [
  "pork",
  "bacon",
  "ham",
  "lard",
  "prosciutto",
  "pepperoni",
  "alcohol",
  "ethanol",
  "wine",
  "beer",
  "rum",
  "vodka",
  "liqueur",
];

const DOUBTFUL_TOKENS = [
  "gelatin",
  "gelatine",
  "rennet",
  "l-cysteine",
  "shortening",
  "mono- and diglycerides",
  "mono and diglycerides",
  "glycerin",
  "glycerine",
  "natural flavour",
  "natural flavor",
  "enzymes",
  // E-numbers that may be animal-derived
  "e120", // cochineal / carmine
  "e441", // gelatin
  "e542", // bone phosphate
  "e471", // mono- and diglycerides of fatty acids
  "e472",
  "e631", // disodium inosinate
  "e904", // shellac
];

export interface HalalCheck {
  status: "ok" | "doubtful" | "haram";
  matches: string[];
}

export function checkHalal(food: Food, strictness: HalalStrictness): HalalCheck {
  if (strictness === "off") return { status: "ok", matches: [] };
  const text = `${food.ingredients ?? ""} ${food.allergens.join(" ")} ${food.additives.join(" ")}`
    .toLowerCase();
  if (!text.trim()) return { status: "ok", matches: [] };

  const haramHits = findTokens(text, HARAM_TOKENS);
  if (haramHits.length) return { status: "haram", matches: haramHits };

  // Strictness controls how aggressively we flag doubtful items.
  if (strictness === "low") return { status: "ok", matches: [] };

  const doubtful = findTokens(text, DOUBTFUL_TOKENS);
  if (!doubtful.length) return { status: "ok", matches: [] };

  // "medium" only flags the more clearly animal-derived doubtful items.
  if (strictness === "medium") {
    const strong = doubtful.filter((d) =>
      ["gelatin", "gelatine", "rennet", "l-cysteine", "e120", "e441", "e542", "e904"].includes(d),
    );
    if (!strong.length) return { status: "ok", matches: [] };
    return { status: "doubtful", matches: strong };
  }

  // strict: flag any doubtful token
  return { status: "doubtful", matches: doubtful };
}
