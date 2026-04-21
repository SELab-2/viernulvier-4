/**
 * This file can be used for a bundeling of extra util functions used elsewhere.
 */

/**
 * Calculates the ETA of a network action.
 * @param startTime The starting time of the action.
 * @param current The current items.
 * @param total The total items.
 * @returns A time string.
 */
export function calculateETA(
  startTime: number,
  current: number,
  total: number,
): string {
  if (current === 0) return "Calculating...";

  const elapsed = Date.now() - startTime; // ms spent so far
  const msPerItem = elapsed / current;
  const remainingItems = total - current;
  const remainingMs = remainingItems * msPerItem;

  // Convert MS to a nice string like "2m 30s"
  const seconds = Math.floor((remainingMs / 1000) % 60);
  const minutes = Math.floor((remainingMs / (1000 * 60)) % 60);

  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}
