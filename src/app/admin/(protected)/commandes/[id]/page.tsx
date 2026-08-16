import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { PROGRAMS } from "@/lib/constants";
import { formatDateTime, formatPrice } from "@/lib/format";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
  if (!order) notFound();

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("meal_id, quantity, protein_grams, starch_grams, veg_grams, sauce, unit_price")
    .eq("order_id", order.id);

  const mealIds = (orderItems ?? []).map((i) => i.meal_id);
  const { data: meals } = mealIds.length
    ? await supabase
        .from("meals")
        .select("id, name, protein_label, starch_label, veg_label, sauce_label")
        .in("id", mealIds)
    : { data: [] };
  const mealById = new Map((meals ?? []).map((m) => [m.id, m]));
  const mealNameById = new Map((meals ?? []).map((m) => [m.id, m.name]));

  const { data: orderExtras } = await supabase
    .from("order_extras")
    .select("extra_id, quantity, is_gift")
    .eq("order_id", order.id);

  const extraIds = (orderExtras ?? []).map((e) => e.extra_id);
  const { data: extras } = extraIds.length
    ? await supabase.from("extras").select("id, name, price").in("id", extraIds)
    : { data: [] };
  const extraById = new Map((extras ?? []).map((e) => [e.id, e]));

  const gifts = (orderExtras ?? []).filter((e) => e.is_gift);
  const paidExtras = (orderExtras ?? []).filter((e) => !e.is_gift);
  const extrasTotal = paidExtras.reduce((sum, e) => {
    const extra = extraById.get(e.extra_id);
    return sum + (extra ? extra.price * e.quantity : 0);
  }, 0);

  const isAthlete = order.program === "athlete";
  // For Athlete orders the sauce surcharge is already folded into
  // order.pack_price (the computed per-gram total); for every other
  // objective it's a separate add-on tracked per order_item.
  const sauceTotal = isAthlete
    ? 0
    : (orderItems ?? []).reduce(
        (sum, item) => sum + (item.sauce ? (item.unit_price ?? 0) * item.quantity : 0),
        0
      );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">{order.order_number}</h1>
          <p className="text-sm text-brand-600">
            Commandée le {formatDateTime(order.created_at)}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="mt-8 rounded-2xl border border-brand-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          Client
        </h2>
        <p className="text-brand-800">{order.full_name}</p>
        <p className="text-brand-600">{order.phone}</p>
        <Link
          href={`/admin/clients/${encodeURIComponent(order.phone)}`}
          className="text-sm font-semibold text-brand-700 underline"
        >
          Voir la fiche client
        </Link>

        <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-brand-500">
          Livraison
        </h2>
        <p className="text-brand-800">
          {order.address}, {order.quartier}, {order.city}
        </p>

        <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-brand-500">
          Objectif
        </h2>
        <p className="text-brand-800">{PROGRAMS[order.program].label}</p>

        <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-brand-500">
          Repas ({order.pack_plates} plats)
        </h2>
        <ul className="mt-1 space-y-1">
          {orderItems?.map((item) => {
            const meal = mealById.get(item.meal_id);
            const isCustomized =
              item.protein_grams !== null || item.starch_grams !== null || item.veg_grams !== null;
            const parts: string[] = [];
            if (meal?.protein_label && item.protein_grams) {
              parts.push(`${meal.protein_label} ${item.protein_grams}g`);
            }
            if (meal?.starch_label && item.starch_grams) {
              parts.push(`${meal.starch_label} ${item.starch_grams}g`);
            }
            if (meal?.veg_label && item.veg_grams) {
              parts.push(`${meal.veg_label} ${item.veg_grams}g`);
            }
            if (item.sauce && meal?.sauce_label) parts.push(`Extra ${meal.sauce_label}`);
            return (
              <li key={item.meal_id} className="text-brand-800">
                <div className="flex justify-between">
                  <span>
                    {item.quantity}× {mealNameById.get(item.meal_id) ?? "Repas supprimé"}
                  </span>
                  {(isCustomized || item.sauce) && item.unit_price !== null && (
                    <span>{formatPrice(item.unit_price * item.quantity)}</span>
                  )}
                </div>
                {parts.length > 0 && <p className="text-xs text-brand-500">{parts.join(" · ")}</p>}
              </li>
            );
          })}
        </ul>

        {(gifts.length > 0 || paidExtras.length > 0) && (
          <>
            <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-brand-500">
              Extras
            </h2>
            <ul className="mt-1 space-y-1">
              {gifts.map((g) => (
                <li key={g.extra_id} className="flex justify-between text-brand-800">
                  <span>
                    {g.quantity}× {extraById.get(g.extra_id)?.name ?? "Extra supprimé"}
                  </span>
                  <span className="text-brand-500">Offert</span>
                </li>
              ))}
              {paidExtras.map((e) => {
                const extra = extraById.get(e.extra_id);
                return (
                  <li key={e.extra_id} className="flex justify-between text-brand-800">
                    <span>
                      {e.quantity}× {extra?.name ?? "Extra supprimé"}
                    </span>
                    <span>{formatPrice((extra?.price ?? 0) * e.quantity)}</span>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {order.free_delivery && (
          <p className="mt-2 text-sm text-brand-600">+ Livraison gratuite</p>
        )}

        <div className="mt-6 space-y-1 border-t border-brand-200 pt-4">
          <div className="flex items-center justify-between text-brand-700">
            <span>{isAthlete ? "Repas personnalisés" : "Formule"}</span>
            <span>{formatPrice(order.pack_price)}</span>
          </div>
          {sauceTotal > 0 && (
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
            <span>Livraison ({order.city})</span>
            <span>{formatPrice(order.delivery_fee)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 text-lg font-bold text-brand-800">
            <span>Total</span>
            <span>
              {formatPrice(order.pack_price + sauceTotal + extrasTotal + order.delivery_fee)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
