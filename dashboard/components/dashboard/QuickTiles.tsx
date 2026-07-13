"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { useCountUp } from "@/lib/useCountUp";
import { getMonthKey, getTodayKey } from "@/lib/format";
import { isTaskDone } from "@/lib/actions";

const reveal = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.07 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function Tile({ index, label, value, trend }: { index: number; label: string; value: number | string; trend: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      custom={index}
      variants={reveal}
      className="border border-hairline bg-paper p-4 dark:border-white/10 dark:bg-dark-surface"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-faint">{label}</p>
      <p className="mt-2 font-grotesk text-2xl font-semibold text-ink dark:text-white/90">{value}</p>
      <p className="mt-1 h-4 text-xs text-ink-muted">{trend}</p>
    </motion.div>
  );
}

export function QuickTiles() {
  const tasks = useStore((s) => s.tasks);
  const expenses = useStore((s) => s.expenses);

  const todayKey = getTodayKey();
  const monthKey = getMonthKey();
  const openTasks = tasks.filter((t) => !isTaskDone(t));
  const doneTasks = tasks.filter(isTaskDone);
  const todayExpense = expenses.filter((e) => e.date === todayKey).reduce((s, e) => s + Number(e.amount), 0);
  const monthExpense = expenses.filter((e) => e.date?.startsWith(monthKey)).reduce((s, e) => s + Number(e.amount), 0);
  const todayAdded = tasks.filter(
    (t) => t.createdAt && new Date(t.createdAt).toISOString().slice(0, 10) === todayKey
  ).length;
  const urgentCount = openTasks.filter((t) => t.priority === "Critical" || t.priority === "High").length;

  const total = useCountUp(tasks.length);
  const open = useCountUp(openTasks.length);
  const done = useCountUp(doneTasks.length);
  const expense = useCountUp(todayExpense);

  const trendTotal = todayAdded > 0 ? `+${todayAdded} วันนี้` : tasks.length === 0 ? "ยังไม่มีงาน" : "";
  const trendOpen =
    openTasks.length === 0 ? "ไม่มีงานค้าง" : urgentCount > 0 ? `${urgentCount} สำคัญ/ด่วน` : "";
  const trendDone =
    doneTasks.length > 0 && tasks.length > 0
      ? `${Math.round((doneTasks.length / tasks.length) * 100)}% ของทั้งหมด`
      : "";
  const trendExpense =
    monthExpense > todayExpense
      ? `฿${monthExpense.toLocaleString("th-TH")} เดือนนี้`
      : monthExpense === 0
        ? "ยังไม่มีรายจ่าย"
        : "";

  return (
    <div className="quick-tiles grid grid-cols-2 gap-3 md:grid-cols-4">
      <Tile index={0} label="งานทั้งหมด" value={total} trend={trendTotal} />
      <Tile index={1} label="ค้างอยู่" value={open} trend={trendOpen} />
      <Tile index={2} label="เสร็จแล้ว" value={done} trend={trendDone} />
      <Tile index={3} label="รายจ่ายวันนี้" value={`฿${expense.toLocaleString("th-TH")}`} trend={trendExpense} />
    </div>
  );
}
