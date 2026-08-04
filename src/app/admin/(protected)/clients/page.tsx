import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-800">Clients</h1>

      <ul className="mt-8 space-y-3">
        {clients?.map((client) => (
          <li key={client.id}>
            <Link
              href={`/admin/clients/${client.id}`}
              className="flex items-center justify-between rounded-2xl border border-brand-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div>
                <p className="font-bold text-brand-800">
                  {client.full_name || "Client sans nom"}
                </p>
                <p className="text-sm text-brand-600">
                  {client.phone} {client.quartier ? `· ${client.quartier}` : ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
        {clients?.length === 0 && (
          <p className="text-brand-500">Aucun client pour le moment.</p>
        )}
      </ul>
    </div>
  );
}
