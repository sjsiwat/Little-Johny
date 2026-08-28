

export const PRIORITY_RANK = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

// Colours below resolve to the theme tokens in src/styles/globals.css, so they
// follow light/dark like everything else. Status hues stay reserved: amber only
// signals priority or warning, green only success, red only danger. Everything
// else draws from the neutral categorical set.
const token = (name) => `rgb(var(--c-${name}))`;

export const PRIORITY_COLORS = {
  Critical: token("danger"),
  High: token("warning"),
  Medium: token("text-secondary"),
  Low: token("text-muted"),
};

export const TASK_LABELS = [
  { id: "urgent", name: "ด่วน", color: token("warning") },
  { id: "work", name: "งาน", color: token("data-6") },
  { id: "personal", name: "ส่วนตัว", color: token("data-1") },
  { id: "followup", name: "ติดตาม", color: token("data-3") },
  { id: "idea", name: "ไอเดีย", color: token("data-4") },
  { id: "meeting", name: "ประชุม", color: token("data-2") },
];

export const STATUS_META = {
  todo: { label: "สิ่งที่ต้องทำ", color: token("text-muted") },
  in_progress: { label: "กำลังทำ", color: token("accent") },
  review: { label: "รอตรวจ", color: token("warning") },
  done: { label: "เสร็จแล้ว", color: token("success") },
};

export const KANBAN_COLUMNS = ["todo", "in_progress", "review", "done"];

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
] ;

export const EXPENSE_BAR_COLORS = {
  อาหาร: token("data-3"),
  เครื่องดื่ม: token("data-2"),
  เดินทาง: token("data-6"),
  น้ำมัน: token("data-3"),
  ค่าไฟ: token("data-5"),
  ค่าน้ำ: token("data-2"),
  อินเทอร์เน็ต: token("data-6"),
  สุขภาพ: token("data-4"),
  ช้อปปิ้ง: token("data-5"),
  การศึกษา: token("data-4"),
  ลงทุน: token("data-1"),
  อื่นๆ: token("text-muted"),
};

export const EXPENSE_ICONS = {
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

export const THAI_DOW = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

/**
 * Ported verbatim from the legacy app's THAI_HOLIDAYS map — hardcoded for
 * 2025–2026 only. Deliberately not extended in this migration (the user did
 * not ask for the holiday range to change); this will silently render no
 * holidays from 2027 onward. A real Thai lunar-calendar source is needed to
 * fix that, tracked separately from this rewrite.
 */
export const THAI_HOLIDAYS = {
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

export function normalizeStatus(s) {
  if (s === "Pending") return "todo";
  if (s === "Completed") return "done";
  if (s === "In Progress") return "in_progress";
  if (s === "Review") return "review";
  return (s ) || "todo";
}
