/* ============================================================
   AUTH — Supabase authentication wrapper
   Exposes a global `Auth` object. Must load after Supabase CDN.
   ============================================================ */

const Auth = (() => {
  const SUPABASE_URL = 'https://amcutibopnfasxrfexdi.supabase.co';
  const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtY3V0aWJvcG5mYXN4cmZleGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNDM2OTMsImV4cCI6MjA5NzYxOTY5M30.Re8H1by-m7xjoP3skdAWI5th-DqzpF04SCuBnm-PFkc';

  // LINE Login channel ID (public — channel secret stays in Pages Function env vars)
  const LINE_CHANNEL_ID = '2010502491';
  const LINE_REDIRECT_URI = `${location.origin}/api/auth/line-callback`;

  const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let _user = null;
  let _lineInfo = null; // { lineUserId, plan, displayName, pictureUrl }

  return {
    db,

    async init() {
      const { data } = await db.auth.getSession();
      _user = data.session?.user ?? null;
      return _user;
    },

    isLoggedIn() {
      return !!_user;
    },

    getUser() {
      return _user;
    },

    /* ── LINE Login OAuth ───────────────────────────────────────────────────── */

    // Redirect the browser to LINE Login. After authorization, LINE redirects
    // to /api/auth/line-callback which creates a Supabase session and returns here.
    signInWithLine() {
      const state = crypto.randomUUID();
      sessionStorage.setItem('line_oauth_state', state);
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: LINE_CHANNEL_ID,
        redirect_uri: LINE_REDIRECT_URI,
        state,
        scope: 'profile openid',
      });
      location.href = `https://access.line.me/oauth2/v2.1/authorize?${params}`;
    },

    async signOut() {
      await db.auth.signOut();
      _user = null;
      _lineInfo = null;
    },

    /* ── Email + password auth ──────────────────────────────────────────────── */

    // Throws on failure. Returns the Supabase auth data on success.
    async signInWithPassword(email, password) {
      const { data, error } = await db.auth.signInWithPassword({ email, password });
      if (error) throw error;
      _user = data.user;
      return data;
    },

    // Throws on failure. `data.session` is null when the project requires
    // email confirmation — the caller should tell the user to check their inbox.
    async signUp(email, password) {
      const { data, error } = await db.auth.signUp({ email, password });
      if (error) throw error;
      _user = data.session ? data.user : null;
      return data;
    },

    onChange(callback) {
      db.auth.onAuthStateChange((event, session) => {
        _user = session?.user ?? null;
        if (!_user) _lineInfo = null;
        callback(event, _user);
      });
    },

    /* ── LINE info ──────────────────────────────────────────────────────────── */

    // Look up line_users table for the current logged-in user.
    // Returns { lineUserId, plan, displayName, pictureUrl } or null.
    async fetchLineInfo() {
      if (!_user) return null;
      try {
        const { data, error } = await db
          .from('line_users')
          .select('line_user_id, plan, display_name, picture_url')
          .eq('user_id', _user.id)
          .maybeSingle();
        if (error || !data) return null;
        _lineInfo = {
          lineUserId:  data.line_user_id,
          plan:        data.plan ?? 'free',
          displayName: data.display_name ?? null,
          pictureUrl:  data.picture_url ?? null,
        };
        return _lineInfo;
      } catch {
        return null;
      }
    },

    // Returns cached LINE info (call fetchLineInfo() first).
    getLineInfo() {
      return _lineInfo;
    },
  };
})();
