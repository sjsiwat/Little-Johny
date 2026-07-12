import './fab.js';

/* ================================================================
   CONSTANTS
   ================================================================ */

/* ── Module-level mutable state ── */
let toastTimer = null;
let _noteModalEditId  = null;
let _editingExpenseId = null;
let _taskModalEditId  = null;
let _dragTaskId       = null;
let _expensePeriod    = 'month'; // 'today' | 'month' | 'year' | 'all'

/* ── Task / priority ── */
const PRIORITY_RANK   = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const PRIORITY_COLORS = { Critical: '#FF453A', High: '#FF9F0A', Medium: '#0A84FF', Low: '#8E8E93' };

const TASK_LABELS = [
  { id: "urgent",   name: "ด่วน",     color: "#FF453A" },
  { id: "work",     name: "งาน",      color: "#0A84FF" },
  { id: "personal", name: "ส่วนตัว",  color: "#BF5AF2" },
  { id: "followup", name: "ติดตาม",   color: "#FF9F0A" },
  { id: "idea",     name: "ไอเดีย",   color: "#30D158" },
  { id: "meeting",  name: "ประชุม",   color: "#64D2FF" },
];

const STATUS_META = {
  todo:        { label: "สิ่งที่ต้องทำ", color: "#6F7480" },
  in_progress: { label: "กำลังทำ",      color: "#0A84FF" },
  review:      { label: "รอตรวจ",       color: "#FF9F0A" },
  done:        { label: "เสร็จแล้ว",    color: "#30D158" },
};

/* ── Expense ── */
const EXPENSE_CATEGORIES = ["อาหาร","เครื่องดื่ม","เดินทาง","น้ำมัน","ค่าไฟ","ค่าน้ำ","อินเทอร์เน็ต","สุขภาพ","ช้อปปิ้ง","การศึกษา","ลงทุน","อื่นๆ"];
const EXPENSE_BAR_COLORS = {
  "อาหาร": "#FF9F0A", "เครื่องดื่ม": "#64D2FF", "เดินทาง": "#BF5AF2",
  "น้ำมัน": "#FF9F0A", "ค่าไฟ": "#FF6B6B", "ค่าน้ำ": "#64D2FF",
  "อินเทอร์เน็ต": "#0A84FF", "สุขภาพ": "#30D158", "ช้อปปิ้ง": "#FF6B6B",
  "การศึกษา": "#30D158", "ลงทุน": "#BF5AF2", "อื่นๆ": "#8E8E93",
};

const EXPENSE_ICONS = {
  "อาหาร":"🍜","เครื่องดื่ม":"☕","เดินทาง":"🚌","น้ำมัน":"⛽",
  "ค่าไฟ":"⚡","ค่าน้ำ":"💧","อินเทอร์เน็ต":"📡","สุขภาพ":"🏥",
  "ช้อปปิ้ง":"🛍️","การศึกษา":"📚","ลงทุน":"📈","อื่นๆ":"📦",
};

/* ── Icons ── */
const ICON_EDIT = '<svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><path d="M7.5 1.5l2 2-6 6H1.5v-2l6-6z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';

/* ── Thai locale ── */
const THAI_MONTHS = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const THAI_DOW    = ["อา","จ","อ","พ","พฤ","ศ","ส"];

