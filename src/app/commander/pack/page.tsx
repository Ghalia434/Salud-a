"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCartStore, type CartPack } from "@/lib/cart-store";
import { PROGRAMS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

export default function PackPage() {
  const router = useRouter();
  const program = useCartStore((s) => s.program);
  const setPack = useCartStore((s) => s.setPack);
  const currentPack = useCartStore((s) => s.pack);

  const [packs, setPacks] = useState<CartPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!program) {
      router.replace("/commander/objectif");
      return;
    }

    const supabase = createClient();
    supabase
      .from("program_packs")
      .select("*")
      .eq("program", program)
      .order("plates", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else {
          setPacks(
            (data ?? []).map((row) => ({
              id: row.id,
              plates: row.plates,
              price: row.price,
              label: row.label,
              giftDetox: row.gift_detox,
              giftGourmandise: row.gift_gourmandise,
              freeDelivery: row.free_delivery,
            }))
          );
        }
        setLoading(false);
      });
  }, [program, router]);

  function choose(pack: CartPack) {
    setPack(pack);
    router.push("/commander/repas");
  }

  if (!program) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-800">
        {PROGRAMS[program].label.startsWith("Formule")
          ? PROGRAMS[program].label
          : `Formule ${PROGRAMS[program].label}`}
      </h1>
      <p className="mt-2 text-brand-600">
        Choisissez le nombre de plats pour votre semaine.
      </p>

      {loading && <p className="mt-8 text-brand-500">Chargement des formules…</p>}
      {error && (
        <p className="mt-8 text-red-600">
          Impossible de charger les formules : {error}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {packs.map((pack) => {
          const active = currentPack?.id === pack.id;
          const gifts = [
            pack.giftDetox && "Boisson détox offerte",
            pack.giftGourmandise && "Gourmandise offerte",
            pack.freeDelivery && "Livraison gratuite",
          ].filter(Boolean) as string[];

          return (
            <button
              key={pack.id}
              onClick={() => choose(pack)}
              className={
                "flex flex-col rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md " +
                (active ? "border-brand-700 bg-brand-100" : "border-brand-200 bg-white")
              }
            >
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-brand-800">
                  {pack.plates} plats
                </span>
                <span className="text-xl font-bold text-brand-700">
                  {formatPrice(pack.price)}
                </span>
              </div>
              {pack.label && (
                <span className="mt-1 text-sm font-semibold text-brand-gold">
                  {pack.label}
                </span>
              )}
              {gifts.length > 0 && (
                <ul className="mt-4 space-y-1 text-sm text-brand-600">
                  {gifts.map((g) => (
                    <li key={g}>+ {g}</li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
