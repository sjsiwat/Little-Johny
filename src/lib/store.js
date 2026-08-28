import { create } from "zustand";

export const defaultAppState = {
  theme: "light",
  tasks: [],
  notes: [],
  expenses: [],
  logs: [],
};

export const useStore = create((set) => ({
  ...defaultAppState,
  syncStatus: "idle",
  syncErrorMessage: null,
  hydrated: false,

  setAll: (state) => set({ ...state }),
  setTheme: (theme) => set({ theme }),
  setSyncStatus: (syncStatus, message) => set({ syncStatus, syncErrorMessage: message ?? null }),
  setHydrated: (hydrated) => set({ hydrated }),
  resetToDefault: () => set({ ...defaultAppState, hydrated: false }),

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  updateTask: (id, patch) =>
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
  updateNote: (id, patch) =>
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)) })),
  removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) => set((s) => ({ expenses: [expense, ...s.expenses] })),
  updateExpense: (id, patch) =>
    set((s) => ({ expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
  removeExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
}));
