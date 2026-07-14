"use client";

import { useState } from "react";
import { NoteComposerForm } from "@/components/notes/NoteComposerForm";
import { NoteCardGrid } from "@/components/notes/NoteCardGrid";
import { NoteModal } from "@/components/notes/NoteModal";
import { DocEditor } from "@/components/notes/DocEditor";
import { useStore } from "@/lib/store";
import { isRichNote } from "@/lib/format";

export default function NotesPage() {
  const addNoteToStore = useStore((s) => s.addNote);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [docEditId, setDocEditId] = useState<string | null>(null);

  function handleNewDoc() {
    const id = crypto.randomUUID();
    addNoteToStore({ id, title: "", body: "<p></p>", tags: "", createdAt: Date.now() });
    setDocEditId(id);
  }

  function handleOpenNote(id: string) {
    const note = useStore.getState().notes.find((n) => n.id === id);
    if (note && isRichNote(note.body)) {
      setDocEditId(id);
    } else {
      setOpenNoteId(id);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <NoteComposerForm onNewDoc={handleNewDoc} />
      <NoteCardGrid onOpen={handleOpenNote} />
      {openNoteId && (
        <NoteModal
          noteId={openNoteId}
          onClose={() => setOpenNoteId(null)}
          onExpand={() => {
            setDocEditId(openNoteId);
            setOpenNoteId(null);
          }}
        />
      )}
      {docEditId && <DocEditor noteId={docEditId} onClose={() => setDocEditId(null)} />}
    </div>
  );
}
