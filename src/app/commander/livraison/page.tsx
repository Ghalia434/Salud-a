"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { DELIVERY_CITIES, deliveryFeeFor } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

export default function LivraisonPage() {
  const router = useRouter();
  const program = useCartStore((s) => s.program);
  const pack = useCartStore((s) => s.pack);
  const setDelivery = useCartStore((s) => s.setDelivery);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [quartier, setQuartier] = useState("");
  const [city, setCity] = useState<string>(DELIVERY_CITIES[0].label);

  useEffect(() => {
    if (!program || !pack) {
      router.replace("/commander/objectif");
    }
  }, [program, pack, router]);

  function submitDetails() {
    setDelivery({ fullName, phone, address, quartier, city, deliveryFee: deliveryFeeFor(city) });
    router.push("/commander/confirmation");
  }

  if (!program || !pack) return null;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl font-bold text-brand-800">Livraison</h1>
      <p className="mt-2 text-brand-600">
        Renseignez vos coordonnées pour la livraison. Vous serez contacté par WhatsApp.
      </p>

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
            onChange={(e) => setPhone(e.target.value)}
            placeholder="06 12 34 56 78"
            className="mt-1 w-full rounded-lg border border-brand-300 px-4 py-2"
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
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-300 px-4 py-2"
          >
            {DELIVERY_CITIES.map((c) => (
              <option key={c.label} value={c.label}>
                {c.label} — livraison {formatPrice(c.fee)}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={submitDetails}
          disabled={!fullName || !phone || !address || !quartier}
          className="w-full rounded-full bg-brand-700 py-3 font-semibold text-white disabled:opacity-40"
        >
          Continuer vers la confirmation
        </button>
      </div>
    </div>
  );
}
