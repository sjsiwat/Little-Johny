/* STORAGE_KEY moved to storage.js */

let toastTimer = null;
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
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  return {
    tasks: [
      {
        id: crypto.randomUUID(),
        title: "ออกแบบ Dashboard ให้เห็นภาพรวมชีวิตใน 5 นาที",
        priority: "High",
        due: today.toISOString().slice(0, 10),
        status: "Pending",
        createdAt: Date.now() - 1000
      },
      {
        id: crypto.randomUUID(),
        title: "จดไอเดียสำหรับต่อ LINE Secretary",
        priority: "Medium",
        due: tomorrow.toISOString().slice(0, 10),
        status: "Pending",
        createdAt: Date.now() - 2000
      },
      {
        id: crypto.randomUUID(),
        title: "ทดลองบันทึกรายจ่ายผ่านหน้า Expenses",
        priority: "Low",
        due: "",
        status: "Completed",
        createdAt: Date.now() - 3000
      }
    ],
    notes: [
      {
        id: crypto.randomUUID(),
        title: "Johny OS คือพื้นที่รวม task, note, expense และเลขาส่วนตัว",
        body: "เวอร์ชันแรกเก็บข้อมูลใน browser ก่อน เพื่อให้ใช้งานฟรีและ deploy ง่ายบน Cloudflare Pages",
        tags: "vision, mvp",
        createdAt: Date.now() - 1000
      },
      {
        id: crypto.randomUUID(),
        title: "Phase 2: sync ข้ามเครื่องด้วย Supabase",
        body: "เพิ่ม login, database, reminder และค่อยต่อ AI หลังจาก workflow หลักนิ่งแล้ว",
        tags: "roadmap",
        createdAt: Date.now() - 2000
      }
    ],
    expenses: [
      {
        id: crypto.randomUUID(),
        title: "กาแฟทำงาน",
        amount: 75,
        category: "เครื่องดื่ม",
        date: today.toISOString().slice(0, 10),
        createdAt: Date.now() - 1000
      },
      {
        id: crypto.randomUUID(),
        title: "เดินทาง",
        amount: 120,
        category: "เดินทาง",
        date: today.toISOString().slice(0, 10),
        createdAt: Date.now() - 2000
      },
      {
        id: crypto.randomUUID(),
        title: "มื้อกลางวัน",
        amount: 95,
        category: "อาหาร",
        date: yesterday.toISOString().slice(0, 10),
        createdAt: Date.now() - 3000
      }
    ],
    logs: [
      "ลองพิมพ์: เพิ่มงาน อ่านหนังสือคืนนี้",
      "ลองพิมพ์: จ่าย กาแฟ 75 เครื่องดื่ม",
      "Johny OS Lite พร้อมช่วยจัดระเบียบวันของคุณแล้ว"
    ]
  };
}

const defaultState = {
  theme: "light",
  taskFilter: "all",
  ...createDemoState()
};

let state = Storage.loadLocal(defaultState);

const views = {
  dashboard: document.getElementById("dashboard"),
  tasks: document.getElementById("tasks"),
  notes: document.getElementById("notes"),
  expenses: document.getElementById("expenses"),
  secretary: document.getElementById("secretary")
};

const viewTitles = {
  dashboard: "Dashboard",
  tasks: "Tasks",
  notes: "Notes",
  expenses: "Expenses",
  secretary: "Assistant"
};

function saveState() {
  Storage.save(state);
}

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
  renderSecretary();
  saveState();
}

function updateClock() {
  const now = new Date();
  const timeEl = document.getElementById("todayTime");
  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
}

function renderShell() {
  document.getElementById("todayLabel").textContent = new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());

  updateClock();

  const openItems = state.tasks.filter((task) => task.status !== "Completed");
  document.getElementById("focusCount").textContent = `${openItems.length} focus items`;

  const heroFocusTitle = document.getElementById("heroFocusTitle");
  if (heroFocusTitle) {
    heroFocusTitle.textContent = openItems[0]?.title || "เริ่มจากเพิ่มงานแรกของวันนี้";
  }

  // ── Hero chips ──────────────────────────────────────────
  const chipTasks = document.getElementById("heroChipTasks");
  if (chipTasks) chipTasks.textContent = `${openItems.length} งานค้าง`;

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayExpense = state.expenses
    .filter((e) => e.date === todayKey)
    .reduce((s, e) => s + Number(e.amount), 0);
  const chipExpense = document.getElementById("heroChipExpense");
  if (chipExpense) chipExpense.textContent = `฿${todayExpense.toLocaleString("th-TH")} วันนี้`;

  const priorityRank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const topFocus = [...openItems].sort(
    (a, b) => (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9)
  )[0];
  const chipFocus = document.getElementById("heroChipFocus");
  if (chipFocus) {
    const label = topFocus?.title || "กำหนดเป้าหมาย";
    chipFocus.textContent = label.length > 22 ? label.slice(0, 22) + "…" : label;
  }
}

