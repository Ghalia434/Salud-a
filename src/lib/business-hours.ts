const CLOSED_DAYS = new Set(["Sun", "Wed"]);

/**
 * Orders are closed Sunday and Wednesday (Casablanca time). Evaluated in
 * Africa/Casablanca regardless of server locale.
 */
export function isOrderingOpen(date: Date = new Date()): boolean {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Casablanca",
    weekday: "short",
  }).format(date);

  return !CLOSED_DAYS.has(weekday);
}
