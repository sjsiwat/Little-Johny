import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { EmptyState } from "@/components/shared/EmptyState";
import { deleteExpense } from "@/lib/actions";
import { useToastStore } from "@/lib/toastStore";
import { EXPENSE_BAR_COLORS, EXPENSE_CATEGORIES, EXPENSE_ICONS } from "@/lib/constants";
import { formatDate, formatMoney, getMonthKey, getTodayKey } from "@/lib/format";

function ExpenseEditForm({ expense, onDone }) {
  const updateExpense = useStore((s) => s.updateExpense);
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState(expense.category);
  const [date, setDate] = useState(expense.date);

  function handleSubmit(e) {
    e.preventDefault();
    updateExpense(expense.id, { title: title.trim(), amount: Number(amount), category, date });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2 border border-hairline bg-paper-dim p-3 sm:grid-cols-5">
      <input value={title} onChange={(e) => setTitle(e.target.value)} className="border border-hairline bg-paper px-2 py-1.5 text-sm sm:col-span-2" />
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="border border-hairline bg-paper px-2 py-1.5 text-sm" />
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-hairline bg-paper px-2 py-1.5 text-sm">
        {EXPENSE_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-hairline bg-paper px-2 py-1.5 text-sm" />
      <div className="col-span-2 flex gap-2 sm:col-span-5">
        <button type="submit" className="bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg hover:bg-accent-dim">
          บันทึก
        </button>
        <button type="button" onClick={onDone} className="border border-hairline px-3 py-1.5 text-xs text-ink-muted">
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

function ExpenseRow({ expense }) {
  const [editing, setEditing] = useState(false);
  const showToast = useToastStore((s) => s.showToast);
  if (editing) return <ExpenseEditForm expense={expense} onDone={() => setEditing(false)} />;

  const icon = EXPENSE_ICONS[expense.category] || "📦";
  const color = EXPENSE_BAR_COLORS[expense.category] || "rgb(var(--c-text-muted))";

  return (
    <div className="flex items-center gap-3 border-t border-hairline py-2 first:border-t-0">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center text-base" style={{ background: `${color}20` }}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-ink">{expense.title}</span>
      <span className="hidden shrink-0 text-xs text-ink-faint sm:block">{expense.category}</span>
      <span className="shrink-0 text-sm font-medium text-ink">−{formatMoney(expense.amount)}</span>
      <button type="button" onClick={() => setEditing(true)} aria-label="แก้ไขรายจ่าย" className="shrink-0 text-ink-faint hover:text-ink">
        <Pencil size={12} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => {
          if (!confirm("ลบรายจ่ายนี้?")) return;
          deleteExpense(expense.id);
          showToast("ลบรายจ่ายแล้ว");
        }}
        aria-label="ลบรายจ่าย"
        className="shrink-0 text-ink-faint hover:text-danger"
      >
        <X size={14} aria-hidden />
      </button>
    </div>
  );
}

export function ExpenseList({ period }) {
  const expenses = useStore((s) => s.expenses);
  const todayKey = getTodayKey();
  const monthKey = getMonthKey();
  const yearKey = new Date().getFullYear().toString();

  let filtered = [...expenses];
  if (period === "today") filtered = filtered.filter((e) => e.date === todayKey);
  else if (period === "month") filtered = filtered.filter((e) => e.date?.startsWith(monthKey));
  else if (period === "year") filtered = filtered.filter((e) => e.date?.startsWith(yearKey));
  filtered.sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.createdAt - a.createdAt);

  if (filtered.length === 0) {
    return <EmptyState message="ยังไม่มีรายจ่ายในช่วงนี้" href="#" action="บันทึกรายจ่าย" />;
  }

  if (period === "today") {
    return (
      <div className="border border-hairline bg-paper px-3">
        {filtered.map((e) => (
          <ExpenseRow key={e.id} expense={e} />
        ))}
      </div>
    );
  }

  const groups = new Map();
  filtered.forEach((e) => {
    const key = e.date || "unknown";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  });

  return (
    <div className="flex flex-col gap-4">
      {[...groups.entries()].map(([date, exps]) => {
        const dayTotal = exps.reduce((s, e) => s + Number(e.amount), 0);
        return (
          <div key={date}>
            <div className="flex items-center justify-between text-xs text-ink-faint">
              <span>{formatDate(date)}</span>
              <span className="font-medium text-ink-muted">{formatMoney(dayTotal)}</span>
            </div>
            <div className="mt-1 border border-hairline bg-paper px-3">
              {exps.map((e) => (
                <ExpenseRow key={e.id} expense={e} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
