import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/lib/database.types";

async function countOrders(
  supabase: Awaited<ReturnType<typeof createClient>>,
  status?: OrderStatus
) {
  let query = supabase.from("orders").select("*", { count: "exact", head: true });
  if (status) query = query.eq("status", status);
  const { count } = await query;
  return count ?? 0;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [totalOrders, clientPhones, enAttente, enPreparation, livree, allOrders] =
    await Promise.all([
      countOrders(supabase),
      supabase.from("orders").select("phone"),
      countOrders(supabase, "en_attente"),
      countOrders(supabase, "en_preparation"),
      countOrders(supabase, "livree"),
      supabase.from("orders").select("pack_price, delivery_fee"),
    ]);

  const totalClients = new Set((clientPhones.data ?? []).map((o) => o.phone)).size;

  const orderRevenue = (allOrders.data ?? []).reduce(
    (sum, o) => sum + o.pack_price + o.delivery_fee,
    0
  );

  const { data: paidOrderExtras } = await supabase
    .from("order_extras")
    .select("extra_id, quantity")
    .eq("is_gift", false);

  const extraIds = [...new Set((paidOrderExtras ?? []).map((e) => e.extra_id))];
  const { data: extraPrices } = extraIds.length
    ? await supabase.from("extras").select("id, price").in("id", extraIds)
    : { data: [] };
  const priceByExtraId = new Map((extraPrices ?? []).map((e) => [e.id, e.price]));

  const extrasRevenue = (paidOrderExtras ?? []).reduce(
    (sum, e) => sum + (priceByExtraId.get(e.extra_id) ?? 0) * e.quantity,
    0
  );

  const revenue = orderRevenue + extrasRevenue;

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("meal_id, quantity");

  const quantityByMeal = new Map<string, number>();
  for (const item of orderItems ?? []) {
    quantityByMeal.set(item.meal_id, (quantityByMeal.get(item.meal_id) ?? 0) + item.quantity);
  }

  const topMealIds = [...quantityByMeal.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const { data: meals } = topMealIds.length
    ? await supabase
        .from("meals")
        .select("id, name")
        .in("id", topMealIds.map(([id]) => id))
    : { data: [] };
  const mealNameById = new Map((meals ?? []).map((m) => [m.id, m.name]));

  const stats = [
    { label: "Commandes totales", value: totalOrders },
    { label: "Clients", value: totalClients },
    { label: "En attente", value: enAttente },
    { label: "En préparation", value: enPreparation },
    { label: "Livrées", value: livree },
    { label: "Chiffre d'affaires", value: formatPrice(revenue) },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-800">Tableau de bord</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-semibold text-brand-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-brand-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-brand-200 bg-white p-6">
        <h2 className="text-lg font-bold text-brand-800">Repas les plus commandés</h2>
        {topMealIds.length === 0 ? (
          <p className="mt-4 text-sm text-brand-500">
            Aucune commande pour le moment.
          </p>
        ) : (
          <ol className="mt-4 space-y-2">
            {topMealIds.map(([mealId, qty]) => (
              <li
                key={mealId}
                className="flex items-center justify-between text-brand-700"
              >
                <span>{mealNameById.get(mealId) ?? "Repas supprimé"}</span>
                <span className="font-semibold">{qty} commandé(s)</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
