import type { OrderStatus, ProgramType } from "@/lib/database.types";

export const PROGRAMS: Record<
  ProgramType,
  {
    label: string;
    tagline: string;
    description: string;
    calories: number;
    protein: number;
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
};

export const PROGRAM_ORDER: ProgramType[] = [
  "perte_de_poids",
  "equilibre",
  "prise_de_masse",
];

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
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "en_attente",
  "confirmee",
  "en_preparation",
  "en_livraison",
  "livree",
];

export const CITY = "Casablanca";

export const WHATSAPP_NUMBER = "+212693401564";
