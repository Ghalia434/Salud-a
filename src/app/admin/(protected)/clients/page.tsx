import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/format";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("full_name, phone, quartier, city, pack_price, delivery_fee, created_at")
    .order("created_at", { ascending: false });

  const clientsByPhone = new Map<
    string,
    {
      fullName: string;
      phone: string;
      quartier: string;
      city: string;
      orderCount: number;
      totalSpent: number;
      lastOrderAt: string;
    }
  >();

  for (const order of orders ?? []) {
    const existing = clientsByPhone.get(order.phone);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += order.pack_price + order.delivery_fee;
    } else {
      clientsByPhone.set(order.phone, {
        fullName: order.full_name,
        phone: order.phone,
        quartier: order.quartier,
        city: order.city,
        orderCount: 1,
        totalSpent: order.pack_price + order.delivery_fee,
        lastOrderAt: order.created_at,
      });
    }
  }

  const clients = [...clientsByPhone.values()];

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-800">Clients</h1>
      <p className="mt-2 text-sm text-brand-600">
        Un client sans compte — regroupé par numéro de téléphone à partir de ses
        commandes.
      </p>

      <ul className="mt-8 space-y-3">
        {clients.map((client) => (
          <li key={client.phone}>
            <Link
              href={`/admin/clients/${encodeURIComponent(client.phone)}`}
              className="flex items-center justify-between rounded-2xl border border-brand-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div>
                <p className="font-bold text-brand-800">
                  {client.fullName || "Client sans nom"}
                </p>
                <p className="text-sm text-brand-600">
                  {client.phone} {client.quartier ? `· ${client.quartier}` : ""} ·{" "}
                  {client.city}
                </p>
                <p className="text-xs text-brand-500">
                  Dernière commande le {formatDate(client.lastOrderAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-brand-800">
                  {formatPrice(client.totalSpent)}
                </p>
                <p className="text-xs text-brand-500">
                  {client.orderCount} commande{client.orderCount > 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
        {clients.length === 0 && (
          <p className="text-brand-500">Aucun client pour le moment.</p>
        )}
      </ul>
    </div>
  );
}
