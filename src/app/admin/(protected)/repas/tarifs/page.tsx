"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PROGRAMS, PROGRAM_ORDER } from "@/lib/constants";
import { DEFAULT_ATHLETE_PRICING_RATES } from "@/lib/athlete-pricing";
import type { Database, ProgramType } from "@/lib/database.types";

type ProgramPack = Database["public"]["Tables"]["program_packs"]["Row"];

// Formule Athlète doesn't use pack prices (its total is computed per gram),
// so only the 4 classic formulas get a pack-price editor.
const CLASSIC_PROGRAMS = PROGRAM_ORDER.filter((p) => p !== "athlete");
const PLATE_TIERS = [3, 6, 9];

export default function AdminTarifsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [packs, setPacks] = useState<ProgramPack[]>([]);
  const [packPrices, setPackPrices] = useState<Record<string, string>>({});

  const [proteinPrice, setProteinPrice] = useState("");
  const [starchPrice, setStarchPrice] = useState("");
  const [vegPrice, setVegPrice] = useState("");
  const [saucePrice, setSaucePrice] = useState("");

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("program_packs").select("*").neq("program", "athlete"),
      supabase.from("athlete_pricing_settings").select("*").single(),
    ]).then(([{ data: packsData }, { data: settings }]) => {
      const list = packsData ?? [];
      setPacks(list);
      setPackPrices(Object.fromEntries(list.map((p) => [p.id, String(p.price)])));
      if (settings) {
        setProteinPrice(String(settings.protein_price_per_10g));
        setStarchPrice(String(settings.starch_price_per_10g));
        setVegPrice(String(settings.veg_price_per_10g));
        setSaucePrice(String(settings.sauce_price));
      } else {
        setProteinPrice(String(DEFAULT_ATHLETE_PRICING_RATES.proteinRatePerGram * 10));
        setStarchPrice(String(DEFAULT_ATHLETE_PRICING_RATES.starchRatePerGram * 10));
        setVegPrice(String(DEFAULT_ATHLETE_PRICING_RATES.vegRatePerGram * 10));
        setSaucePrice(String(DEFAULT_ATHLETE_PRICING_RATES.saucePrice));
      }
      setLoading(false);
    });
  }, []);

  function packFor(program: ProgramType, plates: number) {
    return packs.find((p) => p.program === program && p.plates === plates);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const supabase = createClient();

    const packUpdates = packs.map((pack) =>
      supabase
        .from("program_packs")
        .update({ price: Number(packPrices[pack.id] ?? pack.price) })
        .eq("id", pack.id)
    );

    const settingsUpdate = supabase
      .from("athlete_pricing_settings")
      .update({
        protein_price_per_10g: Number(proteinPrice),
        starch_price_per_10g: Number(starchPrice),
        veg_price_per_10g: Number(vegPrice),
        sauce_price: Number(saucePrice),
      })
      .eq("id", true);

    const results = await Promise.all([...packUpdates, settingsUpdate]);
    const firstError = results.find((r) => r.error)?.error;

    setSaving(false);
    if (firstError) {
      setError(firstError.message);
      return;
    }
    setSaved(true);
  }

  if (loading) return <p className="text-brand-500">Chargement…</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-brand-800">Tarifs</h1>
        <Link href="/admin/repas" className="text-sm font-semibold text-brand-700 underline">
          ← Retour aux repas
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {saved && !error && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Tarifs enregistrés.
        </p>
      )}

      <div className="mt-8 space-y-6">
        {CLASSIC_PROGRAMS.map((program) => (
          <div
            key={program}
            className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-bold text-brand-800">{PROGRAMS[program].label}</h2>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {PLATE_TIERS.map((plates) => {
                const pack = packFor(program, plates);
                if (!pack) return null;
                return (
                  <label key={plates} className="block">
                    <span className="text-sm font-semibold text-brand-700">{plates} plats</span>
                    <div className="mt-1 flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        value={packPrices[pack.id] ?? ""}
                        onChange={(e) =>
                          setPackPrices((prev) => ({ ...prev, [pack.id]: e.target.value }))
                        }
                        className="w-full rounded-lg border border-brand-300 px-3 py-2"
                      />
                      <span className="text-sm text-brand-500">DH</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-brand-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-brand-800">Formule Athlète — prix de base pour 10g</h2>
        <p className="mt-1 text-xs text-brand-500">
          Le client ajuste chaque ingrédient par pas de 10g — ces prix s&apos;appliquent à
          chaque plat, pour tous les ingrédients protéine/féculent/légumes.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <label className="block">
            <span className="text-sm font-semibold text-brand-700">Protéine (10g)</span>
            <div className="mt-1 flex items-center gap-1">
              <input
                type="number"
                min={0}
                step={0.1}
                value={proteinPrice}
                onChange={(e) => setProteinPrice(e.target.value)}
                className="w-full rounded-lg border border-brand-300 px-3 py-2"
              />
              <span className="text-sm text-brand-500">DH</span>
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-brand-700">Féculent (10g)</span>
            <div className="mt-1 flex items-center gap-1">
              <input
                type="number"
                min={0}
                step={0.1}
                value={starchPrice}
                onChange={(e) => setStarchPrice(e.target.value)}
                className="w-full rounded-lg border border-brand-300 px-3 py-2"
              />
              <span className="text-sm text-brand-500">DH</span>
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-brand-700">Légumes (10g)</span>
            <div className="mt-1 flex items-center gap-1">
              <input
                type="number"
                min={0}
                step={0.1}
                value={vegPrice}
                onChange={(e) => setVegPrice(e.target.value)}
                className="w-full rounded-lg border border-brand-300 px-3 py-2"
              />
              <span className="text-sm text-brand-500">DH</span>
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-brand-700">Extra sauce</span>
            <div className="mt-1 flex items-center gap-1">
              <input
                type="number"
                min={0}
                step={0.5}
                value={saucePrice}
                onChange={(e) => setSaucePrice(e.target.value)}
                className="w-full rounded-lg border border-brand-300 px-3 py-2"
              />
              <span className="text-sm text-brand-500">DH</span>
            </div>
          </label>
        </div>
        <p className="mt-3 text-xs text-brand-500">
          Le prix de la sauce est fixe (pas au gramme) et s&apos;applique aussi aux 4 autres
          formules.
        </p>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-brand-700 px-8 py-3 font-semibold text-white shadow disabled:opacity-40"
        >
          {saving ? "Enregistrement…" : "Enregistrer les tarifs"}
        </button>
      </div>
    </div>
  );
}
