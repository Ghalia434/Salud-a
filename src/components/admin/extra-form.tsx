"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { ExtraCategory } from "@/lib/database.types";

export function ExtraForm({ extraId }: { extraId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(Boolean(extraId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [portion, setPortion] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState<ExtraCategory>("gourmandise");
  const [active, setActive] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!extraId) return;
    const supabase = createClient();
    supabase
      .from("extras")
      .select("*")
      .eq("id", extraId)
      .single()
      .then(({ data }) => {
        if (data) {
          setName(data.name);
          setDescription(data.description ?? "");
          setIngredients(data.ingredients ?? "");
          setPortion(data.portion ?? "");
          setPrice(data.price);
          setCategory(data.category);
          setActive(data.active);
          setPhotoUrl(data.photo_url);
        }
        setLoading(false);
      });
  }, [extraId]);

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
      description: description || null,
      ingredients: ingredients || null,
      portion: portion || null,
      price,
      category,
      active,
      photo_url: photoUrl,
    };

    const { error } = extraId
      ? await supabase.from("extras").update(payload).eq("id", extraId)
      : await supabase.from("extras").insert(payload);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/admin/extras");
    router.refresh();
  }

  async function remove() {
    if (!extraId) return;
    if (!confirm("Supprimer ce produit ?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("extras").delete().eq("id", extraId);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/admin/extras");
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
        <span className="text-sm font-semibold text-brand-700">Catégorie</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ExtraCategory)}
          className="mt-1 w-full rounded-lg border border-brand-300 px-4 py-2"
        >
          <option value="gourmandise">Gourmandise</option>
          <option value="detox">Détox</option>
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-brand-700">Prix (DH)</span>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-brand-300 px-4 py-2"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-brand-700">
          Description <span className="font-normal text-brand-500">(optionnel)</span>
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-brand-300 px-4 py-2"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-brand-700">
          Ingrédients / composition
        </span>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Séparés par des virgules"
          className="mt-1 w-full rounded-lg border border-brand-300 px-4 py-2"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-brand-700">
          Portion <span className="font-normal text-brand-500">(optionnel)</span>
        </span>
        <input
          type="text"
          value={portion}
          onChange={(e) => setPortion(e.target.value)}
          placeholder="Ex: 5 boules (25 g chacune)"
          className="mt-1 w-full rounded-lg border border-brand-300 px-4 py-2"
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-semibold text-brand-700">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Visible dans l&apos;étape Gourmandises &amp; Boissons
      </label>

      <div className="flex items-center justify-between pt-4">
        {extraId ? (
          <button onClick={remove} className="text-sm font-semibold text-red-600">
            Supprimer ce produit
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
