"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { formatMoney, getMonthKey, getTodayKey } from "@/lib/format";
import { isTaskDone } from "@/lib/actions";
import type { ReviewTab } from "@/types";

const TABS: { key: ReviewTab; label: string }[] = [
  { key: "daily", label: "รายวัน" },
  { key: "weekly", label: "รายสัปดาห์" },
  { key: "monthly", label: "รายเดือน" },
];

function StatCard({ value, label, tone }: { value: string | number; label: string; tone: "green" | "red" | "amber" | "blue" | "primary" }) {
  const toneClass = {
    green: "text-[#30D158]",
    red: "text-danger",
    amber: "text-amber",
    blue: "text-[#0A84FF]",
    primary: "text-accent",
  }[tone];
  return (
    <div className="border border-hairline bg-paper p-4 dark:border-white/10 dark:bg-dark-surface">
      <strong className={`block font-grotesk text-2xl font-semibold ${toneClass}`}>{value}</strong>
      <span className="mt-1 block text-xs text-ink-muted">{label}</span>
    </div>
  );
}

export function ReviewView() {
  const [tab, setTab] = useState<ReviewTab>("daily");
  const tasks = useStore((s) => s.tasks);
  const notes = useStore((s) => s.notes);
  const expenses = useStore((s) => s.expenses);

  const todayKey = getTodayKey();
  const monthKey = getMonthKey();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekStartKey = weekStart.toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex border border-ink dark:border-white/30" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-sm font-medium ${
              tab === t.key ? "bg-ink text-paper dark:bg-white dark:text-dark-bg" : "text-ink-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "daily" && (() => {
        const todayDone = tasks.filter((t) => isTaskDone(t) && t.due === todayKey);
        const todayOverdue = tasks.filter((t) => !isTaskDone(t) && t.due && t.due < todayKey);
        const todayNotes = notes.filter((n) => n.createdAt && new Date(n.createdAt).toISOString().slice(0, 10) === todayKey);
        const todayExpense = expenses.filter((e) => e.date === todayKey).reduce((s, e) => s + Number(e.amount), 0);
        return (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard value={todayDone.length} label="งานเสร็จวันนี้" tone="green" />
              <StatCard value={todayOverdue.length} label="งานเกินกำหนด" tone="red" />
              <StatCard value={todayNotes.length} label="โน้ตวันนี้" tone="amber" />
              <StatCard value={formatMoney(todayExpense)} label="รายจ่ายวันนี้" tone="blue" />
            </div>
            {todayDone.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-ink dark:text-white/90">งานที่เสร็จวันนี้</h3>
                <div className="mt-2 flex flex-col gap-1">
                  {todayDone.map((t) => (
                    <p key={t.id} className="text-sm text-ink-muted">
                      ✓ {t.title}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {todayOverdue.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-ink dark:text-white/90">งานที่เกินกำหนด</h3>
                <div className="mt-2 flex flex-col gap-1">
                  {todayOverdue.map((t) => (
                    <p key={t.id} className="text-sm text-danger">
                      ! {t.title}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {tab === "weekly" && (() => {
        // Bug fix (approved): scoped to this week (due >= weekStartKey), matching
        // the Dashboard's already-correct weekly widget — the legacy Review tab
        // counted ALL-time done tasks and a global completion rate here instead.
        const weekTasks = tasks.filter((t) => t.due && t.due >= weekStartKey);
        const weekDone = weekTasks.filter(isTaskDone);
        const weekExpense = expenses.filter((e) => e.date >= weekStartKey).reduce((s, e) => s + Number(e.amount), 0);
        const weekNotes = notes.filter((n) => n.createdAt && new Date(n.createdAt).toISOString().slice(0, 10) >= weekStartKey).length;
        const catTotals = new Map<string, number>();
        expenses.filter((e) => e.date >= weekStartKey).forEach((e) => catTotals.set(e.category, (catTotals.get(e.category) ?? 0) + Number(e.amount)));
        const topCat = [...catTotals.entries()].sort((a, b) => b[1] - a[1])[0];
        const completionRate = weekTasks.length ? Math.round((weekDone.length / weekTasks.length) * 100) : 0;
        return (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard value={weekDone.length} label="งานเสร็จสัปดาห์นี้" tone="green" />
              <StatCard value={formatMoney(weekExpense)} label="รายจ่ายสัปดาห์นี้" tone="amber" />
              <StatCard value={weekNotes} label="โน้ตสัปดาห์นี้" tone="blue" />
              <StatCard value={`${completionRate}%`} label="Completion Rate" tone="primary" />
            </div>
            {topCat && (
              <div>
                <h3 className="text-sm font-semibold text-ink dark:text-white/90">หมวดที่ใช้มากสุดสัปดาห์นี้</h3>
                <p className="mt-2 text-sm text-ink-muted">
                  {topCat[0]} · {formatMoney(topCat[1])}
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {tab === "monthly" && (() => {
        // Bug fix (approved): scoped to this month (due startsWith monthKey),
        // same rationale as the weekly tab above.
        const monthTasks = tasks.filter((t) => t.due?.startsWith(monthKey));
        const monthDone = monthTasks.filter(isTaskDone);
        const monthExpense = expenses.filter((e) => e.date?.startsWith(monthKey)).reduce((s, e) => s + Number(e.amount), 0);
        const monthNotes = notes.filter((n) => n.createdAt && new Date(n.createdAt).toISOString().slice(0, 7) === monthKey).length;
        const completionRate = monthTasks.length ? Math.round((monthDone.length / monthTasks.length) * 100) : 0;
        return (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard value={monthDone.length} label="งานเสร็จเดือนนี้" tone="green" />
            <StatCard value={formatMoney(monthExpense)} label="รายจ่ายเดือนนี้" tone="amber" />
            <StatCard value={monthNotes} label="โน้ตเดือนนี้" tone="blue" />
            <StatCard value={`${completionRate}%`} label="Completion Rate" tone="primary" />
          </div>
        );
      })()}
    </div>
  );
}
