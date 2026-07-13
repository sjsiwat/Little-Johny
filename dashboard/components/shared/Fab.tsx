"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, FileText, ListChecks } from "lucide-react";
import { useFabStore } from "@/lib/fabStore";
import { TaskModal } from "@/components/tasks/TaskModal";

export function Fab() {
  const open = useFabStore((s) => s.open);
  const close = useFabStore((s) => s.close);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if ((target as HTMLElement).closest?.("[aria-haspopup='menu']")) return;
      close();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("click", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  if (!open && !taskModalOpen) return null;

  return (
    <>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute bottom-full left-1/2 mb-2 flex w-40 -translate-x-1/2 flex-col border border-ink bg-paper dark:border-white/30 dark:bg-dark-surface"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              router.push("/expenses");
            }}
            className="flex items-center gap-2 border-b border-hairline px-3 py-2 text-left text-sm text-ink hover:bg-paper-dim dark:border-white/10 dark:text-white/90 dark:hover:bg-dark-surface-soft"
          >
            <Wallet size={14} aria-hidden /> รายจ่ายใหม่
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              router.push("/notes");
            }}
            className="flex items-center gap-2 border-b border-hairline px-3 py-2 text-left text-sm text-ink hover:bg-paper-dim dark:border-white/10 dark:text-white/90 dark:hover:bg-dark-surface-soft"
          >
            <FileText size={14} aria-hidden /> โน้ตใหม่
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              setTaskModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-paper-dim dark:text-white/90 dark:hover:bg-dark-surface-soft"
          >
            <ListChecks size={14} aria-hidden /> งานใหม่
          </button>
        </div>
      )}
      {taskModalOpen && <TaskModal taskId={null} defaultStatus="todo" onClose={() => setTaskModalOpen(false)} />}
    </>
  );
}
