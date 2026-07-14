"use client";

import { useEffect, useState } from "react";
import { parseCommand } from "@/lib/commandParser";
import { notifyTyping } from "@/lib/mascotStore";
import { Mascot } from "@/components/shared/Mascot";
import { Fab } from "@/components/shared/Fab";

const GREETING_MAP: [number, number, string][] = [
  [5, 11, "สวัสดีตอนเช้า"],
  [12, 17, "สวัสดีตอนบ่าย"],
  [18, 23, "สวัสดีตอนเย็น"],
  [0, 4, "ดึกแล้วนะ"],
];

function getGreeting(hour: number): string {
  const found = GREETING_MAP.find(([s, e]) => hour >= s && hour <= e);
  return (found ?? GREETING_MAP[0])[2];
}

export function TodayCommandCenter() {
  const [now, setNow] = useState<Date | null>(null);
  const [secValue, setSecValue] = useState("");
  const [secOutput, setSecOutput] = useState<string | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!secOutput) return;
    const t = setTimeout(() => setSecOutput(null), 4000);
    return () => clearTimeout(t);
  }, [secOutput]);

  function runCmd() {
    const raw = secValue.trim();
    if (!raw) return;
    setSecOutput(parseCommand(raw));
    setSecValue("");
  }

  const greeting = now ? getGreeting(now.getHours()) : "";
  const dateText = now
    ? new Intl.DateTimeFormat("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now)
    : "";
  const timeText = now ? new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(now) : "";

  return (
    <div className="border border-hairline bg-paper p-5 dark:border-white/10 dark:bg-dark-surface">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-grotesk text-2xl font-semibold text-ink dark:text-white/90">{greeting}</h2>
          <p className="mt-1 text-sm text-ink-muted">{dateText}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-serif text-3xl italic text-ink-faint tabular-nums">{timeText}</span>
          <div className="relative">
            <Mascot />
            <Fab />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <input
          value={secValue}
          onChange={(e) => {
            setSecValue(e.target.value);
            notifyTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") runCmd();
          }}
          placeholder='ลองพิมพ์ "เพิ่มงาน ส่งรายงาน" หรือ "จ่าย กาแฟ 60"'
          className="flex-1 border border-hairline bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink dark:border-white/15 dark:bg-dark-surface-soft dark:text-white/90"
        />
        <button
          type="button"
          onClick={runCmd}
          className="shrink-0 border border-ink px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper dark:border-white/30 dark:text-white/90"
        >
          Secretary
        </button>
      </div>
      {secOutput && <p className="mt-2 text-xs leading-relaxed text-ink-muted">{secOutput}</p>}
    </div>
  );
}
