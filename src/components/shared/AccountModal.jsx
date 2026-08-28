import { forwardRef } from "react";
import { X } from "lucide-react";
import { Modal, } from "@/components/shared/Modal";

export const AccountModal = forwardRef(function AccountModal({ auth }, ref) {
  const displayName = auth.lineInfo?.display_name || auth.user?.email || "";
  const plan = auth.lineInfo?.plan ?? "free";

  return (
    <Modal ref={ref} labelledBy="account-modal-title">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <p id="account-modal-title" className="font-grotesk text-lg font-semibold text-ink">
            เชื่อมต่อแล้ว
          </p>
          <button
            type="button"
            onClick={() => (ref ).current?.close()}
            aria-label="ปิด"
            className="text-ink-faint hover:text-ink"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
        <p className="mt-4 text-sm text-ink">{displayName}</p>
        <span className="mt-2 inline-block border border-hairline px-2 py-0.5 text-xs uppercase tracking-[0.1em] text-ink-muted">
          {plan === "pro" ? "Pro" : "Free"}
        </span>
        <button
          type="button"
          onClick={() => {
            (ref ).current?.close();
            auth.signOut();
          }}
          className="mt-6 w-full border border-accent px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-accent hover:text-accent-fg"
        >
          ออกจากระบบ
        </button>
      </div>
    </Modal>
  );
});
