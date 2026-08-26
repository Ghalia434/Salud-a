"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PROGRAMS, PROGRAM_ORDER } from "@/lib/constants";
import { DEFAULT_ATHLETE_PRICING_RATES } from "@/lib/athlete-pricing";
import type { Database, ProgramType } from "@/lib/database.types";

type ProgramPack = Database["public"]["Tables"]["program_packs"]["Row"];
type Meal = Database["public"]["Tables"]["meals"]["Row"];

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

  const [saucePrice, setSaucePrice] = useState("");

  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMealId, setSelectedMealId] = useState("");
  const [mealProteinPrice, setMealProteinPrice] = useState("");
  const [mealStarchPrice, setMealStarchPrice] = useState("");
  const [mealVegPrice, setMealVegPrice] = useState("");
  const [mealExtraPrice, setMealExtraPrice] = useState("");
  const [savingMeal, setSavingMeal] = useState(false);
  const [mealError, setMealError] = useState<string | null>(null);
  const [mealSaved, setMealSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("program_packs").select("*").neq("program", "athlete"),
      supabase.from("athlete_pricing_settings").select("*").single(),
      supabase.from("meals").select("*").order("name", { ascending: true }),
    ]).then(([{ data: packsData }, { data: settings }, { data: mealsData }]) => {
      const list = packsData ?? [];
      setPacks(list);
      setPackPrices(Object.fromEntries(list.map((p) => [p.id, String(p.price)])));
      setSaucePrice(
        String(settings ? settings.sauce_price : DEFAULT_ATHLETE_PRICING_RATES.saucePrice)
      );
      // Only meals with at least one Formule Athlète component are relevant here.
      setMeals(
        (mealsData ?? []).filter(
          (m) => m.protein_label || m.starch_label || m.veg_label || m.extra_label
        )
      );
      setLoading(false);
    });
  }, []);

  function packFor(program: ProgramType, plates: number) {
    return packs.find((p) => p.program === program && p.plates === plates);
  }

  const selectedMeal = meals.find((m) => m.id === selectedMealId) ?? null;

  function selectMeal(mealId: string) {
    setSelectedMealId(mealId);
    setMealSaved(false);
    setMealError(null);
    const meal = meals.find((m) => m.id === mealId);
    setMealProteinPrice(meal?.protein_price_per_10g?.toString() ?? "");
    setMealStarchPrice(meal?.starch_price_per_10g?.toString() ?? "");
    setMealVegPrice(meal?.veg_price_per_10g?.toString() ?? "");
    setMealExtraPrice(meal?.extra_price_per_100g?.toString() ?? "");
  }

  async function saveMealPrices() {
    if (!selectedMeal) return;
    setSavingMeal(true);
    setMealError(null);
    setMealSaved(false);
    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("meals")
      .update({
        protein_price_per_10g: mealProteinPrice ? Number(mealProteinPrice) : null,
        starch_price_per_10g: mealStarchPrice ? Number(mealStarchPrice) : null,
        veg_price_per_10g: mealVegPrice ? Number(mealVegPrice) : null,
        extra_price_per_100g: mealExtraPrice ? Number(mealExtraPrice) : null,
      })
      .eq("id", selectedMeal.id);

    setSavingMeal(false);
    if (updateError) {
      setMealError(updateError.message);
      return;
    }
    setMeals((prev) =>
      prev.map((m) =>
        m.id === selectedMeal.id
          ? {
              ...m,
              protein_price_per_10g: mealProteinPrice ? Number(mealProteinPrice) : null,
              starch_price_per_10g: mealStarchPrice ? Number(mealStarchPrice) : null,
              veg_price_per_10g: mealVegPrice ? Number(mealVegPrice) : null,
              extra_price_per_100g: mealExtraPrice ? Number(mealExtraPrice) : null,
            }
          : m
      )
    );
    setMealSaved(true);
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
      .update({ sauce_price: Number(saucePrice) })
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
        <h2 className="font-bold text-brand-800">Formule Athlète — prix par plat</h2>
        <p className="mt-1 text-xs text-brand-500">
          Choisissez un plat pour fixer le prix de ses ingrédients réels (ex : le Poulet
          d&apos;un plat peut coûter différemment du Poulet d&apos;un autre plat).
        </p>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-brand-700">Plat</span>
          <select
            value={selectedMealId}
            onChange={(e) => selectMeal(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-300 px-3 py-2"
          >
            <option value="">— Choisir un plat —</option>
            {meals.map((meal) => (
              <option key={meal.id} value={meal.id}>
                {meal.name}
              </option>
            ))}
          </select>
        </label>

        {selectedMeal && (
          <>
            {mealError && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {mealError}
              </p>
            )}
            {mealSaved && !mealError && (
              <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                Prix du plat enregistrés.
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-4">
              {selectedMeal.protein_label && (
                <IngredientPriceField
                  label={selectedMeal.protein_label}
                  value={mealProteinPrice}
                  onChange={setMealProteinPrice}
                />
              )}
              {selectedMeal.starch_label && (
                <IngredientPriceField
                  label={selectedMeal.starch_label}
                  value={mealStarchPrice}
                  onChange={setMealStarchPrice}
                />
              )}
              {selectedMeal.veg_label && (
                <IngredientPriceField
                  label={selectedMeal.veg_label}
                  value={mealVegPrice}
                  onChange={setMealVegPrice}
                />
              )}
              {selectedMeal.extra_label && (
                <IngredientPriceField
                  label={selectedMeal.extra_label}
                  value={mealExtraPrice}
                  onChange={setMealExtraPrice}
                  per100g
                />
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={saveMealPrices}
                disabled={savingMeal}
                className="rounded-full bg-brand-700 px-6 py-2 font-semibold text-white disabled:opacity-40"
              >
                {savingMeal ? "Enregistrement…" : "Enregistrer ce plat"}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-brand-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-brand-800">Extra sauce</h2>
        <p className="mt-1 text-xs text-brand-500">
          Prix fixe (pas au gramme) — s&apos;applique à toutes les formules, pas
          seulement à la Formule Athlète.
        </p>
        <label className="mt-3 block max-w-[160px]">
          <span className="text-xs text-brand-600">Prix fixe</span>
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

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Two editable, synced price inputs for one ingredient: 10g (the increment
// the client adjusts by) and 100g (the starting/minimum portion — the
// "base" price before any portion adjustment). `value`/`onChange` always
// carry the stored unit (per100g controls which one that is); editing
// either input converts and updates the same underlying value.
function IngredientPriceField({
  label,
  value,
  onChange,
  per100g = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  per100g?: boolean;
}) {
  const numeric = Number(value);
  const hasValue = value !== "" && !Number.isNaN(numeric);

  const price10g = hasValue ? String(per100g ? round2(numeric / 10) : numeric) : "";
  const price100g = hasValue ? String(per100g ? numeric : round2(numeric * 10)) : "";

  function handle10gChange(v: string) {
    if (v === "") return onChange("");
    const n = Number(v);
    if (Number.isNaN(n)) return;
    onChange(String(per100g ? round2(n * 10) : n));
  }

  function handle100gChange(v: string) {
    if (v === "") return onChange("");
    const n = Number(v);
    if (Number.isNaN(n)) return;
    onChange(String(per100g ? n : round2(n / 10)));
  }

  return (
    <div className="rounded-xl border border-brand-100 bg-brand-cream/60 p-3">
      <span className="text-sm font-semibold text-brand-800">{label}</span>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs text-brand-600">Prix / 10g</span>
          <div className="mt-1 flex items-center gap-1">
            <input
              type="number"
              min={0}
              step={0.1}
              value={price10g}
              onChange={(e) => handle10gChange(e.target.value)}
              placeholder="Défaut"
              className="w-full rounded-lg border border-brand-300 px-2 py-1.5 text-sm"
            />
            <span className="text-xs text-brand-500">DH</span>
          </div>
        </label>
        <label className="block">
          <span className="text-xs text-brand-600">Prix / 100g (départ)</span>
          <div className="mt-1 flex items-center gap-1">
            <input
              type="number"
              min={0}
              step={0.5}
              value={price100g}
              onChange={(e) => handle100gChange(e.target.value)}
              placeholder="Défaut"
              className="w-full rounded-lg border border-brand-300 px-2 py-1.5 text-sm"
            />
            <span className="text-xs text-brand-500">DH</span>
          </div>
        </label>
      </div>
      {!hasValue && (
        <p className="mt-1 text-xs text-brand-500">
          {per100g ? "Vide = composant non facturé" : "Vide = tarif par défaut appliqué"}
        </p>
      )}
    </div>
  );
}
