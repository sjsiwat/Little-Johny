"use client";

import Image from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { useCallback, useRef } from "react";

const MIN_SIZE = 40;

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    resizableImage: {
      setResizableImage: (options: {
        src: string;
        alt?: string;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
      }) => ReturnType;
    };
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function ResizableImageView({ node, updateAttributes, selected, editor, deleteNode, getPos }: NodeViewProps) {
  const { src, alt, x, y, width, height } = node.attrs as {
    src: string;
    alt: string | null;
    x: number;
    y: number;
    width: number;
    height: number;
  };

  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number; maxX: number; maxY: number } | null>(
    null
  );
  const resizeState = useRef<{ startX: number; origW: number; origH: number; ratio: number; maxW: number } | null>(null);

  const onDragPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!editor.isEditable) return;
      e.preventDefault();
      e.stopPropagation();
      editor.commands.setNodeSelection(getPos());
      const pageRect = editor.view.dom.getBoundingClientRect();
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: x,
        origY: y,
        maxX: Math.max(0, pageRect.width - width),
        maxY: Math.max(0, pageRect.height - height),
      };

      function onMove(ev: PointerEvent) {
        const s = dragState.current;
        if (!s) return;
        const nextX = clamp(s.origX + (ev.clientX - s.startX), 0, s.maxX);
        const nextY = clamp(s.origY + (ev.clientY - s.startY), 0, s.maxY);
        updateAttributes({ x: Math.round(nextX), y: Math.round(nextY) });
      }
      function onUp() {
        dragState.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      }
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [editor, updateAttributes, getPos, x, y, width, height]
  );

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!editor.isEditable) return;
      e.preventDefault();
      e.stopPropagation();
      editor.commands.setNodeSelection(getPos());
      const pageRect = editor.view.dom.getBoundingClientRect();
      resizeState.current = {
        startX: e.clientX,
        origW: width,
        origH: height,
        ratio: width / height || 1,
        maxW: Math.max(MIN_SIZE, pageRect.width - x),
      };

      function onMove(ev: PointerEvent) {
        const s = resizeState.current;
        if (!s) return;
        const nextW = clamp(s.origW + (ev.clientX - s.startX), MIN_SIZE, s.maxW);
        const nextH = Math.max(MIN_SIZE, Math.round(nextW / s.ratio));
        updateAttributes({ width: Math.round(nextW), height: nextH });
      }
      function onUp() {
        resizeState.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      }
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [editor, updateAttributes, getPos, x, width, height]
  );

  return (
    <NodeViewWrapper
      as="div"
      data-resizable-image-wrapper=""
      style={{ position: "absolute", left: x, top: y, width, height, zIndex: selected ? 20 : 10 }}
      className={selected ? "outline outline-2 outline-accent outline-offset-2" : ""}
    >
      <img
        src={src}
        alt={alt || ""}
        draggable={false}
        onPointerDown={onDragPointerDown}
        style={{ width: "100%", height: "100%", display: "block", cursor: editor.isEditable ? "move" : "default" }}
      />
      {selected && editor.isEditable && (
        <>
          <button
            type="button"
            aria-label="ลบรูปภาพ"
            title="ลบรูปภาพ"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => deleteNode()}
            className="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center border border-ink bg-paper text-xs text-ink hover:bg-ink hover:text-paper"
          >
            ×
          </button>
          <div
            onPointerDown={onResizePointerDown}
            title="ปรับขนาด"
            className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-nwse-resize border border-paper bg-accent"
          />
        </>
      )}
    </NodeViewWrapper>
  );
}

export const ResizableImage = Image.extend({
  name: "resizableImage",
  draggable: false,
  addAttributes() {
    return {
      ...this.parent?.(),
      x: {
        default: 40,
        parseHTML: (element) => parseFloat(element.getAttribute("data-x") || "40"),
        renderHTML: (attributes) => ({ "data-x": attributes.x }),
      },
      y: {
        default: 40,
        parseHTML: (element) => parseFloat(element.getAttribute("data-y") || "40"),
        renderHTML: (attributes) => ({ "data-y": attributes.y }),
      },
      width: {
        default: 280,
        parseHTML: (element) => parseFloat(element.getAttribute("data-width") || "280"),
        renderHTML: (attributes) => ({ "data-width": attributes.width }),
      },
      height: {
        default: 200,
        parseHTML: (element) => parseFloat(element.getAttribute("data-height") || "200"),
        renderHTML: (attributes) => ({ "data-height": attributes.height }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "img[data-resizable-image]" }];
  },
  renderHTML({ HTMLAttributes }) {
    const style = `position:absolute;left:${HTMLAttributes["data-x"]}px;top:${HTMLAttributes["data-y"]}px;width:${HTMLAttributes["data-width"]}px;height:${HTMLAttributes["data-height"]}px;`;
    return ["img", { ...HTMLAttributes, "data-resizable-image": "", style }];
  },
  addCommands() {
    return {
      setResizableImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name, attrs: options });
        },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
