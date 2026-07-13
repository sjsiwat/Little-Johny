"use client";

import { useState } from "react";
import { DndContext, useDroppable, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toastStore";
import { KANBAN_COLUMNS, PRIORITY_RANK, STATUS_META } from "@/lib/constants";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskModal } from "@/components/tasks/TaskModal";
import type { TaskStatus } from "@/types";

function KanbanColumn({ status, onEdit }: { status: TaskStatus; onEdit: (id: string) => void }) {
  const tasks = useStore((s) => s.tasks);
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = STATUS_META[status];
  const columnTasks = tasks
    .filter((t) => t.status === status)
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex items-center gap-2 border-b border-ink pb-2 dark:border-white/30">
        <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} aria-hidden />
        <span className="text-sm font-semibold text-ink dark:text-white/90">{meta.label}</span>
        <span className="ml-auto text-xs text-ink-faint">{columnTasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`mt-3 flex min-h-[120px] flex-col gap-2 ${isOver ? "bg-paper-dim dark:bg-dark-surface-soft" : ""}`}
      >
        {columnTasks.length === 0 ? (
          <p className="py-6 text-center text-xs text-ink-faint">ไม่มีงาน</p>
        ) : (
          columnTasks.map((task) => <TaskCard key={task.id} task={task} onEdit={() => onEdit(task.id)} />)
        )}
        <button
          type="button"
          onClick={() => onEdit("__new__:" + status)}
          className="mt-1 border border-dashed border-hairline py-2 text-xs text-ink-faint hover:border-ink hover:text-ink dark:border-white/15"
        >
          + เพิ่มงาน
        </button>
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const updateTask = useStore((s) => s.updateTask);
  const showToast = useToastStore((s) => s.showToast);
  const [modalState, setModalState] = useState<{ taskId: string | null; defaultStatus: TaskStatus } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleEdit(id: string) {
    if (id.startsWith("__new__:")) {
      setModalState({ taskId: null, defaultStatus: id.split(":")[1] as TaskStatus });
    } else {
      setModalState({ taskId: id, defaultStatus: "todo" });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as TaskStatus;
    const taskId = active.id as string;
    const task = useStore.getState().tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;
    updateTask(taskId, { status: newStatus });
    showToast(`ย้ายงานไป "${STATUS_META[newStatus].label}" แล้ว`);
  }

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {KANBAN_COLUMNS.map((status) => (
            <KanbanColumn key={status} status={status} onEdit={handleEdit} />
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
