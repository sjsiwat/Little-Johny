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
let _dragTaskId       = null;

/* ── Task / priority ── */
const PRIORITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };

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

function renderDeadlineBadge(due, done) {
  const info = getDeadlineInfo(due, done);
  if (!info && due)  return `<span class="task-due-chip">${formatDate(due)}</span>`;
  if (!info)         return "";
  if (info.type === "overdue") return `<span class="deadline-badge deadline-badge--overdue">เกิน ${info.days} วัน</span>`;
  if (info.type === "today")   return `<span class="deadline-badge deadline-badge--today">ครบกำหนดวันนี้</span>`;
  if (info.type === "soon")    return `<span class="deadline-badge deadline-badge--soon">อีก ${info.days} วัน</span>`;
  return "";
}

function renderTaskLabelChips(labels) {
  if (!labels?.length) return "";
  return labels.map(id => {
    const l = TASK_LABELS.find(x => x.id === id);
    return l ? `<span class="task-label-chip" style="--lc:${l.color}">${escapeHtml(l.name)}</span>` : "";
  }).join("");
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

  return {
    // ── Tasks: ครบทุก priority × status ──────────────────────
    tasks: [
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "ส่งสรุปรายงานประจำเดือนมิถุนายน",
        description: "รวบรวมข้อมูลรายจ่ายและรายรับ พร้อม slide สรุปให้ทีม",
        priority: "Critical", due: d(0), status: "in_progress",
        labels: ["urgent", "work"], createdAt: ts(5)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "ประชุม Product Review 14:00 น.",
        description: "เตรียม slide deck และ demo ฟีเจอร์ใหม่ให้พร้อม",
        priority: "High", due: d(0), status: "todo",
        labels: ["meeting", "work"], createdAt: ts(20)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "เขียน spec ฟีเจอร์ Notification ส่งทีม Dev",
        description: "",
        priority: "Medium", due: d(3), status: "todo",
        labels: ["work"], createdAt: ts(60)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "Review Pull Request ของทีม Backend",
        description: "ดู PR #42 และ #43 เพิ่มเติม",
        priority: "High", due: d(1), status: "review",
        labels: ["work"], createdAt: ts(90)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "อ่านหนังสือก่อนนอน 30 นาที",
        description: "",
        priority: "Low", due: d(0), status: "todo",
        labels: ["personal"], createdAt: ts(120)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "อัปเดต README และ documentation",
        description: "",
        priority: "Low", due: "", status: "done",
        labels: ["work"], createdAt: ts(300)
      }
    ],

    // ── Notes: ครบทุกรูปแบบการใช้งาน ─────────────────────────
    notes: [
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "ไอเดีย Feature Q3",
        body: "• Reminder แจ้งเตือนก่อน deadline อัตโนมัติ\n• Export รายจ่ายเป็น PDF รายเดือน\n• Focus Timer เชื่อมกับ task โดยตรง\n• Weekly summary รายงานสรุปประจำสัปดาห์\n• Shortcut เพิ่มงานด้วยเสียง",
        tags: "ไอเดีย, product, Q3",
        createdAt: ts(10)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "สรุป Sprint Meeting 23 มิ.ย.",
        body: "Sprint Goal: ปิด 3 feature ภายใน 2 สัปดาห์\n\n✅ เสร็จแล้ว: Login, Dashboard, Tasks CRUD\n🔄 กำลังทำ: Notes inline edit, Expenses chart\n⛔ Blocked: รอ design จาก UX team\n\nAction items:\n→ @Beam ส่ง mockup ภายใน พฤ. นี้\n→ @Me เขียน API spec ก่อน ศ.",
        tags: "ประชุม, sprint, สรุป",
        createdAt: ts(120)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "แรงบันดาลใจ",
        body: "\"Done is better than perfect.\"\n— Mark Zuckerberg\n\n\"ความสำเร็จ คือผลรวมของความพยายามเล็กๆ น้อยๆ ที่ทำทุกวัน\"\n\n\"The secret of getting ahead is getting started.\"\n— Mark Twain",
        tags: "แรงบันดาล, คำคม",
        createdAt: ts(240)
      }
    ],

    // ── Expenses: หลายหมวด หลายวัน — กราฟสรุปโชว์ครบ ──────────
    expenses: [
      // วันนี้
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "กาแฟ Oat Latte",
        amount: 95, category: "เครื่องดื่ม", date: d(0), createdAt: ts(30)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "ข้าวกลางวัน + น้ำ",
        amount: 135, category: "อาหาร", date: d(0), createdAt: ts(90)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "BTS ไป-กลับ",
        amount: 84, category: "เดินทาง", date: d(0), createdAt: ts(120)
      },
      // เมื่อวาน
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "อาหารเย็น ชาบู",
        amount: 380, category: "อาหาร", date: d(-1), createdAt: ts(300)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "ชาไข่มุก",
        amount: 65, category: "เครื่องดื่ม", date: d(-1), createdAt: ts(360)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "Grab ไปห้าง",
        amount: 120, category: "เดินทาง", date: d(-1), createdAt: ts(420)
      },
      // 3 วันก่อน
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "ค่ายา + วิตามิน",
        amount: 350, category: "สุขภาพ", date: d(-3), createdAt: ts(600)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "เสื้อยืด Uniqlo",
        amount: 590, category: "ช้อปปิ้ง", date: d(-3), createdAt: ts(660)
      },
      // ต้นเดือน
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "Netflix รายเดือน",
        amount: 419, category: "อื่นๆ", date: d(-8), createdAt: ts(1440)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "ค่าอินเทอร์เน็ตบ้าน",
        amount: 599, category: "อินเทอร์เน็ต", date: d(-10), createdAt: ts(2000)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "ค่าอาหารเช้า + กาแฟ",
        amount: 110, category: "อาหาร", date: d(-5), createdAt: ts(900)
      },
      {
        id: crypto.randomUUID(), _isDemo: true,
        title: "ออกกำลังกาย รายเดือน",
        amount: 450, category: "สุขภาพ", date: d(-12), createdAt: ts(2400)
      }
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
  taskFilter: "all",
  ...createDemoState()
};

