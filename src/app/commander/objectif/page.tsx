"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { PROGRAMS, PROGRAM_ORDER, PROGRAM_STYLES } from "@/lib/constants";
import { OBJECTIVE_ICONS } from "@/components/objective-icons";
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
      <h1 className="font-display text-3xl font-bold text-brand-800">
        Choisissez votre objectif
      </h1>
      <p className="mt-2 text-brand-600">
        Ce choix détermine le tarif et les portions adaptées à votre objectif.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PROGRAM_ORDER.map((key) => {
          const program = PROGRAMS[key];
          const style = PROGRAM_STYLES[key];
          const Icon = OBJECTIVE_ICONS[key];
          const active = currentProgram === key;
          return (
            <button
              key={key}
              onClick={() => choose(key)}
              className={
                `flex flex-col rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${style.ring} ` +
                (active ? "bg-brand-100" : "bg-white")
              }
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${style.badgeBg} ${style.iconText}`}
              >
                <Icon className="h-8 w-8" />
              </div>
              <h2 className="mt-4 font-display text-lg font-bold text-brand-900">
                {program.label}
              </h2>
              <p className="mt-2 text-sm text-brand-600">{program.tagline}</p>
              <div className="mt-auto flex gap-4 pt-6 text-xs font-semibold text-brand-700">
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
