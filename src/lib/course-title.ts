/**
 * Fix cramped TMS dashes like `Officer- Category` / `Officer–Category`.
 * Uses a spaced ASCII hyphen so the mark doesn’t collide with lowercase “r”.
 */
export function normalizeCourseTitle(title: string): string {
  return title
    .replace(/(\p{L}|\p{N})\s*[\u002D\u2010\u2011\u2012\u2013\u2014\u2212]\s*(?=\p{L}|\p{N})/gu, "$1 - ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
