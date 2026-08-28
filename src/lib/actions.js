import { useStore } from "@/lib/store";
import { Storage } from "@/lib/storage";
import { Auth } from "@/lib/auth";
import { getTodayKey } from "@/lib/format";

/**
 * Shared create/delete helpers ported from app.js's addTask/addNote/
 * addExpense + the explicit immediate-delete path. Update-in-place is done
 * directly via useStore's updateX actions where the field set is small
 * (kept inline at the call site), matching the legacy code's direct
 * `state.tasks = state.tasks.map(...)` pattern.
 */

export function addTask(
  title,
  priority = "Medium",
  due = "",
  status = "todo",
  description = "",
  labels = [],
  targetValue = null,
  targetUnit = ""
) {
  const task = {
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

export function addNote(title, body = "", tags = "") {
  const note = {
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
  title,
  amount,
  category = "อื่นๆ",
  date = getTodayKey()
) {
  const expense = {
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

function currentUid() {
  return Auth.getUser()?.id ?? null;
}

export function deleteTask(id) {
  useStore.getState().removeTask(id);
  Storage.deleteRow("tasks", id, currentUid());
}

export function deleteNote(id) {
  useStore.getState().removeNote(id);
  Storage.deleteRow("notes", id, currentUid());
}

export function deleteExpense(id) {
  useStore.getState().removeExpense(id);
  Storage.deleteRow("expenses", id, currentUid());
}

export function isTaskDone(t) {
  return t.status === "done";
}