let state = (() => {
  const s = Storage.loadLocal(defaultState);
  // migrate old status values and ensure new fields exist
  s.tasks = (s.tasks || []).map(t => ({
    description: "",
    labels: [],
    ...t,
    status: normalizeStatus(t.status),
  }));
  return s;
})();

const views = {
  dashboard: document.getElementById("dashboard"),
  tasks: document.getElementById("tasks"),
  notes: document.getElementById("notes"),
  expenses: document.getElementById("expenses"),
  calendar: document.getElementById("calendar"),
  secretary: document.getElementById("secretary")
};

const viewTitles = {
  dashboard: "Dashboard",
  tasks: "Tasks",
  notes: "Notes",
  expenses: "Expenses",
  calendar: "Calendar",
  secretary: "Assistant"
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
  renderSecretary();
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
    ? filtered.map((task) => {
        const done = isTaskDone(task);
        const sm   = STATUS_META[task.status] || STATUS_META.todo;
        const deadlineBadge = renderDeadlineBadge(task.due, done);
        const labelChips    = renderTaskLabelChips(task.labels);
        return `
          <article class="task-list-item${done ? " is-done" : ""}" data-task-id="${task.id}">
            <button class="task-check-btn" type="button" data-toggle-task="${task.id}"
              aria-pressed="${done}" title="${done ? "เปิดงานอีกครั้ง" : "ทำเครื่องหมายเสร็จ"}">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                ${done ? '<path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' : '<rect x="1" y="1" width="10" height="10" rx="2.5" stroke="currentColor" stroke-width="1.5"/>'}
              </svg>
            </button>
            <div class="task-list-body">
              <div class="task-list-top">
                <span class="task-list-title">${escapeHtml(task.title)}</span>
                <span class="task-priority-dot task-priority-dot--${task.priority.toLowerCase()}" title="${task.priority}"></span>
              </div>
              ${task.description ? `<p class="task-list-desc">${escapeHtml(task.description)}</p>` : ""}
              <div class="task-list-meta">
                <span class="task-status-pill" style="--sc:${sm.color}">${sm.label}</span>
                ${deadlineBadge}
                ${labelChips}
              </div>
            </div>
            <div class="task-list-actions">
              ${!done ? `<button class="icon-button icon-button--focus${_focusTaskId === task.id ? " is-focusing" : ""}" type="button" data-focus-task="${task.id}" title="Focus" aria-label="Focus">
                <svg width="10" height="11" viewBox="0 0 10 11" fill="none" aria-hidden="true"><path d="M2 1l7 4.5-7 4.5V1z" fill="currentColor"/></svg>
              </button>` : ""}
              <button class="icon-button icon-button--edit" type="button" data-edit-task="${task.id}" title="แก้ไขงาน" aria-label="แก้ไขงาน">
                ${ICON_EDIT}
              </button>
              <button class="icon-button" type="button" data-delete-task="${task.id}" title="ลบงาน">×</button>
            </div>
          </article>`;
      }).join("")
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
          const deadlineBadge = renderDeadlineBadge(t.due, isTaskDone(t));
          const labelChips    = renderTaskLabelChips(t.labels);
          return `
            <div class="kanban-card" draggable="true" data-task-id="${t.id}" data-drag-task="${t.id}">
              <div class="kanban-card-top">
                <span class="task-priority-dot task-priority-dot--${t.priority.toLowerCase()}" title="${t.priority}"></span>
                <span class="kanban-card-title">${escapeHtml(t.title)}</span>
                <button class="kanban-card-edit" type="button" data-edit-task="${t.id}" title="แก้ไข" aria-label="แก้ไขงาน">
                  ${ICON_EDIT}
                </button>
              </div>
              ${t.description ? `<p class="kanban-card-desc">${escapeHtml(t.description)}</p>` : ""}
              ${deadlineBadge || labelChips ? `<div class="kanban-card-footer">${deadlineBadge}${labelChips}</div>` : ""}
            </div>`;
        }).join("")
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
  document.getElementById("modalTaskTitle").value   = task?.title || "";
  document.getElementById("modalTaskDesc").value    = task?.description || "";
  document.getElementById("modalTaskStatus").value  = task?.status || defaultStatus;
  document.getElementById("modalTaskPriority").value = task?.priority || "Medium";
  document.getElementById("modalTaskDue").value     = task?.due || "";
  document.getElementById("taskModalDelete").hidden = !task;

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
  document.getElementById("noteList").innerHTML = state.notes.length
    ? [...state.notes]
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((note) => {
          if (note.id === _editingNoteId) return renderNoteEditForm(note);
          return `
            <article class="list-item">
              <div>
                <span class="item-title">${escapeHtml(note.title)}</span>
                <span class="item-meta">${escapeHtml(note.tags || "ไม่มี tag")} · ${relativeTime(note.createdAt)}</span>
                ${note.body ? `<p class="muted">${escapeHtml(note.body)}</p>` : ""}
              </div>
              <div class="item-actions">
                <button class="icon-button icon-button--edit" type="button" data-edit-note="${note.id}" title="แก้ไขโน้ต" aria-label="แก้ไขโน้ต">
                  ${ICON_EDIT}
                </button>
                <button class="icon-button" type="button" data-delete-note="${note.id}" title="ลบโน้ต">×</button>
              </div>
            </article>
          `;
        })
        .join("")
    : emptyState("ยังไม่มีโน้ต เริ่มจดสิ่งที่คิดได้เลย", "notes", "เขียนโน้ต");
}

