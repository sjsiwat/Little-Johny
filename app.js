import { pauseCanvas, resumeCanvas } from './canvas.js';
import './fab.js';

/* ================================================================
   CONSTANTS
   ================================================================ */

/* ── Module-level mutable state ── */
let toastTimer = null;
let _editingNoteId    = null;
let _editingExpenseId = null;
let _focusTaskId      = null;
let _taskModalEditId  = null;
let _taskView         = "list"; // "list" | "kanban"
const _taskProgressMode = new Map(); // taskId → 'value' | 'pct'
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

/* ── Goals ── */
const GOAL_COLORS = ["#0A84FF", "#30D158", "#FF9F0A", "#BF5AF2", "#FF453A", "#64D2FF"];

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
function showToast(message, type = "success") {
  const existing = document.getElementById("app-toast");
  if (existing) existing.remove();
  if (toastTimer) clearTimeout(toastTimer);
  const toast = document.createElement("div");
  toast.id = "app-toast";
  toast.className = `app-toast${type === "error" ? " app-toast--error" : ""}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = message;
  document.body.appendChild(toast);
  toastTimer = setTimeout(() => toast.remove(), 3000);
}

function createDemoState() {
  const d = (offsetDays) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + offsetDays);
    return dt.toISOString().slice(0, 10);
  };
  const ts = (offsetMin) => Date.now() - offsetMin * 60000;

  const goalBuild  = crypto.randomUUID();
  const goalHealth = crypto.randomUUID();
  const goalSave   = crypto.randomUUID();

  return {
    _demoGoalIds: { build: goalBuild, health: goalHealth, save: goalSave },

    // ── Tasks ──────────────────────────────────────────────────
    tasks: [
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "ออกแบบ Dashboard UI", goal_id: goalBuild,
        description: "วางโครงสร้างหน้า Dashboard ให้ครบทุก widget",
        priority: "High", due: d(-5), status: "done",
        labels: ["work"], createdAt: ts(500)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "ระบบ Login & Auth", goal_id: goalBuild,
        description: "Supabase Auth + guest mode",
        priority: "Critical", due: d(-3), status: "done",
        labels: ["work"], createdAt: ts(400)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "Goals Module", goal_id: goalBuild,
        description: "เชื่อม Tasks กับ Goals ให้คำนวณ progress อัตโนมัติ",
        priority: "High", due: d(2), status: "in_progress",
        labels: ["work"], createdAt: ts(90)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "LINE Bot Integration", goal_id: goalBuild,
        description: "รับ command เพิ่มงาน/โน้ตผ่าน LINE",
        priority: "Medium", due: d(7), status: "todo",
        labels: ["work"], createdAt: ts(60)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "ออกกำลังกาย 30 นาที", goal_id: goalHealth,
        description: "",
        priority: "Medium", due: d(-1), status: "done",
        labels: ["personal"], createdAt: ts(300)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "อ่านหนังสือก่อนนอน", goal_id: goalHealth,
        description: "",
        priority: "Low", due: d(0), status: "todo",
        labels: ["personal"], createdAt: ts(120)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "ส่งสรุปรายงานประจำเดือน", goal_id: null,
        description: "รวบรวมข้อมูลรายจ่ายและรายรับ พร้อม slide สรุปให้ทีม",
        priority: "Critical", due: d(0), status: "in_progress",
        labels: ["urgent", "work"], createdAt: ts(20)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "ประชุม Product Review 14:00 น.", goal_id: null,
        description: "เตรียม slide deck และ demo ฟีเจอร์ใหม่ให้พร้อม",
        priority: "High", due: d(0), status: "todo",
        labels: ["meeting", "work"], createdAt: ts(5)
      },
    ],

    // ── Notes ─────────────────────────────────────────────────
    notes: [
      {
        id: crypto.randomUUID(), _isDemo: true, goal_id: goalBuild,
        title: "ไอเดีย Feature Q3",
        body: "• Reminder แจ้งเตือนก่อน deadline อัตโนมัติ\n• Export รายจ่ายเป็น PDF รายเดือน\n• Focus Timer เชื่อมกับ task โดยตรง\n• Weekly summary รายงานสรุปประจำสัปดาห์\n• Shortcut เพิ่มงานด้วยเสียง",
        tags: "ไอเดีย, product, Q3",
        createdAt: ts(10)
      },
      {
        id: crypto.randomUUID(), _isDemo: true, goal_id: goalBuild,
        title: "สรุป Sprint Meeting 23 มิ.ย.",
        body: "Sprint Goal: ปิด 3 feature ภายใน 2 สัปดาห์\n\n✅ เสร็จแล้ว: Login, Dashboard, Tasks CRUD\n🔄 กำลังทำ: Notes inline edit, Expenses chart\n⛔ Blocked: รอ design จาก UX team\n\nAction items:\n→ @Beam ส่ง mockup ภายใน พฤ. นี้\n→ @Me เขียน API spec ก่อน ศ.",
        tags: "ประชุม, sprint, สรุป",
        createdAt: ts(120)
      },
      {
        id: crypto.randomUUID(), _isDemo: true, goal_id: null,
        title: "แรงบันดาลใจ",
        body: "\"Done is better than perfect.\"\n— Mark Zuckerberg\n\n\"ความสำเร็จ คือผลรวมของความพยายามเล็กๆ น้อยๆ ที่ทำทุกวัน\"\n\n\"The secret of getting ahead is getting started.\"\n— Mark Twain",
        tags: "แรงบันดาล, คำคม",
        createdAt: ts(240)
      }
    ],

    // ── Expenses ───────────────────────────────────────────────
    expenses: [
      // วันนี้
      {
        id: crypto.randomUUID(), _isDemo: true, goal_id: null,
        title: "กาแฟ Oat Latte",
        amount: 95, category: "เครื่องดื่ม", date: d(0), createdAt: ts(30)
      },
      {
        id: crypto.randomUUID(), _isDemo: true, goal_id: null,
        title: "ข้าวกลางวัน + น้ำ",
        amount: 135, category: "อาหาร", date: d(0), createdAt: ts(90)
      },
      {
        id: crypto.randomUUID(), _isDemo: true, goal_id: null,
        title: "BTS ไป-กลับ",
        amount: 84, category: "เดินทาง", date: d(0), createdAt: ts(120)
      },
      // เมื่อวาน
      {
        id: crypto.randomUUID(), _isDemo: true, goal_id: null,
        title: "อาหารเย็น ชาบู",
        amount: 380, category: "อาหาร", date: d(-1), createdAt: ts(300)
      },
      {
        id: crypto.randomUUID(), _isDemo: true, goal_id: null,
        title: "ชาไข่มุก",
        amount: 65, category: "เครื่องดื่ม", date: d(-1), createdAt: ts(360)
      },
      {
        id: crypto.randomUUID(), _isDemo: true, goal_id: null,
        title: "Grab ไปห้าง",
        amount: 120, category: "เดินทาง", date: d(-1), createdAt: ts(420)
      },
      // 3 วันก่อน
      {
        id: crypto.randomUUID(), _isDemo: true, goal_id: goalHealth,
        title: "ค่ายา + วิตามิน",
        amount: 350, category: "สุขภาพ", date: d(-3), createdAt: ts(600)
      },
      {
        id: crypto.randomUUID(), _isDemo: true, goal_id: null,
        title: "เสื้อยืด Uniqlo",
        amount: 590, category: "ช้อปปิ้ง", date: d(-3), createdAt: ts(660)
      },
      // ต้นเดือน
      {
        id: crypto.randomUUID(), _isDemo: true, goal_id: null,
        title: "Netflix รายเดือน",
        amount: 419, category: "อื่นๆ", date: d(-8), createdAt: ts(1440)
      },
      {
        id: crypto.randomUUID(), _isDemo: true, goal_id: null,
        title: "ค่าอินเทอร์เน็ตบ้าน",
        amount: 599, category: "อินเทอร์เน็ต", date: d(-10), createdAt: ts(2000)
      },
      {
        id: crypto.randomUUID(), _isDemo: true, goal_id: null,
        title: "ค่าอาหารเช้า + กาแฟ",
        amount: 110, category: "อาหาร", date: d(-5), createdAt: ts(900)
      },
      {
        id: crypto.randomUUID(), _isDemo: true, goal_id: goalHealth,
        title: "ออกกำลังกาย รายเดือน",
        amount: 450, category: "สุขภาพ", date: d(-12), createdAt: ts(2400)
      }
    ],

    goals: [
      { id: goalBuild,  _isDemo: true, title: "Build Johny Memo",  color: "#0A84FF", createdAt: ts(10) },
      { id: goalSave,   _isDemo: true, title: "Save 100,000 THB",  color: "#FF9F0A", createdAt: ts(20) },
      { id: goalHealth, _isDemo: true, title: "Improve Health",     color: "#30D158", createdAt: ts(30) },
    ],

    logs: [
      "ลองพิมพ์: เพิ่มงาน ประชุมทีมพรุ่งนี้ 10 โมง",
      "ลองพิมพ์: จ่าย กาแฟ 95 เครื่องดื่ม",
      "ลองพิมพ์: โน้ต ไอเดียใหม่สำหรับ project",
      "Johny Memo พร้อมช่วยจัดระเบียบวันของคุณแล้ว"
    ]
  };
}

const defaultState = {
  theme: "dark",
  taskFilter: "open",
  ...createDemoState()
};

let state = (() => {
  const s = Storage.loadLocal(defaultState);
  s.tasks = (s.tasks || []).map(t => ({
    description: "",
    labels: [],
    goal_id: null,
    target_value: null,
    target_unit: "",
    progress_value: 0,
    ...t,
    status: normalizeStatus(t.status),
  }));
  s.notes = (s.notes || []).map(n => ({ goal_id: null, ...n }));
  s.expenses = (s.expenses || []).map(e => ({ goal_id: null, ...e }));
  if (!s.goals) s.goals = [];
  s.goals = s.goals.map(({ progress: _p, ...g }) => g);
  return s;
})();

function calcGoalProgressInfo(goalId) {
  const linked = state.tasks.filter(t => t.goal_id === goalId);
  if (!linked.length) return { pct: 0, mode: 'binary', current: 0, target: 0, unit: '' };

  const numericTasks = linked.filter(t => t.target_value != null && Number(t.target_value) > 0);
  if (numericTasks.length > 0) {
    const current = numericTasks.reduce((s, t) => s + (Number(t.progress_value) || 0), 0);
    const target  = numericTasks.reduce((s, t) => s + Number(t.target_value), 0);
    const unit    = numericTasks[0].target_unit || '';
    const pct     = target > 0 ? Math.min(Math.round(current / target * 100), 100) : 0;
    return { pct, mode: 'numeric', current, target, unit };
  }

  const pct = Math.round(linked.filter(t => isTaskDone(t)).length / linked.length * 100);
  return { pct, mode: 'binary', current: 0, target: 0, unit: '' };
}

function calcGoalProgress(goalId) {
  return calcGoalProgressInfo(goalId).pct;
}

function populateGoalSelects(...ids) {
  const opts = `<option value="">ไม่ระบุ Goal</option>` +
    state.goals.map(g => `<option value="${g.id}">${escapeHtml(g.title)}</option>`).join("");
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = opts;
  });
}

const views = {
  dashboard: document.getElementById("dashboard"),
  tasks: document.getElementById("tasks"),
  notes: document.getElementById("notes"),
  expenses: document.getElementById("expenses"),
  calendar: document.getElementById("calendar"),
  goals: document.getElementById("goals"),
  review: document.getElementById("review"),
};

const viewTitles = {
  dashboard: "Dashboard",
  tasks: "Tasks",
  notes: "Notes",
  expenses: "Expenses",
  calendar: "Calendar",
  goals: "Goals",
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
  populateGoalSelects("noteGoal", "expenseGoal");
  // Sync task filter chip active state with current state
  document.querySelectorAll("[data-task-filter]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.taskFilter === state.taskFilter);
  });
  renderShell();
  renderDashboard();
  renderTasks();
  renderNotes();
  renderExpenses();
  renderCalendar();
  renderGoals();
  renderReview();
  renderFocusTaskPicker();
  saveState();
}

function renderAfterTask() {
  renderShell(); renderDashboard(); renderTasks(); renderCalendar(); renderFocusTaskPicker(); saveState();
}
function renderAfterNote() {
  renderShell(); renderDashboard(); renderNotes(); saveState();
}
function renderAfterExpense() {
  renderShell(); renderDashboard(); renderExpenses(); saveState();
}

function renderFocusTaskPicker() {
  const picker = document.getElementById("focusTaskPicker");
  if (!picker) return;
  // If the currently focused task was completed or deleted, clear it
  const focusTask = _focusTaskId
    ? state.tasks.find(t => t.id === _focusTaskId && !isTaskDone(t))
    : null;
  if (_focusTaskId && !focusTask) _focusTaskId = null;

  if (focusTask) {
    picker.innerHTML = `
      <div class="focus-task-selected">
        <span class="focus-task-name">${escapeHtml(focusTask.title)}</span>
        <button class="focus-task-clear" data-clear-focus-task type="button" aria-label="ยกเลิก focus task">✕</button>
      </div>`;
  } else {
    const openTasks = state.tasks
      .filter(t => !isTaskDone(t))
      .sort((a, b) => { const r = {Critical:0,High:1,Medium:2,Low:3}; return r[a.priority]-r[b.priority]; })
      .slice(0, 10);
    if (!openTasks.length) { picker.innerHTML = ""; return; }
    picker.innerHTML = `
      <select class="focus-task-select" id="focusTaskSelect" aria-label="เลือก task ที่จะ focus">
        <option value="">เลือก task ที่จะ focus…</option>
        ${openTasks.map(t => `<option value="${t.id}">${escapeHtml(t.title)}</option>`).join("")}
      </select>`;
    document.getElementById("focusTaskSelect")?.addEventListener("change", e => {
      _focusTaskId = e.target.value || null;
      renderFocusTaskPicker();
    });
  }
}

function updateClock() {
  const now = new Date();
  const timeEl = document.getElementById("todayTime");
  if (timeEl) {
    timeEl.textContent = "  ·  " + now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
}

function renderShell() {
  const todayLabelEl = document.getElementById("todayLabel");
  if (todayLabelEl) todayLabelEl.textContent = new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());

  updateClock();

  const openItems = state.tasks.filter((task) => !isTaskDone(task));
  const focusCountEl = document.getElementById("focusCount");
  if (focusCountEl) focusCountEl.textContent = `${openItems.length} focus items`;

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

  const signalTasks = document.getElementById("signalTasks");
  if (signalTasks) signalTasks.textContent = `${openItems.length} งานค้าง`;

  const signalExpense = document.getElementById("signalExpense");
  if (signalExpense) signalExpense.textContent = `฿${todayExpense.toLocaleString("th-TH")} วันนี้`;

  const signalNotes = document.getElementById("signalNotes");
  if (signalNotes) {
    const lastNote = [...state.notes].sort((a, b) => b.createdAt - a.createdAt)[0];
    signalNotes.textContent = lastNote
      ? `โน้ต: ${lastNote.title.length > 22 ? lastNote.title.slice(0, 22) + "…" : lastNote.title}`
      : "ยังไม่มีโน้ต";
  }
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
        .slice(0, 4)
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
  renderGoalProgressDash();
  renderWeeklyReviewDash();
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

/* ── Goals ── */
let _expandedGoalId = null;

function addGoal(title, color) {
  state.goals.unshift({
    id: crypto.randomUUID(),
    title,
    color: color || GOAL_COLORS[state.goals.length % GOAL_COLORS.length],
    createdAt: Date.now()
  });
}

function renderGoalDetail(goal) {
  const color = goal.color || "#0A84FF";
  const tasks    = state.tasks.filter(t => t.goal_id === goal.id);
  const notes    = state.notes.filter(n => n.goal_id === goal.id);
  const expenses = state.expenses.filter(e => e.goal_id === goal.id);
  const expTotal = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const taskRows = tasks.length
    ? tasks.map(t => {
        const sm = STATUS_META[t.status] || {};
        return `<div class="gd-row">
          <span class="gd-status-dot" style="background:${sm.color || '#8E8E93'}"></span>
          <span class="gd-row-text">${escapeHtml(t.title)}</span>
          <span class="gd-row-meta">${sm.label || t.status}</span>
        </div>`;
      }).join("")
    : `<p class="gd-empty">ยังไม่มีงาน — <button type="button" class="gd-link" data-view-jump="tasks">เพิ่มงาน</button></p>`;

  const noteRows = notes.length
    ? notes.map(n => `<div class="gd-row">
        <span class="gd-row-text">${escapeHtml(n.title)}</span>
        <span class="gd-row-meta">${escapeHtml(n.tags || "")}</span>
      </div>`).join("")
    : `<p class="gd-empty">ยังไม่มีโน้ต</p>`;

  const expRows = expenses.length
    ? expenses.map(e => `<div class="gd-row">
        <span class="gd-row-text">${escapeHtml(e.title)}</span>
        <span class="gd-row-meta">${formatMoney(e.amount)} · ${escapeHtml(e.category)}</span>
      </div>`).join("")
    : `<p class="gd-empty">ยังไม่มีรายจ่าย</p>`;

  return `
    <div class="goal-detail" style="--gc:${color}">
      <div class="gd-section">
        <div class="gd-section-head">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="0.75" y="0.75" width="10.5" height="10.5" rx="2.5" stroke="currentColor" stroke-width="1.3"/><path d="M3 6l2 2 4-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          งาน (${tasks.length})
        </div>
        ${taskRows}
      </div>
      <div class="gd-section">
        <div class="gd-section-head">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="1.5" y="0.75" width="9" height="10.5" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M3.5 4h5M3.5 6h5M3.5 8h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          โน้ต (${notes.length})
        </div>
        ${noteRows}
      </div>
      <div class="gd-section">
        <div class="gd-section-head">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="5.25" stroke="currentColor" stroke-width="1.3"/><path d="M6 3.5v5M4 6h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          รายจ่าย (${expenses.length})${expenses.length ? ` · <strong>${formatMoney(expTotal)}</strong>` : ""}
        </div>
        ${expRows}
      </div>
    </div>`;
}

function renderGoals() {
  const list = document.getElementById("goalList");
  if (!list) return;
  if (!state.goals.length) {
    list.innerHTML = emptyState("ยังไม่มี Goal ลองเพิ่ม Goal แรกของคุณ", "goals", "เพิ่ม Goal");
    return;
  }
  list.innerHTML = state.goals.map(goal => {
    const info    = calcGoalProgressInfo(goal.id);
    const color   = goal.color || "#0A84FF";
    const linked  = state.tasks.filter(t => t.goal_id === goal.id);
    const done    = linked.filter(t => isTaskDone(t)).length;
    const taskLabel = linked.length ? `${done}/${linked.length} งาน` : "ยังไม่มีงาน";
    const expanded  = _expandedGoalId === goal.id;

    const progressDisplay = info.mode === 'numeric' && info.target > 0
      ? `<div class="goal-progress-numeric">
           <span class="goal-numeric-current" style="color:${color}">${formatNum(info.current)}</span>
           <span class="goal-numeric-sep"> / ${formatNum(info.target)}${info.unit ? " " + escapeHtml(info.unit) : ""}</span>
         </div>
         <div class="goal-bar-track">
           <div class="goal-bar-fill" style="width:${info.pct}%; background:${color}"></div>
         </div>
         <div class="goal-progress-foot">
           <span class="goal-task-count">${taskLabel}</span>
           <span class="goal-pct-small">${info.pct}%</span>
         </div>`
      : `<div class="goal-bar-track">
           <div class="goal-bar-fill" style="width:${info.pct}%; background:${color}"></div>
         </div>
         <span class="goal-task-count">${taskLabel}</span>`;

    return `
      <article class="list-item goal-item${expanded ? " goal-item--expanded" : ""}" data-goal-id="${goal.id}">
        <div class="goal-item-header" data-toggle-goal="${goal.id}" role="button" tabindex="0" aria-expanded="${expanded}">
          <div class="goal-item-body">
            <div class="goal-item-top">
              <span class="goal-item-title">${escapeHtml(goal.title)}</span>
              <span class="goal-pct">${info.pct}%</span>
            </div>
            ${progressDisplay}
          </div>
          <div class="goal-item-chevron" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
        ${expanded ? renderGoalDetail(goal) : ""}
        <div class="item-actions goal-item-actions">
          <button class="icon-button" type="button" data-delete-goal="${goal.id}" title="ลบ Goal">×</button>
        </div>
      </article>`;
  }).join("");

  list.querySelectorAll("[data-toggle-goal]").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.toggleGoal;
      _expandedGoalId = _expandedGoalId === id ? null : id;
      renderGoals();
    });
    el.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); }
    });
  });

  list.querySelectorAll("[data-view-jump]").forEach(btn => {
    btn.addEventListener("click", () => setView(btn.dataset.viewJump));
  });
}

function renderGoalProgressLabel(info, color) {
  if (info.mode === 'numeric' && info.target > 0) {
    return `
      <div class="goal-dash-label">
        <span style="color:${color}">${formatNum(info.current)}<small> / ${formatNum(info.target)}${info.unit ? " " + info.unit : ""}</small></span>
        <strong>${info.pct}%</strong>
      </div>
      <div class="goal-bar-track">
        <div class="goal-bar-fill" style="width:${info.pct}%; background:${color}"></div>
      </div>`;
  }
  return `
    <div class="goal-dash-label">
      <span></span>
      <strong>${info.pct}%</strong>
    </div>
    <div class="goal-bar-track">
      <div class="goal-bar-fill" style="width:${info.pct}%; background:${color}"></div>
    </div>`;
}

function renderGoalProgressDash() {
  const el = document.getElementById("dashGoalBars");
  if (!el) return;
  if (!state.goals.length) {
    el.innerHTML = emptyState("ยังไม่มี Goal", "goals", "เพิ่ม Goal");
    return;
  }
  el.innerHTML = state.goals.slice(0, 4).map(goal => {
    const info  = calcGoalProgressInfo(goal.id);
    const color = goal.color || "#0A84FF";
    return `
      <div class="goal-dash-row">
        <div class="goal-dash-name">${escapeHtml(goal.title)}</div>
        ${renderGoalProgressLabel(info, color)}
      </div>`;
  }).join("");
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
  const avgGoalProgress = state.goals.length
    ? Math.round(state.goals.reduce((s, g) => s + calcGoalProgress(g.id), 0) / state.goals.length)
    : 0;
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
      <div class="review-dash-stat">
        <strong>${avgGoalProgress}%</strong>
        <span>Goal Progress</span>
      </div>
    </div>`;
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

    const taskRowWithGoal = (t, prefix, cls = "") => {
      const g = t.goal_id ? state.goals.find(g => g.id === t.goal_id) : null;
      return `<div class="review-task-row${cls ? " " + cls : ""}">
        ${prefix} ${escapeHtml(t.title)}
        ${g ? `<span class="review-goal-tag" style="--gc:${g.color}">${escapeHtml(g.title)}</span>` : ""}
      </div>`;
    };

    el.innerHTML = `
      <div class="review-section">
        <div class="review-stat-grid">
          <div class="review-stat-card review-stat-card--green"><strong>${todayDone.length}</strong><span>งานเสร็จวันนี้</span></div>
          <div class="review-stat-card review-stat-card--red"><strong>${todayOverdue.length}</strong><span>งานเกินกำหนด</span></div>
          <div class="review-stat-card review-stat-card--amber"><strong>${todayNotes.length}</strong><span>โน้ตวันนี้</span></div>
          <div class="review-stat-card review-stat-card--blue"><strong>${formatMoney(todayExpense)}</strong><span>รายจ่ายวันนี้</span></div>
        </div>
        ${todayDone.length ? `<div class="review-subsection"><h3>งานที่เสร็จวันนี้</h3>${todayDone.map(t => taskRowWithGoal(t, "✓")).join("")}</div>` : ""}
        ${todayOverdue.length ? `<div class="review-subsection"><h3>งานที่เกินกำหนด</h3>${todayOverdue.map(t => taskRowWithGoal(t, "!", "review-task-row--overdue")).join("")}</div>` : ""}
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

    const goalsWithTasks = state.goals.filter(g => state.tasks.some(t => t.goal_id === g.id));
    el.innerHTML = `
      <div class="review-section">
        <div class="review-stat-grid">
          <div class="review-stat-card review-stat-card--green"><strong>${weekDone.length}</strong><span>งานเสร็จสัปดาห์นี้</span></div>
          <div class="review-stat-card review-stat-card--amber"><strong>${formatMoney(weekExpense)}</strong><span>รายจ่ายสัปดาห์นี้</span></div>
          <div class="review-stat-card review-stat-card--blue"><strong>${weekNotes}</strong><span>โน้ตสัปดาห์นี้</span></div>
          <div class="review-stat-card review-stat-card--primary"><strong>${completionRate}%</strong><span>Completion Rate</span></div>
        </div>
        ${topCat ? `<div class="review-subsection"><h3>หมวดที่ใช้มากสุดสัปดาห์นี้</h3><div class="review-top-cat">${escapeHtml(topCat[0])} · ${formatMoney(topCat[1])}</div></div>` : ""}
        ${goalsWithTasks.length ? `
          <div class="review-subsection">
            <h3>Goals Progress</h3>
            ${goalsWithTasks.map(g => {
              const pct   = calcGoalProgress(g.id);
              const done  = state.tasks.filter(t => t.goal_id === g.id && isTaskDone(t)).length;
              const total = state.tasks.filter(t => t.goal_id === g.id).length;
              return `<div class="review-goal-row">
                <span>${escapeHtml(g.title)}</span>
                <div class="goal-bar-track"><div class="goal-bar-fill" style="width:${pct}%;background:${g.color||'#0A84FF'}"></div></div>
                <strong>${done}/${total}</strong>
              </div>`;
            }).join("")}
          </div>` : ""}
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
    const avgGoalProgress = state.goals.length
      ? Math.round(state.goals.reduce((s, g) => s + calcGoalProgress(g.id), 0) / state.goals.length) : 0;
    el.innerHTML = `
      <div class="review-section">
        <div class="review-stat-grid">
          <div class="review-stat-card review-stat-card--green"><strong>${monthDone}</strong><span>งานเสร็จเดือนนี้</span></div>
          <div class="review-stat-card review-stat-card--amber"><strong>${formatMoney(monthExpense)}</strong><span>รายจ่ายเดือนนี้</span></div>
          <div class="review-stat-card review-stat-card--blue"><strong>${monthNotes}</strong><span>โน้ตเดือนนี้</span></div>
          <div class="review-stat-card review-stat-card--primary"><strong>${completionRate}%</strong><span>Completion Rate</span></div>
        </div>
        ${state.goals.length ? `
          <div class="review-subsection">
            <h3>ความคืบหน้า Goals</h3>
            ${state.goals.map(g => {
              const pct = calcGoalProgress(g.id);
              return `<div class="review-goal-row">
                <span>${escapeHtml(g.title)}</span>
                <div class="goal-bar-track"><div class="goal-bar-fill" style="width:${pct}%;background:${g.color||'#0A84FF'}"></div></div>
                <strong>${pct}%</strong>
              </div>`;
            }).join("")}
          </div>` : ""}
        <div class="review-subsection">
          <div class="review-summary-item"><span>Average Goal Progress</span><strong>${avgGoalProgress}%</strong></div>
        </div>
      </div>`;
  }
}

