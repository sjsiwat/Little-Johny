

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

// Both maps derive from one token per priority, so the solid colour and its
// tint can never disagree. Building a tint by appending hex alpha to the
// colour string was the old approach and it silently produced invalid CSS
// once these became rgb(var(--…)).
const PRIORITY_TOKENS = {
  Critical: "danger",
  High: "warning",
  Medium: "text-secondary",
  Low: "text-muted",
};

export const PRIORITY_COLORS = Object.fromEntries(
  Object.entries(PRIORITY_TOKENS).map(([k, t]) => [k, `rgb(var(--c-${t}))`])
);

export const PRIORITY_TINTS = Object.fromEntries(
  Object.entries(PRIORITY_TOKENS).map(([k, t]) => [k, `rgb(var(--c-${t}) / 0.14)`])
);

// Labels carry the token name rather than a finished colour so a badge can
// build both the solid and the tinted form from it. Composing a soft variant
// by appending hex alpha ("#RRGGBB18") stopped working when the palette moved
// to rgb(var(--…)) — labelTint replaces that.
export const TASK_LABELS = [
  { id: "urgent", name: "ด่วน", token: "warning" },
  { id: "work", name: "งาน", token: "data-6" },
  { id: "personal", name: "ส่วนตัว", token: "data-1" },
  { id: "followup", name: "ติดตาม", token: "data-3" },
  { id: "idea", name: "ไอเดีย", token: "data-4" },
  { id: "meeting", name: "ประชุม", token: "data-2" },
];

export const labelColor = (label) => `rgb(var(--c-${label.token}))`;
export const labelTint = (label) => `rgb(var(--c-${label.token}) / 0.14)`;

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

// Expense bars are a single hue — the brand purple — with intensity carrying
// the magnitude, so the panel reads as one family instead of a categorical
// rainbow.
//
// The alpha is normalised across the bars actually on screen rather than taken
// straight from total/max. Real category totals cluster (370 / 232 / 205 maps
// to alpha 1.00 / 0.80 / 0.75, which the eye cannot separate); stretching the
// visible range over the full ramp keeps the steps legible while still ordering
// strictly by bar length.
export function expenseBarColor(total, max, min) {
  const span = max - min;
  const t = span > 0 ? (total - min) / span : 1;
  return `rgb(var(--c-accent) / ${(0.45 + 0.55 * t).toFixed(2)})`;
}

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
