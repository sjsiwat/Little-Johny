/* ============================================================
   JOHNY BUDDY — interactive dashboard mascot
   ------------------------------------------------------------
   Lives inline in the Dashboard greeting row (.tc-mascot) — not
   fixed to the viewport, so it scrolls away with the page like
   any other content and only shows on the Dashboard view.
   Reacts to app events + time of day. Uses PNG pose frames from
   ./mascot/ and gracefully falls back to ./johny-cat.svg for any
   pose that isn't exported yet.

   Public API (also usable from app.js as window.Johny):
     Johny.mood(state, message?, holdMs?)   // force a pose
     Johny.celebrate(message?)              // task-done bounce 🎉
     Johny.say(message, holdMs?)            // speech bubble only
     Johny.wake()                           // reset idle timer

   Or fire a CustomEvent from anywhere:
     window.dispatchEvent(new CustomEvent('johny:mood',
       { detail: { state:'happy', message:'เยี่ยม!', hold:2600 } }))
   ============================================================ */
(function () {
  "use strict";

  const BASE = "./mascot/";
  const FALLBACK = "./johny-cat.svg";

  /* Pose frames — export these PNGs into ./mascot/ to upgrade.
     Any missing file automatically falls back to johny-cat.svg. */
  const POSES = {
    idle:     BASE + "idle.png",
    wave:     BASE + "wave.png",
    happy:    BASE + "happy.png",
    typing:   BASE + "typing.png",
    thinking: BASE + "thinking.png",
    sleeping: BASE + "sleeping.png",
  };

  /* Resolved src per pose (fallback applied once we know load status). */
  const resolved = {};
  Object.keys(POSES).forEach((k) => (resolved[k] = POSES[k]));

  const IDLE_MS = 45000;          // no activity → doze off
  const DEFAULT_HOLD = 2600;      // how long an event pose sticks

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ── Contextual copy (Thai-first, matches app voice) ── */
  const LINES = {
    morningGreet:  "อรุณสวัสดิ์! วันนี้มีอะไรให้ช่วยไหม ☀️",
    afternoonGreet:"บ่ายแล้ว อย่าลืมพักดื่มน้ำนะ 💧",
    eveningGreet:  "เย็นแล้ว วันนี้เก่งมากเลย 🌆",
    nightGreet:    "ดึกแล้วนะ พักผ่อนบ้างก็ได้ 🌙",
    sleep:         "Zzz... เรียกได้เลยนะ 😴",
  };

  /* ── Time-of-day ambient mood ── */
  function ambient() {
    const h = new Date().getHours();
    if (h >= 5 && h <= 10)  return { state: "wave", line: LINES.morningGreet };
    if (h >= 11 && h <= 16) return { state: "idle", line: LINES.afternoonGreet };
    if (h >= 17 && h <= 21) return { state: "idle", line: LINES.eveningGreet };
    return { state: "sleeping", line: LINES.nightGreet };
  }

  /* ── Build the buddy DOM — appended into .tc-mascot (dashboard greeting) ── */
  const root = document.createElement("div");
  root.className = "johny-buddy";
  root.setAttribute("data-state", "idle");
  root.hidden = true;
  root.innerHTML = `
    <div class="johny-buddy-bubble" role="status" aria-live="polite" hidden></div>
    <button class="johny-buddy-body" type="button" aria-label="Quick actions — เปิดเมนูเพิ่มงาน/โน้ต/รายจ่าย" aria-haspopup="menu" aria-controls="fabMenu" aria-expanded="false">
      <img class="johny-buddy-img" alt="" src="${resolved.idle}" />
      <span class="johny-buddy-zzz" aria-hidden="true">z</span>
    </button>
  `;
  const imgEl    = root.querySelector(".johny-buddy-img");
  const bubbleEl = root.querySelector(".johny-buddy-bubble");
  const bodyEl   = root.querySelector(".johny-buddy-body");

  /* ── Image fallback: if a pose PNG 404s, use the SVG ── */
  Object.keys(POSES).forEach((key) => {
    const probe = new Image();
    probe.onerror = () => { resolved[key] = FALLBACK; };
    probe.src = POSES[key];
  });

  /* ── State machine ── */
  let current = "idle";
  let holdTimer = null;
  let bubbleTimer = null;
  let idleTimer = null;

  function applyPose(state) {
    const src = resolved[state] || resolved.idle || FALLBACK;
    if (imgEl.getAttribute("src") !== src) {
      imgEl.setAttribute("src", src);
    }
    root.setAttribute("data-state", state);
  }

  function setState(state, { message, hold } = {}) {
    if (!POSES[state]) state = "idle";
    current = state;
    applyPose(state);
    if (message) say(message, hold);
    clearTimeout(holdTimer);
    // Event poses auto-return to the ambient mood after they settle.
    const transient = state !== "idle" && state !== "sleeping";
    if (transient) {
      holdTimer = setTimeout(() => settle(), hold || DEFAULT_HOLD);
    }
  }

  // Return to whatever the time of day suggests (unless dozing).
  function settle() {
    const a = ambient();
    current = a.state;
    applyPose(a.state);
  }

  /* ── Speech bubble ── */
  function say(message, hold) {
    if (!message) return;
    bubbleEl.textContent = message;
    bubbleEl.hidden = false;
    // reflow for enter animation
    bubbleEl.classList.remove("is-in");
    void bubbleEl.offsetWidth;
    bubbleEl.classList.add("is-in");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => {
      bubbleEl.classList.remove("is-in");
      bubbleTimer = setTimeout(() => { bubbleEl.hidden = true; }, 220);
    }, hold || 3600);
  }

  /* ── Idle → sleep ── */
  function resetIdle() {
    clearTimeout(idleTimer);
    if (current === "sleeping" && ambient().state !== "sleeping") {
      settle(); // woke up during the day
    }
    idleTimer = setTimeout(() => {
      setState("sleeping", { message: LINES.sleep, hold: 4000 });
    }, IDLE_MS);
  }

  /* ── Public API ── */
  const Johny = {
    mood(state, message, holdMs) { resetIdle(); setState(state, { message, hold: holdMs }); },
    celebrate(message) {
      resetIdle();
      setState("happy", { message: message || "เยี่ยมไปเลย! เสร็จอีกงานแล้ว 🎉", hold: 2800 });
    },
    say(message, holdMs) { resetIdle(); say(message, holdMs); },
    wake() { resetIdle(); },
  };
  window.Johny = Johny;

  window.addEventListener("johny:mood", (e) => {
    const d = e.detail || {};
    Johny.mood(d.state || "idle", d.message, d.hold);
  });

  /* ── Self-wired reactions (no app.js coupling needed) ── */

  // Command bar typing → typing pose (silent; no bubble spam).
  let typingCooldown = null;
  function onType() {
    resetIdle();
    if (current !== "typing") setState("typing", { hold: 2200 });
    clearTimeout(typingCooldown);
    typingCooldown = setTimeout(() => { if (current === "typing") settle(); }, 1800);
  }
  document.addEventListener("input", (e) => {
    if (e.target && e.target.id === "secInput") onType();
  });

  // Sync/save status → pose only (fires on every autosave — keep it quiet).
  const syncLabel = document.getElementById("syncLabel");
  if (syncLabel) {
    let lastSync = "";
    new MutationObserver(() => {
      const txt = (syncLabel.textContent || "").trim();
      if (txt === lastSync) return;
      lastSync = txt;
      if (/กำลัง|รอบันทึก/.test(txt)) {
        setState("thinking", { hold: 2600 });      // saving… (no bubble)
      } else if (/✓/.test(txt) && current === "thinking") {
        setState("happy", { hold: 1200 });         // saved — brief nod, no bubble
      }
    }).observe(syncLabel, { childList: true, characterData: true, subtree: true });
  }

  // Any activity wakes the buddy.
  ["mousemove", "keydown", "click", "touchstart"].forEach((ev) =>
    window.addEventListener(ev, () => resetIdle(), { passive: true })
  );

  // Click the buddy → open the quick-action menu (fab.js listens).
  // Brief wave pose so the mascot reacts, then hands off to the menu.
  bodyEl.addEventListener("click", (e) => {
    e.stopPropagation();
    resetIdle();
    setState("wave", { hold: 900 });
    window.dispatchEvent(new CustomEvent("johny:fab-toggle"));
  });

  /* ── Visibility: only on the Dashboard view, and only inside the app
     shell (guest or signed in). No drag, no dismiss — it lives fixed
     in the greeting row and scrolls away with the page like any other
     dashboard content. ── */
  function isDashboardActive() {
    const dash = document.getElementById("dashboard");
    return !!dash && dash.classList.contains("active");
  }

  function refreshVisibility() {
    const shell = document.querySelector(".app-shell");
    const inApp = shell && getComputedStyle(shell).display !== "none";
    const show = !!inApp && isDashboardActive();
    root.hidden = !show;
    if (show && !root.dataset.greeted) {
      root.dataset.greeted = "1";
      const a = ambient();
      setState(a.state, { message: a.line, hold: 4200 });
      resetIdle();
    }
  }

  function boot() {
    const slot = document.querySelector(".tc-mascot");
    (slot || document.body).appendChild(root);
    if (prefersReduced) root.classList.add("is-reduced");
    // Reparent the quick-action menu inside the buddy so it anchors
    // directly above it (CSS: .fab-menu { bottom: 100% }).
    const menu = document.getElementById("fabMenu");
    if (menu && menu.parentElement !== root) {
      root.appendChild(menu);
    }
    // Watch the app shell appearing/disappearing (login / logout) and the
    // Dashboard view's active class (nav switching) — either can change
    // whether the mascot should be visible.
    const shell = document.querySelector(".app-shell");
    if (shell) {
      new MutationObserver(refreshVisibility).observe(shell, {
        attributes: true, attributeFilter: ["style", "class"],
      });
    }
    const dash = document.getElementById("dashboard");
    if (dash) {
      new MutationObserver(refreshVisibility).observe(dash, {
        attributes: true, attributeFilter: ["class"],
      });
    }
    refreshVisibility();
    // Re-evaluate ambient every 10 min so the mood tracks the clock.
    setInterval(() => { if (!holdTimer && current !== "sleeping") settle(); }, 600000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