function renderTaskListItem(task) {
  const done     = isTaskDone(task);
  const pColor   = PRIORITY_COLORS[task.priority] || '#8E8E93';
  const hasTarget = task.target_value != null && Number(task.target_value) > 0;
  const prog     = hasTarget ? Math.min(Math.round((Number(task.progress_value)||0)/Number(task.target_value)*100),100) : 0;
  const progMode = _taskProgressMode.get(task.id) || 'value';
  const progressLabel = progMode === 'pct'
    ? `${prog}%`
    : `${formatNum(task.progress_value)} / ${formatNum(task.target_value)}${task.target_unit ? ' '+escapeHtml(task.target_unit) : ''}`;

  const labelChips = task.labels?.map(id => {
    const l = TASK_LABELS.find(x => x.id === id);
    return l ? `<span class="tli-label" style="--lc:${l.color}">${escapeHtml(l.name)}</span>` : '';
  }).join('') || '';

  const dueChip = (() => {
    if (!task.due) return '';
    const info = getDeadlineInfo(task.due, done);
    if (!info) return `<span class="tli-due">${formatDate(task.due)}</span>`;
    if (info.type === 'overdue') return `<span class="tli-due tli-due--overdue">เกิน ${info.days} วัน</span>`;
    if (info.type === 'today')   return `<span class="tli-due tli-due--today">วันนี้</span>`;
    if (info.type === 'soon')    return `<span class="tli-due tli-due--soon">อีก ${info.days} วัน</span>`;
    return `<span class="tli-due">${formatDate(task.due)}</span>`;
  })();

  const goalBadge = (() => {
    if (!task.goal_id) return '';
    const g = state.goals.find(g => g.id === task.goal_id);
    return g ? `<span class="tli-goal" style="--gc:${g.color}">${escapeHtml(g.title)}</span>` : '';
  })();

  return `
    <article class="tli${done ? ' tli--done' : ''}" data-task-id="${task.id}">
      <div class="tli-row">
        <button class="tli-check" type="button" data-toggle-task="${task.id}" aria-pressed="${done}" title="${done ? 'เปิดงานอีกครั้ง' : 'ทำเครื่องหมายเสร็จ'}">
          ${done ? `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true"><path d="M1.5 4.5l2 2 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}
        </button>
        <span class="tli-dot" style="background:${done ? '#8E8E93' : pColor}"></span>
        <span class="tli-title">${escapeHtml(task.title)}</span>
        <span class="tli-badge" style="--bc:${pColor}18;--bt:${pColor}">${task.priority}</span>
        ${labelChips}
        ${goalBadge}
        ${dueChip}
        <div class="tli-acts">
          ${!done && !hasTarget ? `<button class="tli-act" type="button" data-add-progress="${task.id}" title="เพิ่ม Progress Bar" aria-label="เพิ่ม Progress Bar"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><rect x="1" y="6.5" width="1.5" height="3" rx="0.4" fill="currentColor" opacity=".4"/><rect x="3.5" y="3.5" width="1.5" height="6" rx="0.4" fill="currentColor" opacity=".7"/><rect x="6.5" y="1" width="1.5" height="8.5" rx="0.4" fill="currentColor"/></svg></button>` : ''}
          ${!done ? `<button class="tli-act${_focusTaskId === task.id ? ' is-focusing' : ''}" type="button" data-focus-task="${task.id}" title="Focus" aria-label="Focus"><svg width="8" height="9" viewBox="0 0 8 9" fill="none" aria-hidden="true"><path d="M1 1.5l6 3-6 3V1.5z" fill="currentColor"/></svg></button>` : ''}
          <button class="tli-act" type="button" data-edit-task="${task.id}" title="แก้ไขงาน" aria-label="แก้ไขงาน">${ICON_EDIT}</button>
          <button class="tli-act tli-act--del" type="button" data-delete-task="${task.id}" title="ลบงาน">×</button>
        </div>
      </div>
      ${task.description ? `<p class="tli-desc">${escapeHtml(task.description)}</p>` : ''}
      ${hasTarget ? `
      <div class="tli-prog" style="--prog:${prog/100}">
        <div class="tli-prog-track"><div class="tli-prog-fill" style="background:${pColor}"></div></div>
        <span class="tli-prog-lbl">${progressLabel}</span>
        <button class="tli-prog-mode" type="button" data-toggle-progress-mode="${task.id}" title="${progMode==='pct'?'แสดงค่าจริง':'แสดงเป็น %'}">${progMode==='pct'?'123':'%'}</button>
        ${!done ? `<button class="tli-prog-log-btn" type="button" data-log-task="${task.id}">+ บันทึก</button>` : ''}
        <button class="tli-prog-rm" type="button" data-remove-progress="${task.id}" title="ลบ Progress Bar">×</button>
      </div>
      <div class="tli-log-row" id="logRow-${task.id}" hidden>
        <span class="tli-log-pfx">${escapeHtml(task.target_unit||'')}</span>
        <input class="tli-log-inp" type="number" placeholder="เพิ่ม เช่น 500" min="0" step="any" data-log-input="${task.id}" />
        <button class="tli-log-ok" type="button" data-log-confirm="${task.id}">บันทึก</button>
        <button class="tli-log-x" type="button" data-log-cancel="${task.id}">ยกเลิก</button>
      </div>` : (!done ? `
      <div class="tli-addprog-row" id="addProgRow-${task.id}" hidden>
        <input class="tli-log-inp" type="number" placeholder="เป้าหมาย เช่น 10000" min="0" step="any" data-quick-target="${task.id}" />
        <input class="tli-log-inp tli-log-unit-inp" type="text" placeholder="หน่วย เช่น บาท วัน ครั้ง" maxlength="20" data-quick-unit="${task.id}" />
        <button class="tli-log-ok" type="button" data-quick-confirm="${task.id}">เพิ่ม</button>
        <button class="tli-log-x" type="button" data-quick-cancel="${task.id}">ยกเลิก</button>
      </div>` : '')}
    </article>`;
}

function renderTasks() {
  if (_taskView === "kanban") { renderKanban(); return; }

  const filtered = state.tasks.filter((task) => {
    if (state.taskFilter === "open") return !isTaskDone(task);
    if (state.taskFilter === "done") return isTaskDone(task);
    return true;
  }).sort((a, b) => {
    if (a.due && b.due) return a.due.localeCompare(b.due);
    if (a.due) return -1;
    if (b.due) return 1;
    return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  });

  document.getElementById("taskList").innerHTML = filtered.length
    ? filtered.map(task => renderTaskListItem(task)).join("")
    : emptyState("ยังไม่มีงานในมุมมองนี้", "tasks", "เพิ่มงาน");
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

  const goalSel = document.getElementById("modalTaskGoal");
  if (goalSel) {
    goalSel.innerHTML = `<option value="">ไม่ระบุ Goal</option>` +
      state.goals.map(g =>
        `<option value="${g.id}"${task?.goal_id === g.id ? " selected" : ""}>${escapeHtml(g.title)}</option>`
      ).join("");
  }

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
      if (note.id === _editingNoteId) return `<div class="note-card-edit-wrap">${renderNoteEditForm(note)}</div>`;
      const noteGoal = note.goal_id ? state.goals.find(g => g.id === note.goal_id) : null;
      const tags = note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const acts = note._isKVLine
        ? `<button class="note-card-act note-card-act--del" type="button" data-delete-note="${note.id}" title="ลบโน้ต">×</button>`
        : `<button class="note-card-act" type="button" data-edit-note="${note.id}" title="แก้ไขโน้ต" aria-label="แก้ไขโน้ต">${ICON_EDIT}</button>
           <button class="note-card-act note-card-act--del" type="button" data-delete-note="${note.id}" title="ลบโน้ต">×</button>`;
      return `
        <article class="note-card" data-note-id="${note.id}">
          <div class="note-card-head">
            <span class="note-card-title">${escapeHtml(note.title)}</span>
            <div class="note-card-acts">${acts}</div>
          </div>
          ${note.body ? `<p class="note-card-body">${escapeHtml(note.body.slice(0,140))}${note.body.length>140?'…':''}</p>` : ''}
          <div class="note-card-foot">
            ${tags.map(t => `<span class="tli-label" style="--lc:#5a8fa8">${escapeHtml(t)}</span>`).join('')}
            ${noteGoal ? `<span class="tli-goal" style="--gc:${noteGoal.color}">${escapeHtml(noteGoal.title)}</span>` : ''}
            <span class="note-card-date">${relativeTime(note.createdAt)}</span>
          </div>
        </article>`;
    }).join('');
}

function renderNoteEditForm(note) {
  const goalOpts = `<option value="">ไม่ระบุ Goal</option>` +
    state.goals.map(g =>
      `<option value="${g.id}"${note.goal_id === g.id ? " selected" : ""}>${escapeHtml(g.title)}</option>`
    ).join("");
  return `
    <article class="list-item list-item--editing">
      <form class="task-edit-form" data-edit-form-note="${note.id}">
        <input class="task-edit-title" type="text" value="${escapeHtml(note.title)}"
          placeholder="หัวข้อโน้ต" required maxlength="160"
          autocorrect="off" autocapitalize="sentences" />
        <textarea class="note-edit-body" rows="4"
          placeholder="เนื้อหา">${escapeHtml(note.body || "")}</textarea>
        <div class="task-edit-row">
          <input class="note-edit-tags" type="text" value="${escapeHtml(note.tags || "")}"
            placeholder="tags เช่น work, idea" />
          <select class="note-edit-goal task-edit-select" aria-label="Goal">${goalOpts}</select>
          <div class="task-edit-actions">
            <button type="submit" class="task-edit-save">บันทึก</button>
            <button type="button" class="task-edit-cancel" data-cancel-edit-note="${note.id}">ยกเลิก</button>
          </div>
        </div>
      </form>
    </article>
  `;
}

function renderExpenseItem(expense) {
  const expGoal  = expense.goal_id ? state.goals.find(g => g.id === expense.goal_id) : null;
  const icon     = EXPENSE_ICONS[expense.category] || '📦';
  const catColor = EXPENSE_BAR_COLORS[expense.category] || '#8E8E93';
  return `
    <article class="exp-item" data-expense-id="${expense.id}">
      <span class="exp-icon" style="background:${catColor}20">${icon}</span>
      <span class="exp-name">${escapeHtml(expense.title)}</span>
      <span class="exp-cat">${escapeHtml(expense.category)}</span>
      ${expGoal ? `<span class="tli-goal" style="--gc:${expGoal.color}">${escapeHtml(expGoal.title)}</span>` : ''}
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
  const goalOpts = `<option value="">ไม่ระบุ Goal</option>` +
    state.goals.map(g =>
      `<option value="${g.id}"${expense.goal_id === g.id ? " selected" : ""}>${escapeHtml(g.title)}</option>`
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
          <select class="expense-edit-goal task-edit-select" aria-label="Goal">${goalOpts}</select>
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

function renderSimpleNote(note) {
  const tags = note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  return `
    <div class="dash-note-row">
      <span class="dash-note-title">${escapeHtml(note.title)}</span>
      ${tags.slice(0,2).map(t => `<span class="tli-label" style="--lc:#5a8fa8">${escapeHtml(t)}</span>`).join('')}
      <span class="note-card-date">${relativeTime(note.createdAt)}</span>
    </div>`;
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

/* ── Homepage ↔ App routing ── */
let _inApp = false; // true once user enters the app (guest or signed in)
let _syncedUserId = null; // guard against double onSignedIn (Auth.init + onChange race)

function showApp() {
  _inApp = true;
  document.getElementById("homepage")?.style.setProperty("display", "none");
  document.querySelector(".app-shell")?.style.removeProperty("display");
  document.getElementById("bg-canvas")?.style.setProperty("display", "none");
  document.querySelector(".paper-grain")?.style.setProperty("display", "none");
  pauseCanvas();
  if (!_clockInterval) _clockInterval = setInterval(updateClock, 1000);
}

function showHomepage() {
  _inApp = false;
  document.getElementById("homepage")?.style.removeProperty("display");
  document.querySelector(".app-shell")?.style.setProperty("display", "none");
  document.getElementById("bg-canvas")?.style.removeProperty("display");
  document.querySelector(".paper-grain")?.style.removeProperty("display");
  resumeCanvas();
  clearInterval(_clockInterval);
  _clockInterval = null;
}

function freshDemoState() {
  return { theme: state.theme || "dark", taskFilter: "open", goals: [], ...createDemoState() };
}

function renderHomepageDemo() {
  const demo = freshDemoState();

  // Stats
  const total   = demo.tasks.length;
  const pending = demo.tasks.filter(t => t.status !== 'done').length;
  const done    = demo.tasks.filter(t => t.status === 'done').length;
  const monthExp = demo.expenses.reduce((s, e) => s + e.amount, 0);

  const $ = id => document.getElementById(id);
  if ($('hpDemoStatAll'))     $('hpDemoStatAll').textContent     = total;
  if ($('hpDemoStatPending')) $('hpDemoStatPending').textContent = pending;
  if ($('hpDemoStatDone'))    $('hpDemoStatDone').textContent    = done;
  if ($('hpDemoStatExpense')) $('hpDemoStatExpense').textContent = `฿${monthExp.toLocaleString()}`;

  // Focus list: top open tasks by priority
  const open = demo.tasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9))
    .slice(0, 5);

  const focusEl = $('hpDemoFocus');
  if (focusEl) {
    focusEl.innerHTML = open.map(t => `
      <li class="hp-demo-task-item">
        <span class="hp-demo-task-dot" style="background:${PRIORITY_COLORS[t.priority] || '#8E8E93'}"></span>
        <span class="hp-demo-task-name">${t.title}</span>
        <span class="hp-demo-task-tag">${t.priority}</span>
      </li>`).join('');
  }

  // Expense bars: top categories
  const CAT_COLOR = {
    "อาหาร": "#FF9F0A", "เครื่องดื่ม": "#64D2FF", "เดินทาง": "#BF5AF2",
    "น้ำมัน": "#FF9F0A", "ค่าไฟ": "#FF6B6B", "สุขภาพ": "#30D158",
    "ช้อปปิ้ง": "#FF6B6B", "อินเทอร์เน็ต": "#0A84FF", "อื่นๆ": "#8E8E93",
  };
  const catTotals = {};
  demo.expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
  const maxAmt = Math.max(...Object.values(catTotals), 1);
  const topCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const barsEl = $('hpDemoBars');
  if (barsEl) {
    barsEl.innerHTML = topCats.map(([cat, amt]) => `
      <div class="hp-demo-bar-row">
        <span class="hp-demo-bar-label">${cat}</span>
        <div class="hp-demo-bar-track">
          <div class="hp-demo-bar-fill" style="width:${(amt / maxAmt * 100).toFixed(1)}%;background:${CAT_COLOR[cat] || '#8E8E93'}"></div>
        </div>
        <span class="hp-demo-bar-amt">฿${amt.toLocaleString()}</span>
      </div>`).join('');
  }
}