const THAI_HOLIDAYS = {
  // 2025
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
  // 2026
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

function normalizeStatus(s) {
  if (s === "Pending")     return "todo";
  if (s === "Completed")   return "done";
  if (s === "In Progress") return "in_progress";
  if (s === "Review")      return "review";
  return s || "todo";
}

function isTaskDone(t) { return t.status === "done"; }

function getStatusLabel(status) {
  return STATUS_META[status]?.label || status;
}

function getDeadlineInfo(due, done) {
  if (!due || done) return null;
  const today = getTodayKey();
  const diff  = Math.floor((new Date(due) - new Date(today)) / 86400000);
  if (diff < 0)  return { type: "overdue", days: -diff };
  if (diff === 0) return { type: "today" };
  if (diff <= 3)  return { type: "soon",   days: diff };
  return null;
}


let _calYear  = new Date().getFullYear();
let _calMonth = new Date().getMonth();
let _calSelectedDate = null;
const TOAST_META = {
  success: { label: "SUCCESS", cls: "app-toast--success" },
  error:   { label: "ERROR",   cls: "app-toast--error" },
  warning: { label: "WARNING", cls: "app-toast--warning" },
  info:    { label: "INFO",    cls: "app-toast--info" },
};

function showToast(title, type = "success", description = "") {
  const existing = document.getElementById("app-toast");
  if (existing) existing.remove();
  if (toastTimer) clearTimeout(toastTimer);
  const meta = TOAST_META[type] || TOAST_META.success;
  const toast = document.createElement("div");
  toast.id = "app-toast";
  toast.className = `app-toast ${meta.cls}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.innerHTML = `
    <div class="app-toast-head">
      <span class="app-toast-label"><span class="app-toast-dot"></span>${meta.label}</span>
      <button class="app-toast-close" type="button" aria-label="ปิด">&times;</button>
    </div>
    <strong class="app-toast-title">${escapeHtml(title)}</strong>
    ${description ? `<p class="app-toast-desc">${escapeHtml(description)}</p>` : ""}
  `;
  toast.querySelector(".app-toast-close").addEventListener("click", () => toast.remove());
  document.body.appendChild(toast);
  toastTimer = setTimeout(() => toast.remove(), 4000);
}

const defaultState = {
  theme: "light",
  tasks: [],
  notes: [],
  expenses: [],
  logs: []
};

// True only when the synchronous init below actually pulled from LOCAL_KEY —
// lets initAuth() know whether a confirmed-logged-out result needs to purge
// a stale/expired cached account snapshot before the auth gate is shown.
let _usedCachedLocal = Storage.hasAuthHint();

let state = (() => {
  // Only trust cached account data if the last known state on this device
  // was signed in. Otherwise (never logged in, logged out, or a stale/expired
  // hint) start empty — the app requires login before any data exists.
  const s = _usedCachedLocal ? Storage.loadLocal(defaultState) : defaultState;
  s.tasks = (s.tasks || []).map(t => ({
    description: "",
    labels: [],
    target_value: null,
    target_unit: "",
    progress_value: 0,
    ...t,
    status: normalizeStatus(t.status),
  }));
  s.notes = s.notes || [];
  s.expenses = s.expenses || [];
  return s;
})();

const views = {
  dashboard: document.getElementById("dashboard"),
  tasks: document.getElementById("tasks"),
  notes: document.getElementById("notes"),
  expenses: document.getElementById("expenses"),
  calendar: document.getElementById("calendar"),
  review: document.getElementById("review"),
};

const viewTitles = {
  dashboard: "Dashboard",
  tasks: "Tasks",
  notes: "Notes",
  expenses: "Expenses",
  calendar: "Calendar",
  review: "Review",
};

function saveState() {
  Storage.save(state);
}

function getTodayKey() { return new Date().toISOString().slice(0, 10); }
function getMonthKey() { return new Date().toISOString().slice(0, 7); }

function formatMoney(amount) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0
  }).format(amount || 0);
}

function formatDate(value) {
  if (!value) return "ไม่มีวันครบกำหนด";
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function setView(viewName) {
  Object.entries(views).forEach(([name, element]) => {
    element.classList.toggle("active", name === viewName);
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.view === viewName);
  });

  document.getElementById("viewTitle").textContent = viewTitles[viewName];
  window.history.replaceState(null, "", `#${viewName}`);
}

function render() {
  document.documentElement.dataset.theme = state.theme;
  renderShell();
  renderDashboard();
  renderTasks();
  renderNotes();
  renderExpenses();
  renderCalendar();
  renderReview();
  saveState();
}

function renderAfterTask() {
  renderShell(); renderDashboard(); renderTasks(); renderCalendar(); saveState();
}
function renderAfterNote() {
  renderShell(); renderDashboard(); renderNotes(); saveState();
}
function renderAfterExpense() {
  renderShell(); renderDashboard(); renderExpenses(); saveState();
}

function updateClock() {
  const now = new Date();
  const timeEl = document.getElementById("todayTime");
  if (timeEl) {
    timeEl.textContent = "  ·  " + now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
}

function renderShell() {
  updateClock();

  const openItems = state.tasks.filter((task) => !isTaskDone(task));

  // ── Quick-tiles (dashboard top) ─────────────────────────
  const todayKey = getTodayKey();
  const todayExpense = state.expenses
    .filter((e) => e.date === todayKey)
    .reduce((s, e) => s + Number(e.amount), 0);
  const doneTasks = state.tasks.filter((t) => isTaskDone(t));

  const sbTotal   = document.getElementById("sbStatTotal");
  const sbOpen    = document.getElementById("sbStatOpen");
  const sbDone    = document.getElementById("sbStatDone");
  const sbExpense = document.getElementById("sbStatExpense");
  if (sbTotal)   sbTotal.textContent   = state.tasks.length;
  if (sbOpen)    sbOpen.textContent    = openItems.length;
  if (sbDone)    sbDone.textContent    = doneTasks.length;
  if (sbExpense) sbExpense.textContent = `฿${todayExpense.toLocaleString("th-TH")}`;

  // Stat card trends — computed from real data, no hardcoded deltas
  const todayAdded = state.tasks.filter(t =>
    t.createdAt && new Date(t.createdAt).toISOString().slice(0, 10) === todayKey
  ).length;
  const urgentCount = openItems.filter(t => t.priority === "Critical" || t.priority === "High").length;
  const monthExpense = state.expenses
    .filter(e => e.date?.startsWith(getMonthKey()))
    .reduce((s, e) => s + Number(e.amount), 0);

  const sbTrendTotal   = document.getElementById("sbTrendTotal");
  const sbTrendOpen    = document.getElementById("sbTrendOpen");
  const sbTrendDone    = document.getElementById("sbTrendDone");
  const sbTrendExpense = document.getElementById("sbTrendExpense");

  if (sbTrendTotal) {
    sbTrendTotal.textContent = todayAdded > 0 ? `+${todayAdded} วันนี้` : state.tasks.length === 0 ? "ยังไม่มีงาน" : "";
  }
  if (sbTrendOpen) {
    sbTrendOpen.textContent = openItems.length === 0
      ? "ไม่มีงานค้าง"
      : urgentCount > 0 ? `${urgentCount} สำคัญ/ด่วน` : "";
  }
  if (sbTrendDone) {
    sbTrendDone.textContent = doneTasks.length > 0 && state.tasks.length > 0
      ? `${Math.round(doneTasks.length / state.tasks.length * 100)}% ของทั้งหมด`
      : "";
  }
  if (sbTrendExpense) {
    sbTrendExpense.textContent = monthExpense > todayExpense
      ? `฿${monthExpense.toLocaleString("th-TH")} เดือนนี้`
      : monthExpense === 0 ? "ยังไม่มีรายจ่าย" : "";
  }

  // ── Today Command Center ─────────────────────────────────
  const hour = new Date().getHours();
  const greetingMap = [
    [5,  11, "สวัสดีตอนเช้า",  "Good morning"],
    [12, 17, "สวัสดีตอนบ่าย", "Good afternoon"],
    [18, 23, "สวัสดีตอนเย็น", "Good evening"],
    [0,   4, "ดึกแล้วนะ",      "Late night"]
  ];
  const [,, thaiGreet] = greetingMap.find(([s, e]) => hour >= s && hour <= e) ?? greetingMap[0];

  const greetingHeading = document.getElementById("greetingHeading");
  if (greetingHeading) greetingHeading.textContent = thaiGreet;
  const greetingDateText = document.getElementById("greetingDateText");
  if (greetingDateText) greetingDateText.textContent = new Intl.DateTimeFormat("th-TH", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  }).format(new Date());
}

let _clockInterval = null;

function renderDashboard() {
  const openTasks = state.tasks.filter((task) => !isTaskDone(task));
  const doneTasks = state.tasks.filter((task) => isTaskDone(task));
  const monthExpense = state.expenses
    .filter((expense) => expense.date?.startsWith(getMonthKey()))
    .reduce((sum, expense) => sum + Number(expense.amount), 0);


  const focus = [...openTasks]
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
    .slice(0, 5);

  document.getElementById("focusList").innerHTML = focus.length
    ? focus.map(renderSimpleTask).join("")
    : emptyState("ยังไม่มีงานค้าง ลองกดเพิ่มงานแรกเพื่อเริ่มจัดลำดับวันของคุณ", "tasks", "เพิ่มงานแรก");

  document.getElementById("recentNotes").innerHTML = state.notes.length
    ? [...state.notes]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map(renderSimpleNote)
        .join("")
    : emptyState("ยังไม่มีโน้ต ลองบันทึกไอเดียหรือความคิดแรกของ Johny OS", "notes", "เขียนโน้ต");

  // Calendar heading + today's tasks
  const calHead = document.getElementById("calTodayHeading");
  if (calHead) {
    calHead.textContent = new Intl.DateTimeFormat("th-TH", {
      day: "numeric", month: "long", year: "numeric"
    }).format(new Date());
  }
  const todayKey = getTodayKey();
  const todayTasks = state.tasks.filter(t => t.due === todayKey);
  const calEventsEl = document.getElementById("todayCalEvents");
  if (calEventsEl) {
    if (todayTasks.length) {
      calEventsEl.innerHTML = todayTasks.map(t => `
        <div class="dash-cal-task dash-cal-task--${t.priority.toLowerCase()}${isTaskDone(t) ? ' is-done' : ''}">
          <span class="dash-cal-pip"></span>
          <span class="dash-cal-title">${escapeHtml(t.title)}</span>
          <span class="priority-${t.priority} dash-cal-badge">${t.priority}</span>
        </div>`).join("");
    } else {
      calEventsEl.innerHTML = `<div class="cal-empty-state">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" style="opacity:0.35"><rect x="2.5" y="5" width="23" height="20.5" rx="4.5" stroke="currentColor" stroke-width="1.8"/><path d="M9 2.5v5M19 2.5v5M2.5 12h23" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <p>ไม่มีกำหนดการวันนี้</p>
      </div>`;
    }
  }

  renderExpenseBars();
  renderWeeklyReviewDash();

  // Real data is in the DOM at this point — safe to kick off the
  // one-time entrance stagger + count-up (no-op after the first call).
  runDashboardEntranceOnce({
    total: state.tasks.length,
    open: openTasks.length,
    done: doneTasks.length,
    expense: state.expenses
      .filter((e) => e.date === todayKey)
      .reduce((sum, e) => sum + Number(e.amount), 0),
  });
}

function renderExpenseBars() {
  const totals = state.expenses.reduce((groups, expense) => {
    groups[expense.category] = (groups[expense.category] || 0) + Number(expense.amount);
    return groups;
  }, {});

  const rows = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const max = Math.max(...rows.map((row) => row[1]), 1);
  document.getElementById("expenseBars").innerHTML = rows.length
    ? rows
        .map(([category, total]) => {
          const width = Math.max(6, Math.round((total / max) * 100));
          const color = EXPENSE_BAR_COLORS[category] || "#0A84FF";
          return `
            <div class="bar-row">
              <div class="bar-label"><span>${category}</span><strong>${formatMoney(total)}</strong></div>
              <div class="bar-track"><div class="bar-fill" style="width:${width}%; --bar-color:${color};"></div></div>
            </div>
          `;
        })
        .join("")
    : emptyState("ยังไม่มีรายจ่ายให้สรุป ลองบันทึกกาแฟ มื้อกลางวัน หรือค่าเดินทางรายการแรก", "expenses", "บันทึกรายจ่าย");
}

/* ── Review ── */
let _reviewTab = "daily";

function renderWeeklyReviewDash() {
  const el = document.getElementById("dashReviewStats");
  if (!el) return;
  const monthKey = getMonthKey();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekStartKey = weekStart.toISOString().slice(0, 10);
  const weekDone = state.tasks.filter(t => isTaskDone(t) && t.due >= weekStartKey).length;
  const monthExpense = state.expenses
    .filter(e => e.date?.startsWith(monthKey))
    .reduce((s, e) => s + Number(e.amount), 0);
  const monthNotes = state.notes.filter(n =>
    n.createdAt && new Date(n.createdAt).toISOString().slice(0, 7) === monthKey
  ).length;
  el.innerHTML = `
    <div class="review-dash-grid">
      <div class="review-dash-stat">
        <strong>${weekDone}</strong>
        <span>งานเสร็จสัปดาห์นี้</span>
      </div>
      <div class="review-dash-stat">
        <strong>${formatMoney(monthExpense)}</strong>
        <span>รายจ่ายเดือนนี้</span>
      </div>
      <div class="review-dash-stat">
        <strong>${monthNotes}</strong>
        <span>โน้ตเดือนนี้</span>
      </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   MOTION — dashboard entrance stagger + number count-up.
   Pure presentation layer: only reads state already rendered by
   renderShell()/renderDashboard(), never touches Supabase/storage.
   Runs once per session, the first time real data is on screen.
   ════════════════════════════════════════════════════════════ */

let _dashEntranceStarted = false;

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

// Numeric twin of the --ease-out-soft CSS curve (CSS easing can't
// interpolate a text node, so the count-up paces itself with this).
function easeOutSoft(t) {
  return 1 - Math.pow(1 - t, 3);
}

function countUpNumber(el, target, { duration = 600, format = (n) => String(n) } = {}) {
  if (!el) return;
  if (prefersReducedMotion() || target === 0) {
    el.textContent = format(target);
    return;
  }
  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    el.textContent = format(Math.round(target * easeOutSoft(t)));
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function runDashboardEntranceOnce(stats) {
  // The stagger-in reveal is genuinely one-time, but the numbers themselves
  // must stay live — later renders (post-login cloud replace, guest reset
  // on sign-out, etc.) still need sbStat* to reflect the current state, not
  // freeze at whatever was on screen during the very first paint.
  if (!_dashEntranceStarted) {
    _dashEntranceStarted = true;

    if (!prefersReducedMotion()) {
      const STAGGER_MS = 70;
      const statCards = document.querySelectorAll(".quick-tiles .sb-stat");
      const widgetCards = document.querySelectorAll(".dashboard-grid .panel");

      statCards.forEach((card, i) => {
        card.style.animationDelay = `${i * STAGGER_MS}ms`;
        card.classList.add("dash-stagger-in");
      });
      widgetCards.forEach((card, i) => {
        card.style.animationDelay = `${(statCards.length + i) * STAGGER_MS}ms`;
        card.classList.add("dash-stagger-in");
      });
    }
  }

  countUpNumber(document.getElementById("sbStatTotal"), stats.total);
  countUpNumber(document.getElementById("sbStatOpen"),  stats.open);
  countUpNumber(document.getElementById("sbStatDone"),  stats.done);
  countUpNumber(document.getElementById("sbStatExpense"), stats.expense, {
    format: (n) => `฿${n.toLocaleString("th-TH")}`,
  });
}

function renderReview() {
  const el = document.getElementById("reviewContent");
  if (!el) return;
  const todayKey = getTodayKey();
  const monthKey = getMonthKey();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekStartKey = weekStart.toISOString().slice(0, 10);

  if (_reviewTab === "daily") {
    const todayDone    = state.tasks.filter(t => isTaskDone(t) && t.due === todayKey);
    const todayOverdue = state.tasks.filter(t => !isTaskDone(t) && t.due && t.due < todayKey);
    const todayNotes   = state.notes.filter(n =>
      n.createdAt && new Date(n.createdAt).toISOString().slice(0, 10) === todayKey
    );
    const todayExpense = state.expenses
      .filter(e => e.date === todayKey)
      .reduce((s, e) => s + Number(e.amount), 0);

    const taskRow = (t, prefix, cls = "") =>
      `<div class="review-task-row${cls ? " " + cls : ""}">${prefix} ${escapeHtml(t.title)}</div>`;

    el.innerHTML = `
      <div class="review-section">
        <div class="review-stat-grid">
          <div class="review-stat-card review-stat-card--green"><strong>${todayDone.length}</strong><span>งานเสร็จวันนี้</span></div>
          <div class="review-stat-card review-stat-card--red"><strong>${todayOverdue.length}</strong><span>งานเกินกำหนด</span></div>
          <div class="review-stat-card review-stat-card--amber"><strong>${todayNotes.length}</strong><span>โน้ตวันนี้</span></div>
          <div class="review-stat-card review-stat-card--blue"><strong>${formatMoney(todayExpense)}</strong><span>รายจ่ายวันนี้</span></div>
        </div>
        ${todayDone.length ? `<div class="review-subsection"><h3>งานที่เสร็จวันนี้</h3>${todayDone.map(t => taskRow(t, "✓")).join("")}</div>` : ""}
        ${todayOverdue.length ? `<div class="review-subsection"><h3>งานที่เกินกำหนด</h3>${todayOverdue.map(t => taskRow(t, "!", "review-task-row--overdue")).join("")}</div>` : ""}
      </div>`;
  } else if (_reviewTab === "weekly") {
    const weekDone = state.tasks.filter(t => isTaskDone(t));
    const weekExpense = state.expenses
      .filter(e => e.date >= weekStartKey)
      .reduce((s, e) => s + Number(e.amount), 0);
    const weekNotes = state.notes.filter(n =>
      n.createdAt && new Date(n.createdAt).toISOString().slice(0, 10) >= weekStartKey
    ).length;
    const catTotals = state.expenses
      .filter(e => e.date >= weekStartKey)
      .reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + Number(e.amount); return acc; }, {});
    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
    const completionRate = state.tasks.length
      ? Math.round(state.tasks.filter(t => isTaskDone(t)).length / state.tasks.length * 100) : 0;

    el.innerHTML = `
      <div class="review-section">
        <div class="review-stat-grid">
          <div class="review-stat-card review-stat-card--green"><strong>${weekDone.length}</strong><span>งานเสร็จสัปดาห์นี้</span></div>
          <div class="review-stat-card review-stat-card--amber"><strong>${formatMoney(weekExpense)}</strong><span>รายจ่ายสัปดาห์นี้</span></div>
          <div class="review-stat-card review-stat-card--blue"><strong>${weekNotes}</strong><span>โน้ตสัปดาห์นี้</span></div>
          <div class="review-stat-card review-stat-card--primary"><strong>${completionRate}%</strong><span>Completion Rate</span></div>
        </div>
        ${topCat ? `<div class="review-subsection"><h3>หมวดที่ใช้มากสุดสัปดาห์นี้</h3><div class="review-top-cat">${escapeHtml(topCat[0])} · ${formatMoney(topCat[1])}</div></div>` : ""}
      </div>`;
  } else {
    const monthDone = state.tasks.filter(t => isTaskDone(t)).length;
    const monthExpense = state.expenses
      .filter(e => e.date?.startsWith(monthKey))
      .reduce((s, e) => s + Number(e.amount), 0);
    const monthNotes = state.notes.filter(n =>
      n.createdAt && new Date(n.createdAt).toISOString().slice(0, 7) === monthKey
    ).length;
    const completionRate = state.tasks.length
      ? Math.round(state.tasks.filter(t => isTaskDone(t)).length / state.tasks.length * 100) : 0;
    el.innerHTML = `
      <div class="review-section">
        <div class="review-stat-grid">
          <div class="review-stat-card review-stat-card--green"><strong>${monthDone}</strong><span>งานเสร็จเดือนนี้</span></div>
          <div class="review-stat-card review-stat-card--amber"><strong>${formatMoney(monthExpense)}</strong><span>รายจ่ายเดือนนี้</span></div>
          <div class="review-stat-card review-stat-card--blue"><strong>${monthNotes}</strong><span>โน้ตเดือนนี้</span></div>
          <div class="review-stat-card review-stat-card--primary"><strong>${completionRate}%</strong><span>Completion Rate</span></div>
        </div>
      </div>`;
  }
}

function renderTasks() {
  renderKanban();
}

function renderKanban() {
  const COLS = ["todo", "in_progress", "review", "done"];
  COLS.forEach(status => {
    const tasks = state.tasks
      .filter(t => t.status === status)
      .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);

    const countEl = document.getElementById(`kcount-${status}`);
    if (countEl) countEl.textContent = tasks.length;

    const zone = document.getElementById(`kdrop-${status}`);
    if (!zone) return;

    zone.innerHTML = tasks.length
      ? tasks.map(t => {
          const pColor = PRIORITY_COLORS[t.priority] || '#8E8E93';
          const done   = isTaskDone(t);
          const labels = t.labels?.map(id => {
            const l = TASK_LABELS.find(x => x.id === id);
            return l ? `<span class="tli-label" style="--lc:${l.color}">${escapeHtml(l.name)}</span>` : '';
          }).join('') || '';
          const dueChip = (() => {
            if (!t.due) return '';
            const info = getDeadlineInfo(t.due, done);
            if (!info) return `<span class="tli-due">${formatDate(t.due)}</span>`;
            if (info.type === 'overdue') return `<span class="tli-due tli-due--overdue">เกิน ${info.days} วัน</span>`;
            if (info.type === 'today')   return `<span class="tli-due tli-due--today">วันนี้</span>`;
            return `<span class="tli-due">${formatDate(t.due)}</span>`;
          })();
          return `
            <div class="kanban-card" draggable="true" data-task-id="${t.id}" data-drag-task="${t.id}">
              <div class="kanban-card-top">
                <span class="tli-dot" style="background:${pColor};flex-shrink:0"></span>
                <span class="kanban-card-title">${escapeHtml(t.title)}</span>
                <button class="tli-act" type="button" data-edit-task="${t.id}" title="แก้ไข" aria-label="แก้ไขงาน" style="opacity:0.6">${ICON_EDIT}</button>
              </div>
              ${t.description ? `<p class="kanban-card-desc">${escapeHtml(t.description)}</p>` : ''}
              ${labels || dueChip ? `<div class="kanban-card-footer">${labels}${dueChip}</div>` : ''}
            </div>`;
        }).join('')
      : `<div class="kanban-empty">ไม่มีงาน</div>`;
  });

  setupKanbanDragDrop();
}

function setupKanbanDragDrop() {
  document.querySelectorAll(".kanban-card").forEach(card => {
    card.addEventListener("dragstart", e => {
      _dragTaskId = card.dataset.taskId;
      card.classList.add("is-dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("is-dragging");
      document.querySelectorAll(".kanban-dropzone").forEach(z => z.classList.remove("drag-over"));
    });
  });

  document.querySelectorAll(".kanban-dropzone").forEach(zone => {
    zone.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      zone.classList.add("drag-over");
    });
    zone.addEventListener("dragleave", e => {
      if (!zone.contains(e.relatedTarget)) zone.classList.remove("drag-over");
    });
    zone.addEventListener("drop", e => {
      e.preventDefault();
      zone.classList.remove("drag-over");
      const newStatus = zone.dataset.status;
      if (_dragTaskId && newStatus) {
        state.tasks = state.tasks.map(t =>
          t.id === _dragTaskId ? { ...t, status: newStatus } : t
        );
        Storage.save(state);
        renderKanban();
        renderShell();
        showToast(`ย้ายงานไป "${getStatusLabel(newStatus)}" แล้ว`);
      }
      _dragTaskId = null;
    });
  });
}

/* ── Task Modal ── */
function openTaskModal(taskId = null, defaultStatus = "todo") {
  const modal = document.getElementById("taskModal");
  _taskModalEditId = taskId;
  const task = taskId ? state.tasks.find(t => t.id === taskId) : null;

  document.getElementById("taskModalHeading").textContent = task ? "แก้ไขงาน" : "เพิ่มงาน";
  document.getElementById("modalTaskTitle").value    = task?.title || "";
  document.getElementById("modalTaskDesc").value     = task?.description || "";
  document.getElementById("modalTaskStatus").value   = task?.status || defaultStatus;
  document.getElementById("modalTaskPriority").value = task?.priority || "Medium";
  document.getElementById("modalTaskDue").value      = task?.due || "";
  document.getElementById("taskModalDelete").hidden  = !task;

  const targetToggle = document.getElementById("taskTargetToggle");
  const targetFields = document.getElementById("taskTargetFields");
  const hasTarget = task?.target_value != null && task.target_value > 0;
  if (targetToggle) targetToggle.checked = hasTarget;
  if (targetFields) targetFields.hidden = !hasTarget;
  const tvEl = document.getElementById("modalTaskTargetValue");
  const tuEl = document.getElementById("modalTaskTargetUnit");
  const pvEl = document.getElementById("modalTaskProgressValue");
  if (tvEl) tvEl.value = hasTarget ? task.target_value : "";
  if (tuEl) tuEl.value = task?.target_unit || "";
  if (pvEl) pvEl.value = task?.progress_value > 0 ? task.progress_value : "";

  renderModalLabelPicker(task?.labels || []);
  modal.showModal();
  setTimeout(() => document.getElementById("modalTaskTitle")?.focus(), 50);
}

function closeTaskModal() {
  document.getElementById("taskModal")?.close();
  _taskModalEditId = null;
}

function renderModalLabelPicker(selectedLabels) {
  const picker = document.getElementById("modalLabelPicker");
  if (!picker) return;
  picker.innerHTML = TASK_LABELS.map(l => `
    <button type="button" class="modal-label-chip${selectedLabels.includes(l.id) ? " is-selected" : ""}"
      data-label-id="${l.id}" style="--lc:${l.color}">${escapeHtml(l.name)}
    </button>`).join("");
  picker.querySelectorAll(".modal-label-chip").forEach(chip => {
    chip.addEventListener("click", () => chip.classList.toggle("is-selected"));
  });
}

function getSelectedModalLabels() {
  return [...document.querySelectorAll(".modal-label-chip.is-selected")].map(c => c.dataset.labelId);
}

/* ── Note Modal ── */
function openNoteModal(noteId) {
  const modal = document.getElementById("noteModal");
  const note  = state.notes.find(n => n.id === noteId);
  if (!modal || !note || note._isKVLine) return;
  _noteModalEditId = noteId;
  document.getElementById("noteModalTitleInput").value = note.title || "";
  document.getElementById("noteModalBody").value       = note.body || "";
  document.getElementById("noteModalTags").value       = note.tags || "";
  const meta = document.getElementById("noteModalMeta");
  if (meta) {
    const created = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" }).format(new Date(note.createdAt));
    meta.textContent = `สร้างเมื่อ ${created} · ${relativeTime(note.createdAt)}`;
  }
  modal.showModal();
  setTimeout(() => {
    const body = document.getElementById("noteModalBody");
    if (body) { body.focus(); body.setSelectionRange(body.value.length, body.value.length); }
  }, 50);
}

function closeNoteModal() {
  document.getElementById("noteModal")?.close();
  _noteModalEditId = null;
}

function renderNotes() {
  const el = document.getElementById("noteList");
  if (!state.notes.length) {
    el.className = "item-list";
    el.innerHTML = emptyState("ยังไม่มีโน้ต เริ่มจดสิ่งที่คิดได้เลย", "notes", "เขียนโน้ต");
    return;
  }
  el.className = "note-card-grid";
  el.innerHTML = [...state.notes]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(note => {
      const tags = note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const openAttr = note._isKVLine ? "" : ` data-open-note="${note.id}" role="button" tabindex="0"`;
      const preview = notePlainText(note.body);
      return `
        <article class="note-card${note._isKVLine ? "" : " note-card--clickable"}" data-note-id="${note.id}"${openAttr}>
          <div class="note-card-head">
            <span class="note-card-title">${escapeHtml(note.title)}</span>
            <div class="note-card-acts">
              <button class="note-card-act note-card-act--del" type="button" data-delete-note="${note.id}" title="ลบโน้ต">×</button>
            </div>
          </div>
          ${preview ? `<p class="note-card-body">${escapeHtml(preview.slice(0,140))}${preview.length>140?'…':''}</p>` : ''}
          <div class="note-card-foot">
            ${tags.map(t => `<span class="tli-label" style="--lc:#5a8fa8">${escapeHtml(t)}</span>`).join('')}
            <span class="note-card-date">${relativeTime(note.createdAt)}</span>
          </div>
        </article>`;
    }).join('');
}

function renderExpenseItem(expense) {
  const icon     = EXPENSE_ICONS[expense.category] || '📦';
  const catColor = EXPENSE_BAR_COLORS[expense.category] || '#8E8E93';
  return `
    <article class="exp-item" data-expense-id="${expense.id}">
      <span class="exp-icon" style="background:${catColor}20">${icon}</span>
      <span class="exp-name">${escapeHtml(expense.title)}</span>
      <span class="exp-cat">${escapeHtml(expense.category)}</span>
      <span class="exp-amt">−${formatMoney(expense.amount)}</span>
      <div class="exp-acts">
        <button class="tli-act" type="button" data-edit-expense="${expense.id}" title="แก้ไขรายจ่าย" aria-label="แก้ไขรายจ่าย">${ICON_EDIT}</button>
        <button class="tli-act tli-act--del" type="button" data-delete-expense="${expense.id}" title="ลบรายจ่าย">×</button>
      </div>
    </article>`;
}

function renderExpenses() {
  const todayKey = getTodayKey();
  const monthKey = getMonthKey();
  const yearKey  = new Date().getFullYear().toString();

  const todayExps = state.expenses.filter(e => e.date === todayKey);
  const monthExps = state.expenses.filter(e => e.date?.startsWith(monthKey));
  const todayTotal = todayExps.reduce((s, e) => s + Number(e.amount), 0);
  const monthTotal = monthExps.reduce((s, e) => s + Number(e.amount), 0);

  const statsEl = document.getElementById("expenseStats");
  if (statsEl) {
    statsEl.innerHTML = state.expenses.length ? `
      <div class="expense-stats-row">
        <div class="expense-stat-item">
          <span class="expense-stat-label">วันนี้</span>
          <strong class="expense-stat-value">${formatMoney(todayTotal)}</strong>
          <span class="expense-stat-sub">${todayExps.length} รายการ</span>
        </div>
        <div class="expense-stat-divider"></div>
        <div class="expense-stat-item">
          <span class="expense-stat-label">เดือนนี้</span>
          <strong class="expense-stat-value">${formatMoney(monthTotal)}</strong>
          <span class="expense-stat-sub">${monthExps.length} รายการ</span>
        </div>
      </div>
    ` : "";
  }

  // Filter by selected period
  let filtered = [...state.expenses];
  if (_expensePeriod === 'today') {
    filtered = filtered.filter(e => e.date === todayKey);
  } else if (_expensePeriod === 'month') {
    filtered = filtered.filter(e => e.date?.startsWith(monthKey));
  } else if (_expensePeriod === 'year') {
    filtered = filtered.filter(e => e.date?.startsWith(yearKey));
  }
  filtered.sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.createdAt - a.createdAt);

  const listEl = document.getElementById("expenseList");
  if (!filtered.length) {
    listEl.innerHTML = emptyState("ยังไม่มีรายจ่ายในช่วงนี้", "expenses", "บันทึกรายจ่าย");
    return;
  }

  if (_expensePeriod === 'today') {
    listEl.innerHTML = `<div class="exp-list-box">${filtered.map(e =>
      e.id === _editingExpenseId ? renderExpenseEditForm(e) : renderExpenseItem(e)
    ).join("")}</div>`;
    return;
  }

  // Group by date for month/year/all views
  const groups = new Map();
  filtered.forEach(e => {
    const key = e.date || 'unknown';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  });

  listEl.innerHTML = [...groups.entries()].map(([date, exps]) => {
    const dayTotal = exps.reduce((s, e) => s + Number(e.amount), 0);
    const rows = exps.map(e =>
      e.id === _editingExpenseId ? renderExpenseEditForm(e) : renderExpenseItem(e)
    ).join("");
    return `
      <div class="exp-date-group">
        <div class="exp-date-header">
          <span class="exp-date-label">${formatDate(date)}</span>
          <span class="exp-date-total">${formatMoney(dayTotal)}</span>
        </div>
        <div class="exp-list-box">${rows}</div>
      </div>`;
  }).join("");
}

function renderExpenseEditForm(expense) {
  const catOpts = EXPENSE_CATEGORIES.map(c =>
    `<option value="${c}"${c === expense.category ? " selected" : ""}>${c}</option>`
  ).join("");
  return `
    <article class="list-item list-item--editing">
      <form class="task-edit-form" data-edit-form-expense="${expense.id}">
        <div class="task-edit-row">
          <input class="task-edit-title expense-edit-title" type="text" value="${escapeHtml(expense.title)}"
            placeholder="รายการ" required maxlength="80" autocorrect="off" />
          <input class="expense-edit-amount" type="number" value="${expense.amount}"
            min="0" step="0.01" required placeholder="฿" />
        </div>
        <div class="task-edit-row">
          <select class="task-edit-select" aria-label="หมวดหมู่">${catOpts}</select>
          <input class="task-edit-date" type="date" value="${expense.date || ""}" aria-label="วันที่" />
          <div class="task-edit-actions">
            <button type="submit" class="task-edit-save">บันทึก</button>
            <button type="button" class="task-edit-cancel" data-cancel-edit-expense="${expense.id}">ยกเลิก</button>
          </div>
        </div>
      </form>
    </article>
  `;
}

function renderCalendar() {
  const el = document.getElementById("calendar");
  if (!el) return;

  const todayKey = getTodayKey();
  const thaiYear = _calYear + 543;

  // Build tasks-by-date lookup
  const tasksByDate = {};
  state.tasks.forEach(t => {
    if (t.due) {
      if (!tasksByDate[t.due]) tasksByDate[t.due] = [];
      tasksByDate[t.due].push(t);
    }
  });

  const firstDay    = new Date(_calYear, _calMonth, 1);
  const daysInMonth = new Date(_calYear, _calMonth + 1, 0).getDate();
  const startDow    = firstDay.getDay(); // 0 = Sunday

  // Build day cells
  let cells = "";
  for (let i = 0; i < startDow; i++) {
    cells += `<div class="cal-cell cal-cell--empty"></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm      = String(_calMonth + 1).padStart(2, "0");
    const dd      = String(d).padStart(2, "0");
    const dateKey = `${_calYear}-${mm}-${dd}`;
    const isToday    = dateKey === todayKey;
    const isSelected = dateKey === _calSelectedDate;
    const holiday    = THAI_HOLIDAYS[dateKey];
    const tasks      = tasksByDate[dateKey] || [];
    const dow        = new Date(_calYear, _calMonth, d).getDay();
    const isWeekend  = dow === 0 || dow === 6;

    const dotColors = [...tasks]
      .sort((a, b) => (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9))
      .slice(0, 3)
      .map(t => `<span class="cal-dot cal-dot--${t.priority.toLowerCase()}${isTaskDone(t) ? ' cal-dot--done' : ''}"></span>`)
      .join("");

    cells += `
      <button class="cal-cell${isToday ? " is-today" : ""}${isSelected ? " is-selected" : ""}${isWeekend ? " is-weekend" : ""}${holiday ? " has-holiday" : ""}"
              data-cal-date="${dateKey}" type="button" aria-label="${dateKey}${holiday ? ' ' + holiday.name : ''}">
        <span class="cal-num">${d}</span>
        ${holiday ? `<span class="cal-hday-pip cal-hday-pip--${holiday.type}" title="${holiday.name}"></span>` : ""}
        ${tasks.length ? `<span class="cal-dots">${dotColors}${tasks.length > 3 ? `<span class="cal-dot-more">+${tasks.length - 3}</span>` : ""}</span>` : ""}
      </button>`;
  }

  // Day panel
  const dayPanelHtml = _calSelectedDate
    ? renderCalDayPanel(_calSelectedDate, tasksByDate[_calSelectedDate] || [])
    : `<div class="cal-empty-hint"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity=".25"><rect x="3" y="5" width="26" height="24" rx="4" stroke="currentColor" stroke-width="2"/><path d="M3 13h26" stroke="currentColor" stroke-width="2"/><path d="M10 3v4M22 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><p>กดที่วันที่เพื่อดูงานและเพิ่ม task</p></div>`;

  el.innerHTML = `
    <div class="cal-layout">

      <div class="cal-main">
        <div class="cal-header">
          <button class="cal-nav-btn" data-cal-prev type="button" aria-label="เดือนก่อน">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 14L7 9l4-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="cal-title-wrap">
            <span class="cal-month-name">${THAI_MONTHS[_calMonth]}</span>
            <span class="cal-year">${thaiYear}</span>
          </div>
          <button class="cal-nav-btn" data-cal-next type="button" aria-label="เดือนถัดไป">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l4 5-4 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>

        <div class="cal-dow-row">
          ${THAI_DOW.map((d, i) => `<span class="cal-dow${i === 0 || i === 6 ? " is-weekend" : ""}">${d}</span>`).join("")}
        </div>

        <div class="cal-grid">${cells}</div>

        <div class="cal-legend">
          <span class="cal-legend-item"><span class="cal-hday-pip cal-hday-pip--national"></span>วันหยุดราชการ</span>
          <span class="cal-legend-item"><span class="cal-hday-pip cal-hday-pip--buddhist"></span>วันสำคัญทางพุทธ</span>
          <span class="cal-legend-item"><span class="cal-hday-pip cal-hday-pip--royal"></span>วันราชพิธี</span>
        </div>
      </div>

      <aside class="cal-side" id="calSidePanel">${dayPanelHtml}</aside>

    </div>`;
}

