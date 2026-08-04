"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart-store";
import { PROGRAMS, CITY } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { Database } from "@/lib/database.types";

type Meal = Database["public"]["Tables"]["meals"]["Row"];

export default function ConfirmationPage() {
  const router = useRouter();
  const program = useCartStore((s) => s.program);
  const pack = useCartStore((s) => s.pack);
  const items = useCartStore((s) => s.items);
  const delivery = useCartStore((s) => s.delivery);
  const reset = useCartStore((s) => s.reset);

  const [meals, setMeals] = useState<Meal[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!program || !pack || !delivery) {
      router.replace("/commander/objectif");
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
    // items intentionally excluded: only needs to refetch when the id set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, pack, delivery, router]);

  async function confirmOrder() {
    if (!program || !pack || !delivery) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Votre session a expiré, merci de revérifier votre numéro.");
      setSubmitting(false);
      return;
    }

    await supabase
      .from("profiles")
      .update({
        full_name: delivery.fullName,
        phone: delivery.phone,
        address: delivery.address,
        quartier: delivery.quartier,
        city: CITY,
      })
      .eq("id", user.id);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        program,
        pack_plates: pack.plates,
        pack_price: pack.price,
        full_name: delivery.fullName,
        phone: delivery.phone,
        address: delivery.address,
        quartier: delivery.quartier,
        city: CITY,
        gift_detox: pack.giftDetox,
        gift_gourmandise: pack.giftGourmandise,
        free_delivery: pack.freeDelivery,
      })
      .select()
      .single();

    if (orderError || !order) {
      setError(orderError?.message ?? "Impossible de créer la commande.");
      setSubmitting(false);
      return;
    }

    const orderItems = Object.entries(items).map(([mealId, quantity]) => ({
      order_id: order.id,
      meal_id: mealId,
      quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      setError(itemsError.message);
      setSubmitting(false);
      return;
    }

    setOrderNumber(order.order_number);
    reset();
    setSubmitting(false);
  }

  if (orderNumber) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-bold text-brand-800">Commande confirmée !</h1>
        <p className="mt-4 text-brand-600">
          Votre numéro de commande est
        </p>
        <p className="mt-2 text-2xl font-bold text-brand-700">{orderNumber}</p>
        <p className="mt-4 text-sm text-brand-600">
          Paiement à la livraison. Vous serez livré dimanche à l&apos;adresse
          indiquée.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/compte"
            className="rounded-full bg-brand-700 px-6 py-3 font-semibold text-white"
          >
            Voir mes commandes
          </Link>
          <Link href="/" className="rounded-full border border-brand-300 px-6 py-3 font-semibold text-brand-700">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  if (!program || !pack || !delivery) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold text-brand-800">Récapitulatif</h1>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-6 rounded-2xl border border-brand-200 bg-white p-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Objectif
          </h2>
          <p className="text-brand-800">{PROGRAMS[program].label}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Repas ({pack.plates} plats)
          </h2>
          <ul className="mt-1 space-y-1">
            {meals.map((meal) => (
              <li key={meal.id} className="text-brand-800">
                {items[meal.id]}× {meal.name}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Livraison
          </h2>
          <p className="text-brand-800">{delivery.fullName}</p>
          <p className="text-brand-600">
            {delivery.address}, {delivery.quartier}, {CITY}
          </p>
          <p className="text-brand-600">{delivery.phone}</p>
        </div>

        <div className="flex items-center justify-between border-t border-brand-200 pt-4 text-lg font-bold text-brand-800">
          <span>Total</span>
          <span>{formatPrice(pack.price)}</span>
        </div>
        <p className="text-sm text-brand-600">Paiement à la livraison uniquement.</p>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={confirmOrder}
          disabled={submitting}
          className="rounded-full bg-brand-700 px-8 py-3 font-semibold text-white shadow disabled:opacity-40"
        >
          {submitting ? "Confirmation…" : "Confirmer la commande"}
        </button>
      </div>
    </div>
  );
}
