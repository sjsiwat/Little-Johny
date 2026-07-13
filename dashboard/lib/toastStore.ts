import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastState {
  toast: { id: number; title: string; type: ToastType; description?: string } | null;
  showToast: (title: string, type?: ToastType, description?: string) => void;
  dismissToast: () => void;
}

let counter = 0;

// Single-instance singleton — matches the legacy app's non-stacking toast:
// showing a new one immediately replaces whatever was previously visible.
export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  showToast: (title, type = "info", description) =>
    set({ toast: { id: ++counter, title, type, description } }),
  dismissToast: () => set({ toast: null }),
}));