function renderCalDayPanel(dateKey, tasks) {
  const holiday  = THAI_HOLIDAYS[dateKey];
  const [y, m, d] = dateKey.split("-");
  const thaiYear  = Number(y) + 543;
  const dateLabel = `${Number(d)} ${THAI_MONTHS[Number(m) - 1]} ${thaiYear}`;

  const openTasks = tasks.filter(t => !isTaskDone(t));
  const doneTasks = tasks.filter(t => isTaskDone(t));
  const allRows   = [...openTasks, ...doneTasks];

  const taskRows = allRows.length
    ? allRows.map(t => `
        <div class="cal-task-row${isTaskDone(t) ? " is-done" : ""}">
          <span class="cal-task-pip cal-task-pip--${t.priority.toLowerCase()}"></span>
          <span class="cal-task-name">${escapeHtml(t.title)}</span>
          <span class="priority-${t.priority} cal-task-badge">${t.priority}</span>
        </div>`).join("")
    : `<p class="cal-no-tasks">ไม่มีงานในวันนี้</p>`;

  return `
    <div class="cal-day-hdr">
      <span class="cal-day-label">${dateLabel}</span>
      ${holiday ? `<span class="cal-day-holiday cal-day-holiday--${holiday.type}">${holiday.name}</span>` : ""}
    </div>
    <div class="cal-task-rows">${taskRows}</div>
    <form class="cal-add-form" id="calAddForm" data-add-date="${dateKey}">
      <input class="cal-add-input" type="text" id="calAddInput" placeholder="เพิ่มงานสำหรับวันนี้…" autocomplete="off" />
      <div class="cal-add-row">
        <select class="cal-add-select" id="calAddPriority">
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
          <option value="Low">Low</option>
        </select>
        <button class="cal-add-btn" type="submit">+ เพิ่ม</button>
      </div>
    </form>`;
}


