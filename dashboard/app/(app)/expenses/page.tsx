"use client";

import { useState } from "react";
import { ExpenseComposerForm } from "@/components/expenses/ExpenseComposerForm";
import { ExpenseStats } from "@/components/expenses/ExpenseStats";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import type { ExpensePeriod } from "@/types";

export default function ExpensesPage() {
  const [period, setPeriod] = useState<ExpensePeriod>("month");

  return (
    <div className="flex flex-col gap-4">
      <ExpenseComposerForm />
      <ExpenseStats period={period} onChange={setPeriod} />
      <ExpenseList period={period} />
    </div>
  );
}
