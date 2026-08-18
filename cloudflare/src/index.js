const USERNAME_RE = /^[a-z0-9.-]{3,32}$/;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders
    }
  });
}

function getUsername(value) {
  const username = String(value || '').trim().toLowerCase();
  return USERNAME_RE.test(username) ? username : null;
}

function getLimit(value) {
  const n = Number(value);
  return Number.isInteger(n) ? Math.min(Math.max(n, 1), MAX_LIMIT) : DEFAULT_LIMIT;
}

async function leaderboard(request, env) {
  const url = new URL(request.url);
  const limit = getLimit(url.searchParams.get('limit'));
  const username = getUsername(url.searchParams.get('username'));

  const rows = await env.DB.prepare(`
    SELECT username, total_points AS points, sf
    FROM players
    ORDER BY total_points DESC, updated_at ASC, username ASC
    LIMIT ?
  `).bind(limit).all();

  let me = null;
  if (username) {
    me = await env.DB.prepare(`
      SELECT username, total_points AS points, sf,
        (SELECT COUNT(*) + 1 FROM players p2 WHERE p2.total_points > p1.total_points) AS rank
      FROM players p1
      WHERE username = ?
    `).bind(username).first();
  }

  return json({
    leaderboard: rows.results || [],
    me: me || null
  });
}

async function handle(request, env) {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (url.pathname === '/health' && request.method === 'GET') {
    try {
      await env.DB.prepare('SELECT 1').first();
      return json({ ok: true, service: 'steem-flags-api', database: 'd1' });
    } catch (error) {
      console.error(error);
      return json({ ok: false, service: 'steem-flags-api', database: 'unavailable' }, 503);
    }
  }

  if (url.pathname === '/api/leaderboard' && request.method === 'GET') {
    try {
      return await leaderboard(request, env);
    } catch (error) {
      console.error(error);
      return json({ error: 'Leaderboard unavailable' }, 503);
    }
  }

  if (url.pathname === '/api/leaderboard/me' && request.method === 'GET') {
    const username = getUsername(url.searchParams.get('username'));
    if (!username) return json({ error: 'Valid username is required' }, 400);
    try {
      const me = await env.DB.prepare(`
        SELECT username, total_points AS points, sf,
          (SELECT COUNT(*) + 1 FROM players p2 WHERE p2.total_points > p1.total_points) AS rank
        FROM players p1
        WHERE username = ?
      `).bind(username).first();
      return json({ me: me || null });
    } catch (error) {
      console.error(error);
      return json({ error: 'Leaderboard unavailable' }, 503);
    }
  }

  return json({ error: 'Not found' }, 404);
}

export default {
  fetch(request, env, ctx) {
    return handle(request, env, ctx);
  }
};
