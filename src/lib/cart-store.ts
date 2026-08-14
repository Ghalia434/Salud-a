import { create } from "zustand";
import { persist } from "zustand/middleware";
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

interface CartState {
  program: ProgramType | null;
  pack: CartPack | null;
  items: Record<string, number>; // mealId -> quantity
  extras: Record<string, number>; // extraId -> paid quantity (gifts tracked separately)
  giftDetoxId: string | null;
  giftGourmandiseId: string | null;
  delivery: CartDelivery | null;
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
      setProgram: (program) =>
        set({
          program,
          pack: null,
          items: {},
          extras: {},
          giftDetoxId: null,
          giftGourmandiseId: null,
          delivery: null,
        }),
      setPack: (pack) =>
        set({ pack, items: {}, extras: {}, giftDetoxId: null, giftGourmandiseId: null }),
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
        }),
    }),
    { name: "saludea-cart" }
  )
);
