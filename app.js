const STORAGE_KEY = "johny-os-lite-state";

const defaultState = {
  theme: "light",
  taskFilter: "all",
  tasks: [
    {
      id: crypto.randomUUID(),
      title: "วางแผน Johny OS Lite เวอร์ชันแรก",
      priority: "High",
      due: new Date().toISOString().slice(0, 10),
      status: "Pending",
      createdAt: Date.now()
    }
  ],
  notes: [
    {
      id: crypto.randomUUID(),
      title: "แนวทางลดค่าใช้จ่าย",
      body: "เริ่มจาก localStorage + Cloudflare Pages ก่อน แล้วค่อยต่อ Supabase, LINE และ AI ภายหลัง",
      tags: "project, mvp",
      createdAt: Date.now()
    }
  ],
  expenses: [],
  logs: ["Johny OS Lite พร้อมใช้งานในเครื่องแล้ว"]
};

let state = loadState();

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
  secretary: "Secretary"
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...defaultState, ...saved } : defaultState;
  } catch {
    return defaultState;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

function renderShell() {
  document.getElementById("todayLabel").textContent = new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());

  const focusItems = state.tasks.filter((task) => task.status !== "Completed");
  document.getElementById("focusCount").textContent = `${focusItems.length} focus items`;
}

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
    : emptyState("ยังไม่มีงานค้าง");

  document.getElementById("recentNotes").innerHTML = state.notes.length
    ? [...state.notes]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 4)
        .map(renderSimpleNote)
        .join("")
    : emptyState("ยังไม่มีโน้ต");

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
    : emptyState("ยังไม่มีรายจ่ายให้สรุป");
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
          (task) => `
            <article class="list-item ${task.status === "Completed" ? "done" : ""}">
              <div>
                <span class="item-title">${escapeHtml(task.title)}</span>
                <span class="item-meta">
                  <span class="priority-${task.priority}">${task.priority}</span> · ${formatDate(task.due)} · ${task.status}
                </span>
              </div>
              <div class="item-actions">
                <button class="icon-button" type="button" data-toggle-task="${task.id}" title="Toggle done">✓</button>
                <button class="icon-button" type="button" data-delete-task="${task.id}" title="Delete">×</button>
              </div>
            </article>
          `
        )
        .join("")
    : emptyState("ยังไม่มีงานในมุมมองนี้");
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
    : emptyState("ยังไม่มีโน้ต");
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
    : emptyState("ยังไม่มีรายจ่าย");
}

function renderSecretary() {
  document.getElementById("assistantLog").innerHTML = state.logs.length
    ? state.logs
        .slice(-8)
        .reverse()
        .map((line) => `<div class="log-line">${escapeHtml(line)}</div>`)
        .join("")
    : emptyState("ยังไม่มีประวัติคำสั่ง");
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

function emptyState(message) {
  return `<div class="empty-state">${message}</div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

document.getElementById("taskForm").addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(
    document.getElementById("taskTitle").value.trim(),
    document.getElementById("taskPriority").value,
    document.getElementById("taskDue").value
  );
  event.currentTarget.reset();
  document.getElementById("taskPriority").value = "Medium";
  render();
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
  addNote(
    document.getElementById("noteTitle").value.trim(),
    document.getElementById("noteBody").value.trim(),
    document.getElementById("noteTags").value.trim()
  );
  event.currentTarget.reset();
  render();
});

document.getElementById("expenseDate").value = new Date().toISOString().slice(0, 10);
document.getElementById("expenseForm").addEventListener("submit", (event) => {
  event.preventDefault();
  addExpense(
    document.getElementById("expenseTitle").value.trim(),
    document.getElementById("expenseAmount").value,
    document.getElementById("expenseCategory").value,
    document.getElementById("expenseDate").value
  );
  event.currentTarget.reset();
  document.getElementById("expenseDate").value = new Date().toISOString().slice(0, 10);
  render();
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

  const toggleId = target.dataset.toggleTask;
  const deleteTaskId = target.dataset.deleteTask;
  const deleteNoteId = target.dataset.deleteNote;
  const deleteExpenseId = target.dataset.deleteExpense;

  if (toggleId) {
    state.tasks = state.tasks.map((task) =>
      task.id === toggleId
        ? { ...task, status: task.status === "Completed" ? "Pending" : "Completed" }
        : task
    );
    render();
  }

  if (deleteTaskId) {
    state.tasks = state.tasks.filter((task) => task.id !== deleteTaskId);
    render();
  }

  if (deleteNoteId) {
    state.notes = state.notes.filter((note) => note.id !== deleteNoteId);
    render();
  }

  if (deleteExpenseId) {
    state.expenses = state.expenses.filter((expense) => expense.id !== deleteExpenseId);
    render();
  }
});

setView(location.hash.replace("#", "") && views[location.hash.replace("#", "")]
  ? location.hash.replace("#", "")
  : "dashboard");
render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // The app still works without offline caching.
    });
  });
}
