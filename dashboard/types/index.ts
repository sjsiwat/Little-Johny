export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "Critical" | "High" | "Medium" | "Low";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  due: string | null; // YYYY-MM-DD
  status: TaskStatus;
  labels: string[];
  target_value: number | null;
  target_unit: string;
  progress_value: number;
  createdAt: number;
  _isDemo?: boolean;
}

export interface Note {
  id: string;
  title: string;
  body: string; // HTML string (TipTap output) or plain text
  tags: string; // comma-separated, matches legacy storage shape (Supabase `notes.tags` column)
  createdAt: number;
  _isDemo?: boolean;
  _isKVLine?: boolean; // display-only legacy LINE-bot note, never persisted
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
  _isDemo?: boolean;
}

export type Theme = "light" | "dark";

export interface AppState {
  theme: Theme;
  tasks: Task[];
  notes: Note[];
  expenses: Expense[];
  logs: unknown[];
}

export type SyncStatus =
  | "idle"
  | "loading"
  | "pending"
  | "syncing"
  | "synced"
  | "offline"
  | "error";

export interface LineUserInfo {
  line_user_id: string | null;
  plan: "free" | "pro";
  display_name: string | null;
  picture_url: string | null;
}

export type ExpensePeriod = "today" | "month" | "year" | "all";
export type ReviewTab = "daily" | "weekly" | "monthly";
