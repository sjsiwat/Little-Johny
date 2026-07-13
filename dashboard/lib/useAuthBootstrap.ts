"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Auth } from "@/lib/auth";
import { Storage } from "@/lib/storage";
import { defaultAppState, useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toastStore";
import { normalizeStatus } from "@/lib/constants";
import type { AppState, LineUserInfo } from "@/types";

// Guard against onSignedIn firing twice for the same user — Auth.init()'s
// synchronous session check and the async SIGNED_IN event can both fire for
// the same login. Module-level (not a ref) so it survives even a
// dev-StrictMode remount, matching the robustness of the legacy app.js guard.
let syncedUserId: string | null = null;

function withTaskDefaults(state: AppState): AppState {
  return {
    ...state,
    tasks: (state.tasks || []).map((t) => ({
      ...t,
      description: t.description ?? "",
      labels: t.labels ?? [],
      target_value: t.target_value ?? null,
      target_unit: t.target_unit ?? "",
      progress_value: t.progress_value ?? 0,
      status: normalizeStatus(t.status),
    })),
    notes: state.notes || [],
    expenses: state.expenses || [],
  };
}

export interface AuthBootstrap {
  authReady: boolean;
  authed: boolean;
  user: User | null;
  lineInfo: LineUserInfo | null;
  gateError: string | null;
  clearGateError: () => void;
  signInWithLine: () => void;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialGateTab: "login" | "signup";
}

export function useAuthBootstrap(): AuthBootstrap {
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [lineInfo, setLineInfo] = useState<LineUserInfo | null>(null);
  const [gateError, setGateError] = useState<string | null>(null);
  const [initialGateTab, setInitialGateTab] = useState<"login" | "signup">("login");

  const authedRef = useRef(authed);
  const uidRef = useRef<string | null>(null);
  authedRef.current = authed;

  const showToast = useToastStore((s) => s.showToast);
  const setSyncStatus = useStore((s) => s.setSyncStatus);
  const setAll = useStore((s) => s.setAll);
  const setHydrated = useStore((s) => s.setHydrated);

  function clearToLoggedOut() {
    Storage.setAuthHint(false);
    Storage.clearLocal();
    uidRef.current = null;
    const theme = useStore.getState().theme || "light";
    setAll({ ...defaultAppState, theme });
    setAuthed(false);
    setUser(null);
    setLineInfo(null);
  }

  async function onSignedIn(signedInUser: User) {
    if (syncedUserId === signedInUser.id) return;
    syncedUserId = signedInUser.id;
    uidRef.current = signedInUser.id;
    Storage.setAuthHint(true);

    setAuthed(true);
    setUser(signedInUser);

    const info = await Auth.fetchLineInfo();
    setLineInfo(info);

    setSyncStatus("loading");
    const cloud = await Storage.loadCloud(signedInUser.id);

    if (cloud) {
      const current = useStore.getState();
      const merge = <T extends { id: string }>(localArr: T[], cloudArr: T[]) => {
        const cloudIds = new Set(cloudArr.map((i) => i.id));
        const localOnly = localArr.filter((i) => !cloudIds.has(i.id));
        return [...cloudArr, ...localOnly];
      };
      const merged: AppState = {
        theme: current.theme,
        logs: current.logs,
        tasks: merge(current.tasks, cloud.tasks),
        notes: merge(current.notes, cloud.notes),
        expenses: merge(current.expenses, cloud.expenses),
      };
      setAll(merged);
      showToast(
        merged.tasks.length > 0 ? `โหลดข้อมูลจาก cloud (${merged.tasks.length} งาน)` : "เชื่อมต่อแล้ว ✓",
        "success"
      );
    }
    // loadCloud failure is non-critical — local data still intact, next save will retry
    setSyncStatus("idle");
  }

  useEffect(() => {
    // ── Query-param handling: ?auth_error= (from LINE callback) and
    // ?auth=signup (from site/'s Sign Up CTA) ──
    const params = new URLSearchParams(location.search);
    const authErr = params.get("auth_error");
    if (authErr) {
      history.replaceState(null, "", location.pathname + location.hash);
      showToast(`เข้าสู่ระบบไม่สำเร็จ: ${authErr}`, "error");
    }
    if (params.get("auth") === "signup") {
      history.replaceState(null, "", location.pathname + location.hash);
      setInitialGateTab("signup");
    }

    // ── Synchronous local hydration, gated on the auth hint ──
    const usedCachedLocal = Storage.hasAuthHint();
    const initial = withTaskDefaults(
      usedCachedLocal ? Storage.loadLocal(defaultAppState) : defaultAppState
    );
    setAll(initial);
    setHydrated(true);

    // ── Async session check ──
    (async () => {
      const sessionUser = await Auth.init();
      setUser(sessionUser);
      if (sessionUser) {
        await onSignedIn(sessionUser);
      } else {
        if (usedCachedLocal) clearToLoggedOut();
        setAuthed(false);
      }
      setAuthReady(true);
    })();

    const { data: sub } = Auth.onChange((event, changedUser) => {
      setUser(changedUser);
      if (event === "SIGNED_IN" && changedUser) onSignedIn(changedUser);
      if (event === "SIGNED_OUT") {
        syncedUserId = null;
        clearToLoggedOut();
        showToast("ออกจากระบบแล้ว");
      }
    });

    Storage.onSyncChange((status, message) => {
      setSyncStatus(status, message);
      if (status === "synced") {
        setTimeout(() => {
          if (useStore.getState().syncStatus === "synced") setSyncStatus("idle");
        }, 3000);
      }
      if (status === "error") {
        showToast(
          message ? `sync error: ${message}` : "บันทึกไม่สำเร็จ — เปิด Console (F12) ดู [storage] error",
          "error"
        );
      }
    });
    const handleOnline = () => setSyncStatus("idle");
    const handleOffline = () => setSyncStatus("offline");
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      sub.subscription.unsubscribe();
      Storage.onSyncChange(null);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persistence subscription: whenever tasks/notes/expenses/theme change
  // (after hydration), save locally + debounce a cloud push — mirrors the
  // legacy app's saveState() call at the end of every render*() function. ──
  useEffect(() => {
    let prev = useStore.getState();
    const unsubscribe = useStore.subscribe((state) => {
      if (!state.hydrated) return;
      const changed =
        state.tasks !== prev.tasks ||
        state.notes !== prev.notes ||
        state.expenses !== prev.expenses ||
        state.theme !== prev.theme;
      prev = state;
      if (!changed) return;
      Storage.save(
        { theme: state.theme, tasks: state.tasks, notes: state.notes, expenses: state.expenses, logs: state.logs },
        authedRef.current,
        uidRef.current
      );
    });
    return unsubscribe;
  }, []);

  return {
    authReady,
    authed,
    user,
    lineInfo,
    gateError,
    clearGateError: () => setGateError(null),
    signInWithLine: () => Auth.signInWithLine(),
    async signInWithPassword(email, password) {
      setGateError(null);
      try {
        await Auth.signInWithPassword(email, password);
        // onSignedIn() runs via the SIGNED_IN event from Auth.onChange() above.
      } catch (err) {
        setGateError((err as Error).message || "เข้าสู่ระบบไม่สำเร็จ");
        throw err;
      }
    },
    async signUp(email, password) {
      setGateError(null);
      try {
        const data = await Auth.signUp(email, password);
        if (!data.session) {
          showToast("สมัครสมาชิกสำเร็จ — โปรดยืนยันอีเมลก่อนเข้าสู่ระบบ", "success");
        }
        // If email confirmation is disabled, Auth.signUp() already started a
        // session and the SIGNED_IN event from Auth.onChange() above takes over.
      } catch (err) {
        setGateError((err as Error).message || "สมัครสมาชิกไม่สำเร็จ");
        throw err;
      }
    },
    async signOut() {
      await Auth.signOut();
      // UI reset happens reactively via the SIGNED_OUT event above.
    },
    initialGateTab,
  };
}
