import { ATHLETE_PRICING } from "@/lib/constants";
import type { AthleteCustomization } from "@/lib/cart-store";
import type { Database } from "@/lib/database.types";

type MealLabels = Pick<
  Database["public"]["Tables"]["meals"]["Row"],
  "protein_label" | "starch_label"
>;

// Meals with no protein_label/starch_label (e.g. Salade exotique) are priced
// as a single vegetable-rate component using only vegGrams.
export function computeAthleteMealUnitPrice(
  meal: MealLabels,
  c: AthleteCustomization
): number {
  let total = 0;
  if (meal.protein_label && c.proteinGrams) {
    total += c.proteinGrams * ATHLETE_PRICING.proteinRatePerGram;
  }
  if (meal.starch_label && c.starchGrams) {
    total += c.starchGrams * ATHLETE_PRICING.starchRatePerGram;
  }
  total += c.vegGrams * ATHLETE_PRICING.vegRatePerGram;
  total += c.extraVegGrams * ATHLETE_PRICING.vegRatePerGram;
  if (c.sauce) total += ATHLETE_PRICING.saucePrice;
  return Math.round(total * 100) / 100;
}
