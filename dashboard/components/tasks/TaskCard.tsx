"use client";

import { useDraggable } from "@dnd-kit/core";
import { Pencil } from "lucide-react";
import type { Task } from "@/types";
import { PRIORITY_COLORS, TASK_LABELS } from "@/lib/constants";
import { formatDate, getDeadlineInfo } from "@/lib/format";
import { isTaskDone } from "@/lib/actions";

export function TaskCard({ task, onEdit }: { task: Task; onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const color = PRIORITY_COLORS[task.priority] || "#8E8E93";
  const done = isTaskDone(task);
  const info = getDeadlineInfo(task.due, done);

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab border border-hairline bg-paper p-3 active:cursor-grabbing dark:border-white/10 dark:bg-dark-surface ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
        <span className="min-w-0 flex-1 text-sm font-medium text-ink dark:text-white/90">{task.title}</span>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onEdit}
          aria-label="แก้ไขงาน"
          title="แก้ไข"
          className="shrink-0 text-ink-faint opacity-60 hover:text-ink hover:opacity-100"
        >
          <Pencil size={12} aria-hidden />
        </button>
      </div>
      {task.description && (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-muted">{task.description}</p>
      )}
      {(task.labels.length > 0 || task.due) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {task.labels.map((id) => {
            const l = TASK_LABELS.find((x) => x.id === id);
            if (!l) return null;
            return (
              <span key={id} className="px-1.5 py-0.5 text-[11px]" style={{ background: `${l.color}18`, color: l.color }}>
                {l.name}
              </span>
            );
          })}
          {task.due &&
            (info?.type === "overdue" ? (
              <span className="px-1.5 py-0.5 text-[11px] text-danger">เกิน {info.days} วัน</span>
            ) : info?.type === "today" ? (
              <span className="px-1.5 py-0.5 text-[11px] text-accent">วันนี้</span>
            ) : (
              <span className="px-1.5 py-0.5 text-[11px] text-ink-faint">{formatDate(task.due)}</span>
            ))}
        </div>
      )}
    </div>
  );
}
