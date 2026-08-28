import { useEffect, useRef, useState } from "react";
import { COMMANDS, parseCommand } from "@/lib/commandParser";
import { notifyTyping } from "@/lib/mascotStore";
import { Mascot } from "@/components/shared/Mascot";
import { QuickActions } from "@/components/shared/QuickActions";

const GREETING_MAP = [
  [5, 11, "สวัสดีตอนเช้า"],
  [12, 17, "สวัสดีตอนบ่าย"],
  [18, 23, "สวัสดีตอนเย็น"],
  [0, 4, "ดึกแล้วนะ"],
];

const DEFAULT_PLACEHOLDER = 'ลองพิมพ์ "เพิ่มงาน ส่งรายงาน" หรือ "จ่าย กาแฟ 60"';

function getGreeting(hour) {
  const found = GREETING_MAP.find(([s, e]) => hour >= s && hour <= e);
  return (found ?? GREETING_MAP[0])[2];
}

export function TodayCommandCenter() {
  const [now, setNow] = useState(null);
  const [secValue, setSecValue] = useState("");
  const [secOutput, setSecOutput] = useState(null);
  const inputRef = useRef(null);
  const [pendingCaret, setPendingCaret] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pendingCaret == null) return;
    const el = inputRef.current;
    el?.focus();
    el?.setSelectionRange(pendingCaret, pendingCaret);
    setPendingCaret(null);
  }, [pendingCaret]);

  useEffect(() => {
    if (!secOutput) return;
    const t = setTimeout(() => setSecOutput(null), 4000);
    return () => clearTimeout(t);
  }, [secOutput]);

  // Chip -> prefilled command. The caret has to move after React has written
  // the new value, so it runs in an effect rather than a requestAnimationFrame
  // callback — rAF is throttled to nothing in a background tab, which would
  // leave the box filled but unfocused.
  function applyPrefix(prefix) {
    setSecValue(prefix);
    setPendingCaret(prefix.length);
  }

  function runCmd() {
    const raw = secValue.trim();
    if (!raw) return;
    setSecOutput(parseCommand(raw));
    setSecValue("");
  }

  // Derived from the input rather than from the last chip clicked, so it also
  // reacts to a prefix typed by hand and resets when the box is cleared.
  const placeholder =
    COMMANDS.find((c) => c.test(secValue.trimStart()))?.hint ?? DEFAULT_PLACEHOLDER;

  const greeting = now ? getGreeting(now.getHours()) : "";
  const dateText = now
    ? new Intl.DateTimeFormat("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now)
    : "";
  const timeText = now ? new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(now) : "";

  return (
    <div className="border border-hairline bg-paper p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-grotesk text-2xl font-semibold text-ink">{greeting}</h2>
          <p className="mt-1 text-sm text-ink-muted">{dateText}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-serif text-3xl italic text-ink-faint tabular-nums">{timeText}</span>
          <Mascot />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <input
          ref={inputRef}
          value={secValue}
          onChange={(e) => {
            setSecValue(e.target.value);
            notifyTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") runCmd();
          }}
          placeholder={placeholder}
          className="flex-1 border border-hairline bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-hairline"
        />
        <button
          type="button"
          onClick={runCmd}
          className="shrink-0 border border-accent px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-accent hover:text-accent-fg"
        >
          ADD
        </button>
      </div>
      <QuickActions onPick={applyPrefix} />
      {secOutput && <p className="mt-2 text-xs leading-relaxed text-ink-muted">{secOutput}</p>}
    </div>
  );
}
