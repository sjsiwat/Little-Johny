import { create } from "zustand";

interface FabState {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

export const useFabStore = create<FabState>((set) => ({
  open: false,
  toggle: () => set((s) => ({ open: !s.open })),
  close: () => set({ open: false }),
}));
