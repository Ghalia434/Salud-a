"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import type { Database } from "@/lib/database.types";

type Extra = Database["public"]["Tables"]["extras"]["Row"];

export default function ExtrasPage() {
  const router = useRouter();
  const program = useCartStore((s) => s.program);
  const pack = useCartStore((s) => s.pack);
  const totalSelected = useCartStore((s) => s.totalSelected());
  const extrasQty = useCartStore((s) => s.extras);
  const addExtra = useCartStore((s) => s.addExtra);
  const removeExtra = useCartStore((s) => s.removeExtra);
  const giftDetoxId = useCartStore((s) => s.giftDetoxId);
  const giftGourmandiseId = useCartStore((s) => s.giftGourmandiseId);
  const setGiftDetoxId = useCartStore((s) => s.setGiftDetoxId);
  const setGiftGourmandiseId = useCartStore((s) => s.setGiftGourmandiseId);

  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!program || !pack) {
      router.replace("/commander/objectif");
      return;
    }
    if (totalSelected !== pack.plates) {
      router.replace("/commander/repas");
      return;
    }

    const supabase = createClient();
    supabase
      .from("extras")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true })
      .then(({ data }) => {
        setExtras(data ?? []);
        setLoading(false);
      });
  }, [program, pack, totalSelected, router]);

  const gourmandises = extras.filter((e) => e.category === "gourmandise");
  const detox = extras.filter((e) => e.category === "detox");

  // Default the free gift(s) to the first option once the lists load, so the
  // client always gets their gift even if they never interact with this step.
  useEffect(() => {
    if (!pack) return;
    if (pack.giftDetox && !giftDetoxId && detox.length > 0) {
      setGiftDetoxId(detox[0].id);
    }
    if (pack.giftGourmandise && !giftGourmandiseId && gourmandises.length > 0) {
      setGiftGourmandiseId(gourmandises[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack, detox.length, gourmandises.length]);

  if (!program || !pack) return null;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-brand-800">
        Gourmandises &amp; Boissons
      </h1>
      <p className="mt-2 text-brand-600">
        Ajoutez une gourmandise ou une boisson détox à votre commande. Cette étape est
        facultative.
      </p>

      {(pack.giftDetox || pack.giftGourmandise) && (
        <div className="mt-8 rounded-2xl border border-brand-gold/40 bg-brand-100 p-6">
          <p className="font-semibold text-brand-800">
            {pack.giftGourmandise
              ? "🎁 Cette formule comprend :"
              : "🎁 Cette formule comprend une boisson Détox offerte."}
          </p>
          {pack.giftGourmandise && (
            <ul className="mt-2 space-y-1 text-brand-700">
              <li>• 1 Détox offerte</li>
              <li>• 1 Gourmandise offerte</li>
            </ul>
          )}

          {pack.giftDetox && detox.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-brand-700">
                Choisissez votre détox offerte
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {detox.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setGiftDetoxId(d.id)}
                    className={
                      "rounded-full border px-4 py-2 text-sm font-semibold transition " +
                      (giftDetoxId === d.id
                        ? "border-brand-700 bg-brand-700 text-white"
                        : "border-brand-300 bg-white text-brand-700")
                    }
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {pack.giftGourmandise && gourmandises.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-brand-700">
                Choisissez votre gourmandise offerte
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {gourmandises.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGiftGourmandiseId(g.id)}
                    className={
                      "rounded-full border px-4 py-2 text-sm font-semibold transition " +
                      (giftGourmandiseId === g.id
                        ? "border-brand-700 bg-brand-700 text-white"
                        : "border-brand-300 bg-white text-brand-700")
                    }
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading && <p className="mt-8 text-brand-500">Chargement…</p>}

      {gourmandises.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-brand-800">Gourmandises</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {gourmandises.map((extra) => (
              <ExtraCard
                key={extra.id}
                extra={extra}
                quantity={extrasQty[extra.id] ?? 0}
                onAdd={() => addExtra(extra.id)}
                onRemove={() => removeExtra(extra.id)}
              />
            ))}
          </div>
        </div>
      )}

      {detox.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-brand-800">
            Boissons détox
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {detox.map((extra) => (
              <ExtraCard
                key={extra.id}
                extra={extra}
                quantity={extrasQty[extra.id] ?? 0}
                onAdd={() => addExtra(extra.id)}
                onRemove={() => removeExtra(extra.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="sticky bottom-0 mt-10 flex items-center justify-between border-t border-brand-200 bg-brand-cream/95 py-4 backdrop-blur">
        <button
          onClick={() => router.push("/commander/repas")}
          className="rounded-full border border-brand-300 px-6 py-3 font-semibold text-brand-700"
        >
          Retour aux repas
        </button>
        <button
          onClick={() => router.push("/commander/panier")}
          className="rounded-full bg-brand-700 px-8 py-3 font-semibold text-white shadow"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}

function ExtraCard({
  extra,
  quantity,
  onAdd,
  onRemove,
}: {
  extra: Extra;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-brand-200 bg-white p-4 shadow-sm">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-brand-100">
        {extra.photo_url && (
          <Image src={extra.photo_url} alt={extra.name} fill className="object-cover" />
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <h3 className="font-bold text-brand-800">{extra.name}</h3>
        <p className="mt-1 text-xs text-brand-600 line-clamp-2">
          {extra.description ?? extra.ingredients}
        </p>
        {extra.portion && <p className="mt-1 text-xs text-brand-500">{extra.portion}</p>}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-semibold text-brand-700">{formatPrice(extra.price)}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={onRemove}
              disabled={quantity === 0}
              className="h-8 w-8 rounded-full border border-brand-300 text-brand-700 disabled:opacity-30"
            >
              −
            </button>
            <span className="w-4 text-center font-semibold">{quantity}</span>
            <button
              onClick={onAdd}
              className="h-8 w-8 rounded-full bg-brand-700 text-white"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
