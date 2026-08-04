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
}

interface CartState {
  program: ProgramType | null;
  pack: CartPack | null;
  items: Record<string, number>; // mealId -> quantity
  delivery: CartDelivery | null;
  setProgram: (program: ProgramType) => void;
  setPack: (pack: CartPack) => void;
  addMeal: (mealId: string) => void;
  removeMeal: (mealId: string) => void;
  setQuantity: (mealId: string, quantity: number) => void;
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
      delivery: null,
      setProgram: (program) =>
        set({ program, pack: null, items: {}, delivery: null }),
      setPack: (pack) => set({ pack, items: {} }),
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
      setDelivery: (delivery) => set({ delivery }),
      totalSelected: () =>
        Object.values(get().items).reduce((sum, qty) => sum + qty, 0),
      reset: () => set({ program: null, pack: null, items: {}, delivery: null }),
    }),
    { name: "saludea-cart" }
  )
);
