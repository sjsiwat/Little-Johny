"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ListChecks,
  FileText,
  Wallet,
  CalendarDays,
  BarChart3,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutGrid },
  { href: "/tasks", label: "Tasks", Icon: ListChecks },
  { href: "/notes", label: "Notes", Icon: FileText },
  { href: "/expenses", label: "Expenses", Icon: Wallet },
  { href: "/calendar", label: "Calendar", Icon: CalendarDays },
  { href: "/review", label: "Review", Icon: BarChart3 },
];

const QUOTES = [
  "งานที่ดีที่สุด คือที่งานที่ทำเสร็จแล้ว",
  "จดไว้ก่อน อย่าฝากไว้กับความจำ",
  "วันนี้ทำให้ดีพอ พรุ่งนี้ค่อยทำให้ดีขึ้น",
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    setCollapsed(localStorage.getItem("sidebarCollapsed") === "1");
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside
      aria-label="Main navigation"
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-hairline bg-paper p-4 transition-[width] duration-200 dark:border-white/10 dark:bg-dark-surface ${
        collapsed ? "w-16" : "w-52"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        {!collapsed && (
          <span className="font-grotesk text-sm font-semibold text-ink dark:text-white/90">Johny Memo</span>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
          className="text-ink-faint hover:text-ink"
        >
          {collapsed ? <PanelLeft size={16} aria-hidden /> : <PanelLeftClose size={16} aria-hidden />}
        </button>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-ink text-paper dark:bg-white dark:text-dark-bg"
                  : "text-ink-muted hover:text-ink dark:hover:text-white/90"
              }`}
              title={label}
            >
              <Icon size={16} aria-hidden className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <p className="mt-auto text-xs italic leading-relaxed text-ink-faint font-serif">&ldquo;{quote}&rdquo;</p>
      )}
    </aside>
  );
}
