import type { TaskPriority, TaskStatus } from "@/types";

export const PRIORITY_RANK: Record<TaskPriority, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  Critical: "#FF453A",
  High: "#FF9F0A",
  Medium: "#0A84FF",
  Low: "#8E8E93",
};

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

export const TASK_LABELS: TaskLabel[] = [
  { id: "urgent", name: "ด่วน", color: "#FF453A" },
  { id: "work", name: "งาน", color: "#0A84FF" },
  { id: "personal", name: "ส่วนตัว", color: "#BF5AF2" },
  { id: "followup", name: "ติดตาม", color: "#FF9F0A" },
  { id: "idea", name: "ไอเดีย", color: "#30D158" },
  { id: "meeting", name: "ประชุม", color: "#64D2FF" },
];

export const STATUS_META: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: "สิ่งที่ต้องทำ", color: "#6F7480" },
  in_progress: { label: "กำลังทำ", color: "#0A84FF" },
  review: { label: "รอตรวจ", color: "#FF9F0A" },
  done: { label: "เสร็จแล้ว", color: "#30D158" },
};

export const KANBAN_COLUMNS: TaskStatus[] = ["todo", "in_progress", "review", "done"];

export const EXPENSE_CATEGORIES = [
  "อาหาร",
  "เครื่องดื่ม",
  "เดินทาง",
  "น้ำมัน",
  "ค่าไฟ",
  "ค่าน้ำ",
  "อินเทอร์เน็ต",
  "สุขภาพ",
  "ช้อปปิ้ง",
  "การศึกษา",
  "ลงทุน",
  "อื่นๆ",
] as const;

export const EXPENSE_BAR_COLORS: Record<string, string> = {
  อาหาร: "#FF9F0A",
  เครื่องดื่ม: "#64D2FF",
  เดินทาง: "#BF5AF2",
  น้ำมัน: "#FF9F0A",
  ค่าไฟ: "#FF6B6B",
  ค่าน้ำ: "#64D2FF",
  อินเทอร์เน็ต: "#0A84FF",
  สุขภาพ: "#30D158",
  ช้อปปิ้ง: "#FF6B6B",
  การศึกษา: "#30D158",
  ลงทุน: "#BF5AF2",
  อื่นๆ: "#8E8E93",
};

export const EXPENSE_ICONS: Record<string, string> = {
  อาหาร: "🍜",
  เครื่องดื่ม: "☕",
  เดินทาง: "🚌",
  น้ำมัน: "⛽",
  ค่าไฟ: "⚡",
  ค่าน้ำ: "💧",
  อินเทอร์เน็ต: "📡",
  สุขภาพ: "🏥",
  ช้อปปิ้ง: "🛍️",
  การศึกษา: "📚",
  ลงทุน: "📈",
  อื่นๆ: "📦",
};

export const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

export const THAI_DOW = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

/**
 * Ported verbatim from the legacy app's THAI_HOLIDAYS map — hardcoded for
 * 2025–2026 only. Deliberately not extended in this migration (the user did
 * not ask for the holiday range to change); this will silently render no
 * holidays from 2027 onward. A real Thai lunar-calendar source is needed to
 * fix that, tracked separately from this rewrite.
 */
export const THAI_HOLIDAYS: Record<string, { name: string; type: string }> = {
  "2025-01-01": { name: "วันขึ้นปีใหม่", type: "national" },
  "2025-02-12": { name: "วันมาฆบูชา", type: "buddhist" },
  "2025-04-06": { name: "วันจักรี", type: "national" },
  "2025-04-13": { name: "วันสงกรานต์", type: "national" },
  "2025-04-14": { name: "วันสงกรานต์", type: "national" },
  "2025-04-15": { name: "วันสงกรานต์", type: "national" },
  "2025-05-01": { name: "วันแรงงานแห่งชาติ", type: "national" },
  "2025-05-04": { name: "วันฉัตรมงคล", type: "national" },
  "2025-05-12": { name: "วันวิสาขบูชา", type: "buddhist" },
  "2025-06-03": { name: "วันเฉลิมพระชนมพรรษา สมเด็จพระราชินี", type: "royal" },
  "2025-07-10": { name: "วันอาสาฬหบูชา", type: "buddhist" },
  "2025-07-11": { name: "วันเข้าพรรษา", type: "buddhist" },
  "2025-07-28": { name: "วันเฉลิมพระชนมพรรษา ร.10", type: "royal" },
  "2025-08-12": { name: "วันแม่แห่งชาติ", type: "national" },
  "2025-10-13": { name: "วันนวมินทรมหาราช", type: "royal" },
  "2025-10-23": { name: "วันปิยมหาราช", type: "national" },
  "2025-12-05": { name: "วันพ่อแห่งชาติ", type: "national" },
  "2025-12-10": { name: "วันรัฐธรรมนูญ", type: "national" },
  "2025-12-31": { name: "วันสิ้นปี", type: "national" },
  "2026-01-01": { name: "วันขึ้นปีใหม่", type: "national" },
  "2026-02-01": { name: "วันมาฆบูชา", type: "buddhist" },
  "2026-04-06": { name: "วันจักรี", type: "national" },
  "2026-04-13": { name: "วันสงกรานต์", type: "national" },
  "2026-04-14": { name: "วันสงกรานต์", type: "national" },
  "2026-04-15": { name: "วันสงกรานต์", type: "national" },
  "2026-05-01": { name: "วันแรงงานแห่งชาติ", type: "national" },
  "2026-05-04": { name: "วันฉัตรมงคล", type: "national" },
  "2026-05-31": { name: "วันวิสาขบูชา", type: "buddhist" },
  "2026-06-03": { name: "วันเฉลิมพระชนมพรรษา สมเด็จพระราชินี", type: "royal" },
  "2026-07-27": { name: "วันอาสาฬหบูชา", type: "buddhist" },
  "2026-07-28": { name: "วันเข้าพรรษา + วันเฉลิมพระชนมพรรษา ร.10", type: "buddhist" },
  "2026-08-12": { name: "วันแม่แห่งชาติ", type: "national" },
  "2026-10-13": { name: "วันนวมินทรมหาราช", type: "royal" },
  "2026-10-23": { name: "วันปิยมหาราช", type: "national" },
  "2026-12-05": { name: "วันพ่อแห่งชาติ", type: "national" },
  "2026-12-10": { name: "วันรัฐธรรมนูญ", type: "national" },
  "2026-12-31": { name: "วันสิ้นปี", type: "national" },
};

export function normalizeStatus(s: string | undefined | null): TaskStatus {
  if (s === "Pending") return "todo";
  if (s === "Completed") return "done";
  if (s === "In Progress") return "in_progress";
  if (s === "Review") return "review";
  return (s as TaskStatus) || "todo";
}
