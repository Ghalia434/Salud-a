"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CITY } from "@/lib/constants";

export default function ProfilPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [quartier, setQuartier] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, address, quartier")
        .eq("id", user.id)
        .single();
      if (profile) {
        setFullName(profile.full_name ?? "");
        setPhone(profile.phone ?? "");
        setAddress(profile.address ?? "");
        setQuartier(profile.quartier ?? "");
      }
      setLoading(false);
    });
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ full_name: fullName, address, quartier, city: CITY })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
  }

  if (loading) return <p className="text-brand-500">Chargement…</p>;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold text-brand-800">Mon profil</h1>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-brand-700">Nom complet</span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-300 px-4 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-brand-700">
            Numéro de téléphone
          </span>
          <input
            type="tel"
            value={phone}
            disabled
            className="mt-1 w-full rounded-lg border border-brand-200 bg-brand-100 px-4 py-2 text-brand-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-brand-700">Adresse</span>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-300 px-4 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-brand-700">Quartier</span>
          <input
            type="text"
            value={quartier}
            onChange={(e) => setQuartier(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-300 px-4 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-brand-700">Ville</span>
          <input
            type="text"
            value={CITY}
            disabled
            className="mt-1 w-full rounded-lg border border-brand-200 bg-brand-100 px-4 py-2 text-brand-500"
          />
        </label>

        {saved && <p className="text-sm text-brand-600">Profil mis à jour.</p>}

        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-full bg-brand-700 py-3 font-semibold text-white disabled:opacity-40"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
