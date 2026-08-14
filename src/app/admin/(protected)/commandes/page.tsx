import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { ORDER_STATUS_LABELS, PROGRAMS } from "@/lib/constants";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/lib/database.types";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; from?: string; to?: string }>;
}) {
  const { q, status, from, to } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      `order_number.ilike.%${q}%,full_name.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }
  if (status) query = query.eq("status", status as OrderStatus);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", `${to}T23:59:59`);

  const { data: orders } = await query;

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-800">Commandes</h1>

      <form className="mt-6 grid gap-3 rounded-2xl border border-brand-200 bg-white p-4 sm:grid-cols-5">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="N° commande, nom, téléphone…"
          className="rounded-lg border border-brand-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-brand-300 px-3 py-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="from"
          defaultValue={from}
          className="rounded-lg border border-brand-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          name="to"
          defaultValue={to}
          className="rounded-lg border border-brand-300 px-3 py-2 text-sm"
        />
        <button className="col-span-full rounded-full bg-brand-700 px-6 py-2 text-sm font-semibold text-white sm:col-span-1">
          Filtrer
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {orders?.map((order) => (
          <li key={order.id}>
            <Link
              href={`/admin/commandes/${order.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-brand-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-bold text-brand-800">
                  {order.order_number} — {order.full_name}
                </p>
                <p className="text-sm text-brand-600">
                  {PROGRAMS[order.program].label} · {order.pack_plates} plats ·{" "}
                  {formatDateTime(order.created_at)}
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
        {orders?.length === 0 && (
          <p className="text-brand-500">Aucune commande ne correspond à ces filtres.</p>
        )}
      </ul>
    </div>
  );
}
