"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart-store";
import { CITY } from "@/lib/constants";

type Step = "email" | "otp" | "details";

export default function LivraisonPage() {
  const router = useRouter();
  const program = useCartStore((s) => s.program);
  const pack = useCartStore((s) => s.pack);
  const setDelivery = useCartStore((s) => s.setDelivery);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [quartier, setQuartier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!program || !pack) {
      router.replace("/commander/objectif");
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, address, quartier, phone")
        .eq("id", user.id)
        .single();
      if (profile) {
        setFullName(profile.full_name ?? "");
        setAddress(profile.address ?? "");
        setQuartier(profile.quartier ?? "");
        setPhone(profile.phone ?? "");
      }
      setStep("details");
    });
  }, [program, pack, router]);

  async function sendCode() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("otp");
  }

  async function verifyCode() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("details");
  }

  function submitDetails() {
    setDelivery({ fullName, phone, address, quartier });
    router.push("/commander/confirmation");
  }

  if (!program || !pack) return null;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold text-brand-800">Livraison</h1>
      <p className="mt-2 text-brand-600">
        Nous vérifions votre email avant de finaliser la commande.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === "email" && (
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-brand-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="mt-1 w-full rounded-lg border border-brand-300 px-4 py-2"
            />
          </label>
          <button
            onClick={sendCode}
            disabled={loading || !email.includes("@")}
            className="w-full rounded-full bg-brand-700 py-3 font-semibold text-white disabled:opacity-40"
          >
            {loading ? "Envoi…" : "Envoyer le code"}
          </button>
        </div>
      )}

      {step === "otp" && (
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-brand-700">
              Code reçu par email
            </span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="mt-1 w-full rounded-lg border border-brand-300 px-4 py-2 tracking-widest"
            />
          </label>
          <button
            onClick={verifyCode}
            disabled={loading || code.length < 4}
            className="w-full rounded-full bg-brand-700 py-3 font-semibold text-white disabled:opacity-40"
          >
            {loading ? "Vérification…" : "Vérifier le code"}
          </button>
          <button
            onClick={() => setStep("email")}
            className="w-full text-sm text-brand-600 underline"
          >
            Changer d&apos;email
          </button>
        </div>
      )}

      {step === "details" && (
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
            <input
              type="text"
              value={CITY}
              disabled
              className="mt-1 w-full rounded-lg border border-brand-200 bg-brand-100 px-4 py-2 text-brand-500"
            />
          </label>
          <button
            onClick={submitDetails}
            disabled={!fullName || !phone || !address || !quartier}
            className="w-full rounded-full bg-brand-700 py-3 font-semibold text-white disabled:opacity-40"
          >
            Continuer vers la confirmation
          </button>
        </div>
      )}
    </div>
  );
}
