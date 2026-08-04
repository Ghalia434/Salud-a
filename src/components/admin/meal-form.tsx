"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { ProgramType } from "@/lib/database.types";

// Every meal is shown for all 3 objectifs; the DB column is kept (not null)
// but no longer surfaced in the admin UI — this default is what gets saved.
const DEFAULT_PROGRAM: ProgramType = "equilibre";

export function MealForm({ mealId }: { mealId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(Boolean(mealId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState(0);
  const [proteinG, setProteinG] = useState(0);
  const [program, setProgram] = useState<ProgramType>(DEFAULT_PROGRAM);
  const [active, setActive] = useState(true);
  const [available, setAvailable] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!mealId) return;
    const supabase = createClient();
    supabase
      .from("meals")
      .select("*")
      .eq("id", mealId)
      .single()
      .then(({ data }) => {
        if (data) {
          setName(data.name);
          setDescription(data.description ?? "");
          setCalories(data.calories);
          setProteinG(data.protein_g);
          setProgram(data.program);
          setActive(data.active);
          setAvailable(data.available);
          setPhotoUrl(data.photo_url);
        }
        setLoading(false);
      });
  }, [mealId]);

  async function uploadPhoto(file: File) {
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("meal-photos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("meal-photos").getPublicUrl(path);
    setPhotoUrl(publicUrl);
    setUploading(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const payload = {
      name,
      description,
      calories,
      protein_g: proteinG,
      program,
      active,
      available,
      photo_url: photoUrl,
    };

    const { error } = mealId
      ? await supabase.from("meals").update(payload).eq("id", mealId)
      : await supabase.from("meals").insert(payload);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/admin/repas");
    router.refresh();
  }

  async function remove() {
    if (!mealId) return;
    if (!confirm("Supprimer ce repas ?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("meals").delete().eq("id", mealId);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/admin/repas");
    router.refresh();
  }

  if (loading) return <p className="text-brand-500">Chargement…</p>;

  return (
    <div className="max-w-xl space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-100">
          {photoUrl && <Image src={photoUrl} alt="" fill className="object-cover" />}
        </div>
        <label className="text-sm font-semibold text-brand-700">
          <span className="cursor-pointer rounded-full border border-brand-300 px-4 py-2 hover:bg-brand-100">
            {uploading ? "Envoi…" : "Changer la photo"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadPhoto(file);
            }}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-brand-700">Nom</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-brand-300 px-4 py-2"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-brand-700">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-brand-300 px-4 py-2"
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-semibold text-brand-700">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Visible dans le menu
      </label>
      <p className="-mt-3 pl-6 text-xs text-brand-500">
        Décoché : le plat disparaît complètement du menu client.
      </p>

      <label className="flex items-center gap-2 text-sm font-semibold text-brand-700">
        <input
          type="checkbox"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
        />
        Disponible actuellement
      </label>
      <p className="-mt-3 pl-6 text-xs text-brand-500">
        Décoché : le plat reste visible dans le menu mais marqué &quot;Rupture de
        stock&quot; et ne peut plus être ajouté au panier.
      </p>

      <div className="flex items-center justify-between pt-4">
        {mealId ? (
          <button onClick={remove} className="text-sm font-semibold text-red-600">
            Supprimer ce repas
          </button>
        ) : (
          <span />
        )}
        <button
          onClick={save}
          disabled={saving || !name}
          className="rounded-full bg-brand-700 px-6 py-3 font-semibold text-white disabled:opacity-40"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
