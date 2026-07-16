"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import { ResizableImage } from "@/lib/tiptapResizableImage";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  ImagePlus,
  X,
  RemoveFormatting,
} from "lucide-react";
import { FontSize } from "@/lib/tiptapFontSize";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toastStore";

const DOC_FONTS: [string, string][] = [
  ["ค่าเริ่มต้น", "system-ui, -apple-system, 'Segoe UI', sans-serif"],
  ["Tahoma", "Tahoma, 'Leelawadee UI', sans-serif"],
  ["Arial", "Arial, Helvetica, sans-serif"],
  ["Verdana", "Verdana, Geneva, sans-serif"],
  ["Georgia", "Georgia, serif"],
  ["Times New Roman", "'Times New Roman', Times, serif"],
  ["Courier New", "'Courier New', monospace"],
  ["Sarabun", "'Sarabun', 'TH Sarabun New', sans-serif"],
  ["Angsana", "'Angsana New', 'AngsanaUPC', serif"],
];
const DOC_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72];
const DOC_TEXT_SWATCHES = [
  "#1a1a1a", "#c23b22", "#fb2c36", "#edb200", "#00c758", "#3080ff",
  "#8e44ad", "#5a8fa8", "#795548", "#607d8b", "#e91e63", "#ffffff",
];
const DOC_HL_SWATCHES = [
  "#fff3b0", "#ffd6a5", "#caffbf", "#a0e7e5", "#bdb2ff", "#ffc6ff",
  "#ffadad", "#d0f4de", "#ffe066", "#c1fba4", "#9bf6ff", "#e2e2e2",
];

interface DocEditorProps {
  noteId: string;
  onClose: () => void;
}

