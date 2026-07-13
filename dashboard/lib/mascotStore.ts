import { create } from "zustand";

export type MascotPose = "idle" | "wave" | "happy" | "typing" | "thinking" | "sleeping";

interface MascotState {
  pose: MascotPose;
  bubble: string | null;
}

const LINES = {
  morningGreet: "อรุณสวัสดิ์! วันนี้มีอะไรให้ช่วยไหม ☀️",
  afternoonGreet: "บ่ายแล้ว อย่าลืมพักดื่มน้ำนะ 💧",
  eveningGreet: "เย็นแล้ว วันนี้เก่งมากเลย 🌆",
  nightGreet: "ดึกแล้วนะ พักผ่อนบ้างก็ได้ 🌙",
  sleep: "Zzz... เรียกได้เลยนะ 😴",
};

const IDLE_MS = 45000;
const DEFAULT_HOLD = 2600;

function ambient(): { state: MascotPose; line: string } {
  const h = new Date().getHours();
  if (h >= 5 && h <= 10) return { state: "wave", line: LINES.morningGreet };
  if (h >= 11 && h <= 16) return { state: "idle", line: LINES.afternoonGreet };
  if (h >= 17 && h <= 21) return { state: "idle", line: LINES.eveningGreet };
  return { state: "sleeping", line: LINES.nightGreet };
}

export const useMascotStore = create<MascotState>(() => ({
  pose: "idle",
  bubble: null,
}));

let holdTimer: ReturnType<typeof setTimeout> | null = null;
let bubbleTimer: ReturnType<typeof setTimeout> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let typingCooldown: ReturnType<typeof setTimeout> | null = null;
let greeted = false;

function say(message: string | undefined, hold?: number) {
  if (!message) return;
  useMascotStore.setState({ bubble: message });
  if (bubbleTimer) clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => useMascotStore.setState({ bubble: null }), hold || 3600);
}

function setPose(pose: MascotPose, opts: { message?: string; hold?: number } = {}) {
  useMascotStore.setState({ pose });
  if (opts.message) say(opts.message, opts.hold);
  if (holdTimer) clearTimeout(holdTimer);
  const transient = pose !== "idle" && pose !== "sleeping";
  if (transient) {
    holdTimer = setTimeout(() => settle(), opts.hold || DEFAULT_HOLD);
  }
}

function settle() {
  const a = ambient();
  useMascotStore.setState({ pose: a.state });
}

export function resetIdle() {
  if (idleTimer) clearTimeout(idleTimer);
  if (useMascotStore.getState().pose === "sleeping" && ambient().state !== "sleeping") {
    settle();
  }
  idleTimer = setTimeout(() => {
    setPose("sleeping", { message: LINES.sleep, hold: 4000 });
  }, IDLE_MS);
}

export function greetOnce() {
  if (greeted) return;
  greeted = true;
  const a = ambient();
  setPose(a.state, { message: a.line, hold: 4200 });
  resetIdle();
}

export function notifyTyping() {
  resetIdle();
  if (useMascotStore.getState().pose !== "typing") setPose("typing", { hold: 2200 });
  if (typingCooldown) clearTimeout(typingCooldown);
  typingCooldown = setTimeout(() => {
    if (useMascotStore.getState().pose === "typing") settle();
  }, 1800);
}

export function notifySyncStatus(status: string) {
  if (status === "loading" || status === "pending" || status === "syncing") {
    setPose("thinking", { hold: 2600 });
  } else if (status === "synced" && useMascotStore.getState().pose === "thinking") {
    setPose("happy", { hold: 1200 });
  }
}

export function celebrate(message?: string) {
  resetIdle();
  setPose("happy", { message: message || "เยี่ยมไปเลย! เสร็จอีกงานแล้ว 🎉", hold: 2800 });
}

export function mascotClicked(onToggleFab: () => void) {
  resetIdle();
  setPose("wave", { hold: 900 });
  onToggleFab();
}

export function ambientReevaluate() {
  if (!holdTimer && useMascotStore.getState().pose !== "sleeping") settle();
}
