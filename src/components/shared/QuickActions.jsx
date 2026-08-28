import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, FileText, ListChecks } from "lucide-react";
import { TaskModal } from "@/components/tasks/TaskModal";

// Sits under the quick-capture input so the three things you can capture are
// one click away without typing a command. This used to be a popup menu hung
// off the mascot; the mascot is display-only now.
export function QuickActions() {
  const navigate = useNavigate();
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const actions = [
    { label: "งานใหม่", Icon: ListChecks, run: () => setTaskModalOpen(true) },
    { label: "โน้ตใหม่", Icon: FileText, run: () => navigate("/notes") },
    { label: "รายจ่ายใหม่", Icon: Wallet, run: () => navigate("/expenses") },
  ];

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        {actions.map(({ label, Icon, run }) => (
          <button
            key={label}
            type="button"
            onClick={run}
            className="inline-flex items-center gap-1.5 border border-hairline px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-accent hover:text-accent"
          >
            <Icon size={13} aria-hidden />
            {label}
          </button>
        ))}
      </div>
      {taskModalOpen && <TaskModal taskId={null} defaultStatus="todo" onClose={() => setTaskModalOpen(false)} />}
    </>
  );
}
