import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { addTask, isTaskDone } from "@/lib/actions";
import { useToastStore } from "@/lib/toastStore";
import { PRIORITY_COLORS, PRIORITY_RANK, THAI_DOW, THAI_HOLIDAYS, THAI_MONTHS } from "@/lib/constants";
import { getTodayKey } from "@/lib/format";

function thaiDate(dateKey) {
  const [y, m, d] = dateKey.split("-");
  return `${Number(d)} ${THAI_MONTHS[Number(m) - 1]} ${Number(y) + 543}`;
}

/* ── Right column: the selected day in full ─────────────────────────────── */
function AgendaPanel({ dateKey, tasks }) {
  const showToast = useToastStore((s) => s.showToast);
  const updateTask = useStore((s) => s.updateTask);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [focused, setFocused] = useState(false);

  const holiday = THAI_HOLIDAYS[dateKey];
  const open = tasks.filter((t) => !isTaskDone(t));
  const done = tasks.filter(isTaskDone);
  const expanded = focused || title.trim().length > 0;

  function toggle(task) {
    updateTask(task.id, { status: isTaskDone(task) ? "todo" : "done" });
  }

  function handleAdd(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addTask(trimmed, priority, dateKey);
    showToast(`เพิ่มงาน "${trimmed}" ในวันที่เลือกแล้ว`);
    setTitle("");
    setPriority("Medium");
  }

  return (
    <div className="flex h-full flex-col">
      <div>
        <h3 className="font-grotesk text-lg font-semibold text-ink">{thaiDate(dateKey)}</h3>
        <p className="mt-0.5 text-xs text-ink-faint">
          {holiday ? holiday.name : tasks.length ? `${open.length} งานค้าง` : "ไม่มีงาน"}
        </p>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="py-8 text-center text-xs text-ink-faint">ยังไม่มีงานในวันนี้</p>
        ) : (
          [...open, ...done].map((t) => {
            const isDone = isTaskDone(t);
            return (
              <label
                key={t.id}
                className="flex cursor-pointer items-center gap-3 border border-hairline px-3 py-2.5 transition-colors hover:border-hairline-strong"
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggle(t)}
                  className="h-4 w-4 shrink-0 accent-accent"
                />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm ${isDone ? "text-ink-faint line-through" : "text-ink"}`}>
                    {t.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-ink-faint">{t.priority}</span>
                </span>
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: PRIORITY_COLORS[t.priority] }}
                  aria-hidden
                />
              </label>
            );
          })
        )}
      </div>

      {/* Quiet by default, like a "+ add" link; the priority control only
          appears once you are actually adding something. */}
      <form onSubmit={handleAdd} className="mt-4 border-t border-hairline pt-3">
        <div className="flex items-center gap-1.5 text-ink-faint focus-within:text-accent">
          <Plus size={14} aria-hidden className="shrink-0" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="เพิ่มงานใหม่…"
            autoComplete="off"
            aria-label="เพิ่มงานในวันที่เลือก"
            className="w-full bg-transparent py-1 text-sm text-ink outline-none placeholder:text-ink-faint"
          />
        </div>
        {expanded && (
          <div className="mt-2 flex gap-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              aria-label="ความสำคัญ"
              className="flex-1 border border-hairline bg-paper px-2 py-1.5 text-xs text-ink"
            >
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
              <option value="Low">Low</option>
            </select>
            <button
              type="submit"
              className="shrink-0 bg-accent px-4 py-1.5 text-xs font-medium text-accent-fg hover:bg-accent-dim"
            >
              เพิ่ม
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

/* ── One cell. The highlight is a 36px disc around the number, never the
      whole cell, so the grid keeps its own background and stays quiet. ──── */
function DayCell({ dateKey, day, isToday, isSelected, isWeekend, holiday, dayTasks, onSelect }) {
  const dots = [...dayTasks]
    .sort((a, b) => (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9))
    .slice(0, 3);

  const disc = isSelected
    ? "bg-accent text-accent-fg"
    : isToday
      ? "border border-accent text-ink"
      : holiday
        ? "text-accent"
        : isWeekend
          ? "text-ink-faint"
          : "text-ink";

  return (
    <button
      type="button"
      onClick={() => onSelect(dateKey)}
      title={holiday?.name}
      aria-label={`${thaiDate(dateKey)}${holiday ? ` — ${holiday.name}` : ""}`}
      aria-pressed={isSelected}
      className="flex h-12 flex-col items-center justify-center gap-1"
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs transition-colors ${disc} ${
          isSelected || isToday ? "" : "hover:bg-paper-dim"
        }`}
      >
        {day}
      </span>
      <span className="flex h-1 items-center gap-0.5">
        {dots.map((t, i) => (
          <span
            key={i}
            className="h-1 w-1 rounded-full"
            style={{ background: PRIORITY_COLORS[t.priority] }}
            aria-hidden
          />
        ))}
      </span>
    </button>
  );
}

export function CalendarView() {
  const tasks = useStore((s) => s.tasks);
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const todayKey = getTodayKey();
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const tasksByDate = new Map();
  tasks.forEach((t) => {
    if (!t.due) return;
    if (!tasksByDate.has(t.due)) tasksByDate.set(t.due, []);
    tasksByDate.get(t.due).push(t);
  });

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const startDow = new Date(calYear, calMonth, 1).getDay();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(<div key={`empty-${i}`} className="h-12" />);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dow = new Date(calYear, calMonth, d).getDay();
    cells.push(
      <DayCell
        key={dateKey}
        dateKey={dateKey}
        day={d}
        isToday={dateKey === todayKey}
        isSelected={dateKey === selectedDate}
        isWeekend={dow === 0 || dow === 6}
        holiday={THAI_HOLIDAYS[dateKey]}
        dayTasks={tasksByDate.get(dateKey) || []}
        onSelect={setSelectedDate}
      />
    );
  }

  function shiftMonth(delta) {
    const next = new Date(calYear, calMonth + delta, 1);
    setCalYear(next.getFullYear());
    setCalMonth(next.getMonth());
  }

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[3fr_2fr]">
      <div className="border border-hairline bg-paper p-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="เดือนก่อน"
            className="p-1 text-ink-faint hover:text-accent"
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <div className="text-center">
            <span className="font-grotesk text-base font-semibold text-ink">{THAI_MONTHS[calMonth]}</span>{" "}
            <span className="text-sm text-ink-faint">{calYear + 543}</span>
          </div>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="เดือนถัดไป"
            className="p-1 text-ink-faint hover:text-accent"
          >
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 text-center text-[11px] text-ink-faint">
          {THAI_DOW.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        {/* No cell borders — the gap does the separating. */}
        <div className="mt-1 grid grid-cols-7">{cells}</div>

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-hairline pt-3 text-[11px] text-ink-faint">
          <span className="flex items-center gap-1.5">
            <span className="h-4 w-4 rounded-full border border-accent" aria-hidden /> วันนี้
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-4 w-4 rounded-full bg-accent" aria-hidden /> วันที่เลือก
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-accent">12</span> วันหยุด
          </span>
        </div>
      </div>

      <aside className="border border-hairline bg-paper p-5 lg:min-h-[420px]">
        {selectedDate ? (
          <AgendaPanel dateKey={selectedDate} tasks={tasksByDate.get(selectedDate) || []} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-ink-faint">
            <CalendarDays size={28} className="opacity-30" aria-hidden />
            <p className="text-xs">กดที่วันที่เพื่อดูงานและเพิ่ม task</p>
          </div>
        )}
      </aside>
    </div>
  );
}
