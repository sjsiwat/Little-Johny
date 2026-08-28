import { useState } from "react";
import { DndContext, useDroppable, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toastStore";
import { addTask } from "@/lib/actions";
import { KANBAN_COLUMNS, PRIORITY_RANK, STATUS_META } from "@/lib/constants";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskModal } from "@/components/tasks/TaskModal";

/* Inline capture: Enter creates the task in this column, Escape backs out.
   The modal stays available from the pencil for everything else. */
function QuickAdd({ status }) {
  const [openInput, setOpenInput] = useState(false);
  const [title, setTitle] = useState("");

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return setOpenInput(false);
    addTask(trimmed, "Medium", "", status, "", []);
    setTitle("");
  }

  if (!openInput) {
    return (
      <button
        type="button"
        onClick={() => setOpenInput(true)}
        className="flex items-center justify-center gap-1 border border-dashed border-hairline py-2 text-xs text-ink-faint transition-colors hover:border-accent hover:text-accent"
      >
        <Plus size={13} aria-hidden /> เพิ่มงาน
      </button>
    );
  }

  return (
    <input
      autoFocus
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") submit();
        if (e.key === "Escape") {
          setTitle("");
          setOpenInput(false);
        }
      }}
      onBlur={submit}
      placeholder="ชื่องาน แล้วกด Enter"
      aria-label={`เพิ่มงานใน ${STATUS_META[status].label}`}
      className="border border-accent bg-paper px-2 py-2 text-xs text-ink outline-none"
    />
  );
}

function KanbanColumn({ status, onEdit, dragging }) {
  const tasks = useStore((s) => s.tasks);
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = STATUS_META[status];
  const columnTasks = tasks
    .filter((t) => t.status === status)
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);

  return (
    <div className="flex min-w-0 flex-col bg-paper-dim p-3">
      <div className="flex items-center gap-2 pb-3">
        <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} aria-hidden />
        <span className="text-sm font-semibold text-ink">{meta.label}</span>
        <span className="ml-auto min-w-[20px] rounded-full bg-paper px-1.5 py-0.5 text-center text-[11px] text-ink-muted">
          {columnTasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-col gap-2 border border-dashed p-1 transition-colors ${
          isOver
            ? "border-accent bg-accent/10"
            : dragging
              ? "border-hairline-strong"
              : "border-transparent"
        }`}
      >
        {columnTasks.length === 0 ? (
          <p className="py-6 text-center text-xs text-ink-faint">{isOver ? "วางที่นี่" : "ไม่มีงาน"}</p>
        ) : (
          columnTasks.map((task) => <TaskCard key={task.id} task={task} onEdit={() => onEdit(task.id)} />)
        )}
        <QuickAdd status={status} />
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const updateTask = useStore((s) => s.updateTask);
  const showToast = useToastStore((s) => s.showToast);
  const [modalState, setModalState] = useState(null);
  const [dragging, setDragging] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleEdit(id) {
    setModalState(
      id.startsWith("__new__:")
        ? { taskId: null, defaultStatus: id.split(":")[1] }
        : { taskId: id, defaultStatus: "todo" }
    );
  }

  function handleDragEnd(event) {
    setDragging(false);
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id;
    const task = useStore.getState().tasks.find((t) => t.id === active.id);
    if (!task || task.status === newStatus) return;
    updateTask(active.id, { status: newStatus });
    showToast(`ย้ายงานไป "${STATUS_META[newStatus].label}" แล้ว`);
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={() => setDragging(true)}
        onDragCancel={() => setDragging(false)}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KANBAN_COLUMNS.map((status) => (
            <KanbanColumn key={status} status={status} onEdit={handleEdit} dragging={dragging} />
          ))}
        </div>
      </DndContext>
      {modalState && (
        <TaskModal
          taskId={modalState.taskId}
          defaultStatus={modalState.defaultStatus}
          onClose={() => setModalState(null)}
        />
      )}
    </>
  );
}
