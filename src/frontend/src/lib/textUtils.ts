/**
 * Normalizes a text string for search/matching:
 * - Converts to lowercase
 * - Trims leading and trailing whitespace
 * - Collapses multiple consecutive spaces into a single space
 */
export function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Normalizes a search filter value.
 * Returns undefined if the result is an empty string (so the backend treats it as "no filter").
 */
export function normalizeFilter(value: string): string | undefined {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : undefined;
}
