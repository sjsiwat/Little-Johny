import { db, LINE_CHANNEL_ID } from "@/lib/supabaseClient";
import type { LineUserInfo } from "@/types";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

let _user: User | null = null;
let _lineInfo: LineUserInfo | null = null;

export const Auth = {
  db,

  async init(): Promise<User | null> {
    const { data } = await db.auth.getSession();
    _user = data.session?.user ?? null;
    return _user;
  },

  isLoggedIn(): boolean {
    return !!_user;
  },

  getUser(): User | null {
    return _user;
  },

  /* ── LINE Login OAuth ── */
  // Redirect the browser to LINE Login. After authorization, LINE redirects
  // to /api/auth/line-callback (the Cloudflare Worker) which creates a
  // Supabase session and returns here.
  signInWithLine() {
    const state = crypto.randomUUID();
    sessionStorage.setItem("line_oauth_state", state);
    const redirectUri = `${location.origin}/api/auth/line-callback`;
    const params = new URLSearchParams({
      response_type: "code",
      client_id: LINE_CHANNEL_ID,
      redirect_uri: redirectUri,
      state,
      scope: "profile openid",
    });
    location.href = `https://access.line.me/oauth2/v2.1/authorize?${params}`;
  },

  async signOut() {
    await db.auth.signOut();
    _user = null;
    _lineInfo = null;
  },

  /* ── Email + password auth ── */
  async signInWithPassword(email: string, password: string) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    _user = data.user;
    return data;
  },

  // `data.session` is null when the project requires email confirmation —
  // the caller should tell the user to check their inbox.
  async signUp(email: string, password: string) {
    const { data, error } = await db.auth.signUp({ email, password });
    if (error) throw error;
    _user = data.session ? data.user : null;
    return data;
  },

  onChange(callback: (event: AuthChangeEvent, user: User | null) => void) {
    return db.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      _user = session?.user ?? null;
      if (!_user) _lineInfo = null;
      callback(event, _user);
    });
  },

  /* ── LINE info ── */
  async fetchLineInfo(): Promise<LineUserInfo | null> {
    if (!_user) return null;
    try {
      const { data, error } = await db
        .from("line_users")
        .select("line_user_id, plan, display_name, picture_url")
        .eq("user_id", _user.id)
        .maybeSingle();
      if (error || !data) return null;
      _lineInfo = {
        line_user_id: data.line_user_id,
        plan: data.plan ?? "free",
        display_name: data.display_name ?? null,
        picture_url: data.picture_url ?? null,
      };
      return _lineInfo;
    } catch {
      return null;
    }
  },

  getLineInfo(): LineUserInfo | null {
    return _lineInfo;
  },
};
