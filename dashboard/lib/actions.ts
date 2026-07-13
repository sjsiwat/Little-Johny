import { useStore } from "@/lib/store";
import { Storage } from "@/lib/storage";
import { Auth } from "@/lib/auth";
import { getTodayKey } from "@/lib/format";
import type { Expense, Note, Task, TaskPriority, TaskStatus } from "@/types";

/**
 * Shared create/delete helpers ported from app.js's addTask/addNote/
 * addExpense + the explicit immediate-delete path. Update-in-place is done
 * directly via useStore's updateX actions where the field set is small
 * (kept inline at the call site), matching the legacy code's direct
 * `state.tasks = state.tasks.map(...)` pattern.
 */

export function addTask(
  title: string,
  priority: TaskPriority = "Medium",
  due = "",
  status: TaskStatus = "todo",
  description = "",
  labels: string[] = [],
  targetValue: number | null = null,
  targetUnit = ""
): Task {
  const task: Task = {
    id: crypto.randomUUID(),
    title,
    description,
    priority,
    due,
    status,
    labels,
    target_value: targetValue ? Number(targetValue) : null,
    target_unit: targetUnit || "",
    progress_value: 0,
    createdAt: Date.now(),
  };
  useStore.getState().addTask(task);
  return task;
}

export function addNote(title: string, body = "", tags = ""): Note {
  const note: Note = {
    id: crypto.randomUUID(),
    title,
    body,
    tags,
    createdAt: Date.now(),
  };
  useStore.getState().addNote(note);
  return note;
}

export function addExpense(
  title: string,
  amount: number,
  category = "อื่นๆ",
  date: string = getTodayKey()
): Expense {
  const expense: Expense = {
    id: crypto.randomUUID(),
    title,
    amount: Number(amount),
    category,
    date,
    createdAt: Date.now(),
  };
  useStore.getState().addExpense(expense);
  return expense;
}

function currentUid(): string | null {
  return Auth.getUser()?.id ?? null;
}

export function deleteTask(id: string) {
  useStore.getState().removeTask(id);
  Storage.deleteRow("tasks", id, currentUid());
}

export function deleteNote(id: string) {
  useStore.getState().removeNote(id);
  Storage.deleteRow("notes", id, currentUid());
}

export function deleteExpense(id: string) {
  useStore.getState().removeExpense(id);
  Storage.deleteRow("expenses", id, currentUid());
}

export function toggleTaskDone(id: string) {
  const task = useStore.getState().tasks.find((t) => t.id === id);
  if (!task) return;
  const nowDone = task.status !== "done";
  useStore.getState().updateTask(id, { status: nowDone ? "done" : "todo" });
  return nowDone;
}

export function isTaskDone(t: Task): boolean {
  return t.status === "done";
}