function renderSimpleTask(task) {
  const pColor = PRIORITY_COLORS[task.priority] || '#8E8E93';
  return `
    <div class="dash-task-row">
      <span class="tli-dot" style="background:${pColor}"></span>
      <span class="dash-task-title">${escapeHtml(task.title)}</span>
      <span class="tli-badge" style="--bc:${pColor}18;--bt:${pColor}">${task.priority}</span>
      ${task.due ? `<span class="tli-due">${formatDate(task.due)}</span>` : ''}
    </div>`;
}

function relativeTime(ts) {
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

const ICON_NOTE_DOC = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 1.5h5.5L11.5 4.5V12a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V2.5a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M8.5 1.5v3h3" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M5 8h4M5 10.2h2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>';

/* Strip rich-text/HTML from a note body → plain text for card previews. */
function notePlainText(body) {
  if (!body) return "";
  if (!/<[a-z!/][\s\S]*>/i.test(body)) return body.replace(/\s+/g, " ").trim();
  const tmp = document.createElement("div");
  tmp.innerHTML = body;
  tmp.querySelectorAll(".doc-img, .doc-img-handle, .doc-img-del, img").forEach(el => el.remove());
  return (tmp.textContent || "").replace(/\s+/g, " ").trim();
}

function renderSimpleNote(note) {
  const tags = note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const preview = notePlainText(note.body);
  const openAttr = note._isKVLine ? "" : ` data-open-note="${note.id}"`;
  return `
    <button class="dash-note-item" type="button"${openAttr}>
      <span class="dash-note-icon">${ICON_NOTE_DOC}</span>
      <span class="dash-note-main">
        <span class="dash-note-item-title">${escapeHtml(note.title)}</span>
        ${preview ? `<span class="dash-note-item-preview">${escapeHtml(preview.slice(0, 90))}${preview.length > 90 ? "…" : ""}</span>` : ""}
      </span>
      <span class="dash-note-side">
        ${tags.slice(0, 2).map(t => `<span class="tli-label" style="--lc:#5a8fa8">${escapeHtml(t)}</span>`).join('')}
        <span class="dash-note-item-date">${relativeTime(note.createdAt)}</span>
      </span>
    </button>`;
}

function emptyState(message, view = "dashboard", action = "เริ่มใช้งาน") {
  return `
    <div class="empty-state">
      <strong>${escapeHtml(message)}</strong>
      <button class="empty-action" type="button" data-view-jump="${view}">${escapeHtml(action)}</button>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ── Auth gate ↔ App routing ──
   The Dashboard requires a signed-in session — there is no guest/demo mode.
   Marketing/landing content now lives on the site/ (Next.js) app; this app
   only ever shows either the auth gate or the authenticated workspace. ── */
let _syncedUserId = null; // guard against double onSignedIn (Auth.init + onChange race)

function showApp() {
  document.getElementById("authGate")?.style.setProperty("display", "none");
  document.querySelector(".app-shell")?.style.removeProperty("display");
  if (!_clockInterval) _clockInterval = setInterval(updateClock, 1000);
}

function showAuthGate() {
  document.getElementById("authGate")?.style.removeProperty("display");
  document.querySelector(".app-shell")?.style.setProperty("display", "none");
  clearInterval(_clockInterval);
  _clockInterval = null;
}

// Clears any cached account snapshot and resets to an empty state. Called on
// sign-out and whenever the async session check finds no active user but a
// stale/expired cached snapshot was optimistically loaded from localStorage.
function clearToLoggedOut() {
  Storage.setAuthHint(false);
  Storage.clearLocal();
  state = { theme: state.theme || "light", tasks: [], notes: [], expenses: [], logs: [] };
  render();
}

function addTask(title, priority = "Medium", due = "", status = "todo", description = "", labels = [], targetValue = null, targetUnit = "") {
  state.tasks.unshift({
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
    createdAt: Date.now()
  });
}

function formatNum(n) {
  const num = Number(n || 0);
  return num % 1 === 0
    ? num.toLocaleString('th-TH')
    : num.toLocaleString('th-TH', { maximumFractionDigits: 2 });
}

function addNote(title, body = "", tags = "") {
  state.notes.unshift({
    id: crypto.randomUUID(),
    title,
    body,
    tags,
    createdAt: Date.now()
  });
}

function addExpense(title, amount, category = "อื่นๆ", date = getTodayKey()) {
  state.expenses.unshift({
    id: crypto.randomUUID(),
    title,
    amount: Number(amount),
    category,
    date,
    createdAt: Date.now()
  });
}


function parseCommand(rawText) {
  const text = rawText.trim();
  if (!text) return "ยังไม่ได้พิมพ์คำสั่ง";

  if (text.startsWith("เพิ่มงาน")) {
    const title = text.replace("เพิ่มงาน", "").trim() || "งานใหม่จาก Secretary";
    addTask(title, "Medium", "", "todo", "", []);
    render(); saveState();
    return `เพิ่มงานแล้ว: ${title}`;
  }

  if (text.startsWith("โน้ต:") || text.startsWith("note:")) {
    const body  = text.replace(/^โน้ต:|^note:/i, "").trim();
    const title = body.split("\n")[0].trim() || "โน้ตใหม่";
    addNote(title, body, "secretary");
    render(); saveState();
    return `บันทึกโน้ตแล้ว: ${title}`;
  }

  if (text.startsWith("จ่าย")) {
    const parts       = text.split(/\s+/);
    const amountIndex = parts.findIndex((p) => Number.isFinite(Number(p)));
    if (amountIndex > 0) {
      const title    = parts.slice(1, amountIndex).join(" ").trim() || "รายจ่าย";
      const amount   = Number(parts[amountIndex]);
      const category = parts[amountIndex + 1] || "อื่นๆ";
      addExpense(title, amount, category, getTodayKey());
      render(); saveState();
      return `บันทึกรายจ่ายแล้ว: ${title} ${formatMoney(amount)}`;
    }
  }

  if (text.includes("วันนี้มีงานอะไร")) {
    const openTasks = state.tasks.filter((task) => !isTaskDone(task));
    return openTasks.length
      ? `งานค้างตอนนี้: ${openTasks.map((task) => task.title).join(", ")}`
      : "วันนี้ยังไม่มีงานค้าง";
  }

  if (text.includes("สรุปรายจ่าย")) {
    const total = state.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    return `รายจ่ายทั้งหมดที่บันทึกไว้ตอนนี้คือ ${formatMoney(total)}`;
  }

  return "ยังไม่เข้าใจคำสั่งนี้ ตอนนี้รองรับ:\nเพิ่มงาน, โน้ต:, จ่าย, วันนี้มีงานอะไร, สรุปรายจ่าย";
}

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setView(link.dataset.view);
  });
});

document.querySelectorAll("[data-view-jump]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.viewJump));
});

document.getElementById("themeToggle").addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = state.theme;
  saveState();
});

/* ── Secretary command bar ── */
(function () {
  const input  = document.getElementById("secInput");
  const btn    = document.getElementById("secBtn");
  const output = document.getElementById("secOutput");
  if (!input || !btn || !output) return;

  function runCmd() {
    const raw = input.value.trim();
    if (!raw) return;
    const result = parseCommand(raw);
    output.textContent = result;
    output.hidden = false;
    input.value = "";
    input.focus();
    setTimeout(() => { output.hidden = true; }, 4000);
  }

  btn.addEventListener("click", runCmd);
  input.addEventListener("keydown", e => { if (e.key === "Enter") runCmd(); });
})();

/* ── Open add task modal ── */
document.getElementById("openAddTask")?.addEventListener("click", () => openTaskModal());

/* ── Task modal form submit ── */
document.getElementById("taskModalForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("modalTaskTitle").value.trim();
  if (!title) return;
  const status      = document.getElementById("modalTaskStatus").value;
  const priority    = document.getElementById("modalTaskPriority").value;
  const due         = document.getElementById("modalTaskDue").value;
  const description = document.getElementById("modalTaskDesc").value.trim();
  const labels      = getSelectedModalLabels();
  const hasTarget   = document.getElementById("taskTargetToggle")?.checked;
  const targetValue = hasTarget ? (Number(document.getElementById("modalTaskTargetValue")?.value) || null) : null;
  const targetUnit  = hasTarget ? (document.getElementById("modalTaskTargetUnit")?.value.trim() || "") : "";
  const progRaw     = document.getElementById("modalTaskProgressValue")?.value;
  const progressVal = progRaw !== "" ? Number(progRaw) : null; // null = keep existing

  if (_taskModalEditId) {
    const existing = state.tasks.find(t => t.id === _taskModalEditId);
    state.tasks = state.tasks.map(t =>
      t.id === _taskModalEditId
        ? { ...t, title, description, status, priority, due, labels,
            target_value: targetValue, target_unit: targetUnit,
            progress_value: progressVal !== null ? progressVal : (existing?.progress_value || 0) }
        : t
    );
    showToast(`อัปเดตงาน "${title}" แล้ว`);
  } else {
    addTask(title, priority, due, status, description, labels, targetValue, targetUnit);
    showToast(`เพิ่มงาน "${title}" แล้ว`);
  }
  closeTaskModal();
  renderAfterTask();
});

/* ── Task modal cancel & close ── */
document.getElementById("taskTargetToggle")?.addEventListener("change", e => {
  const fields = document.getElementById("taskTargetFields");
  if (fields) fields.hidden = !e.target.checked;
  if (e.target.checked) document.getElementById("modalTaskTargetValue")?.focus();
});

document.getElementById("taskModalCancel")?.addEventListener("click", closeTaskModal);
document.getElementById("taskModalClose")?.addEventListener("click", closeTaskModal);
document.getElementById("taskModal")?.addEventListener("click", e => {
  if (e.target === e.currentTarget) closeTaskModal();
});

/* ── Task modal delete ── */
document.getElementById("taskModalDelete")?.addEventListener("click", () => {
  const task = _taskModalEditId && state.tasks.find(t => t.id === _taskModalEditId);
  if (!task || !confirm(`ลบงาน "${task.title}"?`)) return;
  state.tasks = state.tasks.filter(t => t.id !== _taskModalEditId);
  Storage.deleteRow('tasks', task.id);
  closeTaskModal();
  renderAfterTask();
  showToast("ลบงานแล้ว");
});

/* ── Kanban add buttons ── */
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-kanban-add]");
  if (btn) openTaskModal(null, btn.dataset.kanbanAdd);
});

/* ── FAB open task modal ── */
document.addEventListener("click", e => {
  if (e.target.closest("[data-open-task-modal]")) {
    setView("tasks");
    openTaskModal();
  }
});

/* ── Note modal: save / cancel / close / delete ── */
document.getElementById("noteModalForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("noteModalTitleInput").value.trim();
  if (!title || !_noteModalEditId) return;
  const body = document.getElementById("noteModalBody").value.trim();
  const tags = document.getElementById("noteModalTags").value.trim();
  state.notes = state.notes.map(n =>
    n.id === _noteModalEditId ? { ...n, title, body, tags } : n
  );
  closeNoteModal();
  renderAfterNote();
  showToast(`บันทึกโน้ต "${title}" แล้ว`);
});

document.getElementById("noteModalCancel")?.addEventListener("click", closeNoteModal);
document.getElementById("noteModalClose")?.addEventListener("click", closeNoteModal);
document.getElementById("noteModal")?.addEventListener("click", e => {
  if (e.target === e.currentTarget) closeNoteModal();
});

/* Open note card with Enter/Space when focused via keyboard */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target instanceof HTMLElement ? e.target.closest("article[data-open-note]") : null;
  if (card) { e.preventDefault(); openNoteModal(card.dataset.openNote); }
});

document.getElementById("noteModalDelete")?.addEventListener("click", () => {
  const note = _noteModalEditId && state.notes.find(n => n.id === _noteModalEditId);
  if (!note || !confirm(`ลบโน้ต "${note.title}"?`)) return;
  state.notes = state.notes.filter(n => n.id !== _noteModalEditId);
  Storage.deleteRow('notes', note.id);
  closeNoteModal();
  renderAfterNote();
  showToast("ลบโน้ตแล้ว");
});

document.getElementById("noteForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const title  = document.getElementById("noteTitle").value.trim();
  if (!title) return;
  addNote(title, document.getElementById("noteBody").value.trim(), document.getElementById("noteTags").value.trim());
  event.currentTarget.reset();
  renderAfterNote();
  showToast(`บันทึกโน้ต "${title}" แล้ว`);
});

/* ══════════════════════════════════════════════════════════════
   DOC EDITOR — full-page A4 rich-text editor (Word-like)
   Body is stored as HTML in note.body. Backward compatible with
   plain-text notes; card previews strip HTML via notePlainText().
   ══════════════════════════════════════════════════════════════ */
const DOC_FONTS = [
  ["ค่าเริ่มต้น",       "system-ui, -apple-system, 'Segoe UI', sans-serif"],
  ["Tahoma",           "Tahoma, 'Leelawadee UI', sans-serif"],
  ["Arial",            "Arial, Helvetica, sans-serif"],
  ["Verdana",          "Verdana, Geneva, sans-serif"],
  ["Trebuchet MS",     "'Trebuchet MS', sans-serif"],
  ["Georgia",          "Georgia, serif"],
  ["Times New Roman",  "'Times New Roman', Times, serif"],
  ["Courier New",      "'Courier New', monospace"],
  ["Comic Sans",       "'Comic Sans MS', cursive"],
  ["Sarabun",          "'Sarabun', 'TH Sarabun New', sans-serif"],
  ["Angsana",          "'Angsana New', 'AngsanaUPC', serif"],
];
const DOC_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72];
const DOC_TEXT_SWATCHES = ["#1a1a1a","#fe6e00","#fb2c36","#edb200","#00c758","#3080ff","#8e44ad","#5a8fa8","#795548","#607d8b","#e91e63","#ffffff"];
const DOC_HL_SWATCHES   = ["#fff3b0","#ffd6a5","#caffbf","#a0e7e5","#bdb2ff","#ffc6ff","#ffadad","#d0f4de","#ffe066","#c1fba4","#9bf6ff","#e2e2e2"];

let _docEditId = null;
let _docSelectedImg = null;
let _docDirty = false;
let _docBuilt = false;
let _docRange = null;
let _docSaveTimer = null;
const _docPopRender = {};

const docEditor  = document.getElementById("docEditor");
const docPage    = document.getElementById("docPage");
const docTitleEl = document.getElementById("docTitle");
const docToolbar = document.getElementById("docToolbar");
const docStatus  = document.getElementById("docStatus");

/* ── Selection save / restore (toolbar interactions blur the editor) ── */
function docSaveSel() {
  const s = getSelection();
  if (s && s.rangeCount && docPage.contains(s.anchorNode)) _docRange = s.getRangeAt(0).cloneRange();
}
function docRestoreSel() {
  if (!_docRange) return;
  const s = getSelection();
  s.removeAllRanges();
  s.addRange(_docRange);
}
function docSetStatus(txt) { if (docStatus) docStatus.textContent = txt; }
function docMarkDirty() {
  _docDirty = true;
  docSetStatus("กำลังแก้ไข…");
  clearTimeout(_docSaveTimer);
  _docSaveTimer = setTimeout(() => docSaveNow(false), 1200);
}

/* ── Command helpers ── */
function docExec(cmd, val) {
  docPage.focus();
  document.execCommand("styleWithCSS", false, true);
  document.execCommand(cmd, false, val);
  docMarkDirty();
}
function docApply(fn) {
  docPage.focus();
  docRestoreSel();
  document.execCommand("styleWithCSS", false, true);
  fn();
  docSaveSel();
  docMarkDirty();
}
function docSetFontSize(px) {
  // fontSize only supports 1–7; emit <font size="7"> then rewrite to exact px.
  // This requires styleWithCSS OFF (CSS mode emits keyword sizes like "xxx-large").
  document.execCommand("styleWithCSS", false, false);
  document.execCommand("fontSize", false, "7");
  docPage.querySelectorAll('font[size="7"]').forEach(f => {
    f.removeAttribute("size");
    f.style.fontSize = px + "px";
  });
  document.execCommand("styleWithCSS", false, true);
}
function docUpdateToolbar() {
  ["bold","italic","underline","strikeThrough","justifyLeft","justifyCenter","justifyRight","justifyFull","insertUnorderedList","insertOrderedList"]
    .forEach(cmd => {
      const btn = docToolbar.querySelector(`[data-cmd="${cmd}"]`);
      if (btn) { try { btn.classList.toggle("is-active", document.queryCommandState(cmd)); } catch {} }
    });
}

/* ── Colour swatches (persist frequently-used colours) ── */
function docSwatchKey(kind) { return kind === "text" ? "johny-doc-text-swatches" : "johny-doc-hl-swatches"; }
function docLoadSwatches(kind) {
  try { const s = JSON.parse(localStorage.getItem(docSwatchKey(kind))); if (Array.isArray(s) && s.length) return s; } catch {}
  return (kind === "text" ? DOC_TEXT_SWATCHES : DOC_HL_SWATCHES).slice();
}
function docAddSwatch(kind, color) {
  const arr = [color, ...docLoadSwatches(kind).filter(c => c.toLowerCase() !== color.toLowerCase())].slice(0, 12);
  localStorage.setItem(docSwatchKey(kind), JSON.stringify(arr));
  _docPopRender[kind]?.();
}
function docCloseAllPops() { docToolbar.querySelectorAll(".doc-color-pop").forEach(p => p.hidden = true); }
function docApplyColor(kind, color, bar, pop) {
  docPage.focus();
  docRestoreSel();
  document.execCommand("styleWithCSS", false, true);
  if (kind === "text") {
    document.execCommand("foreColor", false, color);
  } else if (!document.execCommand("hiliteColor", false, color)) {
    document.execCommand("backColor", false, color);
  }
  if (color !== "transparent" && bar) bar.style.background = color;
  docSaveSel();
  docMarkDirty();
  pop.hidden = true;
}
function buildColorPop(kind, wrapId, barId) {
  const wrap = document.getElementById(wrapId);
  const bar  = document.getElementById(barId);
  const toggle = wrap.querySelector(".doc-color-btn");
  const pop = document.createElement("div");
  pop.className = "doc-color-pop";
  pop.hidden = true;
  pop.innerHTML =
    `<div class="doc-color-pop-label">${kind === "text" ? "สีตัวอักษร" : "สีไฮไลท์"}</div>` +
    `<div class="doc-swatches"></div>` +
    `<div class="doc-color-custom"><input type="color" value="${kind === "text" ? "#fe6e00" : "#fff3b0"}"><button type="button" class="doc-btn">ใช้สีนี้ + บันทึก</button></div>`;
  wrap.appendChild(pop);
  const grid    = pop.querySelector(".doc-swatches");
  const custom  = pop.querySelector('input[type="color"]');
  const applyBtn = pop.querySelector(".doc-btn");
  const render = () => {
    grid.innerHTML = "";
    if (kind === "hl") {
      const none = document.createElement("button");
      none.type = "button"; none.className = "doc-swatch doc-swatch--none"; none.title = "ไม่มีไฮไลท์";
      none.addEventListener("click", () => docApplyColor(kind, "transparent", bar, pop));
      grid.appendChild(none);
    }
    docLoadSwatches(kind).forEach(c => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "doc-swatch"; b.style.background = c; b.title = c;
      b.addEventListener("click", () => docApplyColor(kind, c, bar, pop));
      grid.appendChild(b);
    });
  };
  _docPopRender[kind] = render;
  render();
  applyBtn.addEventListener("mousedown", e => e.preventDefault());
  applyBtn.addEventListener("click", () => { docApplyColor(kind, custom.value, bar, pop); docAddSwatch(kind, custom.value); });
  toggle.addEventListener("click", e => {
    e.stopPropagation();
    const willOpen = pop.hidden;
    docCloseAllPops();
    if (willOpen) { docSaveSel(); pop.hidden = false; }
  });
}

