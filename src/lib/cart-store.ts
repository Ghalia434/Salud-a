import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ATHLETE_PRICING } from "@/lib/constants";
import type { ProgramType } from "@/lib/database.types";

export interface CartPack {
  id: string;
  plates: number;
  price: number;
  label: string | null;
  giftDetox: boolean;
  giftGourmandise: boolean;
  freeDelivery: boolean;
}

export interface CartDelivery {
  fullName: string;
  phone: string;
  address: string;
  quartier: string;
  city: string;
  deliveryFee: number;
}

// Formule Athlète: per-meal (not per-unit) portion customization, keyed by
// mealId. proteinGrams/starchGrams stay null for meals with no
// protein_label/starch_label (single vegetable-priced component).
export interface AthleteCustomization {
  proteinGrams: number | null;
  starchGrams: number | null;
  vegGrams: number;
  extraGrams: number;
}

export const DEFAULT_ATHLETE_CUSTOMIZATION: AthleteCustomization = {
  proteinGrams: ATHLETE_PRICING.minGrams,
  starchGrams: ATHLETE_PRICING.minGrams,
  vegGrams: ATHLETE_PRICING.minGrams,
  extraGrams: ATHLETE_PRICING.minGrams,
};

interface CartState {
  program: ProgramType | null;
  pack: CartPack | null;
  items: Record<string, number>; // mealId -> quantity
  extras: Record<string, number>; // extraId -> paid quantity (gifts tracked separately)
  giftDetoxId: string | null;
  giftGourmandiseId: string | null;
  delivery: CartDelivery | null;
  athleteCustomization: Record<string, AthleteCustomization>;
  // "Extra sauce" add-on, keyed by mealId — available across every
  // objective, not just Formule Athlète.
  mealSauces: Record<string, boolean>;
  setProgram: (program: ProgramType) => void;
  setPack: (pack: CartPack) => void;
  addMeal: (mealId: string) => void;
  removeMeal: (mealId: string) => void;
  setQuantity: (mealId: string, quantity: number) => void;
  addExtra: (extraId: string) => void;
  removeExtra: (extraId: string) => void;
  setExtraQuantity: (extraId: string, quantity: number) => void;
  setGiftDetoxId: (extraId: string | null) => void;
  setGiftGourmandiseId: (extraId: string | null) => void;
  setDelivery: (delivery: CartDelivery) => void;
  setAthleteCustomization: (mealId: string, customization: Partial<AthleteCustomization>) => void;
  setMealSauce: (mealId: string, sauce: boolean) => void;
  totalSelected: () => number;
  reset: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      program: null,
      pack: null,
      items: {},
      extras: {},
      giftDetoxId: null,
      giftGourmandiseId: null,
      delivery: null,
      athleteCustomization: {},
      mealSauces: {},
      setProgram: (program) =>
        set({
          program,
          pack: null,
          items: {},
          extras: {},
          giftDetoxId: null,
          giftGourmandiseId: null,
          delivery: null,
          athleteCustomization: {},
          mealSauces: {},
        }),
      setPack: (pack) =>
        set({
          pack,
          items: {},
          extras: {},
          giftDetoxId: null,
          giftGourmandiseId: null,
          athleteCustomization: {},
          mealSauces: {},
        }),
      addMeal: (mealId) =>
        set((state) => {
          const current = state.items[mealId] ?? 0;
          const total = get().totalSelected();
          if (state.pack && total >= state.pack.plates) return state;
          return { items: { ...state.items, [mealId]: current + 1 } };
        }),
      removeMeal: (mealId) =>
        set((state) => {
          const current = state.items[mealId] ?? 0;
          if (current <= 1) {
            const rest = { ...state.items };
            delete rest[mealId];
            return { items: rest };
          }
          return { items: { ...state.items, [mealId]: current - 1 } };
        }),
      setQuantity: (mealId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            const rest = { ...state.items };
            delete rest[mealId];
            return { items: rest };
          }
          return { items: { ...state.items, [mealId]: quantity } };
        }),
      addExtra: (extraId) =>
        set((state) => ({
          extras: { ...state.extras, [extraId]: (state.extras[extraId] ?? 0) + 1 },
        })),
      removeExtra: (extraId) =>
        set((state) => {
          const current = state.extras[extraId] ?? 0;
          if (current <= 1) {
            const rest = { ...state.extras };
            delete rest[extraId];
            return { extras: rest };
          }
          return { extras: { ...state.extras, [extraId]: current - 1 } };
        }),
      setExtraQuantity: (extraId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            const rest = { ...state.extras };
            delete rest[extraId];
            return { extras: rest };
          }
          return { extras: { ...state.extras, [extraId]: quantity } };
        }),
      setGiftDetoxId: (extraId) => set({ giftDetoxId: extraId }),
      setGiftGourmandiseId: (extraId) => set({ giftGourmandiseId: extraId }),
      setDelivery: (delivery) => set({ delivery }),
      setAthleteCustomization: (mealId, customization) =>
        set((state) => ({
          athleteCustomization: {
            ...state.athleteCustomization,
            [mealId]: {
              ...DEFAULT_ATHLETE_CUSTOMIZATION,
              ...state.athleteCustomization[mealId],
              ...customization,
            },
          },
        })),
      setMealSauce: (mealId, sauce) =>
        set((state) => ({ mealSauces: { ...state.mealSauces, [mealId]: sauce } })),
      totalSelected: () =>
        Object.values(get().items).reduce((sum, qty) => sum + qty, 0),
      reset: () =>
        set({
          program: null,
          pack: null,
          items: {},
          extras: {},
          giftDetoxId: null,
          giftGourmandiseId: null,
          delivery: null,
          athleteCustomization: {},
          mealSauces: {},
        }),
    }),
    { name: "saludea-cart" }
  )
);
