"use client";

import { useState } from "react";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskModal } from "@/components/tasks/TaskModal";

export default function TasksPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-accent hover:border-accent"
        >
          + เพิ่มงาน
        </button>
      </div>
      <KanbanBoard />
      {addOpen && <TaskModal taskId={null} defaultStatus="todo" onClose={() => setAddOpen(false)} />}
    </div>
  );
}
