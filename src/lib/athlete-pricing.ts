import { ATHLETE_PRICING, EXTRA_SAUCE_PRICE } from "@/lib/constants";
import type { AthleteCustomization } from "@/lib/cart-store";
import type { Database } from "@/lib/database.types";

type MealLabels = Pick<
  Database["public"]["Tables"]["meals"]["Row"],
  "protein_label" | "starch_label" | "veg_label"
>;

type MealDefaultGrams = Pick<
  Database["public"]["Tables"]["meals"]["Row"],
  | "protein_label"
  | "starch_label"
  | "veg_label"
  | "protein_default_grams"
  | "starch_default_grams"
  | "veg_default_grams"
>;

// The starting portion a client sees for a given meal — the admin-set
// default gram amount per component if configured, otherwise the 100g
// floor. A component is only included when the meal actually has it
// (e.g. no proteinGrams for a meal with no protein_label).
export function getDefaultAthleteCustomization(meal: MealDefaultGrams): AthleteCustomization {
  return {
    proteinGrams: meal.protein_label
      ? Math.max(ATHLETE_PRICING.minGrams, meal.protein_default_grams ?? ATHLETE_PRICING.minGrams)
      : null,
    starchGrams: meal.starch_label
      ? Math.max(ATHLETE_PRICING.minGrams, meal.starch_default_grams ?? ATHLETE_PRICING.minGrams)
      : null,
    vegGrams: Math.max(ATHLETE_PRICING.minGrams, meal.veg_default_grams ?? ATHLETE_PRICING.minGrams),
  };
}

// Each component (protein/starch/veg) only counts toward the price — and
// only appears in the portions UI — when the meal actually has that real
// ingredient (e.g. Salade exotique has veg_label but no protein_label).
// Extra sauce is priced separately (see mealSauceTotal) since it's offered
// across every objective, not just Formule Athlète.
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
  if (meal.veg_label) {
    total += c.vegGrams * ATHLETE_PRICING.vegRatePerGram;
  }
  return Math.round(total * 100) / 100;
}

// Total cost of "extra sauce" add-ons across selected meals, scaled by each
// meal's quantity — shared by every objective's panier/récapitulatif.
export function mealSauceTotal(
  items: Record<string, number>,
  mealSauces: Record<string, boolean>
): number {
  return Object.entries(items).reduce((sum, [mealId, qty]) => {
    return sum + (mealSauces[mealId] ? EXTRA_SAUCE_PRICE * qty : 0);
  }, 0);
}
