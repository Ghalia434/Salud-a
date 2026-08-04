"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ConnexionPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    router.push("/compte");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-20">
      <h1 className="text-3xl font-bold text-brand-800">Connexion</h1>
      <p className="mt-2 text-brand-600">
        Connectez-vous avec votre email pour suivre vos commandes.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === "email" ? (
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
      ) : (
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

      <p className="mt-8 text-center text-sm text-brand-500">
        Vous êtes de l&apos;équipe Saludèa ?{" "}
        <Link href="/admin/login" className="underline">
          Connexion admin
        </Link>
      </p>
    </div>
  );
}