function renderNoteEditForm(note) {
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
          <div class="task-edit-actions">
            <button type="submit" class="task-edit-save">บันทึก</button>
            <button type="button" class="task-edit-cancel" data-cancel-edit-note="${note.id}">ยกเลิก</button>
          </div>
        </div>
      </form>
    </article>
  `;
}

function renderExpenses() {
  const todayKey  = getTodayKey();
  const monthKey  = getMonthKey();
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

  document.getElementById("expenseList").innerHTML = state.expenses.length
    ? [...state.expenses]
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((expense) => {
          if (expense.id === _editingExpenseId) return renderExpenseEditForm(expense);
          return `
            <article class="list-item">
              <div>
                <span class="item-title">${escapeHtml(expense.title)} · ${formatMoney(expense.amount)}</span>
                <span class="item-meta">${escapeHtml(expense.category)} · ${formatDate(expense.date)}</span>
              </div>
              <div class="item-actions">
                <button class="icon-button icon-button--edit" type="button" data-edit-expense="${expense.id}" title="แก้ไขรายจ่าย" aria-label="แก้ไขรายจ่าย">
                  ${ICON_EDIT}
                </button>
                <button class="icon-button" type="button" data-delete-expense="${expense.id}" title="ลบรายจ่าย">×</button>
              </div>
            </article>
          `;
        })
        .join("")
    : emptyState("ยังไม่มีรายจ่าย เริ่มบันทึกได้เลย", "expenses", "บันทึกรายจ่าย");
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

function renderSecretary() {
  document.getElementById("assistantLog").innerHTML = state.logs.length
    ? state.logs
        .slice(-8)
        .reverse()
        .map((line) => `<div class="log-line">${escapeHtml(line)}</div>`)
        .join("")
    : emptyState("ยังไม่มีประวัติคำสั่ง ลองพิมพ์ เพิ่มงาน หรือ จ่าย ตามด้วยรายการ", "secretary", "ลองส่งคำสั่ง");
}

function renderSimpleTask(task) {
  return `
    <article class="list-item">
      <div class="task-row">
        <span class="task-dot task-dot--${task.priority}" aria-hidden="true"></span>
        <div>
          <span class="item-title">${escapeHtml(task.title)}</span>
          <span class="item-meta"><span class="priority-${task.priority}">${task.priority}</span>${task.due ? " · " + formatDate(task.due) : ""}</span>
        </div>
      </div>
    </article>
  `;
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
  return `
    <article class="list-item">
      <span class="item-title">${escapeHtml(note.title)}</span>
      <span class="item-meta">${relativeTime(note.createdAt)}${note.tags ? " · " + escapeHtml(note.tags) : ""}</span>
    </article>
  `;
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
  return { theme: state.theme || "dark", taskFilter: "all", ...createDemoState() };
}

function enterGuestMode() {
  state = freshDemoState(); // always reset to clean demo — ignore any stale localStorage
  render();
  showApp();
  setView("dashboard");
}

function addTask(title, priority = "Medium", due = "", status = "todo", description = "", labels = []) {
  state.tasks.unshift({
    id: crypto.randomUUID(),
    title,
    description,
    priority,
    due,
    status,
    labels,
    createdAt: Date.now()
  });
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

function parseCommand(rawText) {
  const text = rawText.trim();
  if (!text) return "ยังไม่ได้พิมพ์คำสั่ง";

  if (text.startsWith("เพิ่มงาน")) {
    const title = text.replace("เพิ่มงาน", "").trim();
    addTask(title || "งานใหม่จาก Secretary", "Medium", "");
    return `เพิ่มงานแล้ว: ${title || "งานใหม่จาก Secretary"}`;
  }

  if (text.startsWith("โน้ต:") || text.startsWith("note:")) {
    const body = text.replace(/^โน้ต:|^note:/i, "").trim();
    const title = body.split("\n")[0] || "โน้ตใหม่";
    addNote(title, body, "secretary");
    return `บันทึกโน้ตแล้ว: ${title}`;
  }

  if (text.startsWith("จ่าย")) {
    const parts = text.split(/\s+/);
    const amountIndex = parts.findIndex((part) => Number.isFinite(Number(part)));
    if (amountIndex > 0) {
      const title = parts.slice(1, amountIndex).join(" ") || "รายจ่าย";
      const amount = Number(parts[amountIndex]);
      const category = parts[amountIndex + 1] || "อื่นๆ";
      addExpense(title, amount, category);
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

  return "ยังไม่เข้าใจคำสั่งนี้ ตอนนี้รองรับ: เพิ่มงาน, โน้ต:, จ่าย, วันนี้มีงานอะไร, สรุปรายจ่าย";
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

  if (_taskModalEditId) {
    state.tasks = state.tasks.map(t =>
      t.id === _taskModalEditId ? { ...t, title, description, status, priority, due, labels } : t
    );
    showToast(`อัปเดตงาน "${title}" แล้ว`);
  } else {
    addTask(title, priority, due, status, description, labels);
    showToast(`เพิ่มงาน "${title}" แล้ว`);
  }
  closeTaskModal();
  renderAfterTask();
});

/* ── Task modal cancel & close ── */
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
  const title = document.getElementById("noteTitle").value.trim();
  if (!title) return;
  addNote(title, document.getElementById("noteBody").value.trim(), document.getElementById("noteTags").value.trim());
  event.currentTarget.reset();
  renderAfterNote();
  showToast(`บันทึกโน้ต "${title}" แล้ว`);
});

document.getElementById("expenseDate").value = getTodayKey();
document.getElementById("expenseForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const title = document.getElementById("expenseTitle").value.trim();
  const amount = document.getElementById("expenseAmount").value;
  if (!title || !amount) return;
  addExpense(title, amount, document.getElementById("expenseCategory").value, document.getElementById("expenseDate").value);
  event.currentTarget.reset();
  document.getElementById("expenseDate").value = getTodayKey();
  renderAfterExpense();
  showToast(`บันทึก ${title} ${formatMoney(Number(amount))} แล้ว`);
});

document.getElementById("commandForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const commandInput = document.getElementById("commandText");
  const result = parseCommand(commandInput.value);
  state.logs.push(result);
  commandInput.value = "";
  render();
});

document.getElementById("noteList").addEventListener("submit", (e) => {
  const form = e.target.closest("[data-edit-form-note]");
  if (!form) return;
  e.preventDefault();
  const id = form.dataset.editFormNote;
  const newTitle = form.querySelector(".task-edit-title").value.trim();
  const newBody  = form.querySelector(".note-edit-body").value.trim();
  const newTags  = form.querySelector(".note-edit-tags").value.trim();
  if (!newTitle) return;
  state.notes = state.notes.map(n =>
    n.id === id ? { ...n, title: newTitle, body: newBody, tags: newTags } : n
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
});

document.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea, select")) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  const viewKeys = { "1": "dashboard", "2": "tasks", "3": "notes", "4": "expenses", "5": "calendar", "6": "secretary" };
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

/* ── Dashboard assistant chips ── */
document.querySelectorAll(".dash-assist-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    const input = document.getElementById("dashAssistInput");
    if (input) { input.value = chip.dataset.assist || ""; input.focus(); }
  });
});

document.getElementById("dashAssistSend")?.addEventListener("click", () => {
  const input = document.getElementById("dashAssistInput");
  if (!input?.value.trim()) return;
  const result = parseCommand(input.value);
  state.logs.push(result);
  input.value = "";
  render();
  showToast(result.length < 60 ? result : "ดำเนินการเรียบร้อย");
});

document.getElementById("dashAssistInput")?.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    document.getElementById("dashAssistSend")?.click();
  }
});

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

setView(location.hash.replace("#", "") && views[location.hash.replace("#", "")]
  ? location.hash.replace("#", "")
  : "dashboard");
render();

/* ── Auth UI ── */
function updateSyncStatus(status) {
  const dot   = document.getElementById('syncDot');
  const label = document.getElementById('syncLabel');
  if (!dot || !label) return;
  const states = {
    idle:    { cls: 'status-dot--online',  text: 'อยู่ในระบบ' },
    pending: { cls: 'status-dot--syncing', text: 'รอซิงค์…' },
    syncing: { cls: 'status-dot--syncing', text: 'กำลังซิงค์…' },
    synced:  { cls: 'status-dot--online',  text: 'ซิงค์แล้ว ✓' },
    offline: { cls: 'status-dot--offline', text: 'ออฟไลน์' },
    error:   { cls: 'status-dot--error',   text: 'ซิงค์ไม่สำเร็จ' }
  };
  const s = states[status] || states.idle;
  dot.className = `status-dot ${s.cls}`;
  label.textContent = s.text;
  if (status === 'synced') {
    setTimeout(() => { if (label.textContent === 'ซิงค์แล้ว ✓') updateSyncStatus('idle'); }, 3000);
  }
}



function updateAuthBar(user) {
  const loggedInRow = document.getElementById("authLoggedInRow");
  const guestRow    = document.getElementById("authGuestRow");
  const emailEl     = document.getElementById("authUserEmailTopbar");
  const subtitle    = document.getElementById("brandSubtitle");

  if (loggedInRow) loggedInRow.hidden = !user;
  if (guestRow)    guestRow.hidden = !!user;
  if (emailEl) { emailEl.textContent = user ? user.email : ""; emailEl.hidden = !user; }
  if (subtitle) subtitle.textContent = user ? user.email : "Personal workspace";
}

async function onSignedIn(user) {
  // Guard: prevent double-execution for the same user (Auth.init + onChange can both fire)
  if (_syncedUserId === user.id) return;
  _syncedUserId = user.id;

  showApp();
  updateAuthBar(user);

  // Guest mode is ephemeral — nothing was saved, so cloud is always authoritative.
  updateSyncStatus('syncing');
  showToast("กำลังซิงค์ข้อมูล…");
  const cloud = await Storage.loadCloud();

  if (cloud) {
    state = { ...state, tasks: cloud.tasks, notes: cloud.notes, expenses: cloud.expenses };
    showToast(cloud.tasks.length > 0 ? `โหลดข้อมูลจาก cloud (${cloud.tasks.length} งาน)` : "เชื่อมต่อแล้ว ✓");
    render();
    updateSyncStatus('synced');
  } else {
    updateSyncStatus('error');
    showToast("ซิงค์ไม่สำเร็จ — ข้อมูล local ยังอยู่ครบ");
  }
}

async function initAuth() {
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
      _syncedUserId = null; // allow next sign-in to sync fresh
      showToast("ออกจากระบบแล้ว — ข้อมูล local ยังอยู่");
      showHomepage();
    }
  });

  /* ── Modal elements ── */
  const modal          = document.getElementById("authModal");
  const loginPanel     = document.getElementById("authLoginPanel");
  const signupPanel    = document.getElementById("authSignupPanel");
  const successPanel   = document.getElementById("authSuccessPanel");
  const signedInPanel  = document.getElementById("authSignedInPanel");
  const loginForm      = document.getElementById("authLoginForm");
  const signupForm     = document.getElementById("authSignupForm");
  const loginErr       = document.getElementById("authError");
  const signupErr      = document.getElementById("authSignupError");

  const panels = [loginPanel, signupPanel, successPanel, signedInPanel];
  function showPanel(name) {
    const map = { login: loginPanel, signup: signupPanel, success: successPanel, signedIn: signedInPanel };
    panels.forEach(p => { if (p) p.hidden = true; });
    if (map[name]) map[name].hidden = false;
  }

  /* Login button (guest state) → open modal */
  document.getElementById("authLoginBtn").addEventListener("click", () => {
    if (loginErr)  loginErr.textContent = "";
    if (loginForm) loginForm.reset();
    showPanel("login");
    modal.showModal();
  });

  /* Logout button (logged-in state) → sign out directly */
  document.getElementById("authLogoutTopBtn").addEventListener("click", async () => {
    await Auth.signOut();
    state = Storage.loadLocal(defaultState);
    render();
    showHomepage();
  });

  /* close on backdrop click */
  modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });

  /* all [data-auth-close] elements */
  modal.addEventListener("click", e => {
    if (e.target.closest("[data-auth-close]")) modal.close();
  });

  /* explicit close X on login panel */
  document.getElementById("authModalClose")?.addEventListener("click", () => modal.close());

  /* guest mode button */
  document.getElementById("authGuestBtn")?.addEventListener("click", () => {
    modal.close();
    enterGuestMode();
  });

  /* switch to signup */
  document.getElementById("authSwitchSignup")?.addEventListener("click", () => {
    if (signupErr) signupErr.textContent = "";
    if (signupForm) signupForm.reset();
    showPanel("signup");
  });

  /* switch back to login */
  document.getElementById("authSwitchLogin")?.addEventListener("click", () => {
    if (loginErr) loginErr.textContent = "";
    if (loginForm) loginForm.reset();
    showPanel("login");
  });

  /* back from success to login */
  document.getElementById("authSuccessBackBtn")?.addEventListener("click", () => {
    if (loginErr) loginErr.textContent = "";
    if (loginForm) loginForm.reset();
    showPanel("login");
  });

  /* login form submit */
  loginForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const email    = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    const btn      = loginForm.querySelector("button[type='submit']");
    btn.disabled   = true;
    loginErr.textContent = "";
    try {
      await Auth.signIn(email, password);
      modal.close();
    } catch (err) {
      loginErr.textContent = err.message || "เกิดข้อผิดพลาด";
    } finally {
      btn.disabled = false;
    }
  });

  /* signup form submit */
  signupForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const email    = document.getElementById("authSignupEmail").value.trim();
    const password = document.getElementById("authSignupPassword").value;
    const confirm  = document.getElementById("authSignupConfirm").value;
    const btn      = signupForm.querySelector("button[type='submit']");
    signupErr.textContent = "";
    if (password !== confirm) {
      signupErr.textContent = "Password ไม่ตรงกัน";
      return;
    }
    btn.disabled = true;
    try {
      await Auth.signUp(email, password);
      showPanel("success");
    } catch (err) {
      signupErr.textContent = err.message || "เกิดข้อผิดพลาด";
    } finally {
      btn.disabled = false;
    }
  });

  /* logout from signed-in panel */
  document.getElementById("authLogoutModalBtn")?.addEventListener("click", async () => {
    await Auth.signOut();
    state = Storage.loadLocal(defaultState);
    render();
    modal.close();
    showHomepage();
  });

}

/* ── Homepage button wiring ──
   hpNavLoginBtn / hpLoginBtn: open auth modal (dialog goes to top-layer,
   visible even while app-shell is display:none)
   hpGuestBtn / hpFooterGuestBtn: enter guest mode instantly ── */
document.getElementById("hpNavLoginBtn")?.addEventListener("click", () => {
  document.getElementById("authLoginBtn")?.click();
});
document.getElementById("hpLoginBtn")?.addEventListener("click", () => {
  document.getElementById("authLoginBtn")?.click();
});
document.getElementById("hpGuestBtn")?.addEventListener("click", enterGuestMode);
document.getElementById("hpFooterGuestBtn")?.addEventListener("click", enterGuestMode);

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


// LINE Bot Linking
const LINE_WORKER_URL = 'https://johny-line-bot.sj-siwat.workers.dev'

function initLineLink() {
  const panel = document.getElementById('lineLinkPanel')
  const btn = document.getElementById('lineLinkBtn')
  const input = document.getElementById('lineLinkCode')
  const status = document.getElementById('lineLinkStatus')
  const form = document.getElementById('lineLinkForm')

  const stored = localStorage.getItem('lineUserId')
  if (stored) {
    showLinked(stored, status, form)
  }

  btn?.addEventListener('click', async () => {
    const code = input.value.trim()
    if (code.length !== 6) return showToast('กรอกรหัส 6 หลัก')

    btn.disabled = true
    btn.textContent = 'กำลังตรวจสอบ...'
    try {
      const res = await fetch(`${LINE_WORKER_URL}/link/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      localStorage.setItem('lineUserId', data.lineUserId)
      showLinked(data.lineUserId, status, form)
      showToast('เชื่อมบัญชี LINE สำเร็จ!')
      loadLineNotes(data.lineUserId)
    } catch (err) {
      showToast(err.message || 'เกิดข้อผิดพลาด')
      btn.disabled = false
      btn.textContent = 'เชื่อม'
    }
  })
}

function showLinked(userId, status, form) {
  status.textContent = '✓ เชื่อมแล้ว'
  form.innerHTML = `<p class="line-link-hint">LINE เชื่อมกับ JohnyMemo แล้ว <button type="button" id="lineUnlinkBtn" style="color:var(--danger);background:none;border:none;cursor:pointer;padding:0">ยกเลิก</button></p><div id="lineNoteList"></div>`
  document.getElementById('lineUnlinkBtn')?.addEventListener('click', () => {
    localStorage.removeItem('lineUserId')
    location.reload()
  })
  loadLineNotes(userId)
}

async function loadLineNotes(userId) {
  const container = document.getElementById('lineNoteList')
  if (!container) return
  const res = await fetch(`${LINE_WORKER_URL}/notes/${userId}`)
  const { notes } = await res.json()
  if (notes.length === 0) {
    container.innerHTML = '<p class="line-link-hint">ยังไม่มีโน้ตจาก LINE</p>'
    return
  }
  container.innerHTML = notes.map(n =>
    `<div class="item-row"><span>${n.text}</span><small style="color:var(--text-muted)">${new Date(n.createdAt).toLocaleDateString('th-TH')}</small></div>`
  ).join('')
}

initLineLink()
