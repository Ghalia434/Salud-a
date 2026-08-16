"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart-store";
import { EXTRA_SAUCE_PRICE } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { Database } from "@/lib/database.types";

type Meal = Database["public"]["Tables"]["meals"]["Row"];

export default function RepasPage() {
  const router = useRouter();
  const program = useCartStore((s) => s.program);
  const pack = useCartStore((s) => s.pack);
  const items = useCartStore((s) => s.items);
  const addMeal = useCartStore((s) => s.addMeal);
  const removeMeal = useCartStore((s) => s.removeMeal);
  const totalSelected = useCartStore((s) => s.totalSelected());
  const mealSauces = useCartStore((s) => s.mealSauces);
  const setMealSauce = useCartStore((s) => s.setMealSauce);

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

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
    supabase
      .from("meals")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true })
      .then(({ data }) => {
        const sorted = (data ?? []).sort((a, b) => {
          if (a.available !== b.available) return a.available ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        setMeals(sorted);
        setLoading(false);
      });
  }, [program, pack, router]);

  if (!program || !pack) return null;

  const remaining = pack.plates - totalSelected;
  const complete = remaining === 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-800">Choisissez vos repas</h1>
          <p className="mt-2 text-brand-600">
            Sélectionnez {pack.plates} plats parmi le menu.
          </p>
        </div>
        <div
          className={
            "rounded-full px-5 py-2 text-sm font-semibold " +
            (complete ? "bg-brand-700 text-white" : "bg-brand-100 text-brand-700")
          }
        >
          {totalSelected} / {pack.plates} sélectionnés
        </div>
      </div>

      {loading && <p className="mt-8 text-brand-500">Chargement du menu…</p>}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {meals.map((meal) => {
          const qty = items[meal.id] ?? 0;
          return (
            <div
              key={meal.id}
              className={
                "flex gap-4 rounded-2xl border border-brand-200 bg-white p-4 shadow-sm" +
                (meal.available ? "" : " opacity-60")
              }
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-brand-100">
                {meal.photo_url && (
                  <Image
                    src={meal.photo_url}
                    alt={meal.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-brand-800">{meal.name}</h3>
                  {!meal.available && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      Rupture de stock
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-brand-600 line-clamp-2">
                  {meal.description}
                </p>
                <div className="mt-auto flex items-center gap-3 pt-2">
                  <button
                    onClick={() => removeMeal(meal.id)}
                    disabled={qty === 0}
                    className="h-8 w-8 rounded-full border border-brand-300 text-brand-700 disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-4 text-center font-semibold">{qty}</span>
                  <button
                    onClick={() => addMeal(meal.id)}
                    disabled={remaining === 0 || !meal.available}
                    className="h-8 w-8 rounded-full bg-brand-700 text-white disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
                {program !== "athlete" && qty > 0 && meal.sauce_label && (
                  <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-brand-700">
                    <input
                      type="checkbox"
                      checked={mealSauces[meal.id] ?? false}
                      onChange={(e) => setMealSauce(meal.id, e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-brand-300"
                    />
                    Extra {meal.sauce_label} (+{formatPrice(EXTRA_SAUCE_PRICE)})
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 mt-10 flex items-center justify-between border-t border-brand-200 bg-brand-cream/95 py-4 backdrop-blur">
        <span className="text-sm text-brand-600">
          {complete
            ? "Sélection complète !"
            : `Encore ${remaining} plat${remaining > 1 ? "s" : ""} à choisir`}
        </span>
        <button
          onClick={() =>
            router.push(program === "athlete" ? "/commander/portions" : "/commander/extras")
          }
          disabled={!complete}
          className="rounded-full bg-brand-700 px-8 py-3 font-semibold text-white shadow disabled:opacity-30"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
