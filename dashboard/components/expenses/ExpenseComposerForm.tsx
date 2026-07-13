"use client";

import { useState } from "react";
import { addExpense } from "@/lib/actions";
import { useToastStore } from "@/lib/toastStore";
import { formatMoney, getTodayKey } from "@/lib/format";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

export function ExpenseComposerForm() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(getTodayKey());
  const showToast = useToastStore((s) => s.showToast);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    addExpense(title.trim(), Number(amount), category, date);
    showToast(`บันทึก ${title.trim()} ${formatMoney(Number(amount))} แล้ว`);
    setTitle("");
    setAmount("");
    setDate(getTodayKey());
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2 border border-hairline bg-paper p-4 sm:grid-cols-5 dark:border-white/10 dark:bg-dark-surface">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="รายการ"
        className="border border-hairline bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink sm:col-span-2 dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="จำนวนเงิน"
        className="border border-hairline bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border border-hairline bg-paper px-2 py-2 text-sm text-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
      >
        {EXPENSE_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border border-hairline bg-paper px-2 py-2 text-sm text-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
      />
      <button type="submit" className="col-span-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-accent sm:col-span-1">
        บันทึก
      </button>
    </form>
  );
}