function addTask(title, priority = "Medium", due = "", status = "todo", description = "", labels = [], goalId = null, targetValue = null, targetUnit = "") {
  state.tasks.unshift({
    id: crypto.randomUUID(),
    title,
    description,
    priority,
    due,
    status,
    labels,
    goal_id: goalId || null,
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

function addNote(title, body = "", tags = "", goalId = null) {
  state.notes.unshift({
    id: crypto.randomUUID(),
    title,
    body,
    tags,
    goal_id: goalId || null,
    createdAt: Date.now()
  });
}

function addExpense(title, amount, category = "อื่นๆ", date = getTodayKey(), goalId = null) {
  state.expenses.unshift({
    id: crypto.randomUUID(),
    title,
    amount: Number(amount),
    category,
    date,
    goal_id: goalId || null,
    createdAt: Date.now()
  });
}


function loadDemoData() {
  const demo = createDemoState();
  state = {
    ...state,
    tasks: demo.tasks,
    notes: demo.notes,
    expenses: demo.expenses,
    logs: demo.logs
  };
  render();
}

/* ── Smart Goal inference ──────────────────────────────────
   Priority: explicit #tag > keyword overlap > null
   Explicit: text ends with  #<partial goal name>
   Keyword : tokenise text + each goal title, count overlap
───────────────────────────────────────────────────────── */
function inferGoalId(text) {
  if (!state.goals.length) return null;

  // 1. Explicit tag: #<partial>  (case-insensitive, strip trailing punctuation)
  const tagMatch = text.match(/#([฀-๿\w]+)/u);
  if (tagMatch) {
    const tag = tagMatch[1].toLowerCase();
    const found = state.goals.find(g => g.title.toLowerCase().includes(tag));
    if (found) return found.id;
  }

  // 2. Keyword overlap: tokenise both sides (≥2 chars), pick highest score ≥1
  const textTokens = new Set(
    text.toLowerCase().replace(/#[\S]+/g, "").split(/[\s,./]+/).filter(w => w.length >= 2)
  );
  let bestId = null, bestScore = 0;
  for (const g of state.goals) {
    const goalTokens = g.title.toLowerCase().split(/[\s,./]+/).filter(w => w.length >= 2);
    const score = goalTokens.filter(w => textTokens.has(w)).length;
    if (score > bestScore) { bestScore = score; bestId = g.id; }
  }
  return bestScore >= 1 ? bestId : null;
}

function goalLabel(goalId) {
  if (!goalId) return "";
  const g = state.goals.find(g => g.id === goalId);
  return g ? ` [${g.title}]` : "";
}

function parseCommand(rawText) {
  const text = rawText.trim();
  if (!text) return "ยังไม่ได้พิมพ์คำสั่ง";

  if (text.startsWith("เพิ่มงาน")) {
    const body   = text.replace("เพิ่มงาน", "").trim();
    const title  = body.replace(/#[\S]+/g, "").trim() || "งานใหม่จาก Secretary";
    const goalId = inferGoalId(body);
    addTask(title, "Medium", "", "todo", "", [], goalId);
    render(); saveState();
    return `เพิ่มงานแล้ว: ${title}${goalLabel(goalId)}`;
  }

  if (text.startsWith("โน้ต:") || text.startsWith("note:")) {
    const body   = text.replace(/^โน้ต:|^note:/i, "").trim();
    const title  = body.split("\n")[0].replace(/#[\S]+/g, "").trim() || "โน้ตใหม่";
    const goalId = inferGoalId(body);
    addNote(title, body, "secretary", goalId);
    render(); saveState();
    return `บันทึกโน้ตแล้ว: ${title}${goalLabel(goalId)}`;
  }

  if (text.startsWith("จ่าย")) {
    const parts       = text.split(/\s+/);
    const amountIndex = parts.findIndex((p) => Number.isFinite(Number(p)));
    if (amountIndex > 0) {
      const titleRaw = parts.slice(1, amountIndex).join(" ");
      const title    = titleRaw.replace(/#[\S]+/g, "").trim() || "รายจ่าย";
      const amount   = Number(parts[amountIndex]);
      const category = parts[amountIndex + 1]?.startsWith("#") ? "อื่นๆ" : (parts[amountIndex + 1] || "อื่นๆ");
      const goalId   = inferGoalId(text);
      addExpense(title, amount, category, getTodayKey(), goalId);
      render(); saveState();
      return `บันทึกรายจ่ายแล้ว: ${title} ${formatMoney(amount)}${goalLabel(goalId)}`;
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

  if (text.includes("goals") || text.includes("เป้าหมาย")) {
    if (!state.goals.length) return "ยังไม่มี Goal ที่บันทึกไว้";
    return state.goals.map(g => {
      const pct = calcGoalProgress(g.id);
      const done = state.tasks.filter(t => t.goal_id === g.id && isTaskDone(t)).length;
      const total = state.tasks.filter(t => t.goal_id === g.id).length;
      return `• ${g.title}: ${pct}% (${done}/${total} งาน)`;
    }).join("\n");
  }

  return "ยังไม่เข้าใจคำสั่งนี้ ตอนนี้รองรับ:\nเพิ่มงาน, โน้ต:, จ่าย, วันนี้มีงานอะไร, สรุปรายจ่าย, goals\nใช้ #ชื่อgoal ต่อท้ายเพื่อระบุ Goal โดยตรง";
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

/* ── Task filter chips ── */
document.querySelectorAll("[data-task-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    state.taskFilter = button.dataset.taskFilter;
    document.querySelectorAll("[data-task-filter]").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    renderTasks();
  });
});

/* ── Task view toggle (list / kanban) ── */
document.getElementById("taskViewToggle")?.addEventListener("click", () => {
  _taskView = _taskView === "list" ? "kanban" : "list";
  const listView   = document.getElementById("taskListView");
  const kanbanView = document.getElementById("taskKanbanView");
  const iconList   = document.getElementById("iconViewList");
  const iconKanban = document.getElementById("iconViewKanban");
  if (_taskView === "kanban") {
    listView.hidden   = true;
    kanbanView.hidden = false;
    if (iconList)   iconList.hidden   = true;
    if (iconKanban) iconKanban.hidden = false;
    renderKanban();
  } else {
    listView.hidden   = false;
    kanbanView.hidden = true;
    if (iconList)   iconList.hidden   = false;
    if (iconKanban) iconKanban.hidden = true;
    renderTasks();
  }
});

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
  const goalId      = document.getElementById("modalTaskGoal")?.value || null;
  const hasTarget   = document.getElementById("taskTargetToggle")?.checked;
  const targetValue = hasTarget ? (Number(document.getElementById("modalTaskTargetValue")?.value) || null) : null;
  const targetUnit  = hasTarget ? (document.getElementById("modalTaskTargetUnit")?.value.trim() || "") : "";
  const progRaw     = document.getElementById("modalTaskProgressValue")?.value;
  const progressVal = progRaw !== "" ? Number(progRaw) : null; // null = keep existing

  if (_taskModalEditId) {
    const existing = state.tasks.find(t => t.id === _taskModalEditId);
    state.tasks = state.tasks.map(t =>
      t.id === _taskModalEditId
        ? { ...t, title, description, status, priority, due, labels, goal_id: goalId || null,
            target_value: targetValue, target_unit: targetUnit,
            progress_value: progressVal !== null ? progressVal : (existing?.progress_value || 0) }
        : t
    );
    showToast(`อัปเดตงาน "${title}" แล้ว`);
  } else {
    addTask(title, priority, due, status, description, labels, goalId, targetValue, targetUnit);
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

document.getElementById("noteForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const title  = document.getElementById("noteTitle").value.trim();
  if (!title) return;
  const goalId = document.getElementById("noteGoal")?.value || null;
  addNote(title, document.getElementById("noteBody").value.trim(), document.getElementById("noteTags").value.trim(), goalId);
  event.currentTarget.reset();
  populateGoalSelects("noteGoal", "expenseGoal");
  renderAfterNote();
  showToast(`บันทึกโน้ต "${title}" แล้ว`);
});

document.getElementById("expenseDate").value = getTodayKey();
document.getElementById("expenseForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const title  = document.getElementById("expenseTitle").value.trim();
  const amount = document.getElementById("expenseAmount").value;
  if (!title || !amount) return;
  const goalId = document.getElementById("expenseGoal")?.value || null;
  addExpense(title, amount, document.getElementById("expenseCategory").value, document.getElementById("expenseDate").value, goalId);
  event.currentTarget.reset();
  document.getElementById("expenseDate").value = getTodayKey();
  populateGoalSelects("noteGoal", "expenseGoal");
  renderAfterExpense();
  showToast(`บันทึก ${title} ${formatMoney(Number(amount))} แล้ว`);
});

/* ── Goals form ── */
document.getElementById("goalForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("goalTitle").value.trim();
  if (!title) return;
  addGoal(title);
  e.currentTarget.reset();
  populateGoalSelects("noteGoal", "expenseGoal");
  renderGoals();
  renderGoalProgressDash();
  saveState();
  showToast(`เพิ่ม Goal "${title}" แล้ว`);
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

document.getElementById("noteList").addEventListener("submit", (e) => {
  const form = e.target.closest("[data-edit-form-note]");
  if (!form) return;
  e.preventDefault();
  const id = form.dataset.editFormNote;
  const newTitle  = form.querySelector(".task-edit-title").value.trim();
  const newBody   = form.querySelector(".note-edit-body").value.trim();
  const newTags   = form.querySelector(".note-edit-tags").value.trim();
  const newGoalId = form.querySelector(".note-edit-goal")?.value || null;
  if (!newTitle) return;
  state.notes = state.notes.map(n =>
    n.id === id ? { ...n, title: newTitle, body: newBody, tags: newTags, goal_id: newGoalId || null } : n
  );
  _editingNoteId = null;
  renderAfterNote();
  showToast("อัปเดตโน้ตแล้ว");
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
  const newGoalId  = form.querySelector(".expense-edit-goal")?.value || null;
  if (!newTitle || isNaN(newAmount)) return;
  state.expenses = state.expenses.map(ex =>
    ex.id === id ? { ...ex, title: newTitle, amount: newAmount, category: newCat, date: newDate, goal_id: newGoalId || null } : ex
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
  // Focus task
  if (target.closest("[data-focus-task]")) {
    const id = target.closest("[data-focus-task]").dataset.focusTask;
    _focusTaskId = (_focusTaskId === id) ? null : id;  // toggle
    renderFocusTaskPicker();
    renderTasks();
    if (_focusTaskId) showToast("Focus: " + (state.tasks.find(t => t.id === id)?.title || ""));
    return;
  }
  if (target.closest("[data-clear-focus-task]")) {
    _focusTaskId = null;
    renderFocusTaskPicker();
    renderTasks();
    return;
  }

  const editNoteId      = target.closest("[data-edit-note]")?.dataset.editNote;
  const cancelNoteId    = target.closest("[data-cancel-edit-note]")?.dataset.cancelEditNote;
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

  // Progress log: toggle input row
  const logTaskId = target.closest("[data-log-task]")?.dataset.logTask;
  if (logTaskId) {
    const row = document.getElementById(`logRow-${logTaskId}`);
    if (row) {
      row.hidden = !row.hidden;
      if (!row.hidden) row.querySelector(`[data-log-input]`)?.focus();
    }
    return;
  }
  const logCancelId = target.closest("[data-log-cancel]")?.dataset.logCancel;
  if (logCancelId) {
    const row = document.getElementById(`logRow-${logCancelId}`);
    if (row) { row.hidden = true; const inp = row.querySelector(`[data-log-input]`); if (inp) inp.value = ""; }
    return;
  }
  const logConfirmId = target.closest("[data-log-confirm]")?.dataset.logConfirm;
  if (logConfirmId) {
    const row   = document.getElementById(`logRow-${logConfirmId}`);
    const input = row?.querySelector(`[data-log-input]`);
    const amount = Number(input?.value);
    if (!amount || amount <= 0) return;
    state.tasks = state.tasks.map(t =>
      t.id === logConfirmId
        ? { ...t, progress_value: (Number(t.progress_value) || 0) + amount }
        : t
    );
    const task = state.tasks.find(t => t.id === logConfirmId);
    showToast(`บันทึก +${formatNum(amount)} ${task?.target_unit || ""} แล้ว`);
    saveState(); renderTasks(); renderGoals(); renderGoalProgressDash();
    return;
  }

  // Toggle % / value display
  const toggleModeId = target.closest("[data-toggle-progress-mode]")?.dataset.toggleProgressMode;
  if (toggleModeId) {
    const cur = _taskProgressMode.get(toggleModeId) || 'value';
    _taskProgressMode.set(toggleModeId, cur === 'value' ? 'pct' : 'value');
    renderTasks();
    return;
  }

  // Remove progress bar
  const removeProg = target.closest("[data-remove-progress]")?.dataset.removeProgress;
  if (removeProg) {
    state.tasks = state.tasks.map(t =>
      t.id === removeProg ? { ...t, target_value: null, target_unit: "", progress_value: 0 } : t
    );
    _taskProgressMode.delete(removeProg);
    showToast("ลบ Progress Bar แล้ว");
    saveState(); renderTasks(); renderGoals(); renderGoalProgressDash();
    return;
  }

  // Add progress bar quick-add: show inline form
  const addProgId = target.closest("[data-add-progress]")?.dataset.addProgress;
  if (addProgId) {
    const row = document.getElementById(`addProgRow-${addProgId}`);
    if (row) {
      row.hidden = !row.hidden;
      if (!row.hidden) row.querySelector(`[data-quick-target]`)?.focus();
    }
    return;
  }
  // Quick-add cancel
  const quickCancelId = target.closest("[data-quick-cancel]")?.dataset.quickCancel;
  if (quickCancelId) {
    const row = document.getElementById(`addProgRow-${quickCancelId}`);
    if (row) row.hidden = true;
    return;
  }
  // Quick-add confirm
  const quickConfirmId = target.closest("[data-quick-confirm]")?.dataset.quickConfirm;
  if (quickConfirmId) {
    const row        = document.getElementById(`addProgRow-${quickConfirmId}`);
    const targetVal  = Number(row?.querySelector(`[data-quick-target]`)?.value);
    const targetUnit = row?.querySelector(`[data-quick-unit]`)?.value.trim() || "";
    if (!targetVal || targetVal <= 0) { showToast("กรุณาใส่เป้าหมายที่มากกว่า 0"); return; }
    state.tasks = state.tasks.map(t =>
      t.id === quickConfirmId ? { ...t, target_value: targetVal, target_unit: targetUnit, progress_value: 0 } : t
    );
    showToast(`เพิ่ม Progress Bar แล้ว (เป้าหมาย ${formatNum(targetVal)} ${targetUnit})`);
    saveState(); renderTasks(); renderGoals(); renderGoalProgressDash();
    return;
  }


  if (editNoteId) {
    _editingNoteId = editNoteId;
    renderNotes();
    setTimeout(() => { const inp = document.querySelector(".task-edit-title"); if (inp) { inp.focus(); inp.select(); } }, 30);
    return;
  }
  if (cancelNoteId !== undefined) {
    _editingNoteId = null;
    renderNotes();
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
    }
  }

  if (deleteTaskId) {
    const task = state.tasks.find((t) => t.id === deleteTaskId);
    if (!task || !confirm(`ลบงาน "${task.title}"?`)) return;
    state.tasks = state.tasks.filter((t) => t.id !== deleteTaskId);
    renderAfterTask();
    showToast("ลบงานแล้ว");
  }

  if (deleteNoteId) {
    const note = state.notes.find((n) => n.id === deleteNoteId);
    if (!note || !confirm(`ลบโน้ต "${note.title}"?`)) return;
    state.notes = state.notes.filter((n) => n.id !== deleteNoteId);
    renderAfterNote();
    showToast("ลบโน้ตแล้ว");
  }

  if (deleteExpenseId) {
    const expense = state.expenses.find((e) => e.id === deleteExpenseId);
    if (!expense || !confirm(`ลบรายการ "${expense.title}"?`)) return;
    state.expenses = state.expenses.filter((e) => e.id !== deleteExpenseId);
    renderAfterExpense();
    showToast("ลบรายจ่ายแล้ว");
  }

  const deleteGoalId = target.closest("[data-delete-goal]")?.dataset.deleteGoal;
  if (deleteGoalId) {
    const goal = state.goals.find(g => g.id === deleteGoalId);
    if (!goal || !confirm(`ลบ Goal "${goal.title}"?`)) return;
    state.goals = state.goals.filter(g => g.id !== deleteGoalId);
    populateGoalSelects("noteGoal", "expenseGoal");
    renderGoals();
    renderGoalProgressDash();
    saveState();
    showToast("ลบ Goal แล้ว");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea, select")) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  const viewKeys = { "1": "dashboard", "2": "tasks", "3": "notes", "4": "expenses", "5": "calendar", "6": "goals", "7": "review" };
  if (viewKeys[e.key]) {
    e.preventDefault();
    setView(viewKeys[e.key]);
    return;
  }

  if (e.key === "n" || e.key === "N") {
    e.preventDefault();
    const activeView = document.querySelector(".view.active");
    const firstInput = activeView?.querySelector('input[type="text"], input[type="number"], textarea');
    if (firstInput) { firstInput.focus(); firstInput.select(); }
    return;
  }

  if (e.key === "Escape") {
    document.activeElement?.blur();
  }
});

/* ── Sidebar toggle — restore persisted state ── */
(function() {
  const shell = document.querySelector(".app-shell");
  if (shell && localStorage.getItem("sidebarCollapsed") === "1") {
    shell.classList.add("sidebar-collapsed");
  }
})();

/* ── Focus timer (Pomodoro) ── */
(function initFocusTimer() {
  const btnStart  = document.getElementById("focusTimerBtn");
  const btnReset  = document.getElementById("focusTimerReset");
  const btnFinish = document.getElementById("focusFinishBtn");
  const label     = document.getElementById("focusTimerLabel");
  const input     = document.getElementById("focusTimeInput");
  const arc       = document.getElementById("focusArc");
  if (!btnStart || !arc) return;

  const CIRCUMFERENCE = 2 * Math.PI * 28;
  arc.style.strokeDasharray = CIRCUMFERENCE;

  let totalSecs = 25 * 60;
  let remaining = totalSecs;
  let interval  = null;
  let running   = false;

  function fmt(secs) {
    return `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  }

  function updateDisplay() {
    if (label) label.textContent = fmt(remaining);
    arc.style.strokeDashoffset = CIRCUMFERENCE * (1 - remaining / totalSecs);
  }

  function setTotal(mins) {
    totalSecs = Math.max(1, Math.min(99, mins)) * 60;
    remaining = totalSecs;
    updateDisplay();
    document.querySelectorAll(".focus-preset").forEach(b =>
      b.classList.toggle("focus-preset--active", Number(b.dataset.minutes) === mins)
    );
  }

  function playChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [[523.25, 0], [659.25, 0.22], [783.99, 0.44], [1046.5, 0.66]].forEach(([freq, delay]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine"; osc.frequency.value = freq;
        const t = ctx.currentTime + delay;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (delay < 0.6 ? 0.55 : 1.0));
        osc.start(t); osc.stop(t + 1.1);
      });
      setTimeout(() => ctx.close(), 2500);
    } catch (e) {}
  }

  function showDonePrompt() {
    const ft = _focusTaskId ? state.tasks.find(t => t.id === _focusTaskId && !isTaskDone(t)) : null;
    if (ft) {
      const prompt = document.getElementById("focusDonePrompt");
      const textEl = document.getElementById("focusDoneText");
      const yesBtn = document.getElementById("focusDoneYes");
      if (prompt && textEl && yesBtn) {
        textEl.textContent = ft.title;
        yesBtn.dataset.completeTask = _focusTaskId;
        prompt.hidden = false;
      }
    } else {
      showToast("⏰ Focus session เสร็จแล้ว! พักสักครู่");
    }
  }

  function stop() {
    clearInterval(interval); interval = null; running = false;
    btnStart.textContent = "▶ Start";
    btnStart.classList.remove("running");
    if (btnFinish) btnFinish.hidden = true;
    arc.style.stroke = "#0A84FF";
  }

  function reset() {
    stop();
    remaining = totalSecs;
    updateDisplay();
  }

  // ── Start / Pause
  btnStart.addEventListener("click", () => {
    if (running) {
      clearInterval(interval); interval = null; running = false;
      btnStart.textContent = "▶ Resume";
      btnStart.classList.remove("running");
    } else {
      if (remaining <= 0) { remaining = totalSecs; updateDisplay(); }
      running = true;
      btnStart.textContent = "⏸ Pause";
      btnStart.classList.add("running");
      if (btnFinish) btnFinish.hidden = false;
      arc.style.stroke = "#0A84FF";
      interval = setInterval(() => {
        remaining--;
        updateDisplay();
        if (remaining <= 0) {
          stop(); playChime(); showDonePrompt();
        }
      }, 1000);
    }
  });

  // ── Reset
  btnReset?.addEventListener("click", reset);

  // ── Manual finish early
  btnFinish?.addEventListener("click", () => {
    stop(); remaining = 0; updateDisplay(); playChime(); showDonePrompt();
  });

  // ── Preset chips
  document.querySelectorAll(".focus-preset").forEach(btn => {
    btn.addEventListener("click", () => { if (!running) setTotal(Number(btn.dataset.minutes)); });
  });

  // ── Tap label to set custom time
  label?.addEventListener("click", () => {
    if (running || !input) return;
    input.value = Math.round(totalSecs / 60);
    label.hidden = true; input.hidden = false;
    input.focus(); input.select();
  });
  label?.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") label.click(); });

  function commitInput() {
    const mins = parseInt(input.value, 10);
    if (!isNaN(mins) && mins >= 1) setTotal(mins);
    input.hidden = true; if (label) label.hidden = false;
  }
  input?.addEventListener("blur", commitInput);
  input?.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); commitInput(); }
    if (e.key === "Escape") { input.hidden = true; if (label) label.hidden = false; }
  });

  updateDisplay();
})();


/* ── Focus done prompt ── */
document.getElementById("focusDoneYes")?.addEventListener("click", e => {
  const taskId = e.currentTarget.dataset.completeTask;
  if (taskId) {
    state.tasks = state.tasks.map(t => t.id === taskId ? { ...t, status: "done" } : t);
    _focusTaskId = null;
    renderAfterTask();
    showToast("งานเสร็จแล้ว 🎉 เยี่ยมมาก!");
  }
  document.getElementById("focusDonePrompt").hidden = true;
});
document.getElementById("focusDoneNo")?.addEventListener("click", () => {
  _focusTaskId = null;
  document.getElementById("focusDonePrompt").hidden = true;
  renderFocusTaskPicker();
  renderTasks();
  showToast("⏰ Focus session เสร็จแล้ว! พักสักครู่");
});

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
    showToast(msg, 6000);
  }
}



function updateAuthBar(user) {
  const loggedInRow = document.getElementById("authLoggedInRow");
  const guestRow    = document.getElementById("authGuestRow");
  const emailEl     = document.getElementById("authUserEmailTopbar");
  const subtitle    = document.getElementById("brandSubtitle");

  if (loggedInRow) loggedInRow.hidden = !user;
  if (guestRow)    guestRow.hidden = !!user;

  const lineInfo = Auth.getLineInfo();
  const displayLabel = lineInfo?.displayName || (user ? 'LINE User' : '');
  if (emailEl) { emailEl.textContent = displayLabel; emailEl.hidden = !user; }
  if (subtitle) subtitle.textContent = user ? (lineInfo?.displayName || 'Connected') : 'Personal workspace';
}

async function onSignedIn(user) {
  // Guard: prevent double-execution for the same user (Auth.init + onChange can both fire)
  if (_syncedUserId === user.id) return;
  _syncedUserId = user.id;

  showApp();
  updateAuthBar(user);

  // Fetch LINE profile early so display name and plan are ready
  await Auth.fetchLineInfo();
  updateAuthBar(user);

  updateSyncStatus('loading');
  const cloud = await Storage.loadCloud();

  if (cloud) {
    // Merge: union of real-local + cloud, cloud items win on conflict.
    // Demo items are stripped — they exist only in guest/unauthed mode.
    function mergeItems(local, remote) {
      const realLocal = (local || []).filter(i => !i._isDemo);
      if (!remote || remote.length === 0) return realLocal;
      const map = new Map(realLocal.map(i => [i.id, i]));
      for (const item of remote) map.set(item.id, item);
      return [...map.values()];
    }
    const merged = {
      tasks:    mergeItems(state.tasks,    cloud.tasks),
      notes:    mergeItems(state.notes,    cloud.notes),
      expenses: mergeItems(state.expenses, cloud.expenses),
      goals:    mergeItems(state.goals,    cloud.goals),
    };
    state = { ...state, ...merged };
    showToast(merged.tasks.length > 0 ? `โหลดข้อมูลจาก cloud (${merged.tasks.length} งาน)` : "เชื่อมต่อแล้ว ✓");
    saveState();
    render();
  }
  // loadCloud failure is non-critical — local data still intact, next save will retry
  updateSyncStatus('idle');
}

/* ── Auth modal helpers — module-scope so homepage buttons can call openAuthModal() directly ── */
const _authModal         = document.getElementById("authModal");
const _authLoginPanel    = document.getElementById("authLoginPanel");
const _authSignedInPanel = document.getElementById("authSignedInPanel");

function _showAuthPanel(name) {
  [_authLoginPanel, _authSignedInPanel].forEach(p => { if (p) p.hidden = true; });
  if (name === 'login'    && _authLoginPanel)    _authLoginPanel.hidden    = false;
  if (name === 'signedIn' && _authSignedInPanel) _authSignedInPanel.hidden = false;
}

function openAuthModal() {
  const errEl = document.getElementById('authError');
  if (errEl) { errEl.textContent = ''; errEl.hidden = true; }
  _showAuthPanel(Auth.isLoggedIn() ? 'signedIn' : 'login');
  _authModal.showModal();
}

async function initAuth() {
  /* ── Handle ?auth_error= from LINE callback ── */
  const urlParams = new URLSearchParams(location.search);
  const authErr = urlParams.get('auth_error');
  if (authErr) {
    history.replaceState(null, '', location.pathname + location.hash);
    showToast(`เข้าสู่ระบบไม่สำเร็จ: ${authErr}`, 4000);
  }

  /* ── Modal wiring ── */
  document.getElementById("authLoginBtn")?.addEventListener("click", openAuthModal);
  document.getElementById("authModalClose")?.addEventListener("click", () => _authModal.close());
  _authModal.addEventListener("click", e => { if (e.target === _authModal) _authModal.close(); });
  _authModal.addEventListener("click", e => { if (e.target.closest("[data-auth-close]")) _authModal.close(); });

  document.getElementById("authLineLoginBtn")?.addEventListener("click", () => Auth.signInWithLine());

  document.getElementById("authLogoutTopBtn")?.addEventListener("click", async () => {
    await Auth.signOut();
    state = Storage.loadLocal(defaultState);
    render();
    showHomepage();
  });

  document.getElementById("authLogoutModalBtn")?.addEventListener("click", async () => {
    await Auth.signOut();
    state = Storage.loadLocal(defaultState);
    render();
    _authModal.close();
    showHomepage();
  });

  /* ── Async init ── */
  const user = await Auth.init();
  updateAuthBar(user);
  if (user) {
    onSignedIn(user);
  } else if (!_inApp) {
    showHomepage();
  }

  Auth.onChange((event, u) => {
    updateAuthBar(u);
    if (event === "SIGNED_IN")  onSignedIn(u);
    if (event === "SIGNED_OUT") {
      _syncedUserId = null;
      showToast("ออกจากระบบแล้ว — ข้อมูล local ยังอยู่");
      showHomepage();
    }
  });
}

/* ── Homepage button wiring ──
   hpNavLoginBtn / hpLoginBtn: open auth modal (dialog goes to top-layer,
   visible even while app-shell is display:none)
   hpGuestBtn / hpFooterGuestBtn: enter guest mode instantly ── */
document.getElementById("hpNavLoginBtn")?.addEventListener("click", openAuthModal);
document.getElementById("hpLoginBtn")?.addEventListener("click", openAuthModal);
document.getElementById("hpFooterLoginBtn")?.addEventListener("click", openAuthModal);

renderHomepageDemo();

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

// ── Render sidebar based on LINE info from Supabase ──────────────────────────

function renderLineSidebar(lineInfo) {
  const dot      = document.getElementById('lineStatusDot')
  const text     = document.getElementById('lineStatusText')
  const card     = document.getElementById('lineProfileCard')
  const pic      = document.getElementById('lineProfilePic')
  const name     = document.getElementById('lineProfileName')
  const badge    = document.getElementById('lineTierBadge')

  if (!dot || !text) return

  if (!Auth.isLoggedIn()) {
    dot.classList.remove('line-status-dot--connected')
    text.textContent = 'ไม่ได้ Log in'
    if (card) card.hidden = true
    return
  }

  if (lineInfo) {
    dot.classList.add('line-status-dot--connected')
    text.textContent = 'เชื่อมต่อแล้ว'

    if (card) {
      if (pic && lineInfo.pictureUrl) {
        pic.src = lineInfo.pictureUrl
        pic.hidden = false
      } else if (pic) {
        pic.hidden = true
      }
      if (name) name.textContent = lineInfo.displayName || 'LINE User'
      if (badge) {
        const isPro = lineInfo.plan === 'pro'
        badge.textContent = isPro ? 'Pro' : 'Free'
        badge.className = 'line-tier-badge' + (isPro ? ' line-tier-badge--premium' : '')
      }
      card.hidden = false
    }

    /* Update signed-in panel in auth modal */
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
  } else {
    // Logged in but not a LINE user (email-only account)
    dot.classList.remove('line-status-dot--connected')
    text.textContent = 'ยังไม่ได้เชื่อม'
    if (card) card.hidden = true
  }
}

// Fetch LINE info then update sidebar. Called after login and on auth change.
async function updateLineSidebar() {
  const lineInfo = Auth.isLoggedIn()
    ? await Auth.fetchLineInfo()
    : null
  renderLineSidebar(lineInfo)

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
      goal_id: null,
      createdAt: new Date(n.createdAt).getTime(),
      _isKVLine: true
    }))

    state.notes = [...state.notes.filter(n => !n._isKVLine), ...kvNotes]
    renderNotes()
  } catch (_) {}
}

// ── Init ──────────────────────────────────────────────────────────────────────

function initLineSidebar() {
  // Remove legacy localStorage key — no longer used
  localStorage.removeItem('lineUserId')

  // Initial render (may be logged in already on page load)
  updateLineSidebar()

  // Re-render on every auth state change (login / logout)
  Auth.onChange(() => updateLineSidebar())
}

initLineSidebar()
