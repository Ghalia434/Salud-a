"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart-store";
import { PROGRAMS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { Database } from "@/lib/database.types";

type Meal = Database["public"]["Tables"]["meals"]["Row"];

export default function PanierPage() {
  const router = useRouter();
  const program = useCartStore((s) => s.program);
  const pack = useCartStore((s) => s.pack);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const totalSelected = useCartStore((s) => s.totalSelected());

  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(() => {
    if (!program) {
      router.replace("/commander/objectif");
      return;
    }
    if (!pack) {
      router.replace("/commander/pack");
      return;
    }

    const ids = Object.keys(items);
    if (ids.length === 0) return;

    const supabase = createClient();
    supabase
      .from("meals")
      .select("*")
      .in("id", ids)
      .then(({ data }) => setMeals(data ?? []));
    // items intentionally excluded: this only needs to refetch when the id set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, pack, router]);

  if (!program || !pack) return null;

  const complete = totalSelected === pack.plates;

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-800">Votre panier</h1>
      <p className="mt-2 text-brand-600">
        Formule {PROGRAMS[program].label} — {pack.plates} plats
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

      <ul className="mt-6 divide-y divide-brand-200 rounded-2xl border border-brand-200 bg-white">
        {meals.map((meal) => {
          const qty = items[meal.id] ?? 0;
          if (qty === 0) return null;
          return (
            <li key={meal.id} className="flex items-center justify-between gap-4 p-4">
              <p className="font-semibold text-brand-800">{meal.name}</p>
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

      <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-100 p-6">
        <div className="flex items-center justify-between text-lg font-bold text-brand-800">
          <span>Total ({pack.plates} plats)</span>
          <span>{formatPrice(pack.price)}</span>
        </div>
        {(pack.giftDetox || pack.giftGourmandise || pack.freeDelivery) && (
          <ul className="mt-3 space-y-1 text-sm text-brand-600">
            {pack.giftDetox && <li>+ Boisson détox offerte</li>}
            {pack.giftGourmandise && <li>+ Gourmandise offerte</li>}
            {pack.freeDelivery && <li>+ Livraison gratuite</li>}
          </ul>
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
