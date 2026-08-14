import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { PROGRAMS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/format";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  const { phone } = await params;
  const decodedPhone = decodeURIComponent(phone);
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("phone", decodedPhone)
    .order("created_at", { ascending: false });

  if (!orders || orders.length === 0) notFound();

  const latest = orders[0];
  const totalSpent = orders.reduce((sum, o) => sum + o.pack_price + o.delivery_fee, 0);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-800">
        {latest.full_name || "Client sans nom"}
      </h1>

      <div className="mt-6 rounded-2xl border border-brand-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          Coordonnées
        </h2>
        <p className="text-brand-800">{latest.phone}</p>
        <p className="text-brand-600">
          {latest.address}, {latest.quartier}, {latest.city}
        </p>
        <p className="mt-2 text-xs text-brand-500">
          {orders.length} commande{orders.length > 1 ? "s" : ""} · {formatPrice(totalSpent)}{" "}
          au total
        </p>
      </div>

      <h2 className="mt-8 text-lg font-bold text-brand-800">Historique des commandes</h2>
      <ul className="mt-4 space-y-3">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/admin/commandes/${order.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-brand-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div>
                <p className="font-bold text-brand-800">{order.order_number}</p>
                <p className="text-sm text-brand-600">
                  {PROGRAMS[order.program].label} · {order.pack_plates} plats ·{" "}
                  {formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-brand-800">
                  {formatPrice(order.pack_price + order.delivery_fee)}
                </span>
                <StatusBadge status={order.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
