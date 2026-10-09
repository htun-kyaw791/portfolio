// Tiny VS Code-style fuzzy matcher: every query character must appear in order.
// Consecutive runs and word starts score higher; returns matched indices for
// highlighting, or null when there is no match.

export type FuzzyMatch = { score: number; indices: number[] };

const WORD_BREAK = /[\s\-_/.:@#>]/;

export function fuzzyMatch(query: string, text: string): FuzzyMatch | null {
  const q = query.trim().toLowerCase();
  if (!q) return { score: 0, indices: [] };
  const t = text.toLowerCase();

  const indices: number[] = [];
  let score = 0;
  let ti = 0;
  let prev = -2;

  for (const ch of q) {
    if (ch === " ") continue;
    const found = t.indexOf(ch, ti);
    if (found === -1) return null;
    indices.push(found);

    score += 1;
    if (found === prev + 1) score += 4; // consecutive
    if (found === 0 || WORD_BREAK.test(t[found - 1])) score += 6; // word start
    score -= Math.min(found - ti, 6) * 0.2; // gap penalty

    prev = found;
    ti = found + 1;
  }

  // shorter texts with the same matches feel more relevant
  return { score: score - t.length * 0.01, indices };
}