setInterval(updateClock, 1000);

function renderDashboard() {
  const openTasks = state.tasks.filter((task) => task.status !== "Completed");
  const doneTasks = state.tasks.filter((task) => task.status === "Completed");
  const monthKey = new Date().toISOString().slice(0, 7);
  const monthExpense = state.expenses
    .filter((expense) => expense.date?.startsWith(monthKey))
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  document.getElementById("statTotalTasks").textContent = state.tasks.length;
  document.getElementById("statOpenTasks").textContent = openTasks.length;
  document.getElementById("statDoneTasks").textContent = doneTasks.length;
  document.getElementById("statMonthExpense").textContent = formatMoney(monthExpense);

  const priorityRank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const focus = [...openTasks]
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
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
          return `
            <div class="bar-row">
              <div class="bar-label"><span>${category}</span><strong>${formatMoney(total)}</strong></div>
              <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
            </div>
          `;
        })
        .join("")
    : emptyState("ยังไม่มีรายจ่ายให้สรุป ลองบันทึกกาแฟ มื้อกลางวัน หรือค่าเดินทางรายการแรก", "expenses", "บันทึกรายจ่าย");
}

function renderTasks() {
  const filtered = state.tasks.filter((task) => {
    if (state.taskFilter === "open") return task.status !== "Completed";
    if (state.taskFilter === "done") return task.status === "Completed";
    return true;
  });

  document.getElementById("taskList").innerHTML = filtered.length
    ? filtered
        .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"))
        .map(
          (task) => {
            const done = task.status === "Completed";
            return `
            <article class="list-item ${done ? "done" : ""}" aria-label="${escapeHtml(task.title)}${done ? " (เสร็จแล้ว)" : ""}">
              <div>
                <span class="item-title">${escapeHtml(task.title)}</span>
                <span class="item-meta">
                  <span class="priority-${task.priority}">${task.priority}</span> · ${formatDate(task.due)}${done ? " · ✓ เสร็จแล้ว" : ""}
                </span>
              </div>
              <div class="item-actions">
                <button class="icon-button" type="button" data-toggle-task="${task.id}"
                  aria-pressed="${done}" title="${done ? "เปิดงานอีกครั้ง" : "ทำเครื่องหมายเสร็จ"}">✓</button>
                <button class="icon-button" type="button" data-delete-task="${task.id}" title="ลบงาน">×</button>
              </div>
            </article>
          `;
          }
        )
        .join("")
    : emptyState("ยังไม่มีงานในมุมมองนี้", "tasks", "เพิ่มงาน");
}

function renderNotes() {
  document.getElementById("noteList").innerHTML = state.notes.length
    ? [...state.notes]
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(
          (note) => `
            <article class="list-item">
              <div>
                <span class="item-title">${escapeHtml(note.title)}</span>
                <span class="item-meta">${escapeHtml(note.tags || "no tags")}</span>
                <p class="muted">${escapeHtml(note.body || "")}</p>
              </div>
              <div class="item-actions">
                <button class="icon-button" type="button" data-delete-note="${note.id}" title="Delete">×</button>
              </div>
            </article>
          `
        )
        .join("")
    : emptyState("ยังไม่มีโน้ต", "notes", "เขียนโน้ต");
}

function renderExpenses() {
  document.getElementById("expenseList").innerHTML = state.expenses.length
    ? [...state.expenses]
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(
          (expense) => `
            <article class="list-item">
              <div>
                <span class="item-title">${escapeHtml(expense.title)} · ${formatMoney(expense.amount)}</span>
                <span class="item-meta">${escapeHtml(expense.category)} · ${formatDate(expense.date)}</span>
              </div>
              <div class="item-actions">
                <button class="icon-button" type="button" data-delete-expense="${expense.id}" title="Delete">×</button>
              </div>
            </article>
          `
        )
        .join("")
    : emptyState("ยังไม่มีรายจ่าย", "expenses", "บันทึกรายจ่าย");
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
      <div>
        <span class="item-title">${escapeHtml(task.title)}</span>
        <span class="item-meta"><span class="priority-${task.priority}">${task.priority}</span> · ${formatDate(task.due)}</span>
      </div>
    </article>
  `;
}

function renderSimpleNote(note) {
  return `
    <article class="list-item">
      <div>
        <span class="item-title">${escapeHtml(note.title)}</span>
        <span class="item-meta">${escapeHtml(note.tags || "no tags")}</span>
      </div>
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

function showApp() {
  _inApp = true;
  document.getElementById("homepage")?.style.setProperty("display", "none");
  document.querySelector(".app-shell")?.style.removeProperty("display");
}

function showHomepage() {
  _inApp = false;
  document.getElementById("homepage")?.style.removeProperty("display");
  document.querySelector(".app-shell")?.style.setProperty("display", "none");
}

function enterGuestMode() {
  showApp();
  setView("dashboard");
}

function addTask(title, priority = "Medium", due = "") {
  state.tasks.unshift({
    id: crypto.randomUUID(),
    title,
    priority,
    due,
    status: "Pending",
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

function addExpense(title, amount, category = "อื่นๆ", date = new Date().toISOString().slice(0, 10)) {
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
    const openTasks = state.tasks.filter((task) => task.status !== "Completed");
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
  render();
});

document.getElementById("loadDemoData")?.addEventListener("click", loadDemoData);

document.getElementById("taskForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const title = document.getElementById("taskTitle").value.trim();
  if (!title) return;
  addTask(title, document.getElementById("taskPriority").value, document.getElementById("taskDue").value);
  event.currentTarget.reset();
  document.getElementById("taskPriority").value = "Medium";
  render();
  showToast(`เพิ่มงาน "${title}" แล้ว`);
});

document.querySelectorAll("[data-task-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    state.taskFilter = button.dataset.taskFilter;
    document.querySelectorAll("[data-task-filter]").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    renderTasks();
  });
});

