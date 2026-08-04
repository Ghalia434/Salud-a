import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export default async function AdminMealsPage() {
  const supabase = await createClient();
  const { data: meals } = await supabase
    .from("meals")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-brand-800">Repas</h1>
        <Link
          href="/admin/repas/nouveau"
          className="rounded-full bg-brand-700 px-6 py-2 font-semibold text-white"
        >
          + Ajouter un repas
        </Link>
      </div>
      <p className="mt-2 text-sm text-brand-600">
        Chaque plat est visible pour les 3 objectifs (Perte de poids, Équilibré, Prise
        de masse).
      </p>

      <ul className="mt-8 space-y-3">
        {meals?.map((meal) => (
          <li key={meal.id}>
            <Link
              href={`/admin/repas/${meal.id}`}
              className="flex items-center gap-4 rounded-2xl border border-brand-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-100">
                {meal.photo_url && (
                  <Image src={meal.photo_url} alt="" fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-brand-800">{meal.name}</p>
                <p className="text-xs text-brand-600 line-clamp-1">{meal.description}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {!meal.active && (
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-500">
                    Masqué
                  </span>
                )}
                {meal.active && !meal.available && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    Rupture de stock
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
