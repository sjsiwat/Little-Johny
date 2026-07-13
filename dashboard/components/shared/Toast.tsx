"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { useToastStore } from "@/lib/toastStore";

const META = {
  success: { label: "SUCCESS", Icon: CheckCircle2, color: "text-accent" },
  error: { label: "ERROR", Icon: XCircle, color: "text-danger" },
  warning: { label: "WARNING", Icon: AlertTriangle, color: "text-amber" },
  info: { label: "INFO", Icon: Info, color: "text-ink-muted" },
} as const;

export function Toast() {
  const toast = useToastStore((s) => s.toast);
  const dismissToast = useToastStore((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismissToast, 4000);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);

  if (!toast) return null;
  const { label, Icon, color } = META[toast.type];

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-[1000] w-80 border border-ink bg-paper p-4 dark:border-white/20 dark:bg-dark-surface"
    >
      <div className="flex items-start gap-3">
        <Icon size={16} className={`mt-0.5 shrink-0 ${color}`} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-faint">{label}</p>
          <p className="mt-1 text-sm text-ink dark:text-white/90">{toast.title}</p>
          {toast.description && (
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">{toast.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={dismissToast}
          aria-label="ปิดการแจ้งเตือน"
          className="shrink-0 text-ink-faint hover:text-ink"
        >
          <X size={14} aria-hidden />
        </button>
      </div>
    </div>
  );
}
