import { useDraggable } from "@dnd-kit/core";
import { Pencil } from "lucide-react";

import { PRIORITY_COLORS, TASK_LABELS, labelColor, labelTint } from "@/lib/constants";
import { formatDate, getDeadlineInfo } from "@/lib/format";
import { isTaskDone } from "@/lib/actions";

export function TaskCard({ task, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const color = PRIORITY_COLORS[task.priority] || "rgb(var(--c-text-muted))";
  const done = isTaskDone(task);
  const info = getDeadlineInfo(task.due, done);
  const labels = task.labels.map((id) => TASK_LABELS.find((l) => l.id === id)).filter(Boolean);

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab border border-hairline bg-paper p-3 active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
        <span className="min-w-0 flex-1 text-sm font-medium text-ink">{task.title}</span>
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

      {labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {labels.map((l) => (
            <span
              key={l.id}
              className="rounded-full px-2 py-0.5 text-[11px] leading-tight"
              style={{ background: labelTint(l), color: labelColor(l) }}
            >
              {l.name}
            </span>
          ))}
        </div>
      )}

      {/* Always rendered, so every card carries the same footer line and the
          column does not turn into a ragged mix of one-line and full cards. */}
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-ink-faint">
        <span>{task.priority}</span>
        {task.due ? (
          info?.type === "overdue" ? (
            <span className="text-danger">เกิน {info.days} วัน</span>
          ) : info?.type === "today" ? (
            <span className="text-accent">วันนี้</span>
          ) : (
            <span>{formatDate(task.due)}</span>
          )
        ) : (
          <span>ไม่มีกำหนด</span>
        )}
      </div>
    </div>
  );
}