/* ── Floating image drag / resize / delete ── */
function docHydrateImages() {
  docPage.querySelectorAll(".doc-img").forEach(w => {
    w.setAttribute("contenteditable", "false");
    const img = w.querySelector("img");
    if (img) img.setAttribute("draggable", "false");
    if (!w.querySelector(".doc-img-handle")) {
      const h = document.createElement("span"); h.className = "doc-img-handle"; w.appendChild(h);
      const d = document.createElement("button"); d.type = "button"; d.className = "doc-img-del"; d.textContent = "×"; w.appendChild(d);
    }
  });
}
function docSelectImg(w) {
  docDeselectImg();
  w.classList.add("is-selected");
  w.setAttribute("tabindex", "-1");
  _docSelectedImg = w;
  w.focus({ preventScroll: true });
}
function docDeselectImg() {
  if (_docSelectedImg) _docSelectedImg.classList.remove("is-selected");
  _docSelectedImg = null;
}
function docStartDrag(wrap, e) {
  const sx = e.clientX, sy = e.clientY;
  const sl = parseFloat(wrap.style.left) || 0, st = parseFloat(wrap.style.top) || 0;
  const move = ev => {
    let nl = sl + (ev.clientX - sx), nt = st + (ev.clientY - sy);
    nl = Math.max(0, Math.min(nl, docPage.clientWidth  - wrap.offsetWidth));
    nt = Math.max(0, Math.min(nt, docPage.clientHeight - wrap.offsetHeight));
    wrap.style.left = nl + "px"; wrap.style.top = nt + "px";
  };
  const up = () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); docMarkDirty(); };
  document.addEventListener("pointermove", move); document.addEventListener("pointerup", up);
}
function docStartResize(wrap, e) {
  const sx = e.clientX, sw = wrap.offsetWidth;
  const move = ev => {
    const nw = Math.max(48, Math.min(sw + (ev.clientX - sx), docPage.clientWidth));
    wrap.style.width = nw + "px";
  };
  const up = () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); docMarkDirty(); };
  document.addEventListener("pointermove", move); document.addEventListener("pointerup", up);
}
function docInsertImage(src) {
  const w = document.createElement("div");
  w.className = "doc-img";
  w.setAttribute("contenteditable", "false");
  w.style.left  = "56px";
  w.style.top   = Math.max(24, (docEditor.querySelector(".doc-canvas").scrollTop) + 40) + "px";
  w.style.width = "280px";
  const img = document.createElement("img");
  img.src = src; img.setAttribute("draggable", "false");
  w.appendChild(img);
  docPage.appendChild(w);
  docHydrateImages();
  docSelectImg(w);
  docMarkDirty();
}

