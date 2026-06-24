/**
 * Cloudflare Worker entry point for johnyos
 * Handles /api/auth/line-callback and serves static assets.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Route: LINE OAuth callback
    if (url.pathname === '/api/auth/line-callback') {
      return handleLineCallback(request, env);
    }

    // Everything else → serve static assets
    return env.ASSETS.fetch(request);
  },
};

async function handleLineCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const origin = url.origin;

  if (error || !code) {
    return redirect(origin, `auth_error=${encodeURIComponent(error || 'no_code')}`);
  }

  const supaUrl = env.SUPABASE_URL;
  const supaKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supaUrl || !supaKey || !env.LINE_CHANNEL_ID || !env.LINE_CHANNEL_SECRET) {
    return redirect(origin, 'auth_error=server_misconfigured');
  }

  const supaHeaders = {
    apikey: supaKey,
    Authorization: `Bearer ${supaKey}`,
    'Content-Type': 'application/json',
  };

  try {
    // 1. Exchange code for LINE access token
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${origin}/api/auth/line-callback`,
        client_id: env.LINE_CHANNEL_ID,
        client_secret: env.LINE_CHANNEL_SECRET,
      }).toString(),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('LINE token exchange failed');

    // 2. Get LINE user profile
    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();
    const { userId: lineUserId, displayName, pictureUrl } = profile;
    if (!lineUserId) throw new Error('No LINE user ID in profile');

    // 3. Look up user in line_users table
    const lookupRes = await fetch(
      `${supaUrl}/rest/v1/line_users?line_user_id=eq.${encodeURIComponent(lineUserId)}&select=user_id,plan`,
      { headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` } }
    );
    const lineUsers = await lookupRes.json();

    let userId;
    if (Array.isArray(lineUsers) && lineUsers.length > 0) {
      userId = lineUsers[0].user_id;
      // Refresh profile info
      await fetch(
        `${supaUrl}/rest/v1/line_users?line_user_id=eq.${encodeURIComponent(lineUserId)}`,
        {
          method: 'PATCH',
          headers: { ...supaHeaders, Prefer: 'return=minimal' },
          body: JSON.stringify({ display_name: displayName, picture_url: pictureUrl }),
        }
      );
    } else {
      // Auto-create Supabase auth user for first-time LINE Login
      const email = `line_${lineUserId}@johny.internal`;
      const createRes = await fetch(`${supaUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: supaHeaders,
        body: JSON.stringify({ email, email_confirm: true }),
      });
      const newUser = await createRes.json();
      if (!newUser.id) throw new Error('Failed to create Supabase user');
      userId = newUser.id;

      await fetch(`${supaUrl}/rest/v1/line_users`, {
        method: 'POST',
        headers: { ...supaHeaders, Prefer: 'return=minimal' },
        body: JSON.stringify({
          line_user_id: lineUserId,
          user_id: userId,
          display_name: displayName,
          picture_url: pictureUrl,
          plan: 'free',
        }),
      });
    }

    // 4. Fetch email for magic link
    const userRes = await fetch(`${supaUrl}/auth/v1/admin/users/${userId}`, {
      headers: supaHeaders,
    });
    const userData = await userRes.json();
    if (!userData.email) throw new Error('Could not fetch user email');

    // 5. Generate magic link → redirects browser into Supabase session
    const linkRes = await fetch(`${supaUrl}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: supaHeaders,
      body: JSON.stringify({
        type: 'magiclink',
        email: userData.email,
        options: { redirect_to: origin },
      }),
    });
    const linkData = await linkRes.json();
    if (!linkData.action_link) throw new Error('Failed to generate magic link');

    return Response.redirect(linkData.action_link, 302);
  } catch (err) {
    console.error('[line-callback]', err.message);
    return redirect(origin, `auth_error=${encodeURIComponent(err.message)}`);
  }
}

function redirect(origin, query) {
  return Response.redirect(`${origin}/?${query}`, 302);
}
