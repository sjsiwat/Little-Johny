"use client";

import { useState } from "react";
import { addNote } from "@/lib/actions";
import { useToastStore } from "@/lib/toastStore";

export function NoteComposerForm({ onNewDoc }: { onNewDoc: () => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const showToast = useToastStore((s) => s.showToast);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addNote(trimmed, body.trim(), tags.trim());
    setTitle("");
    setBody("");
    setTags("");
    showToast(`บันทึกโน้ต "${trimmed}" แล้ว`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border border-hairline bg-paper p-4 dark:border-white/10 dark:bg-dark-surface">
      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ชื่อโน้ต"
          className="flex-1 border border-hairline bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
        />
        <button
          type="button"
          onClick={onNewDoc}
          className="shrink-0 border border-ink px-3 py-2 text-sm text-ink hover:bg-ink hover:text-paper dark:border-white/30 dark:text-white/90"
        >
          เอกสาร A4
        </button>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="เขียนอะไรก็ได้ที่คิดออก…"
        rows={2}
        className="border border-hairline bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
      />
      <div className="flex gap-2">
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="แท็ก (คั่นด้วยจุลภาค)"
          className="flex-1 border border-hairline bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
        />
        <button type="submit" className="shrink-0 bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-accent">
          บันทึกโน้ต
        </button>
      </div>
    </form>
  );
}