document.getElementById("noteForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const title = document.getElementById("noteTitle").value.trim();
  if (!title) return;
  addNote(title, document.getElementById("noteBody").value.trim(), document.getElementById("noteTags").value.trim());
  event.currentTarget.reset();
  render();
  showToast(`บันทึกโน้ต "${title}" แล้ว`);
});

document.getElementById("expenseDate").value = new Date().toISOString().slice(0, 10);
document.getElementById("expenseForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const title = document.getElementById("expenseTitle").value.trim();
  const amount = document.getElementById("expenseAmount").value;
  if (!title || !amount) return;
  addExpense(title, amount, document.getElementById("expenseCategory").value, document.getElementById("expenseDate").value);
  event.currentTarget.reset();
  document.getElementById("expenseDate").value = new Date().toISOString().slice(0, 10);
  render();
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

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const viewJump = target.dataset.viewJump;
  const toggleId = target.dataset.toggleTask;
  const deleteTaskId = target.dataset.deleteTask;
  const deleteNoteId = target.dataset.deleteNote;
  const deleteExpenseId = target.dataset.deleteExpense;

  if (viewJump) {
    setView(viewJump);
  }

  if (toggleId) {
    const task = state.tasks.find((t) => t.id === toggleId);
    state.tasks = state.tasks.map((t) =>
      t.id === toggleId ? { ...t, status: t.status === "Completed" ? "Pending" : "Completed" } : t
    );
    render();
    if (task) {
      const nowDone = state.tasks.find((t) => t.id === toggleId)?.status === "Completed";
      showToast(nowDone ? `เสร็จแล้ว: ${task.title}` : `เปิดงานอีกครั้ง: ${task.title}`);
    }
  }

  if (deleteTaskId) {
    const task = state.tasks.find((t) => t.id === deleteTaskId);
    if (!task || !confirm(`ลบงาน "${task.title}"?`)) return;
    state.tasks = state.tasks.filter((t) => t.id !== deleteTaskId);
    render();
    showToast("ลบงานแล้ว");
  }

  if (deleteNoteId) {
    const note = state.notes.find((n) => n.id === deleteNoteId);
    if (!note || !confirm(`ลบโน้ต "${note.title}"?`)) return;
    state.notes = state.notes.filter((n) => n.id !== deleteNoteId);
    render();
    showToast("ลบโน้ตแล้ว");
  }

  if (deleteExpenseId) {
    const expense = state.expenses.find((e) => e.id === deleteExpenseId);
    if (!expense || !confirm(`ลบรายการ "${expense.title}"?`)) return;
    state.expenses = state.expenses.filter((e) => e.id !== deleteExpenseId);
    render();
    showToast("ลบรายจ่ายแล้ว");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea, select")) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  const viewKeys = { "1": "dashboard", "2": "tasks", "3": "notes", "4": "expenses", "5": "secretary" };
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

setView(location.hash.replace("#", "") && views[location.hash.replace("#", "")]
  ? location.hash.replace("#", "")
  : "dashboard");
render();

/* ── Auth UI ── */
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
  showApp();
  updateAuthBar(user);
  showToast("กำลังโหลดข้อมูลจาก cloud…");
  const cloud = await Storage.loadCloud();
  if (cloud) {
    state = { ...state, tasks: cloud.tasks, notes: cloud.notes, expenses: cloud.expenses };
    render();
    showToast(`ซิงค์ข้อมูลจาก cloud สำเร็จ (${cloud.tasks.length} งาน)`);
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

  /* logout from sidebar user panel */
  document.getElementById("authLogoutBtn")?.addEventListener("click", async () => {
    await Auth.signOut();
    state = Storage.loadLocal(defaultState);
    render();
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

initAuth();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // The app still works without offline caching.
    });
  });
}
