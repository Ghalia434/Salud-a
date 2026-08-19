"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart-store";
import { ATHLETE_PRICING, EXTRA_SAUCE_PRICE } from "@/lib/constants";
import {
  computeAthleteMealUnitPrice,
  getDefaultAthleteCustomization,
  mealSauceTotal,
} from "@/lib/athlete-pricing";
import { formatPrice } from "@/lib/format";
import type { Database } from "@/lib/database.types";

type Meal = Database["public"]["Tables"]["meals"]["Row"];

export default function PortionsPage() {
  const router = useRouter();
  const program = useCartStore((s) => s.program);
  const pack = useCartStore((s) => s.pack);
  const items = useCartStore((s) => s.items);
  const totalSelected = useCartStore((s) => s.totalSelected());
  const athleteCustomization = useCartStore((s) => s.athleteCustomization);
  const setAthleteCustomization = useCartStore((s) => s.setAthleteCustomization);
  const mealSauces = useCartStore((s) => s.mealSauces);
  const setMealSauce = useCartStore((s) => s.setMealSauce);

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!program) {
      router.replace("/commander/objectif");
      return;
    }
    if (program !== "athlete") {
      router.replace("/commander/extras");
      return;
    }
    if (!pack) {
      router.replace("/commander/pack");
      return;
    }
    if (totalSelected !== pack.plates) {
      router.replace("/commander/repas");
      return;
    }

    const supabase = createClient();
    supabase
      .from("meals")
      .select("*")
      .in("id", Object.keys(items))
      .then(({ data }) => {
        setMeals(data ?? []);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, pack, totalSelected, router]);

  if (!program || program !== "athlete" || !pack) return null;

  const grandTotal =
    meals.reduce((sum, meal) => {
      const custom = athleteCustomization[meal.id] ?? getDefaultAthleteCustomization(meal);
      const qty = items[meal.id] ?? 0;
      return sum + computeAthleteMealUnitPrice(meal, custom) * qty;
    }, 0) + mealSauceTotal(items, mealSauces);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-brand-800">
        Personnalisez vos portions
      </h1>
      <p className="mt-2 text-brand-600">
        Ajustez au gramme près les portions de chaque plat. Le prix se met à jour en
        temps réel.
      </p>

      {loading && <p className="mt-8 text-brand-500">Chargement…</p>}

      <div className="mt-8 space-y-6">
        {meals.map((meal) => {
          const custom = athleteCustomization[meal.id] ?? getDefaultAthleteCustomization(meal);
          const qty = items[meal.id] ?? 0;
          const hasSauce = mealSauces[meal.id] ?? false;
          const unitPrice =
            computeAthleteMealUnitPrice(meal, custom) + (hasSauce ? EXTRA_SAUCE_PRICE : 0);
          return (
            <div
              key={meal.id}
              className="rounded-2xl border border-brand-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-100">
                  {meal.photo_url && (
                    <Image src={meal.photo_url} alt={meal.name} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-brand-800">{meal.name}</h3>
                  <p className="text-xs text-brand-500">
                    {qty} plat{qty > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-brand-700">
                    {formatPrice(unitPrice * qty)}
                  </p>
                  {qty > 1 && (
                    <p className="text-xs text-brand-500">{formatPrice(unitPrice)} / plat</p>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {meal.protein_label && (
                  <GramStepper
                    label={meal.protein_label}
                    grams={custom.proteinGrams ?? ATHLETE_PRICING.minGrams}
                    min={ATHLETE_PRICING.minGrams}
                    step={ATHLETE_PRICING.gramStep}
                    ratePerGram={ATHLETE_PRICING.proteinRatePerGram}
                    onChange={(proteinGrams) =>
                      setAthleteCustomization(meal.id, { ...custom, proteinGrams })
                    }
                  />
                )}
                {meal.starch_label && (
                  <GramStepper
                    label={meal.starch_label}
                    grams={custom.starchGrams ?? ATHLETE_PRICING.minGrams}
                    min={ATHLETE_PRICING.minGrams}
                    step={ATHLETE_PRICING.gramStep}
                    ratePerGram={ATHLETE_PRICING.starchRatePerGram}
                    onChange={(starchGrams) =>
                      setAthleteCustomization(meal.id, { ...custom, starchGrams })
                    }
                  />
                )}
                {meal.veg_label && (
                  <GramStepper
                    label={meal.veg_label}
                    grams={custom.vegGrams}
                    min={ATHLETE_PRICING.minGrams}
                    step={ATHLETE_PRICING.gramStep}
                    ratePerGram={ATHLETE_PRICING.vegRatePerGram}
                    onChange={(vegGrams) =>
                      setAthleteCustomization(meal.id, { ...custom, vegGrams })
                    }
                  />
                )}
                {meal.extra_label && meal.extra_price_per_100g && (
                  <GramStepper
                    label={meal.extra_label}
                    grams={custom.extraGrams}
                    min={ATHLETE_PRICING.minGrams}
                    step={ATHLETE_PRICING.gramStep}
                    ratePerGram={meal.extra_price_per_100g / 100}
                    onChange={(extraGrams) =>
                      setAthleteCustomization(meal.id, { ...custom, extraGrams })
                    }
                  />
                )}
              </div>

              {meal.sauce_label && (
                <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-700">
                  <input
                    type="checkbox"
                    checked={hasSauce}
                    onChange={(e) => setMealSauce(meal.id, e.target.checked)}
                    className="h-4 w-4 rounded border-brand-300"
                  />
                  Extra {meal.sauce_label} (+{formatPrice(EXTRA_SAUCE_PRICE)})
                </label>
              )}
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 mt-10 flex items-center justify-between border-t border-brand-200 bg-brand-cream/95 py-4 backdrop-blur">
        <div>
          <p className="text-xs text-brand-500">Total des portions</p>
          <p className="text-lg font-bold text-brand-800">{formatPrice(grandTotal)}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/commander/repas")}
            className="rounded-full border border-brand-300 px-6 py-3 font-semibold text-brand-700"
          >
            Retour aux repas
          </button>
          <button
            onClick={() => router.push("/commander/extras")}
            disabled={loading}
            className="rounded-full bg-brand-700 px-8 py-3 font-semibold text-white shadow disabled:opacity-30"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}

function GramStepper({
  label,
  grams,
  min,
  step,
  ratePerGram,
  onChange,
}: {
  label: string;
  grams: number;
  min: number;
  step: number;
  ratePerGram: number;
  onChange: (grams: number) => void;
}) {
  return (
    <div className="rounded-xl border border-brand-100 bg-brand-cream/60 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-brand-800">{label}</span>
        <span className="text-xs text-brand-500">{formatPrice(grams * ratePerGram)}</span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, grams - step))}
          disabled={grams <= min}
          className="h-8 w-8 rounded-full border border-brand-300 text-brand-700 disabled:opacity-30"
        >
          −
        </button>
        <span className="w-16 text-center font-semibold">{grams} g</span>
        <button
          onClick={() => onChange(grams + step)}
          className="h-8 w-8 rounded-full bg-brand-700 text-white"
        >
          +
        </button>
      </div>
    </div>
  );
}
