import { useLocation } from "react-router-dom";
import { useRef } from "react";
import { useStore } from "@/lib/store";

import { AccountModal } from "@/components/shared/AccountModal";

const TITLES = {
  "/dashboard": "Dashboard",
  "/tasks": "Tasks",
  "/notes": "Notes",
  "/expenses": "Expenses",
  "/calendar": "Calendar",
  "/review": "Review",
};

const SYNC_META = {
  idle: { dot: "bg-accent", text: "" },
  loading: { dot: "bg-amber animate-pulse", text: "กำลังโหลด…" },
  pending: { dot: "bg-amber animate-pulse", text: "รอบันทึก…" },
  syncing: { dot: "bg-amber animate-pulse", text: "กำลังบันทึก…" },
  synced: { dot: "bg-accent", text: "บันทึกแล้ว ✓" },
  offline: { dot: "bg-ink-faint", text: "ออฟไลน์" },
  error: { dot: "bg-danger", text: "บันทึกไม่สำเร็จ" },
};

export function Topbar({ auth }) {
  const { pathname } = useLocation();
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const syncStatus = useStore((s) => s.syncStatus);
  const modalRef = useRef(null);

  const title = TITLES[pathname ?? ""] ?? "Dashboard";
  const sync = SYNC_META[syncStatus] ?? SYNC_META.idle;
  const displayLabel = auth.lineInfo?.display_name || auth.user?.email || "";

  return (
    <>
      <header className="flex items-center justify-between border-b border-hairline bg-paper px-6 py-4">
        <h1 className="font-grotesk text-xl font-semibold tracking-tight text-ink">{title}</h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="text-ink-muted hover:text-ink"
          >
            {theme === "dark" ? "☀" : "◐"}
          </button>
          <button
            type="button"
            onClick={() => modalRef.current?.showModal()}
            aria-label="บัญชีผู้ใช้"
            className="flex items-center gap-2 border border-hairline px-3 py-1.5 text-xs"
          >
            <span className="text-ink">{displayLabel}</span>
            <span className="flex items-center gap-1.5 text-ink-faint">
              <span className={`h-1.5 w-1.5 rounded-full ${sync.dot}`} aria-hidden />
              {sync.text}
            </span>
          </button>
        </div>
      </header>
      <AccountModal ref={modalRef} auth={auth} />
    </>
  );
}
