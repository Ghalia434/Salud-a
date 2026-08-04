"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { PROGRAMS, PROGRAM_ORDER } from "@/lib/constants";
import type { ProgramType } from "@/lib/database.types";

export default function ObjectifPage() {
  const router = useRouter();
  const setProgram = useCartStore((s) => s.setProgram);
  const currentProgram = useCartStore((s) => s.program);

  function choose(program: ProgramType) {
    setProgram(program);
    router.push("/commander/pack");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-800">Choisissez votre objectif</h1>
      <p className="mt-2 text-brand-600">
        Ce choix détermine les repas qui vous seront proposés.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {PROGRAM_ORDER.map((key) => {
          const program = PROGRAMS[key];
          const active = currentProgram === key;
          return (
            <button
              key={key}
              onClick={() => choose(key)}
              className={
                "flex flex-col rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md " +
                (active
                  ? "border-brand-700 bg-brand-100"
                  : "border-brand-200 bg-white")
              }
            >
              <h2 className="text-lg font-bold text-brand-800">{program.label}</h2>
              <p className="mt-2 text-sm text-brand-600">{program.tagline}</p>
              <div className="mt-6 flex gap-6 text-sm font-semibold text-brand-700">
                <span>{program.calories} kcal</span>
                <span>{program.protein} g protéines</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