/* ── Serialise / open / close / save ── */
function docCleanHTML() {
  const clone = docPage.cloneNode(true);
  clone.querySelectorAll(".doc-img-handle, .doc-img-del").forEach(e => e.remove());
  clone.querySelectorAll(".doc-img").forEach(w => { w.classList.remove("is-selected"); w.removeAttribute("tabindex"); });
  return clone.innerHTML;
}
function buildDocOnce() {
  if (_docBuilt) return;
  _docBuilt = true;
  const fontSel = document.getElementById("docFont");
  const sizeSel = document.getElementById("docSize");
  DOC_FONTS.forEach(([label, val]) => { const o = document.createElement("option"); o.textContent = label; o.value = val; fontSel.appendChild(o); });
  DOC_SIZES.forEach(px => { const o = document.createElement("option"); o.textContent = px; o.value = px; if (px === 16) o.selected = true; sizeSel.appendChild(o); });
  buildColorPop("text", "docTextColorWrap", "docTextColorBar");
  buildColorPop("hl",   "docHiliteWrap",    "docHiliteBar");

  // Keep selection alive when pressing toolbar buttons / swatches / colour toggles
  docToolbar.addEventListener("mousedown", e => {
    if (e.target.closest(".doc-tb-btn[data-cmd], .doc-swatch, .doc-color-btn")) e.preventDefault();
  });
  docToolbar.addEventListener("click", e => {
    const cmdBtn = e.target.closest(".doc-tb-btn[data-cmd]");
    if (cmdBtn) { docExec(cmdBtn.dataset.cmd); docUpdateToolbar(); }
  });
  fontSel.addEventListener("change", () => docApply(() => document.execCommand("fontName", false, fontSel.value || "system-ui")));
  sizeSel.addEventListener("change", () => docApply(() => docSetFontSize(sizeSel.value)));
  document.getElementById("docBlock").addEventListener("change", e => { docApply(() => document.execCommand("formatBlock", false, e.target.value)); e.target.value = "p"; });
  document.getElementById("docInsertImg").addEventListener("click", () => document.getElementById("docImgInput").click());
  document.getElementById("docImgInput").addEventListener("change", e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => docInsertImage(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  });

  // Image pointer gestures (event delegation on the page)
  docPage.addEventListener("pointerdown", e => {
    if (e.target.closest(".doc-img-del"))   { e.preventDefault(); e.target.closest(".doc-img").remove(); docDeselectImg(); docMarkDirty(); return; }
    if (e.target.closest(".doc-img-handle")){ e.preventDefault(); docStartResize(e.target.closest(".doc-img"), e); return; }
    const wrap = e.target.closest(".doc-img");
    if (wrap) { e.preventDefault(); docSelectImg(wrap); docStartDrag(wrap, e); return; }
    docDeselectImg();
  });
  docPage.addEventListener("input", docMarkDirty);
  docPage.addEventListener("paste", e => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = () => docInsertImage(reader.result);
        reader.readAsDataURL(file);
        return;
      }
    }
    // Strip incoming formatting (fixed widths, white-space:pre, monospace blocks
    // from copied code/tables) so pasted text can't blow out the A4 page width.
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    if (!text) return;
    document.execCommand("insertHTML", false, escapeHtml(text).replace(/\n/g, "<br>"));
    docMarkDirty();
  });
  docTitleEl.addEventListener("input", docMarkDirty);

  docEditor.addEventListener("keydown", e => {
    if (e.key === "Escape") { e.preventDefault(); closeDocEditor(); return; }
    if ((e.key === "Delete" || e.key === "Backspace") && _docSelectedImg &&
        (e.target === _docSelectedImg || _docSelectedImg.contains(e.target))) {
      e.preventDefault(); _docSelectedImg.remove(); docDeselectImg(); docMarkDirty();
    }
  });
  docEditor.addEventListener("click", e => { if (!e.target.closest(".doc-color-wrap")) docCloseAllPops(); });
  document.getElementById("docSave").addEventListener("click", () => docSaveNow(true));
  document.getElementById("docClose").addEventListener("click", closeDocEditor);
}

