import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, PROGRAMS } from "@/lib/constants";
import { formatDateTime, formatPrice } from "@/lib/format";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("meal_id, quantity")
    .eq("order_id", order.id);

  const mealIds = (orderItems ?? []).map((item) => item.meal_id);
  const { data: meals } = mealIds.length
    ? await supabase.from("meals").select("id, name").in("id", mealIds)
    : { data: [] };

  const mealNameById = new Map((meals ?? []).map((m) => [m.id, m.name]));
  const currentStepIndex = ORDER_STATUS_FLOW.indexOf(order.status);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-800">{order.order_number}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-brand-600">
        Commandée le {formatDateTime(order.created_at)}
      </p>

      <ol className="mt-8 flex flex-wrap gap-x-2 gap-y-2 text-xs">
        {ORDER_STATUS_FLOW.map((status, i) => (
          <li
            key={status}
            className={
              "rounded-full px-3 py-1 font-semibold " +
              (i <= currentStepIndex
                ? ORDER_STATUS_LABELS[status].className
                : "bg-brand-100 text-brand-400")
            }
          >
            {ORDER_STATUS_LABELS[status].label}
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-brand-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          Objectif
        </h2>
        <p className="text-brand-800">{PROGRAMS[order.program].label}</p>

        <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-brand-500">
          Repas ({order.pack_plates} plats)
        </h2>
        <ul className="mt-1 space-y-1">
          {orderItems?.map((item) => (
            <li key={item.meal_id} className="text-brand-800">
              {item.quantity}× {mealNameById.get(item.meal_id) ?? "Repas"}
            </li>
          ))}
        </ul>

        <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-brand-500">
          Livraison
        </h2>
        <p className="text-brand-800">{order.full_name}</p>
        <p className="text-brand-600">
          {order.address}, {order.quartier}, {order.city}
        </p>
        <p className="text-brand-600">{order.phone}</p>

        <div className="mt-6 flex items-center justify-between border-t border-brand-200 pt-4 text-lg font-bold text-brand-800">
          <span>Total</span>
          <span>{formatPrice(order.pack_price)}</span>
        </div>
        <p className="text-sm text-brand-600">Paiement à la livraison.</p>
      </div>
    </div>
  );
}
