"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useCartStore, type AthleteCustomization, type CartDelivery } from "@/lib/cart-store";
import { PROGRAMS, EXTRA_SAUCE_PRICE } from "@/lib/constants";
import {
  computeAthleteMealUnitPrice,
  getDefaultAthleteCustomization,
  mealSauceTotal,
} from "@/lib/athlete-pricing";
import { formatPrice } from "@/lib/format";
import type { Database, ProgramType } from "@/lib/database.types";

type Meal = Database["public"]["Tables"]["meals"]["Row"];
type Extra = Database["public"]["Tables"]["extras"]["Row"];

function formatCustomizationLabel(
  meal: Meal,
  custom: AthleteCustomization,
  hasSauce: boolean
): string {
  const parts: string[] = [];
  if (meal.protein_label && custom.proteinGrams) {
    parts.push(`${meal.protein_label} ${custom.proteinGrams}g`);
  }
  if (meal.starch_label && custom.starchGrams) {
    parts.push(`${meal.starch_label} ${custom.starchGrams}g`);
  }
  if (meal.veg_label) parts.push(`${meal.veg_label} ${custom.vegGrams}g`);
  if (meal.extra_label) parts.push(`${meal.extra_label} ${custom.extraGrams}g`);
  if (hasSauce && meal.sauce_label) parts.push(`Extra ${meal.sauce_label}`);
  return parts.join(" · ");
}

interface Receipt {
  orderNumber: string;
  createdAt: Date;
  program: ProgramType;
  packPlates: number;
  packPrice: number;
  deliveryFee: number;
  sauceTotal: number;
  items: { name: string; quantity: number; unitPrice?: number; customizationLabel?: string }[];
  paidExtras: { name: string; quantity: number; price: number }[];
  giftNames: string[];
  delivery: CartDelivery;
}

