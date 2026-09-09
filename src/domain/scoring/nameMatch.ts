/**
 * Normalises class/classifier names and computes fuzzy string similarity.
 * Implements PRD §9.6:
 * normalise(name) = lowercase, strip non-alphanumerics, singularise
 * match(u, r)     = normalise(u.name) == normalise(r.name)
 *                   OR levenshtein_ratio(normalise(u.name), normalise(r.name)) >= 0.80
 */

export function normalise(name: string): string {
  if (!name) return '';
  // Lowercase & strip non-alphanumerics
  let s = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Naive singularise
  if (s.endsWith('ies') && s.length > 4) {
    s = s.slice(0, -3) + 'y';
  } else if (s.endsWith('es') && s.length > 4 && (s.endsWith('sses') || s.endsWith('shes') || s.endsWith('ches') || s.endsWith('xes'))) {
    s = s.slice(0, -2);
  } else if (s.endsWith('s') && !s.endsWith('ss') && s.length > 3) {
    s = s.slice(0, -1);
  }

  return s;
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array<number>(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        (prev[j] ?? 0) + 1,
        (curr[j - 1] ?? 0) + 1,
        (prev[j - 1] ?? 0) + cost
      );
    }
    const temp = prev;
    prev = curr;
    curr = temp;
  }

  return prev[n] ?? 0;
}

/**
 * Standard Levenshtein similarity ratio: (len(a) + len(b) - distance) / (len(a) + len(b))
 * Range 0.0 to 1.0.
 */
export function levenshteinRatio(a: string, b: string): number {
  if (a === b) return 1.0;
  const totalLen = a.length + b.length;
  if (totalLen === 0) return 1.0;
  const dist = levenshteinDistance(a, b);
  return (totalLen - dist) / totalLen;
}

/**
 * Checks if user name matches reference name according to PRD §9.6
 */
export function isNameMatch(userName: string, referenceName: string): boolean {
  const u = normalise(userName);
  const r = normalise(referenceName);
  if (!u || !r) return false;
  if (u === r) return true;
  return levenshteinRatio(u, r) >= 0.80;
}
