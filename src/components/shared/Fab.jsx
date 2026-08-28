import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, FileText, ListChecks } from "lucide-react";
import { useFabStore } from "@/lib/fabStore";
import { TaskModal } from "@/components/tasks/TaskModal";

export function Fab() {
  const open = useFabStore((s) => s.open);
  const close = useFabStore((s) => s.close);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  useEffect(() => {
    function onClickOutside(e) {
      if (!open) return;
      const target = e.target ;
      if (menuRef.current?.contains(target)) return;
      if ((target ).closest?.("[aria-haspopup='menu']")) return;
      close();
    }
    function onKeyDown(e) {
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
          className="absolute bottom-full left-1/2 mb-2 flex w-40 -translate-x-1/2 flex-col border border-hairline bg-paper"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              navigate("/expenses");
            }}
            className="flex items-center gap-2 border-b border-hairline px-3 py-2 text-left text-sm text-ink hover:bg-paper-dim"
          >
            <Wallet size={14} aria-hidden /> รายจ่ายใหม่
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              navigate("/notes");
            }}
            className="flex items-center gap-2 border-b border-hairline px-3 py-2 text-left text-sm text-ink hover:bg-paper-dim"
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
            className="flex items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-paper-dim"
          >
            <ListChecks size={14} aria-hidden /> งานใหม่
          </button>
        </div>
      )}
      {taskModalOpen && <TaskModal taskId={null} defaultStatus="todo" onClose={() => setTaskModalOpen(false)} />}
    </>
  );
}
