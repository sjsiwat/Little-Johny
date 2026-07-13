"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useStore } from "@/lib/store";
import { addTask, isTaskDone } from "@/lib/actions";
import { useToastStore } from "@/lib/toastStore";
import { PRIORITY_COLORS, PRIORITY_RANK, THAI_DOW, THAI_HOLIDAYS, THAI_MONTHS } from "@/lib/constants";
import { getTodayKey } from "@/lib/format";
import type { Task, TaskPriority } from "@/types";

function CalendarDayPanel({ dateKey, tasks }: { dateKey: string; tasks: Task[] }) {
  const showToast = useToastStore((s) => s.showToast);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");

  const holiday = THAI_HOLIDAYS[dateKey];
  const [y, m, d] = dateKey.split("-");
  const thaiYear = Number(y) + 543;
  const dateLabel = `${Number(d)} ${THAI_MONTHS[Number(m) - 1]} ${thaiYear}`;
  const openTasks = tasks.filter((t) => !isTaskDone(t));
  const doneTasks = tasks.filter((t) => isTaskDone(t));

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addTask(trimmed, priority, dateKey);
    showToast(`เพิ่มงาน "${trimmed}" ในวันที่เลือกแล้ว`);
    setTitle("");
    setPriority("Medium");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-2 dark:border-white/10">
        <span className="text-sm font-medium text-ink dark:text-white/90">{dateLabel}</span>
        {holiday && <span className="text-xs text-accent">{holiday.name}</span>}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {openTasks.length === 0 && doneTasks.length === 0 ? (
          <p className="py-4 text-center text-xs text-ink-faint">ไม่มีงานในวันนี้</p>
        ) : (
          [...openTasks, ...doneTasks].map((t) => (
            <div key={t.id} className={`flex items-center gap-2 ${isTaskDone(t) ? "opacity-50 line-through" : ""}`}>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: PRIORITY_COLORS[t.priority] }} aria-hidden />
              <span className="min-w-0 flex-1 truncate text-sm text-ink dark:text-white/90">{t.title}</span>
              <span className="shrink-0 text-[11px] text-ink-faint">{t.priority}</span>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-2 border-t border-hairline pt-3 dark:border-white/10">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เพิ่มงานสำหรับวันนี้…"
          autoComplete="off"
          className="border border-hairline bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
        />
        <div className="flex gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="flex-1 border border-hairline bg-paper px-2 py-2 text-sm text-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
          >
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
            <option value="Low">Low</option>
          </select>
          <button type="submit" className="shrink-0 bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-accent">
            + เพิ่ม
          </button>
        </div>
      </form>
    </div>
  );
}

export function CalendarView() {
  const tasks = useStore((s) => s.tasks);
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayKey = getTodayKey();
  const thaiYear = calYear + 543;

  const tasksByDate = new Map<string, Task[]>();
  tasks.forEach((t) => {
    if (t.due) {
      if (!tasksByDate.has(t.due)) tasksByDate.set(t.due, []);
      tasksByDate.get(t.due)!.push(t);
    }
  });

  const firstDay = new Date(calYear, calMonth, 1);
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const startDow = firstDay.getDay();

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < startDow; i++) {
    cells.push(<div key={`empty-${i}`} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(calMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const dateKey = `${calYear}-${mm}-${dd}`;
    const isToday = dateKey === todayKey;
    const isSelected = dateKey === selectedDate;
    const holiday = THAI_HOLIDAYS[dateKey];
    const dayTasks = tasksByDate.get(dateKey) || [];
    const dow = new Date(calYear, calMonth, d).getDay();
    const isWeekend = dow === 0 || dow === 6;
    const dots = [...dayTasks]
      .sort((a, b) => (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9))
      .slice(0, 3);

    cells.push(
      <button
        key={dateKey}
        type="button"
        onClick={() => setSelectedDate(dateKey)}
        aria-label={`${dateKey}${holiday ? " " + holiday.name : ""}`}
        className={`flex aspect-square flex-col items-center justify-start gap-0.5 border border-transparent p-1 text-xs ${
          isSelected
            ? "border-ink bg-ink text-paper dark:border-white dark:bg-white dark:text-dark-bg"
            : isToday
              ? "border-accent text-ink dark:text-white/90"
              : isWeekend
                ? "text-ink-faint"
                : "text-ink dark:text-white/90"
        }`}
      >
        <span>{d}</span>
        {holiday && <span className="h-1 w-1 rounded-full bg-accent" title={holiday.name} />}
        {dots.length > 0 && (
          <span className="flex gap-0.5">
            {dots.map((t, i) => (
              <span
                key={i}
                className="h-1 w-1 rounded-full"
                style={{ background: isSelected ? "currentColor" : PRIORITY_COLORS[t.priority] }}
              />
            ))}
            {dayTasks.length > 3 && <span className="text-[8px]">+{dayTasks.length - 3}</span>}
          </span>
        )}
      </button>
    );
  }

  function goPrev() {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  }
  function goNext() {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="flex items-center justify-between border-b border-hairline pb-3 dark:border-white/10">
          <button type="button" onClick={goPrev} aria-label="เดือนก่อน" className="text-ink-muted hover:text-ink">
            <ChevronLeft size={18} aria-hidden />
          </button>
          <div className="text-center">
            <span className="font-grotesk text-lg font-semibold text-ink dark:text-white/90">{THAI_MONTHS[calMonth]}</span>{" "}
            <span className="text-ink-muted">{thaiYear}</span>
          </div>
          <button type="button" onClick={goNext} aria-label="เดือนถัดไป" className="text-ink-muted hover:text-ink">
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-ink-faint">
          {THAI_DOW.map((d, i) => (
            <span key={i} className={i === 0 || i === 6 ? "text-ink-faint" : ""}>
              {d}
            </span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">{cells}</div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-faint">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> วันหยุดราชการ/พุทธ/ราชพิธี
          </span>
        </div>
      </div>
      <aside className="border border-hairline bg-paper p-4 dark:border-white/10 dark:bg-dark-surface">
        {selectedDate ? (
          <CalendarDayPanel dateKey={selectedDate} tasks={tasksByDate.get(selectedDate) || []} />
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
