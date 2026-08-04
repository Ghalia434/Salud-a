"use client";

import { usePathname } from "next/navigation";

const STEPS = [
  { href: "/commander/objectif", label: "Objectif" },
  { href: "/commander/pack", label: "Formule" },
  { href: "/commander/repas", label: "Repas" },
  { href: "/commander/panier", label: "Panier" },
  { href: "/commander/livraison", label: "Livraison" },
  { href: "/commander/confirmation", label: "Confirmation" },
];

export function StepIndicator() {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((s) => pathname.startsWith(s.href));

  return (
    <ol className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-3 px-6 py-6 text-sm">
      {STEPS.map((step, i) => {
        const state =
          i === currentIndex ? "current" : i < currentIndex ? "done" : "upcoming";
        return (
          <li key={step.href} className="flex items-center gap-2">
            <span
              className={
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold " +
                (state === "current"
                  ? "bg-brand-700 text-white"
                  : state === "done"
                    ? "bg-brand-300 text-brand-900"
                    : "bg-brand-100 text-brand-400")
              }
            >
              {i + 1}
            </span>
            <span
              className={
                state === "current"
                  ? "font-semibold text-brand-800"
                  : "text-brand-500"
              }
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && <span className="ml-2 text-brand-300">—</span>}
          </li>
        );
      })}
    </ol>
  );
}
