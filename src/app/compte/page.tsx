import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { PROGRAMS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/format";

export default async function ComptePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-800">Mes commandes</h1>

      {(!orders || orders.length === 0) && (
        <div className="mt-8 rounded-2xl border border-brand-200 bg-white p-8 text-center">
          <p className="text-brand-600">Vous n&apos;avez pas encore de commande.</p>
          <Link
            href="/commander/objectif"
            className="mt-4 inline-block rounded-full bg-brand-700 px-6 py-3 font-semibold text-white"
          >
            Commander maintenant
          </Link>
        </div>
      )}

      <ul className="mt-8 space-y-4">
        {orders?.map((order) => (
          <li key={order.id}>
            <Link
              href={`/compte/commandes/${order.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-brand-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
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
                  {formatPrice(order.pack_price)}
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
