import { create } from "zustand";

let counter = 0;

// Single-instance singleton — matches the legacy app's non-stacking toast:
// showing a new one immediately replaces whatever was previously visible.
export const useToastStore = create((set) => ({
  toast: null,
  showToast: (title, type = "info", description) =>
    set({ toast: { id: ++counter, title, type, description } }),
  dismissToast: () => set({ toast: null }),
}));
