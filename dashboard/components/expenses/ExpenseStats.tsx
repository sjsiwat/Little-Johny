"use client";

import { useStore } from "@/lib/store";
import { formatMoney, getMonthKey, getTodayKey } from "@/lib/format";
import type { ExpensePeriod } from "@/types";

const PERIODS: { key: ExpensePeriod; label: string }[] = [
  { key: "today", label: "วันนี้" },
  { key: "month", label: "เดือนนี้" },
  { key: "year", label: "ปีนี้" },
  { key: "all", label: "ทั้งหมด" },
];

export function ExpenseStats({ period, onChange }: { period: ExpensePeriod; onChange: (p: ExpensePeriod) => void }) {
  const expenses = useStore((s) => s.expenses);
  const todayKey = getTodayKey();
  const monthKey = getMonthKey();
  const todayExps = expenses.filter((e) => e.date === todayKey);
  const monthExps = expenses.filter((e) => e.date?.startsWith(monthKey));
  const todayTotal = todayExps.reduce((s, e) => s + Number(e.amount), 0);
  const monthTotal = monthExps.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {expenses.length > 0 && (
        <div className="flex divide-x divide-hairline border border-hairline bg-paper dark:divide-white/10 dark:border-white/10 dark:bg-dark-surface">
          <div className="px-4 py-2">
            <p className="text-xs text-ink-faint">วันนี้</p>
            <p className="font-grotesk text-lg font-semibold text-ink dark:text-white/90">{formatMoney(todayTotal)}</p>
            <p className="text-[11px] text-ink-faint">{todayExps.length} รายการ</p>
          </div>
          <div className="px-4 py-2">
            <p className="text-xs text-ink-faint">เดือนนี้</p>
            <p className="font-grotesk text-lg font-semibold text-ink dark:text-white/90">{formatMoney(monthTotal)}</p>
            <p className="text-[11px] text-ink-faint">{monthExps.length} รายการ</p>
          </div>
        </div>
      )}
      <div className="flex border border-ink dark:border-white/30">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => onChange(p.key)}
            className={`px-3 py-1.5 text-xs font-medium ${
              period === p.key ? "bg-ink text-paper dark:bg-white dark:text-dark-bg" : "text-ink-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
