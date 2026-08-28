import { Wallet, FileText, ListChecks } from "lucide-react";

// The prefixes parseCommand() recognises. Picking a chip drops the command
// into the capture box and puts the caret after it, so the only thing left to
// do is type the actual content — no modal, no page change.
const ACTIONS = [
  { label: "งานใหม่", Icon: ListChecks, prefix: "เพิ่มงาน " },
  { label: "โน้ตใหม่", Icon: FileText, prefix: "โน้ต: " },
  { label: "รายจ่ายใหม่", Icon: Wallet, prefix: "จ่าย " },
];

export function QuickActions({ onPick }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {ACTIONS.map(({ label, Icon, prefix }) => (
        <button
          key={label}
          type="button"
          onClick={() => onPick(prefix)}
          className="inline-flex items-center gap-1.5 border border-hairline px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Icon size={13} aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