export default function ConfirmationPage() {
  const router = useRouter();
  const program = useCartStore((s) => s.program);
  const pack = useCartStore((s) => s.pack);
  const items = useCartStore((s) => s.items);
  const extrasQty = useCartStore((s) => s.extras);
  const giftDetoxId = useCartStore((s) => s.giftDetoxId);
  const giftGourmandiseId = useCartStore((s) => s.giftGourmandiseId);
  const delivery = useCartStore((s) => s.delivery);
  const athleteCustomization = useCartStore((s) => s.athleteCustomization);
  const mealSauces = useCartStore((s) => s.mealSauces);
  const reset = useCartStore((s) => s.reset);
  const isAthlete = program === "athlete";

  const [meals, setMeals] = useState<Meal[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    // Once an order is confirmed, the cart is reset (program/pack/delivery
    // become null) — that must not trigger the "no cart, go back" redirect.
    if (receipt) return;

    if (!program || !pack || !delivery) {
      router.replace("/commander/objectif");
      return;
    }

    const supabase = createClient();

    const ids = Object.keys(items);
    if (ids.length > 0) {
      supabase
        .from("meals")
        .select("*")
        .in("id", ids)
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
    // items/extrasQty/gift ids intentionally excluded: only needs to refetch
    // when the id sets change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, pack, delivery, router, receipt]);

  const extrasTotal = Object.entries(extrasQty).reduce((sum, [extraId, qty]) => {
    const extra = extras.find((e) => e.id === extraId);
    return sum + (extra ? extra.price * qty : 0);
  }, 0);

  const sauceTotal = mealSauceTotal(items, mealSauces);
  const mealsTotal = isAthlete
    ? meals.reduce((sum, meal) => {
        const qty = items[meal.id] ?? 0;
        const custom = athleteCustomization[meal.id] ?? getDefaultAthleteCustomization(meal);
        return sum + computeAthleteMealUnitPrice(meal, custom) * qty;
      }, 0) + sauceTotal
    : pack?.price ?? 0;

  async function confirmOrder() {
    if (!program || !pack || !delivery) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    const extrasPayload = [
      ...Object.entries(extrasQty).map(([extra_id, quantity]) => ({
        extra_id,
        quantity,
        is_gift: false,
      })),
      ...(giftDetoxId ? [{ extra_id: giftDetoxId, quantity: 1, is_gift: true }] : []),
      ...(giftGourmandiseId
        ? [{ extra_id: giftGourmandiseId, quantity: 1, is_gift: true }]
        : []),
    ];

    const { data, error: rpcError } = await supabase.rpc("create_order", {
      p_program: program,
      p_pack_plates: pack.plates,
      p_pack_price: isAthlete ? Math.round(mealsTotal) : pack.price,
      p_delivery_fee: delivery.deliveryFee,
      p_full_name: delivery.fullName,
      p_phone: delivery.phone,
      p_address: delivery.address,
      p_quartier: delivery.quartier,
      p_city: delivery.city,
      p_gift_detox: pack.giftDetox,
      p_gift_gourmandise: pack.giftGourmandise,
      p_free_delivery: pack.freeDelivery,
      p_items: Object.entries(items).map(([meal_id, quantity]) => {
        const hasSauce = mealSauces[meal_id] ?? false;
        if (!isAthlete) {
          return {
            meal_id,
            quantity,
            sauce: hasSauce,
            unit_price: hasSauce ? EXTRA_SAUCE_PRICE : undefined,
          };
        }
        const meal = meals.find((m) => m.id === meal_id);
        if (!meal) {
          return { meal_id, quantity, sauce: hasSauce, unit_price: undefined };
        }
        const custom = athleteCustomization[meal_id] ?? getDefaultAthleteCustomization(meal);
        return {
          meal_id,
          quantity,
          protein_grams: meal.protein_label ? (custom.proteinGrams ?? undefined) : undefined,
          starch_grams: meal.starch_label ? (custom.starchGrams ?? undefined) : undefined,
          veg_grams: custom.vegGrams,
          extra_grams: meal.extra_label ? custom.extraGrams : undefined,
          sauce: hasSauce,
          unit_price: computeAthleteMealUnitPrice(meal, custom) + (hasSauce ? EXTRA_SAUCE_PRICE : 0),
        };
      }),
      p_extras: extrasPayload,
    });

    const created = data?.[0];

    if (rpcError || !created) {
      setError(rpcError?.message ?? "Impossible de créer la commande.");
      setSubmitting(false);
      return;
    }

    const giftDetox = extras.find((e) => e.id === giftDetoxId);
    const giftGourmandise = extras.find((e) => e.id === giftGourmandiseId);

    // Snapshot everything needed for the receipt before reset() clears the cart.
    setReceipt({
      orderNumber: created.order_number,
      createdAt: new Date(),
      program,
      packPlates: pack.plates,
      packPrice: isAthlete ? Math.round(mealsTotal) : pack.price,
      deliveryFee: delivery.deliveryFee,
      sauceTotal: isAthlete ? 0 : sauceTotal,
      items: Object.entries(items).map(([mealId, quantity]) => {
        const meal = meals.find((m) => m.id === mealId);
        const hasSauce = mealSauces[mealId] ?? false;
        if (!isAthlete || !meal) {
          return {
            name: meal?.name ?? "Repas",
            quantity,
            customizationLabel:
              hasSauce && meal?.sauce_label ? `Extra ${meal.sauce_label}` : undefined,
          };
        }
        const custom = athleteCustomization[mealId] ?? getDefaultAthleteCustomization(meal);
        return {
          name: meal.name,
          quantity,
          unitPrice: computeAthleteMealUnitPrice(meal, custom) + (hasSauce ? EXTRA_SAUCE_PRICE : 0),
          customizationLabel: formatCustomizationLabel(meal, custom, hasSauce),
        };
      }),
      paidExtras: Object.entries(extrasQty).map(([extraId, quantity]) => {
        const extra = extras.find((e) => e.id === extraId);
        return {
          name: extra?.name ?? "Extra",
          quantity,
          price: (extra?.price ?? 0) * quantity,
        };
      }),
      giftNames: [giftDetox?.name, giftGourmandise?.name].filter(
        (n): n is string => Boolean(n)
      ),
      delivery,
    });
    reset();
    setSubmitting(false);
  }

  if (receipt) {
    return (
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-brand-800">
            Commande confirmée !
          </h1>
          <p className="mt-2 text-sm text-brand-600">
            Notre équipe vous contactera par WhatsApp pour confirmer et suivre votre
            commande.
          </p>
        </div>

        <div
          id="receipt"
          className="mt-8 rounded-2xl border border-brand-200 bg-white p-6 print:border-none print:shadow-none"
        >
          <div className="flex items-center justify-between border-b border-dashed border-brand-200 pb-4">
            <div>
              <p className="font-display text-lg font-bold text-brand-800">Saludèa</p>
              <p className="text-xs text-brand-500">Reçu de commande</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-brand-800">{receipt.orderNumber}</p>
              <p className="text-xs text-brand-500">
                {receipt.createdAt.toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}{" "}
                à{" "}
                {receipt.createdAt.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-500">
              Objectif
            </h2>
            <p className="text-brand-800">{PROGRAMS[receipt.program].label}</p>
          </div>

          <div className="mt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-500">
              Repas ({receipt.packPlates} plats)
            </h2>
            <ul className="mt-1 space-y-1">
              {receipt.items.map((item, i) => (
                <li key={i} className="text-brand-800">
                  <div className="flex justify-between">
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    {item.unitPrice !== undefined && (
                      <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                    )}
                  </div>
                  {item.customizationLabel && (
                    <p className="text-xs text-brand-500">{item.customizationLabel}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {(receipt.paidExtras.length > 0 || receipt.giftNames.length > 0) && (
            <div className="mt-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                Extras
              </h2>
              <ul className="mt-1 space-y-1">
                {receipt.giftNames.map((name, i) => (
                  <li key={i} className="flex justify-between text-brand-800">
                    <span>1× {name}</span>
                    <span className="text-brand-500">Offert</span>
                  </li>
                ))}
                {receipt.paidExtras.map((item, i) => (
                  <li key={i} className="flex justify-between text-brand-800">
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span>{formatPrice(item.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-500">
              Livraison
            </h2>
            <p className="text-brand-800">{receipt.delivery.fullName}</p>
            <p className="text-brand-600">
              {receipt.delivery.address}, {receipt.delivery.quartier},{" "}
              {receipt.delivery.city}
            </p>
            <p className="text-brand-600">{receipt.delivery.phone}</p>
            <p className="mt-1 text-xs text-brand-500">
              Livraison le lundi ou le jeudi suivant.
            </p>
          </div>

          <div className="mt-4 space-y-1 border-t border-dashed border-brand-200 pt-4">
            <div className="flex items-center justify-between text-brand-700">
              <span>{receipt.program === "athlete" ? "Repas personnalisés" : "Formule"}</span>
              <span>{formatPrice(receipt.packPrice)}</span>
            </div>
            {receipt.sauceTotal > 0 && (
              <div className="flex items-center justify-between text-brand-700">
                <span>Sauces supplémentaires</span>
                <span>{formatPrice(receipt.sauceTotal)}</span>
              </div>
            )}
            {receipt.paidExtras.length > 0 && (
              <div className="flex items-center justify-between text-brand-700">
                <span>Extras</span>
                <span>
                  {formatPrice(
                    receipt.paidExtras.reduce((sum, e) => sum + e.price, 0)
                  )}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-brand-700">
              <span>Livraison</span>
              <span>{formatPrice(receipt.deliveryFee)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-lg font-bold text-brand-800">
              <span>Total</span>
              <span>
                {formatPrice(
                  receipt.packPrice +
                    receipt.sauceTotal +
                    receipt.paidExtras.reduce((sum, e) => sum + e.price, 0) +
                    receipt.deliveryFee
                )}
              </span>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-brand-500">
            Paiement à la livraison uniquement.
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-4 print:hidden">
          <Link
            href="/"
            className="rounded-full bg-brand-700 px-6 py-3 font-semibold text-white"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  if (!program || !pack || !delivery) return null;

  const giftDetox = extras.find((e) => e.id === giftDetoxId);
  const giftGourmandise = extras.find((e) => e.id === giftGourmandiseId);
  const paidExtras = Object.entries(extrasQty)
    .map(([extraId, qty]) => ({ extra: extras.find((e) => e.id === extraId), qty }))
    .filter((e) => e.extra && e.qty > 0);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-brand-800">Récapitulatif</h1>

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
            {meals.map((meal) => {
              const custom = athleteCustomization[meal.id] ?? getDefaultAthleteCustomization(meal);
              const hasSauce = mealSauces[meal.id] ?? false;
              const qty = items[meal.id] ?? 0;
              return (
                <li key={meal.id} className="text-brand-800">
                  <div className="flex justify-between">
                    <span>
                      {qty}× {meal.name}
                    </span>
                    {isAthlete && (
                      <span>
                        {formatPrice(
                          (computeAthleteMealUnitPrice(meal, custom) +
                            (hasSauce ? EXTRA_SAUCE_PRICE : 0)) *
                            qty
                        )}
                      </span>
                    )}
                  </div>
                  {isAthlete && (
                    <p className="text-xs text-brand-500">
                      {formatCustomizationLabel(meal, custom, hasSauce)}
                    </p>
                  )}
                  {!isAthlete && hasSauce && meal.sauce_label && (
                    <p className="text-xs text-brand-500">Extra {meal.sauce_label}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {(paidExtras.length > 0 || giftDetox || giftGourmandise) && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              Extras
            </h2>
            <ul className="mt-1 space-y-1">
              {giftDetox && (
                <li className="flex justify-between text-brand-800">
                  <span>1× {giftDetox.name}</span>
                  <span className="text-brand-500">Offert</span>
                </li>
              )}
              {giftGourmandise && (
                <li className="flex justify-between text-brand-800">
                  <span>1× {giftGourmandise.name}</span>
                  <span className="text-brand-500">Offert</span>
                </li>
              )}
              {paidExtras.map(({ extra, qty }) => {
                if (!extra) return null;
                return (
                  <li key={extra.id} className="flex justify-between text-brand-800">
                    <span>
                      {qty}× {extra.name}
                    </span>
                    <span>{formatPrice(extra.price * qty)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Livraison
          </h2>
          <p className="text-brand-800">{delivery.fullName}</p>
          <p className="text-brand-600">
            {delivery.address}, {delivery.quartier}, {delivery.city}
          </p>
          <p className="text-brand-600">{delivery.phone}</p>
        </div>

        <div className="space-y-1 border-t border-brand-200 pt-4">
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
          <div className="flex items-center justify-between text-brand-700">
            <span>Livraison ({delivery.city})</span>
            <span>{formatPrice(delivery.deliveryFee)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 text-lg font-bold text-brand-800">
            <span>Total</span>
            <span>
              {formatPrice(
                mealsTotal + (isAthlete ? 0 : sauceTotal) + extrasTotal + delivery.deliveryFee
              )}
            </span>
          </div>
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
