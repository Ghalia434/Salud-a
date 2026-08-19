import type { OrderStatus, ProgramType } from "@/lib/database.types";

export const PROGRAMS: Record<
  ProgramType,
  {
    label: string;
    tagline: string;
    description: string;
    calories: number;
    protein: number;
    features?: string[];
  }
> = {
  perte_de_poids: {
    label: "Perte de poids",
    tagline: "Manger sainement, atteindre vos objectifs.",
    description: "Des repas légers et rassasiants pour perdre du poids sans frustration.",
    calories: 450,
    protein: 30,
  },
  equilibre: {
    label: "Équilibré",
    tagline: "L'équilibre parfait entre plaisir et nutrition.",
    description: "Des repas équilibrés pour une alimentation saine au quotidien.",
    calories: 600,
    protein: 38,
  },
  prise_de_masse: {
    label: "Prise de masse",
    tagline: "Prenez de la masse, nourrissez vos muscles.",
    description: "Des repas riches et protéinés pour soutenir vos objectifs sportifs.",
    calories: 750,
    protein: 45,
  },
  transformation_corporelle: {
    label: "Transformation corporelle",
    tagline: "Transformez votre corps durablement.",
    description: "Des repas complets pensés pour accompagner une transformation en profondeur.",
    calories: 650,
    protein: 40,
  },
  athlete: {
    label: "Formule Athlète",
    tagline: "Vos portions, sur-mesure, au gramme près.",
    description:
      "Composez chaque assiette en ajustant vous-même les portions de protéines, féculents et légumes.",
    calories: 0,
    protein: 0,
    features: [
      "Portions personnalisables au gramme",
      "Ingrédients réels de chaque plat",
      "Prix calculé en temps réel",
    ],
  },
};

export const PROGRAM_ORDER: ProgramType[] = [
  "perte_de_poids",
  "equilibre",
  "prise_de_masse",
  "transformation_corporelle",
  "athlete",
];

// Literal Tailwind class names per program (Tailwind's scanner needs the
// full class string to appear somewhere in source — can't be built from a
// dynamic `objective-${key}` template).
export const PROGRAM_STYLES: Record<
  ProgramType,
  { badgeBg: string; iconText: string; ring: string }
> = {
  perte_de_poids: {
    badgeBg: "bg-objective-perte/15",
    iconText: "text-objective-perte",
    ring: "border-objective-perte/30",
  },
  equilibre: {
    badgeBg: "bg-objective-equilibre/15",
    iconText: "text-objective-equilibre",
    ring: "border-objective-equilibre/30",
  },
  prise_de_masse: {
    badgeBg: "bg-objective-prise/10",
    iconText: "text-objective-prise",
    ring: "border-objective-prise/30",
  },
  transformation_corporelle: {
    badgeBg: "bg-objective-transformation/15",
    iconText: "text-objective-transformation",
    ring: "border-objective-transformation/30",
  },
  athlete: {
    badgeBg: "bg-objective-athlete/15",
    iconText: "text-objective-athlete",
    ring: "border-objective-athlete/30",
  },
};

export const ORDER_STATUS_LABELS: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  en_attente: {
    label: "En attente",
    className: "bg-amber-100 text-amber-800",
  },
  confirmee: {
    label: "Confirmée",
    className: "bg-blue-100 text-blue-800",
  },
  en_preparation: {
    label: "En préparation",
    className: "bg-brand-200 text-brand-800",
  },
  en_livraison: {
    label: "En livraison",
    className: "bg-purple-100 text-purple-800",
  },
  livree: {
    label: "Livrée",
    className: "bg-green-100 text-green-800",
  },
  annulee: {
    label: "Annulée",
    className: "bg-red-100 text-red-800",
  },
};

// The normal linear progression, used for the client-facing step tracker.
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "en_attente",
  "confirmee",
  "en_preparation",
  "en_livraison",
  "livree",
];

// Every status an admin can set on an order — the flow above plus the
// terminal "annulée" exception state.
export const ALL_ORDER_STATUSES: OrderStatus[] = [...ORDER_STATUS_FLOW, "annulee"];

export const DELIVERY_CITIES = [
  { label: "Casablanca", fee: 20 },
  { label: "Bouskoura", fee: 35 },
] as const;

export type DeliveryCity = (typeof DELIVERY_CITIES)[number]["label"];

export function deliveryFeeFor(city: string): number {
  return DELIVERY_CITIES.find((c) => c.label === city)?.fee ?? 0;
}

export const WHATSAPP_NUMBER = "+212693401564";

// Formule Athlète — per-gram component pricing (DH/g), applied on top of a
// 100g floor per component, in 10g increments.
export const ATHLETE_PRICING = {
  proteinRatePerGram: 0.22,
  starchRatePerGram: 0.18,
  vegRatePerGram: 0.06,
  minGrams: 100,
  gramStep: 10,
} as const;

// "Extra sauce" is each dish's own named sauce (meals.sauce_label), offered
// as a paid add-on across every objective, not just Formule Athlète.
export const EXTRA_SAUCE_PRICE = 8;
