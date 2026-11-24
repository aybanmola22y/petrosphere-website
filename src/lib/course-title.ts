/**
 * Fix cramped TMS dashes like `Officer- Category` / `Officer–Category`.
 * Uses a spaced ASCII hyphen so the mark doesn’t collide with lowercase “r”.
 * Keeps compound forms like `Eight-Hour` and repairs common TMS typos.
 */
export function normalizeCourseTitle(title: string): string {
  return title
    .replace(/(\p{L}|\p{N})\s*[\u002D\u2010\u2011\u2012\u2013\u2014\u2212]\s*(?=\p{L}|\p{N})/gu, "$1 - ")
    // Compound duration — do not leave as "Eight - hour"
    .replace(/\bEight\s*-\s*[Hh]our\b/g, "Eight-Hour")
    // TMS typo: "Ssafety"
    .replace(/\bSsafety\b/g, "Safety")
    .replace(/\s{2,}/g, " ")
    .trim();
}