function openDocEditor(noteId) {
  const note = state.notes.find(n => n.id === noteId);
  if (!note || note._isKVLine) return;
  buildDocOnce();
  _docEditId = noteId;
  _docDirty = false;
  _docRange = null;
  docTitleEl.value = note.title || "";
  const body = note.body || "";
  docPage.innerHTML = /<[a-z!/][\s\S]*>/i.test(body) ? body : escapeHtml(body).replace(/\n/g, "<br>");
  docHydrateImages();
  docSetStatus("");
  docEditor.hidden = false;
  docEditor.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => docPage.focus(), 60);
}
function openDocEditorNew() {
  const id = crypto.randomUUID();
  state.notes.unshift({ id, title: "", body: "", tags: "", createdAt: Date.now() });
  openDocEditor(id);
  setTimeout(() => docTitleEl.focus(), 70);
}
function docSaveNow(withToast) {
  if (!_docEditId) return;
  const title = docTitleEl.value.trim() || "เอกสารไม่มีชื่อ";
  const body  = docCleanHTML();
  state.notes = state.notes.map(n => n.id === _docEditId ? { ...n, title, body } : n);
  _docDirty = false;
  docSetStatus("บันทึกแล้ว");
  renderNotes();
  renderDashboard();
  saveState();
  if (withToast) showToast(`บันทึกเอกสาร "${title}" แล้ว`);
}
function closeDocEditor() {
  clearTimeout(_docSaveTimer);
  if (_docDirty) docSaveNow(false);
  docCloseAllPops();
  docDeselectImg();
  docEditor.hidden = true;
  docEditor.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  _docEditId = null;
}

/* Track caret so toolbar reflects state & colour/font apply to the right range */
document.addEventListener("selectionchange", () => {
  if (docEditor.hidden) return;
  const s = getSelection();
  if (s && s.rangeCount && docPage.contains(s.anchorNode)) { _docRange = s.getRangeAt(0).cloneRange(); docUpdateToolbar(); }
});

/* Entry points */
document.getElementById("noteModalExpand")?.addEventListener("click", () => {
  const id = _noteModalEditId;
  closeNoteModal();
  if (id) openDocEditor(id);
});
document.getElementById("noteNewDoc")?.addEventListener("click", openDocEditorNew);

document.getElementById("expenseDate").value = getTodayKey();
document.getElementById("expenseForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const title  = document.getElementById("expenseTitle").value.trim();
  const amount = document.getElementById("expenseAmount").value;
  if (!title || !amount) return;
  addExpense(title, amount, document.getElementById("expenseCategory").value, document.getElementById("expenseDate").value);
  event.currentTarget.reset();
  document.getElementById("expenseDate").value = getTodayKey();
  renderAfterExpense();
  showToast(`บันทึก ${title} ${formatMoney(Number(amount))} แล้ว`);
});

/* ── Expense period tabs ── */
document.querySelectorAll("[data-expense-period]").forEach(btn => {
  btn.addEventListener("click", () => {
    _expensePeriod = btn.dataset.expensePeriod;
    document.querySelectorAll("[data-expense-period]").forEach(b =>
      b.classList.toggle("active", b === btn)
    );
    renderExpenses();
  });
});

/* ── Review tabs ── */
document.querySelectorAll("[data-review-tab]").forEach(btn => {
  btn.addEventListener("click", () => {
    _reviewTab = btn.dataset.reviewTab;
    document.querySelectorAll("[data-review-tab]").forEach(b =>
      b.classList.toggle("active", b === btn)
    );
    renderReview();
  });
});

document.getElementById("expenseList").addEventListener("submit", (e) => {
  const form = e.target.closest("[data-edit-form-expense]");
  if (!form) return;
  e.preventDefault();
  const id         = form.dataset.editFormExpense;
  const newTitle   = form.querySelector(".expense-edit-title").value.trim();
  const newAmount  = Number(form.querySelector(".expense-edit-amount").value);
  const newCat     = form.querySelector(".task-edit-select").value;
  const newDate    = form.querySelector(".task-edit-date").value;
  if (!newTitle || isNaN(newAmount)) return;
  state.expenses = state.expenses.map(ex =>
    ex.id === id ? { ...ex, title: newTitle, amount: newAmount, category: newCat, date: newDate } : ex
  );
  _editingExpenseId = null;
  renderAfterExpense();
  showToast("อัปเดตรายจ่ายแล้ว");
});

/* inline task edit handler removed — editing now uses the modal */