function insertImageFile(
  editor: Editor,
  file: File,
  insertCountRef: React.MutableRefObject<number>,
  dirtyRef: React.MutableRefObject<boolean>
) {
  const reader = new FileReader();
  reader.onload = () => {
    const src = reader.result as string;
    const img = new window.Image();
    img.onload = () => {
      const maxWidth = 320;
      const ratio = img.naturalWidth > 0 ? img.naturalHeight / img.naturalWidth : 0.75;
      const width = Math.min(maxWidth, img.naturalWidth || maxWidth);
      const height = Math.max(40, Math.round(width * ratio));
      const offset = (insertCountRef.current++ % 6) * 28;
      editor
        .chain()
        .focus()
        .setResizableImage({ src, x: 64 + offset, y: 64 + offset, width, height })
        .run();
      dirtyRef.current = true;
    };
    img.src = src;
  };
  reader.readAsDataURL(file);
}

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center border ${
        active ? "border-ink bg-ink text-paper" : "border-transparent text-ink-muted hover:border-hairline"
      }`}
    >
      {children}
    </button>
  );
}

export function DocEditor({ noteId, onClose }: DocEditorProps) {
  const note = useStore((s) => s.notes.find((n) => n.id === noteId));
  const updateNote = useStore((s) => s.updateNote);
  const showToast = useToastStore((s) => s.showToast);
  const [title, setTitle] = useState(note?.title ?? "");
  const [showTextSwatches, setShowTextSwatches] = useState(false);
  const [showHlSwatches, setShowHlSwatches] = useState(false);
  const dirtyRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insertCountRef = useRef(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      Color,
      FontFamily,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ResizableImage,
      Placeholder.configure({ placeholder: "เริ่มพิมพ์เอกสารของคุณ…" }),
    ],
    content: note?.body || "",
    immediatelyRender: false,
    onUpdate: () => {
      dirtyRef.current = true;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(saveNow, 1200);
    },
    editorProps: {
      handlePaste(_view, event) {
        if (!editor) return false;
        const files = Array.from(event.clipboardData?.items || [])
          .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
          .map((item) => item.getAsFile())
          .filter((file): file is File => !!file);
        if (files.length === 0) return false;
        event.preventDefault();
        files.forEach((file) => insertImageFile(editor, file, insertCountRef, dirtyRef));
        return true;
      },
    },
  });

  const saveNow = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    updateNote(noteId, { title: title.trim() || "เอกสารไม่มีชื่อ", body: html });
    dirtyRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, noteId, title]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (dirtyRef.current) {
      saveNow();
      showToast(`บันทึกเอกสาร "${title.trim() || "เอกสารไม่มีชื่อ"}" แล้ว`);
    }
    onClose();
  }

  function insertImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    insertImageFile(editor, file, insertCountRef, dirtyRef);
    e.target.value = "";
  }

  if (!note || !editor) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-paper dark:bg-dark-bg" role="dialog" aria-modal="true">
      <header className="flex items-center justify-between border-b border-hairline px-4 py-3 dark:border-white/10">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            dirtyRef.current = true;
          }}
          placeholder="ชื่อเอกสาร"
          className="min-w-0 flex-1 bg-transparent font-grotesk text-lg font-semibold text-ink outline-none dark:text-white/90"
        />
        <button
          type="button"
          onClick={handleClose}
          aria-label="ปิด"
          className="ml-4 shrink-0 border border-ink px-3 py-1.5 text-sm text-ink hover:bg-ink hover:text-paper dark:border-white/30 dark:text-white/90"
        >
          <X size={14} aria-hidden className="inline" /> ปิด
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-1 border-b border-hairline px-4 py-2 dark:border-white/10">
        <select
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          className="border border-hairline bg-paper px-2 py-1 text-xs dark:border-white/15 dark:bg-dark-surface-soft"
          defaultValue=""
        >
          <option value="" disabled>
            ฟอนต์
          </option>
          {DOC_FONTS.map(([label, value]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => editor.chain().focus().setFontSize(`${e.target.value}px`).run()}
          className="border border-hairline bg-paper px-2 py-1 text-xs dark:border-white/15 dark:bg-dark-surface-soft"
          defaultValue=""
        >
          <option value="" disabled>
            ขนาด
          </option>
          {DOC_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => {
            const v = e.target.value;
            const chain = editor.chain().focus();
            if (v === "p") chain.setParagraph().run();
            else if (v === "blockquote") chain.toggleBlockquote().run();
            else chain.toggleHeading({ level: Number(v) as 1 | 2 | 3 }).run();
          }}
          className="border border-hairline bg-paper px-2 py-1 text-xs dark:border-white/15 dark:bg-dark-surface-soft"
          defaultValue="p"
        >
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="blockquote">Blockquote</option>
        </select>

        <div className="mx-1 h-5 w-px bg-hairline dark:bg-white/15" />

        <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={14} aria-hidden />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} aria-hidden />
        </ToolbarButton>
        <ToolbarButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={14} aria-hidden />
        </ToolbarButton>
        <ToolbarButton label="Strike" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={14} aria-hidden />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-hairline dark:bg-white/15" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTextSwatches((v) => !v)}
            aria-label="สีตัวอักษร"
            title="สีตัวอักษร"
            className="flex h-8 w-8 items-center justify-center border border-transparent text-sm font-bold text-ink-muted hover:border-hairline"
          >
            A
          </button>
          {showTextSwatches && (
            <div className="absolute left-0 top-9 z-10 grid grid-cols-6 gap-1 border border-ink bg-paper p-2 dark:border-white/20 dark:bg-dark-surface">
              {DOC_TEXT_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(c).run();
                    setShowTextSwatches(false);
                  }}
                  style={{ background: c }}
                  className="h-5 w-5 border border-hairline"
                  aria-label={c}
                />
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowHlSwatches((v) => !v)}
            aria-label="สีไฮไลต์"
            title="สีไฮไลต์"
            className="flex h-8 w-8 items-center justify-center border border-transparent text-ink-muted hover:border-hairline"
          >
            <span className="bg-amber/40 px-0.5">H</span>
          </button>
          {showHlSwatches && (
            <div className="absolute left-0 top-9 z-10 grid grid-cols-6 gap-1 border border-ink bg-paper p-2 dark:border-white/20 dark:bg-dark-surface">
              {DOC_HL_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color: c }).run();
                    setShowHlSwatches(false);
                  }}
                  style={{ background: c }}
                  className="h-5 w-5 border border-hairline"
                  aria-label={c}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mx-1 h-5 w-px bg-hairline dark:bg-white/15" />

        <ToolbarButton label="ชิดซ้าย" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft size={14} aria-hidden />
        </ToolbarButton>
        <ToolbarButton label="กึ่งกลาง" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter size={14} aria-hidden />
        </ToolbarButton>
        <ToolbarButton label="ชิดขวา" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight size={14} aria-hidden />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-hairline dark:bg-white/15" />

        <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={14} aria-hidden />
        </ToolbarButton>
        <ToolbarButton label="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={14} aria-hidden />
        </ToolbarButton>
        <ToolbarButton label="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={14} aria-hidden />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-hairline dark:bg-white/15" />

        <label className="flex h-8 w-8 cursor-pointer items-center justify-center border border-transparent text-ink-muted hover:border-hairline" title="แทรกรูปภาพ">
          <ImagePlus size={14} aria-hidden />
          <input type="file" accept="image/*" onChange={insertImage} className="hidden" />
        </label>
        <ToolbarButton label="ล้างรูปแบบ" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <RemoveFormatting size={14} aria-hidden />
        </ToolbarButton>
      </div>

      <div
        className="flex-1 overflow-y-auto bg-paper-dim px-4 py-8 dark:bg-dark-bg"
        onClick={() => editor.chain().focus().run()}
      >
        <div
          className="mx-auto max-w-[794px] border border-hairline bg-paper shadow-none dark:border-white/10 dark:bg-dark-surface"
          onClick={(e) => e.stopPropagation()}
        >
          <EditorContent editor={editor} className="doc-editor-content" />
        </div>
      </div>
    </div>
  );
}
