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
    .select("meal_id, quantity")
    .eq("order_id", order.id);

  const mealIds = (orderItems ?? []).map((i) => i.meal_id);
  const { data: meals } = mealIds.length
    ? await supabase.from("meals").select("id, name").in("id", mealIds)
    : { data: [] };
  const mealNameById = new Map((meals ?? []).map((m) => [m.id, m.name]));

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
          href={`/admin/clients/${order.user_id}`}
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
          {orderItems?.map((item) => (
            <li key={item.meal_id} className="text-brand-800">
              {item.quantity}× {mealNameById.get(item.meal_id) ?? "Repas supprimé"}
            </li>
          ))}
        </ul>

        {(order.gift_detox || order.gift_gourmandise || order.free_delivery) && (
          <ul className="mt-2 space-y-1 text-sm text-brand-600">
            {order.gift_detox && <li>+ Boisson détox offerte</li>}
            {order.gift_gourmandise && <li>+ Gourmandise offerte</li>}
            {order.free_delivery && <li>+ Livraison gratuite</li>}
          </ul>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-brand-200 pt-4 text-lg font-bold text-brand-800">
          <span>Total</span>
          <span>{formatPrice(order.pack_price)}</span>
        </div>
      </div>
    </div>
  );
}
