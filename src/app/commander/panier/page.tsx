"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart-store";
import { PROGRAMS } from "@/lib/constants";
import {
  computeAthleteMealUnitPrice,
  DEFAULT_ATHLETE_PRICING_RATES,
  fetchAthletePricingRates,
  getDefaultAthleteCustomization,
  mealSauceTotal,
  type AthletePricingRates,
} from "@/lib/athlete-pricing";
import { formatPrice } from "@/lib/format";
import type { Database } from "@/lib/database.types";

type Meal = Database["public"]["Tables"]["meals"]["Row"];
type Extra = Database["public"]["Tables"]["extras"]["Row"];

export default function PanierPage() {
  const router = useRouter();
  const program = useCartStore((s) => s.program);
  const pack = useCartStore((s) => s.pack);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const totalSelected = useCartStore((s) => s.totalSelected());
  const extrasQty = useCartStore((s) => s.extras);
  const setExtraQuantity = useCartStore((s) => s.setExtraQuantity);
  const giftDetoxId = useCartStore((s) => s.giftDetoxId);
  const giftGourmandiseId = useCartStore((s) => s.giftGourmandiseId);
  const athleteCustomization = useCartStore((s) => s.athleteCustomization);
  const mealSauces = useCartStore((s) => s.mealSauces);

  const [meals, setMeals] = useState<Meal[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [rates, setRates] = useState<AthletePricingRates>(DEFAULT_ATHLETE_PRICING_RATES);

  useEffect(() => {
    if (!program) {
      router.replace("/commander/objectif");
      return;
    }
    if (!pack) {
      router.replace("/commander/pack");
      return;
    }

    const supabase = createClient();
    fetchAthletePricingRates(supabase).then(setRates);

    const mealIds = Object.keys(items);
    if (mealIds.length > 0) {
      supabase
        .from("meals")
        .select("*")
        .in("id", mealIds)
        .then(({ data }) => setMeals(data ?? []));
    }

    const extraIds = [
      ...Object.keys(extrasQty),
      ...(giftDetoxId ? [giftDetoxId] : []),
      ...(giftGourmandiseId ? [giftGourmandiseId] : []),
    ];
    if (extraIds.length > 0) {
      supabase
        .from("extras")
        .select("*")
        .in("id", extraIds)
        .then(({ data }) => setExtras(data ?? []));
    }
    // items/extrasQty/gift ids intentionally excluded: this only needs to
    // refetch when the id sets change, not on every quantity tweak.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, pack, router]);

  if (!program || !pack) return null;

  const complete = totalSelected === pack.plates;
  const isAthlete = program === "athlete";
  const extrasTotal = Object.entries(extrasQty).reduce((sum, [extraId, qty]) => {
    const extra = extras.find((e) => e.id === extraId);
    return sum + (extra ? extra.price * qty : 0);
  }, 0);
  const sauceTotal = mealSauceTotal(items, mealSauces, rates.saucePrice);
  const mealsTotal = isAthlete
    ? meals.reduce((sum, meal) => {
        const qty = items[meal.id] ?? 0;
        const custom = athleteCustomization[meal.id] ?? getDefaultAthleteCustomization(meal);
        return sum + computeAthleteMealUnitPrice(meal, custom, rates) * qty;
      }, 0) + sauceTotal
    : pack.price;
  const total = mealsTotal + extrasTotal + (isAthlete ? 0 : sauceTotal);

  const giftDetox = extras.find((e) => e.id === giftDetoxId);
  const giftGourmandise = extras.find((e) => e.id === giftGourmandiseId);
  const paidExtras = Object.entries(extrasQty)
    .map(([extraId, qty]) => ({ extra: extras.find((e) => e.id === extraId), qty }))
    .filter((e) => e.extra && e.qty > 0);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-brand-800">Votre panier</h1>
      <p className="mt-2 text-brand-600">
        {PROGRAMS[program].label.startsWith("Formule")
          ? PROGRAMS[program].label
          : `Formule ${PROGRAMS[program].label}`}{" "}
        — {pack.plates} plats
      </p>

      {!complete && (
        <p className="mt-4 rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-800">
          Il vous manque {pack.plates - totalSelected} plat(s) pour valider cette
          formule.{" "}
          <button
            onClick={() => router.push("/commander/repas")}
            className="underline"
          >
            Retourner au menu
          </button>
        </p>
      )}

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-brand-500">
        Repas
      </h2>
      <ul className="mt-2 divide-y divide-brand-200 rounded-2xl border border-brand-200 bg-white">
        {meals.map((meal) => {
          const qty = items[meal.id] ?? 0;
          if (qty === 0) return null;
          const custom = athleteCustomization[meal.id] ?? getDefaultAthleteCustomization(meal);
          const hasSauce = mealSauces[meal.id] ?? false;
          const unitPrice = isAthlete
            ? computeAthleteMealUnitPrice(meal, custom, rates) + (hasSauce ? rates.saucePrice : 0)
            : null;
          return (
            <li key={meal.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-semibold text-brand-800">{meal.name}</p>
                {unitPrice !== null && (
                  <p className="text-xs text-brand-500">{formatPrice(unitPrice * qty)}</p>
                )}
                {!isAthlete && hasSauce && meal.sauce_label && (
                  <p className="text-xs text-brand-500">Extra {meal.sauce_label}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(meal.id, qty - 1)}
                  className="h-8 w-8 rounded-full border border-brand-300 text-brand-700"
                >
                  −
                </button>
                <span className="w-4 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => setQuantity(meal.id, qty + 1)}
                  disabled={totalSelected >= pack.plates}
                  className="h-8 w-8 rounded-full bg-brand-700 text-white disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {isAthlete && (
        <button
          onClick={() => router.push("/commander/portions")}
          className="mt-2 text-sm font-semibold text-brand-700 underline"
        >
          Modifier les portions
        </button>
      )}

      {(paidExtras.length > 0 || giftDetox || giftGourmandise) && (
        <>
          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-brand-500">
            Extras
          </h2>
          <ul className="mt-2 divide-y divide-brand-200 rounded-2xl border border-brand-200 bg-white">
            {giftDetox && (
              <li className="flex items-center justify-between gap-4 p-4">
                <p className="font-semibold text-brand-800">1× {giftDetox.name}</p>
                <span className="text-sm font-semibold text-brand-500">Offert</span>
              </li>
            )}
            {giftGourmandise && (
              <li className="flex items-center justify-between gap-4 p-4">
                <p className="font-semibold text-brand-800">1× {giftGourmandise.name}</p>
                <span className="text-sm font-semibold text-brand-500">Offert</span>
              </li>
            )}
            {paidExtras.map(({ extra, qty }) => {
              if (!extra) return null;
              return (
                <li key={extra.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-semibold text-brand-800">
                      {qty}× {extra.name}
                    </p>
                    <p className="text-xs text-brand-500">
                      {formatPrice(extra.price * qty)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExtraQuantity(extra.id, qty - 1)}
                      className="h-8 w-8 rounded-full border border-brand-300 text-brand-700"
                    >
                      −
                    </button>
                    <span className="w-4 text-center font-semibold">{qty}</span>
                    <button
                      onClick={() => setExtraQuantity(extra.id, qty + 1)}
                      className="h-8 w-8 rounded-full bg-brand-700 text-white"
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-100 p-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-brand-700">
            <span>{isAthlete ? `Repas personnalisés (${pack.plates} plats)` : `Formule (${pack.plates} plats)`}</span>
            <span>{formatPrice(mealsTotal)}</span>
          </div>
          {!isAthlete && sauceTotal > 0 && (
            <div className="flex items-center justify-between text-brand-700">
              <span>Sauces supplémentaires</span>
              <span>{formatPrice(sauceTotal)}</span>
            </div>
          )}
          {extrasTotal > 0 && (
            <div className="flex items-center justify-between text-brand-700">
              <span>Extras</span>
              <span>{formatPrice(extrasTotal)}</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-brand-200 pt-3 text-lg font-bold text-brand-800">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        {pack.freeDelivery && (
          <p className="mt-3 text-sm text-brand-600">+ Livraison gratuite</p>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => router.push("/commander/livraison")}
          disabled={!complete}
          className="rounded-full bg-brand-700 px-8 py-3 font-semibold text-white shadow disabled:opacity-30"
        >
          Continuer vers la livraison
        </button>
      </div>
    </div>
  );
}
