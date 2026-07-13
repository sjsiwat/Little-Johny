import { create } from "zustand";
import type { AppState, Expense, Note, SyncStatus, Task, Theme } from "@/types";

interface Store extends AppState {
  syncStatus: SyncStatus;
  syncErrorMessage: string | null;
  hydrated: boolean;

  setAll: (state: AppState) => void;
  setTheme: (theme: Theme) => void;
  setSyncStatus: (status: SyncStatus, message?: string) => void;
  setHydrated: (v: boolean) => void;
  resetToDefault: () => void;

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;

  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  removeNote: (id: string) => void;

  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
}

export const defaultAppState: AppState = {
  theme: "light",
  tasks: [],
  notes: [],
  expenses: [],
  logs: [],
};

export const useStore = create<Store>((set) => ({
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
