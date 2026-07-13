"use client";

import { forwardRef } from "react";
import { X } from "lucide-react";
import { Modal, type ModalHandle } from "@/components/shared/Modal";
import type { AuthBootstrap } from "@/lib/useAuthBootstrap";

interface AccountModalProps {
  auth: AuthBootstrap;
}

export const AccountModal = forwardRef<ModalHandle, AccountModalProps>(function AccountModal({ auth }, ref) {
  const displayName = auth.lineInfo?.display_name || auth.user?.email || "";
  const plan = auth.lineInfo?.plan ?? "free";

  return (
    <Modal ref={ref} labelledBy="account-modal-title">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <p id="account-modal-title" className="font-grotesk text-lg font-semibold text-ink dark:text-white/90">
            เชื่อมต่อแล้ว
          </p>
          <button
            type="button"
            onClick={() => (ref as React.RefObject<ModalHandle>).current?.close()}
            aria-label="ปิด"
            className="text-ink-faint hover:text-ink"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
        <p className="mt-4 text-sm text-ink dark:text-white/90">{displayName}</p>
        <span className="mt-2 inline-block border border-hairline px-2 py-0.5 text-xs uppercase tracking-[0.1em] text-ink-muted">
          {plan === "pro" ? "Pro" : "Free"}
        </span>
        <button
          type="button"
          onClick={() => {
            (ref as React.RefObject<ModalHandle>).current?.close();
            auth.signOut();
          }}
          className="mt-6 w-full border border-ink px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper dark:border-white/30 dark:text-white/90"
        >
          ออกจากระบบ
        </button>
      </div>
    </Modal>
  );
});
