import { Wallet, FileText, ListChecks } from "lucide-react";
import { COMMANDS } from "@/lib/commandParser";

const ICONS = { task: ListChecks, note: FileText, expense: Wallet };

// Picking a chip drops the command into the capture box and puts the caret
// after it, so the only thing left to do is type the actual content — no
// modal, no page change.
export function QuickActions({ onPick }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {COMMANDS.map(({ id, label, prefix }) => {
        const Icon = ICONS[id];
        return (
          <button
            key={id}
            type="button"
            onClick={() => onPick(prefix)}
            className="inline-flex items-center gap-1.5 border border-hairline px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-accent hover:text-accent"
          >
            <Icon size={13} aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
