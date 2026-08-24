import { ATHLETE_PRICING } from "@/lib/constants";
import type { AthleteCustomization } from "@/lib/cart-store";
import type { Database } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type MealLabels = Pick<
  Database["public"]["Tables"]["meals"]["Row"],
  | "protein_label"
  | "starch_label"
  | "veg_label"
  | "extra_label"
  | "extra_price_per_100g"
  | "protein_price_per_10g"
  | "starch_price_per_10g"
  | "veg_price_per_10g"
>;

type MealDefaultGrams = Pick<
  Database["public"]["Tables"]["meals"]["Row"],
  | "protein_label"
  | "starch_label"
  | "veg_label"
  | "extra_label"
  | "protein_default_grams"
  | "starch_default_grams"
  | "veg_default_grams"
  | "extra_default_grams"
>;

// Formule Athlète's global protein/starch/veg rates and the flat extra-sauce
// price are admin-editable (athlete_pricing_settings), priced per 10g since
// that's the increment the client actually adjusts. These are the fallback
// values used only if that row can't be loaded.
export interface AthletePricingRates {
  proteinRatePerGram: number;
  starchRatePerGram: number;
  vegRatePerGram: number;
  saucePrice: number;
}

export const DEFAULT_ATHLETE_PRICING_RATES: AthletePricingRates = {
  proteinRatePerGram: 0.22,
  starchRatePerGram: 0.18,
  vegRatePerGram: 0.06,
  saucePrice: 8,
};

export async function fetchAthletePricingRates(
  supabase: SupabaseClient<Database>
): Promise<AthletePricingRates> {
  const { data } = await supabase.from("athlete_pricing_settings").select("*").single();
  if (!data) return DEFAULT_ATHLETE_PRICING_RATES;
  return {
    proteinRatePerGram: data.protein_price_per_10g / 10,
    starchRatePerGram: data.starch_price_per_10g / 10,
    vegRatePerGram: data.veg_price_per_10g / 10,
    saucePrice: data.sauce_price,
  };
}

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
    extraGrams: Math.max(
      ATHLETE_PRICING.minGrams,
      meal.extra_default_grams ?? ATHLETE_PRICING.minGrams
    ),
  };
}

// Each component (protein/starch/veg) only counts toward the price — and
// only appears in the portions UI — when the meal actually has that real
// ingredient (e.g. Salade exotique has veg_label but no protein_label).
// Each dish's protein/starch/veg can have its own price (meals.*_price_per_10g,
// e.g. Poulet priced differently from Saumon) — when unset, it falls back to
// the global rate in athlete_pricing_settings. "extra" is a 4th, meal-specific
// component priced at its own rate (meals.extra_price_per_100g), for
// ingredients that don't fit the protein/starch/veg model at all (e.g.
// Mozzarella at 20 DH/100g). Extra sauce is priced separately (see
// mealSauceTotal) since it's offered across every objective, not just
// Formule Athlète.
export function computeAthleteMealUnitPrice(
  meal: MealLabels,
  c: AthleteCustomization,
  rates: AthletePricingRates
): number {
  let total = 0;
  if (meal.protein_label && c.proteinGrams) {
    const rate = (meal.protein_price_per_10g ?? rates.proteinRatePerGram * 10) / 10;
    total += c.proteinGrams * rate;
  }
  if (meal.starch_label && c.starchGrams) {
    const rate = (meal.starch_price_per_10g ?? rates.starchRatePerGram * 10) / 10;
    total += c.starchGrams * rate;
  }
  if (meal.veg_label) {
    const rate = (meal.veg_price_per_10g ?? rates.vegRatePerGram * 10) / 10;
    total += c.vegGrams * rate;
  }
  if (meal.extra_label && meal.extra_price_per_100g) {
    total += c.extraGrams * (meal.extra_price_per_100g / 100);
  }
  return Math.round(total * 100) / 100;
}

// The effective DH/g rate actually applied to a dish's component — the
// per-meal override if set, otherwise the global fallback. Used by the
// admin pricing UI to show what a dish is really charging.
export function effectiveIngredientRatePerGram(
  mealPricePer10g: number | null,
  globalRatePerGram: number
): number {
  return (mealPricePer10g ?? globalRatePerGram * 10) / 10;
}

// Total cost of "extra sauce" add-ons across selected meals, scaled by each
// meal's quantity — shared by every objective's panier/récapitulatif.
export function mealSauceTotal(
  items: Record<string, number>,
  mealSauces: Record<string, boolean>,
  saucePrice: number
): number {
  return Object.entries(items).reduce((sum, [mealId, qty]) => {
    return sum + (mealSauces[mealId] ? saucePrice * qty : 0);
  }, 0);
}
