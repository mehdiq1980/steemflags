const USERNAME_RE = /^[a-z0-9.-]{3,32}$/;
const MAX_LIMIT = 100;
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } });
}

function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase();
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
    const url = new URL(request.url);
    if (!env.DB) return json({ error: 'D1 database is not configured' }, 503);

    try {
      if (url.pathname === '/api/leaderboard' && request.method === 'GET') {
        const raw = Number(url.searchParams.get('limit') || 100);
        const limit = Math.min(Math.max(Number.isInteger(raw) ? raw : 100, 1), MAX_LIMIT);
        const username = normalizeUsername(url.searchParams.get('username'));
        const rows = await env.DB.prepare(
          'SELECT username, sf, avatar FROM leaderboard ORDER BY sf DESC, updated_at ASC, username ASC LIMIT ?'
        ).bind(limit).all();
        let me = null;
        if (USERNAME_RE.test(username)) {
          me = await env.DB.prepare('SELECT username, sf, avatar, (SELECT COUNT(*) + 1 FROM leaderboard b WHERE b.sf > a.sf) AS rank FROM leaderboard a WHERE a.username = ?').bind(username).first();
        }
        return json({ leaderboard: rows.results || [], me });
      }

      if (url.pathname === '/api/leaderboard' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const username = normalizeUsername(body.username);
        const sf = Number(body.sf);
        const avatar = String(body.avatar || '').trim().slice(0, 2048);
        if (!USERNAME_RE.test(username) || !Number.isSafeInteger(sf) || sf < 0 || sf > 1000000000) return json({ error: 'Invalid username or SF' }, 400);
        await env.DB.prepare(
          'INSERT INTO leaderboard (username, sf, avatar, updated_at) VALUES (?, ?, ?, unixepoch()) ON CONFLICT(username) DO UPDATE SET sf = excluded.sf, avatar = CASE WHEN excluded.avatar <> \'\' THEN excluded.avatar ELSE leaderboard.avatar END, updated_at = unixepoch()'
        ).bind(username, sf, avatar).run();
        return json({ ok: true });
      }

      if (url.pathname === '/health') return json({ ok: true });
      return json({ error: 'Not found' }, 404);
    } catch (error) {
      console.error(error);
      return json({ error: 'Leaderboard unavailable' }, 503);
    }
  }
};
