import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";

// Thin wrapper around the native <dialog> element — same built-in focus
// trap, ::backdrop, and Escape-to-close behavior as the legacy app's
// <dialog> modals, just exposed imperatively for React.
export const Modal = forwardRef(function Modal(
  { children, className, onClose, labelledBy },
  ref
) {
  const dialogRef = useRef(null);

  useImperativeHandle(ref, () => ({
    showModal: () => dialogRef.current?.showModal(),
    close: () => dialogRef.current?.close(),
  }));

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClose = () => onClose?.();
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      className={`w-full max-w-lg border border-hairline bg-paper p-0 text-ink ${className ?? ""}`}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      {children}
    </dialog>
  );
});
