// Boundary-aware ingredient matching.
//
// The original implementation used `text.includes(token)`, which produces
// embarrassing false positives — "graham" matched "ham", "eggplant" matched
// "egg", "alcohol-free" matched "alcohol". For a halal app especially, wrongly
// flagging a permissible food is a trust-killer. These helpers match whole
// words/phrases only and skip negated mentions like "alcohol-free".

const NEGATORS = ["free from", "no ", "non ", "non-", "without", "0%", "zero", "free of"];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// A token matches only when bounded by non-alphanumeric chars (or string ends),
// so "ham" no longer matches inside "graham" and "e120" won't match "e1200".
function buildMatcher(token: string): RegExp {
  return new RegExp(`(?<![a-z0-9])${escapeRegExp(token)}(?![a-z0-9])`, "i");
}

function isNegated(text: string, matchIndex: number, token: string): boolean {
  const before = text.slice(Math.max(0, matchIndex - 14), matchIndex);
  const after = text.slice(matchIndex + token.length, matchIndex + token.length + 8);
  if (/[-\s](free|frei)\b/i.test(after) || /\bfree$/i.test(before.trimEnd())) return true;
  return NEGATORS.some((neg) => before.toLowerCase().includes(neg));
}

/** Returns the list of tokens genuinely present in `text` (deduped, boundary-aware). */
export function findTokens(text: string, tokens: string[]): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const token of tokens) {
    const re = buildMatcher(token);
    const m = re.exec(lower);
    if (m && !isNegated(lower, m.index, token)) found.push(token);
  }
  return found;
}

/** Returns the first token present in `text`, or null. */
export function firstToken(text: string | undefined, tokens: string[]): string | null {
  if (!text) return null;
  const hits = findTokens(text, tokens);
  return hits[0] ?? null;
}
