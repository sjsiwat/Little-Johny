"use client";

import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import { EmptyState } from "@/components/shared/EmptyState";
import { deleteNote } from "@/lib/actions";
import { useToastStore } from "@/lib/toastStore";
import { notePlainText, parseTags, relativeTime } from "@/lib/format";

export function NoteCardGrid({ onOpen }: { onOpen: (id: string) => void }) {
  const notes = useStore((s) => s.notes);
  const showToast = useToastStore((s) => s.showToast);

  if (notes.length === 0) {
    return <EmptyState message="ยังไม่มีโน้ต เริ่มจดสิ่งที่คิดได้เลย" href="#" action="เขียนโน้ต" />;
  }

  const sorted = [...notes].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((note) => {
        if (note._isKVLine) {
          return (
            <article key={note.id} className="border border-hairline bg-paper-dim p-4 dark:border-white/10 dark:bg-dark-surface-soft">
              <p className="font-grotesk text-sm font-semibold text-ink dark:text-white/90">{note.title}</p>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-muted">{notePlainText(note.body)}</p>
            </article>
          );
        }
        const tags = parseTags(note.tags);
        const preview = notePlainText(note.body);
        return (
          <article
            key={note.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(note.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onOpen(note.id);
            }}
            className="cursor-pointer border border-hairline bg-paper p-4 transition-colors hover:bg-paper-dim dark:border-white/10 dark:bg-dark-surface dark:hover:bg-dark-surface-soft"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="min-w-0 flex-1 truncate font-grotesk text-sm font-semibold text-ink dark:text-white/90">
                {note.title}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!confirm("ลบโน้ตนี้?")) return;
                  deleteNote(note.id);
                  showToast("ลบโน้ตแล้ว");
                }}
                aria-label="ลบโน้ต"
                className="shrink-0 text-ink-faint hover:text-danger"
              >
                <X size={14} aria-hidden />
              </button>
            </div>
            {preview && (
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-muted">
                {preview.slice(0, 140)}
                {preview.length > 140 ? "…" : ""}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {tags.map((t) => (
                <span key={t} className="border border-hairline px-1.5 py-0.5 text-[11px] text-ink-muted">
                  {t}
                </span>
              ))}
              <span className="ml-auto text-[11px] text-ink-faint">{relativeTime(note.createdAt)}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
