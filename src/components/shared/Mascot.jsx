import { useEffect } from "react";
import { useStore } from "@/lib/store";
import {
  useMascotStore,
  resetIdle,
  greetOnce,
  notifySyncStatus,
  ambientReevaluate,
} from "@/lib/mascotStore";

const POSE_SRC = {
  idle: "/mascot/idle.png",
  wave: "/mascot/wave.png",
  happy: "/mascot/happy.png",
  typing: "/mascot/typing.png",
  thinking: "/mascot/thinking.png",
  sleeping: "/mascot/sleeping.png",
};

// Lives inline in the Dashboard greeting row — only ever rendered on the
// Dashboard page. Purely decorative: it reacts to time of day, typing and
// sync status, but is not interactive. The quick actions it used to open now
// sit under the capture input as QuickActions.
export function Mascot() {
  const pose = useMascotStore((s) => s.pose);
  const bubble = useMascotStore((s) => s.bubble);
  const syncStatus = useStore((s) => s.syncStatus);
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    greetOnce();
    const interval = setInterval(ambientReevaluate, 600000);
    const activity = () => resetIdle();
    ["mousemove", "keydown", "click", "touchstart"].forEach((ev) =>
      window.addEventListener(ev, activity, { passive: true })
    );
    return () => {
      clearInterval(interval);
      ["mousemove", "keydown", "click", "touchstart"].forEach((ev) => window.removeEventListener(ev, activity));
    };
  }, []);

  useEffect(() => {
    notifySyncStatus(syncStatus);
  }, [syncStatus]);

  return (
    <div className="relative flex flex-col items-center">
      {bubble && (
        <div
          role="status"
          aria-live="polite"
          className="absolute bottom-full mb-2 max-w-[200px] border border-hairline bg-paper px-3 py-2 text-xs text-ink shadow-none"
        >
          {bubble}
        </div>
      )}
      <div
        aria-hidden
        className={`relative h-14 w-14 ${reducedMotion ? "" : "transition-transform duration-300"}`}
      >
        <img src={POSE_SRC[pose] || POSE_SRC.idle} alt="" width={56} height={56} className="pointer-events-none" />
        {pose === "sleeping" && (
          <span className="absolute -right-1 -top-1 font-serif text-sm italic text-ink-faint" aria-hidden>
            z
          </span>
        )}
      </div>
    </div>
  );
}
