/**
 * Ported verbatim from app.js — getTodayKey()/getMonthKey() intentionally use
 * toISOString() (UTC), matching the legacy app's existing (untouched)
 * behavior rather than the browser's local timezone.
 */
export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export function formatMoney(amount) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDate(value) {
  if (!value) return "ไม่มีวันครบกำหนด";
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function relativeTime(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} นาทีที่แล้ว`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
  const days = Math.floor(diff / 86400000);
  if (days === 1) return "เมื่อวาน";
  if (days < 7) return `${days} วันที่แล้ว`;
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" }).format(new Date(ts));
}

const NOTE_HTML_RE = /<[a-z!/][\s\S]*>/i;

export function isRichNote(body) {
  return !!body && NOTE_HTML_RE.test(body);
}

export function notePlainText(body) {
  if (!body) return "";
  if (!NOTE_HTML_RE.test(body)) return body.replace(/\s+/g, " ").trim();
  if (typeof document === "undefined") return body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const tmp = document.createElement("div");
  tmp.innerHTML = body;
  tmp.querySelectorAll("img").forEach((el) => el.remove());
  return (tmp.textContent || "").replace(/\s+/g, " ").trim();
}

export function parseTags(tags) {
  return tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
}

export function getDeadlineInfo(due, done) {
  if (!due || done) return null;
  const today = getTodayKey();
  const diff = Math.floor((new Date(due).getTime() - new Date(today).getTime()) / 86400000);
  if (diff < 0) return { type: "overdue", days: -diff };
  if (diff === 0) return { type: "today" };
  if (diff <= 3) return { type: "soon", days: diff };
  return null;
}
