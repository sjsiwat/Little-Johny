"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Modal, type ModalHandle } from "@/components/shared/Modal";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toastStore";
import { addTask, deleteTask } from "@/lib/actions";
import { TASK_LABELS } from "@/lib/constants";
import type { TaskPriority, TaskStatus } from "@/types";

interface TaskModalProps {
  taskId: string | null;
  defaultStatus: TaskStatus;
  onClose: () => void;
}

export function TaskModal({ taskId, defaultStatus, onClose }: TaskModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const task = useStore((s) => s.tasks.find((t) => t.id === taskId));
  const updateTask = useStore((s) => s.updateTask);
  const showToast = useToastStore((s) => s.showToast);

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "Medium");
  const [due, setDue] = useState(task?.due ?? "");
  const [labels, setLabels] = useState<string[]>(task?.labels ?? []);
  const hasTarget = task?.target_value != null && task.target_value > 0;
  const [targetOn, setTargetOn] = useState(hasTarget);
  const [targetValue, setTargetValue] = useState(hasTarget ? String(task?.target_value) : "");
  const [targetUnit, setTargetUnit] = useState(task?.target_unit ?? "");
  const [progressValue, setProgressValue] = useState(
    task && task.progress_value > 0 ? String(task.progress_value) : ""
  );

  useEffect(() => {
    modalRef.current?.showModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleLabel(id: string) {
    setLabels((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const targetVal = targetOn ? Number(targetValue) || null : null;
    const targetU = targetOn ? targetUnit.trim() : "";
    const progressVal = progressValue !== "" ? Number(progressValue) : null;

    if (taskId) {
      const existing = useStore.getState().tasks.find((t) => t.id === taskId);
      updateTask(taskId, {
        title: trimmedTitle,
        description: description.trim(),
        status,
        priority,
        due,
        labels,
        target_value: targetVal,
        target_unit: targetU,
        progress_value: progressVal !== null ? progressVal : existing?.progress_value || 0,
      });
      showToast("บันทึกงานแล้ว");
    } else {
      addTask(trimmedTitle, priority, due, status, description.trim(), labels, targetVal, targetU);
      showToast("เพิ่มงานแล้ว");
    }
    modalRef.current?.close();
  }

  function handleDelete() {
    if (!taskId) return;
    if (!confirm("ลบงานนี้?")) return;
    deleteTask(taskId);
    showToast("ลบงานแล้ว");
    modalRef.current?.close();
  }

  return (
    <Modal ref={modalRef} onClose={onClose} labelledBy="task-modal-title" className="max-w-xl">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-start justify-between">
          <p id="task-modal-title" className="font-grotesk text-lg font-semibold text-ink dark:text-white/90">
            {taskId ? "แก้ไขงาน" : "เพิ่มงาน"}
          </p>
          <button
            type="button"
            onClick={() => modalRef.current?.close()}
            aria-label="ปิด"
            className="text-ink-faint hover:text-ink"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <input
            autoFocus
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ชื่องาน"
            className="border border-hairline bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="รายละเอียด (ไม่บังคับ)"
            rows={3}
            className="border border-hairline bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
          />

          <div className="grid grid-cols-3 gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="border border-hairline bg-paper px-2 py-2 text-sm text-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
            >
              <option value="todo">สิ่งที่ต้องทำ</option>
              <option value="in_progress">กำลังทำ</option>
              <option value="review">รอตรวจ</option>
              <option value="done">เสร็จแล้ว</option>
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="border border-hairline bg-paper px-2 py-2 text-sm text-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="border border-hairline bg-paper px-2 py-2 text-sm text-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TASK_LABELS.map((l) => (
              <button
                type="button"
                key={l.id}
                onClick={() => toggleLabel(l.id)}
                className="px-2 py-1 text-xs"
                style={
                  labels.includes(l.id)
                    ? { background: l.color, color: "#fff" }
                    : { background: `${l.color}18`, color: l.color }
                }
              >
                {l.name}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input type="checkbox" checked={targetOn} onChange={(e) => setTargetOn(e.target.checked)} />
            มีเป้าหมายตัวเลข (เช่น หน้า, กิโล, ครั้ง)
          </label>
          {targetOn && (
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                placeholder="เป้าหมาย"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="border border-hairline bg-paper px-2 py-2 text-sm text-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
              />
              <input
                placeholder="หน่วย"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="border border-hairline bg-paper px-2 py-2 text-sm text-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
              />
              <input
                type="number"
                placeholder="ความคืบหน้าปัจจุบัน"
                value={progressValue}
                onChange={(e) => setProgressValue(e.target.value)}
                className="border border-hairline bg-paper px-2 py-2 text-sm text-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          {taskId ? (
            <button type="button" onClick={handleDelete} className="text-sm text-danger hover:underline">
              ลบงาน
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => modalRef.current?.close()}
              className="border border-hairline px-4 py-2 text-sm text-ink-muted dark:border-white/15"
            >
              ยกเลิก
            </button>
            <button type="submit" className="bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-accent">
              บันทึก
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
