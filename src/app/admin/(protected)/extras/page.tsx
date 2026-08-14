import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import type { Database } from "@/lib/database.types";

type Extra = Database["public"]["Tables"]["extras"]["Row"];

function ExtraRow({ extra }: { extra: Extra }) {
  return (
    <li>
      <Link
        href={`/admin/extras/${extra.id}`}
        className="flex items-center gap-4 rounded-2xl border border-brand-200 bg-white p-4 shadow-sm transition hover:shadow-md"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-100">
          {extra.photo_url && (
            <Image src={extra.photo_url} alt="" fill className="object-cover" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-bold text-brand-800">{extra.name}</p>
          <p className="text-xs text-brand-600 line-clamp-1">
            {extra.description ?? extra.ingredients}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="font-semibold text-brand-700">
            {formatPrice(extra.price)}
          </span>
          {!extra.active && (
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-500">
              Masqué
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}

export default async function AdminExtrasPage() {
  const supabase = await createClient();
  const { data: extras } = await supabase
    .from("extras")
    .select("*")
    .order("name", { ascending: true });

  const gourmandises = (extras ?? []).filter((e) => e.category === "gourmandise");
  const detox = (extras ?? []).filter((e) => e.category === "detox");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-brand-800">Extras</h1>
        <Link
          href="/admin/extras/nouveau"
          className="rounded-full bg-brand-700 px-6 py-2 font-semibold text-white"
        >
          + Ajouter un produit
        </Link>
      </div>
      <p className="mt-2 text-sm text-brand-600">
        Gourmandises et boissons détox proposées à l&apos;étape optionnelle du parcours
        de commande.
      </p>

      <h2 className="mt-8 text-lg font-bold text-brand-800">Gourmandises</h2>
      <ul className="mt-3 space-y-3">
        {gourmandises.map((extra) => (
          <ExtraRow key={extra.id} extra={extra} />
        ))}
        {gourmandises.length === 0 && (
          <p className="text-brand-500">Aucune gourmandise pour le moment.</p>
        )}
      </ul>

      <h2 className="mt-8 text-lg font-bold text-brand-800">Boissons détox</h2>
      <ul className="mt-3 space-y-3">
        {detox.map((extra) => (
          <ExtraRow key={extra.id} extra={extra} />
        ))}
        {detox.length === 0 && (
          <p className="text-brand-500">Aucune boisson détox pour le moment.</p>
        )}
      </ul>
    </div>
  );
}
