const CLOSED_DAYS = new Set(["Sat", "Sun"]);

/**
 * Orders are only accepted Monday-Friday (Casablanca time); delivery is
 * every Sunday. Evaluated in Africa/Casablanca regardless of server locale.
 */
export function isOrderingOpen(date: Date = new Date()): boolean {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Casablanca",
    weekday: "short",
  }).format(date);

  return !CLOSED_DAYS.has(weekday);
}
