"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Modal, type ModalHandle } from "@/components/shared/Modal";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toastStore";
import { deleteNote } from "@/lib/actions";

interface NoteModalProps {
  noteId: string;
  onClose: () => void;
  onExpand: () => void;
}

export function NoteModal({ noteId, onClose, onExpand }: NoteModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const note = useStore((s) => s.notes.find((n) => n.id === noteId));
  const updateNote = useStore((s) => s.updateNote);
  const showToast = useToastStore((s) => s.showToast);

  const [title, setTitle] = useState(note?.title ?? "");
  const [body, setBody] = useState(note?.body ?? "");
  const [tags, setTags] = useState(note?.tags ?? "");

  useEffect(() => {
    modalRef.current?.showModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!note) return null;

  const created = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(note.createdAt)
  );

  function handleSave() {
    updateNote(noteId, { title: title.trim() || "โน้ตไม่มีชื่อ", body, tags: tags.trim() });
    showToast("บันทึกโน้ตแล้ว");
    modalRef.current?.close();
  }

  function handleDelete() {
    if (!confirm("ลบโน้ตนี้?")) return;
    deleteNote(noteId);
    showToast("ลบโน้ตแล้ว");
    modalRef.current?.close();
  }

  return (
    <Modal ref={modalRef} onClose={onClose} labelledBy="note-modal-title" className="max-w-2xl">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <input
            id="note-modal-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ชื่อโน้ต"
            className="min-w-0 flex-1 bg-transparent font-grotesk text-lg font-semibold text-ink outline-none dark:text-white/90"
          />
          <button type="button" onClick={() => modalRef.current?.close()} aria-label="ปิด" className="text-ink-faint hover:text-ink">
            <X size={16} aria-hidden />
          </button>
        </div>
        <p className="mt-1 text-xs text-ink-faint">
          สร้างเมื่อ {created} · {" "}
        </p>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="mt-4 w-full border border-hairline bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="แท็ก (คั่นด้วยจุลภาค)"
          className="mt-2 w-full border border-hairline bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
        />

        <div className="mt-6 flex items-center justify-between">
          <button type="button" onClick={handleDelete} className="text-sm text-danger hover:underline">
            ลบโน้ต
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onExpand}
              className="border border-hairline px-4 py-2 text-sm text-ink dark:border-white/15 dark:text-white/90"
            >
              แก้ไขเต็มหน้า
            </button>
            <button
              type="button"
              onClick={() => modalRef.current?.close()}
              className="border border-hairline px-4 py-2 text-sm text-ink-muted dark:border-white/15"
            >
              ยกเลิก
            </button>
            <button type="button" onClick={handleSave} className="bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-accent">
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