document.addEventListener("submit", e => {
  const form = e.target.closest("#calAddForm");
  if (!form) return;
  e.preventDefault();
  const title    = document.getElementById("calAddInput")?.value.trim();
  const priority = document.getElementById("calAddPriority")?.value || "Medium";
  const due      = form.dataset.addDate;
  if (!title) return;
  addTask(title, priority, due);
  document.getElementById("calAddInput").value = "";
  renderCalendar();
  showToast(`เพิ่มงาน "${title}" วันที่ ${due}`);
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  // Calendar navigation
  if (target.closest("[data-cal-prev]")) {
    _calMonth--;
    if (_calMonth < 0) { _calMonth = 11; _calYear--; }
    renderCalendar();
    return;
  }
  if (target.closest("[data-cal-next]")) {
    _calMonth++;
    if (_calMonth > 11) { _calMonth = 0; _calYear++; }
    renderCalendar();
    return;
  }
  // Calendar date click
  const calDate = target.closest("[data-cal-date]");
  if (calDate) {
    _calSelectedDate = calDate.dataset.calDate;
    renderCalendar();
    document.getElementById("calAddInput")?.focus();
    return;
  }

  // Sidebar toggle
  if (target.closest("#sidebarToggle")) {
    const shell = document.querySelector(".app-shell");
    if (shell) {
      shell.classList.toggle("sidebar-collapsed");
      localStorage.setItem("sidebarCollapsed", shell.classList.contains("sidebar-collapsed") ? "1" : "0");
    }
    return;
  }

  const viewJumpEl = target.closest("[data-view-jump]");
  const viewJump = viewJumpEl?.dataset.viewJump;
  const toggleId = target.dataset.toggleTask;
  const deleteTaskId = target.dataset.deleteTask;
  const deleteNoteId = target.dataset.deleteNote;
  const deleteExpenseId = target.dataset.deleteExpense;
  const editTaskId = target.closest("[data-edit-task]")?.dataset.editTask;

  const openNoteId      = target.closest("[data-open-note]")?.dataset.openNote;
  const editExpenseId   = target.closest("[data-edit-expense]")?.dataset.editExpense;
  const cancelExpenseId = target.closest("[data-cancel-edit-expense]")?.dataset.cancelEditExpense;

  if (viewJump) {
    setView(viewJump);
    const focusId = viewJumpEl.dataset.focusInput;
    if (focusId) {
      setTimeout(() => {
        const inp = document.getElementById(focusId);
        if (inp) { inp.focus(); inp.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
      }, 50);
    }
  }

  if (editTaskId) {
    openTaskModal(editTaskId);
    return;
  }


  if (openNoteId && !target.closest("[data-delete-note]")) {
    openNoteModal(openNoteId);
    return;
  }

  if (editExpenseId) {
    _editingExpenseId = editExpenseId;
    renderExpenses();
    setTimeout(() => { const inp = document.querySelector(".expense-edit-title"); if (inp) { inp.focus(); inp.select(); } }, 30);
    return;
  }
  if (cancelExpenseId !== undefined) {
    _editingExpenseId = null;
    renderExpenses();
    return;
  }

  if (toggleId) {
    const task = state.tasks.find((t) => t.id === toggleId);
    state.tasks = state.tasks.map((t) =>
      t.id === toggleId ? { ...t, status: isTaskDone(t) ? "todo" : "done" } : t
    );
    renderAfterTask();
    if (task) {
      const nowDone = isTaskDone(state.tasks.find((t) => t.id === toggleId));
      showToast(nowDone ? `เสร็จแล้ว: ${task.title}` : `เปิดงานอีกครั้ง: ${task.title}`);
      if (nowDone) window.Johny?.celebrate(`เยี่ยม! เสร็จ "${task.title}" แล้ว 🎉`);
    }
  }

  if (deleteTaskId) {
    const task = state.tasks.find((t) => t.id === deleteTaskId);
    if (!task || !confirm(`ลบงาน "${task.title}"?`)) return;
    state.tasks = state.tasks.filter((t) => t.id !== deleteTaskId);
    Storage.deleteRow('tasks', deleteTaskId);
    renderAfterTask();
    showToast("ลบงานแล้ว");
  }

  if (deleteNoteId) {
    const note = state.notes.find((n) => n.id === deleteNoteId);
    if (!note || !confirm(`ลบโน้ต "${note.title}"?`)) return;
    state.notes = state.notes.filter((n) => n.id !== deleteNoteId);
    Storage.deleteRow('notes', deleteNoteId);
    renderAfterNote();
    showToast("ลบโน้ตแล้ว");
  }

  if (deleteExpenseId) {
    const expense = state.expenses.find((e) => e.id === deleteExpenseId);
    if (!expense || !confirm(`ลบรายการ "${expense.title}"?`)) return;
    state.expenses = state.expenses.filter((e) => e.id !== deleteExpenseId);
    Storage.deleteRow('expenses', deleteExpenseId);
    renderAfterExpense();
    showToast("ลบรายจ่ายแล้ว");
  }

});

/* ── Sidebar toggle — restore persisted state ── */
(function() {
  const shell = document.querySelector(".app-shell");
  if (shell && localStorage.getItem("sidebarCollapsed") === "1") {
    shell.classList.add("sidebar-collapsed");
  }
})();

const initialView = location.hash.slice(1);
setView(initialView && views[initialView] ? initialView : "dashboard");
render();

/* ── Auth UI ── */
function updateSyncStatus(status, errMsg) {
  const dot   = document.getElementById('syncDot');
  const label = document.getElementById('syncLabel');
  if (!dot || !label) return;
  const states = {
    idle:    { cls: 'status-dot--online',  text: '' },
    loading: { cls: 'status-dot--syncing', text: 'กำลังโหลด…' },
    pending: { cls: 'status-dot--syncing', text: 'รอบันทึก…' },
    syncing: { cls: 'status-dot--syncing', text: 'กำลังบันทึก…' },
    synced:  { cls: 'status-dot--online',  text: 'บันทึกแล้ว ✓' },
    offline: { cls: 'status-dot--offline', text: 'ออฟไลน์' },
    error:   { cls: 'status-dot--error',   text: 'บันทึกไม่สำเร็จ' }
  };
  const s = states[status] || states.idle;
  dot.className = `status-dot ${s.cls}`;
  label.textContent = s.text;
  if (status === 'synced') {
    setTimeout(() => { if (label.textContent === 'บันทึกแล้ว ✓') updateSyncStatus('idle'); }, 3000);
  }
  if (status === 'error') {
    const msg = errMsg ? `sync error: ${errMsg}` : 'บันทึกไม่สำเร็จ — เปิด Console (F12) ดู [storage] error';
    showToast(msg, "error");
  }
}



function updateAuthBar(user) {
  const emailEl  = document.getElementById("authUserEmailTopbar");
  const subtitle = document.getElementById("brandSubtitle");

  const lineInfo = Auth.getLineInfo();
  const displayLabel = lineInfo?.displayName || user?.email || (user ? 'Signed in' : '');
  if (emailEl) emailEl.textContent = displayLabel;
  if (subtitle) subtitle.textContent = user ? (lineInfo?.displayName || 'Connected') : 'Personal workspace';
}

async function onSignedIn(user) {
  // Guard: prevent double-execution for the same user (Auth.init + onChange can both fire)
  if (_syncedUserId === user.id) return;
  _syncedUserId = user.id;
  Storage.setAuthHint(true);

  showApp();
  updateAuthBar(user);

  // Fetch LINE profile early so display name and plan are ready
  await Auth.fetchLineInfo();
  updateAuthBar(user);

  updateSyncStatus('loading');
  const cloud = await Storage.loadCloud();

  if (cloud) {
    // Legacy onboarding seeds (pre-_isDemo era) leaked into localStorage /
    // cloud on some devices. Fingerprint them by title so they can be
    // purged everywhere — they are sample content, never user data.
    const LEGACY_SEED_TITLES = new Set([
      // tasks
      "ออกแบบ dashboard ให้เห็นภาพรวมชีวิตใน 5 นาที",
      "จดไอเดียสำหรับต่อ line secretary",
      "ทดลองบันทึกรายจ่ายผ่านหน้า expenses",
      // notes
      "johny os คือพื้นที่รวม task, note, expense และเลขาส่วนตัว",
      "phase 2: sync ข้ามเครื่องด้วย supabase",
    ].map(t => t.toLowerCase()));
    // Legacy expenses have generic titles — match title+amount to be safe.
    const LEGACY_SEED_EXPENSES = new Set(["กาแฟทำงาน|75", "เดินทาง|120", "มื้อกลางวัน|95"]);
    const isLegacySeed = (item, kind) => kind === 'expenses'
      ? LEGACY_SEED_EXPENSES.has(`${item.title.trim()}|${item.amount}`)
      : LEGACY_SEED_TITLES.has(item.title.trim().toLowerCase());

    // Purge legacy seeds from the cloud immediately (targeted deletes) so
    // they can't resurface on the next device that logs in.
    for (const [table, items] of [["tasks", cloud.tasks], ["notes", cloud.notes], ["expenses", cloud.expenses]]) {
      for (const item of items) {
        if (isLegacySeed(item, table)) Storage.deleteRow(table, item.id);
      }
    }

    // Merge cloud with any local-only items (edits/creates made on this
    // device that haven't reached the cloud's debounced sync yet — there is
    // no more guest/demo data that could leak in here, since the app
    // requires login before any item can be created). Cloud wins on id
    // conflicts; anything local-only that isn't a legacy seed is kept so it
    // still gets pushed up on the next save.
    const clean = (arr, kind) => (arr || []).filter(i => !isLegacySeed(i, kind));
    const merge = (localArr, cloudArr, kind) => {
      const cloudClean = clean(cloudArr, kind);
      const cloudIds = new Set(cloudClean.map(i => i.id));
      const localOnly = clean(localArr, kind).filter(i => !cloudIds.has(i.id));
      return [...cloudClean, ...localOnly];
    };
    state = {
      ...state,
      tasks:    merge(state.tasks,    cloud.tasks,    'tasks'),
      notes:    merge(state.notes,    cloud.notes,    'notes'),
      expenses: merge(state.expenses, cloud.expenses, 'expenses'),
    };
    showToast(state.tasks.length > 0 ? `โหลดข้อมูลจาก cloud (${state.tasks.length} งาน)` : "เชื่อมต่อแล้ว ✓");
    saveState();
    render();
  }
  // loadCloud failure is non-critical — local data still intact, next save will retry
  updateSyncStatus('idle');
}

/* ── Account modal helpers (topbar "account" button while signed in) ── */
const _authModal = document.getElementById("authModal");

function openAuthModal() {
  _authModal.showModal();
}

/* ── Auth gate helpers (LINE + email/password login and signup) ── */
function setGateTab(tab) {
  document.getElementById("gateTabLogin")?.classList.toggle("active", tab === "login");
  document.getElementById("gateTabSignup")?.classList.toggle("active", tab === "signup");
  document.getElementById("gateTabLogin")?.setAttribute("aria-selected", tab === "login");
  document.getElementById("gateTabSignup")?.setAttribute("aria-selected", tab === "signup");
  const loginForm = document.getElementById("gateLoginForm");
  const signupForm = document.getElementById("gateSignupForm");
  if (loginForm)  loginForm.hidden  = tab !== "login";
  if (signupForm) signupForm.hidden = tab !== "signup";
}

function showGateError(message) {
  const errEl = document.getElementById("gateError");
  if (!errEl) return;
  errEl.textContent = message;
  errEl.hidden = false;
}

function clearGateError() {
  const errEl = document.getElementById("gateError");
  if (errEl) { errEl.textContent = ""; errEl.hidden = true; }
}

async function initAuth() {
  /* ── Handle ?auth_error= from LINE callback ── */
  const urlParams = new URLSearchParams(location.search);
  const authErr = urlParams.get('auth_error');
  if (authErr) {
    history.replaceState(null, '', location.pathname + location.hash);
    showToast(`เข้าสู่ระบบไม่สำเร็จ: ${authErr}`, "error");
  }

  /* ── ?auth=signup (from site/'s Sign Up page) opens straight on the signup tab ── */
  if (urlParams.get('auth') === 'signup') {
    history.replaceState(null, '', location.pathname + location.hash);
    setGateTab('signup');
  }

  /* ── Account modal wiring ── */
  document.getElementById("authAccountBtn")?.addEventListener("click", openAuthModal);
  _authModal.addEventListener("click", e => { if (e.target === _authModal) _authModal.close(); });
  _authModal.addEventListener("click", e => { if (e.target.closest("[data-auth-close]")) _authModal.close(); });

  document.getElementById("authLogoutTopBtn")?.addEventListener("click", () => Auth.signOut());
  document.getElementById("authLogoutModalBtn")?.addEventListener("click", () => {
    _authModal.close();
    Auth.signOut();
  });

  /* ── Auth gate wiring ── */
  document.getElementById("gateLineLoginBtn")?.addEventListener("click", () => Auth.signInWithLine());
  document.getElementById("gateTabLogin")?.addEventListener("click", () => setGateTab("login"));
  document.getElementById("gateTabSignup")?.addEventListener("click", () => setGateTab("signup"));

  document.getElementById("gateLoginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearGateError();
    const email = document.getElementById("gateLoginEmail").value.trim();
    const password = document.getElementById("gateLoginPassword").value;
    try {
      await Auth.signInWithPassword(email, password);
      // onSignedIn() runs via the SIGNED_IN event fired by Auth.onChange() below.
    } catch (err) {
      showGateError(err.message || "เข้าสู่ระบบไม่สำเร็จ");
    }
  });

  document.getElementById("gateSignupForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearGateError();
    const email = document.getElementById("gateSignupEmail").value.trim();
    const password = document.getElementById("gateSignupPassword").value;
    const confirm = document.getElementById("gateSignupConfirm").value;
    if (password !== confirm) {
      showGateError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    try {
      const data = await Auth.signUp(email, password);
      if (!data.session) {
        showToast("สมัครสมาชิกสำเร็จ — โปรดยืนยันอีเมลก่อนเข้าสู่ระบบ", "success");
      }
      // If email confirmation is disabled, Auth.signUp() already started a
      // session and the SIGNED_IN event from Auth.onChange() below takes over.
    } catch (err) {
      showGateError(err.message || "สมัครสมาชิกไม่สำเร็จ");
    }
  });

  /* ── Async init ── */
  const user = await Auth.init();
  updateAuthBar(user);
  if (user) {
    onSignedIn(user);
  } else {
    // Only force a purge if the sync init actually trusted a cached local
    // snapshot (stale/expired hint) — a fresh visitor's state is already empty.
    if (_usedCachedLocal) clearToLoggedOut();
    showAuthGate();
  }

  Auth.onChange((event, u) => {
    updateAuthBar(u);
    if (event === "SIGNED_IN")  onSignedIn(u);
    if (event === "SIGNED_OUT") {
      _syncedUserId = null;
      clearToLoggedOut();
      showAuthGate();
      showToast("ออกจากระบบแล้ว");
    }
  });
}

Storage.onSyncChange(updateSyncStatus);
window.addEventListener('online',  () => updateSyncStatus('idle'));
window.addEventListener('offline', () => updateSyncStatus('offline'));

initAuth();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // The app still works without offline caching.
    });
  });
}


// LINE Bot
const LINE_WORKER_URL = 'https://johny-line-bot.sj-siwat.workers.dev'

// ── Signed-in panel in auth modal (LINE profile + plan badge) ─────────────────

function renderLineAuthPanel(lineInfo) {
  if (!lineInfo) return
  const modalPic  = document.getElementById('authSignedInPic')
  const modalName = document.getElementById('authSignedInName')
  const planBadge = document.getElementById('authPlanBadge')
  if (modalPic && lineInfo.pictureUrl) {
    modalPic.src = lineInfo.pictureUrl
    modalPic.hidden = false
  }
  if (modalName) modalName.textContent = lineInfo.displayName || 'LINE User'
  if (planBadge) {
    planBadge.textContent = lineInfo.plan === 'pro' ? 'Pro' : 'Free'
    planBadge.className = 'auth-plan-badge' + (lineInfo.plan === 'pro' ? ' auth-plan-badge--pro' : '')
  }
}

// Fetch LINE info then update UI. Called after login and on auth change.
async function updateLineInfo() {
  const lineInfo = Auth.isLoggedIn()
    ? await Auth.fetchLineInfo()
    : null
  renderLineAuthPanel(lineInfo)

  // Load legacy KV notes for LINE users who joined before auto-create
  if (lineInfo?.lineUserId) {
    loadLineNotes(lineInfo.lineUserId).catch(() => {})
  }
}

// ── Legacy: load KV notes (for users who used bot before Supabase auto-create) ─

async function loadLineNotes(userId) {
  try {
    const res = await fetch(`${LINE_WORKER_URL}/notes/${userId}`)
    if (!res.ok) return
    const { notes } = await res.json()
    if (!notes.length) return

    const kvNotes = [...notes].reverse().map(n => ({
      id: `kv-line-${userId}-${new Date(n.createdAt).getTime()}`,
      title: n.text,
      body: '',
      tags: 'LINE',
      createdAt: new Date(n.createdAt).getTime(),
      _isKVLine: true
    }))

    state.notes = [...state.notes.filter(n => !n._isKVLine), ...kvNotes]
    renderNotes()
  } catch (_) {}
}

// ── Init ──────────────────────────────────────────────────────────────────────

function initLineInfo() {
  // Remove legacy localStorage key — no longer used
  localStorage.removeItem('lineUserId')

  // Initial render (may be logged in already on page load)
  updateLineInfo()

  // Re-render on every auth state change (login / logout)
  Auth.onChange(() => updateLineInfo())
}

initLineInfo()
