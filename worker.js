const REPO = 'mehdiq1980/steemflags';
const LEADERBOARD_PATH = 'data/leaderboard.json';
const ALLOWED_ORIGIN = 'https://mehdiq1980.github.io';
const MAX_SCORE = 20;

function json(data, status = 200, origin = ALLOWED_ORIGIN) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type'
    }
  });
}

function validUsername(value) {
  return /^[a-z0-9.-]{3,32}$/.test(String(value || '').trim().toLowerCase());
}

function validEventId(value) {
  return /^[a-z0-9._:-]{12,160}$/i.test(String(value || ''));
}

async function github(path, env, options = {}) {
  const response = await fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    ...options,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      'x-github-api-version': '2022-11-28',
      'user-agent': 'Steem-Flags-Worker',
      ...(options.headers || {})
    }
  });
  return response;
}

async function updateLeaderboard(username, delta, eventId, env) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const read = await github(`contents/${LEADERBOARD_PATH}`, env);
    if (!read.ok) throw new Error(`GitHub read failed: ${read.status}`);
    const file = await read.json();
    const decoded = atob(file.content.replace(/\n/g, ''));
    const board = JSON.parse(decoded);

    board.version = 1;
    board.updated_at = new Date().toISOString();
    board.players ||= {};
    board.processed_events ||= [];

    if (board.processed_events.includes(eventId)) {
      return { duplicate: true, sf: Number(board.players[username]?.sf || 0) };
    }

    const current = Number(board.players[username]?.sf || 0);
    const next = Math.max(0, current + delta);
    board.players[username] = { sf: next };
    board.processed_events.push(eventId);
    if (board.processed_events.length > 5000) board.processed_events = board.processed_events.slice(-5000);

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(board, null, 2) + '\n')));
    const write = await github(`contents/${LEADERBOARD_PATH}`, env, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: `Update SF leaderboard: ${username} ${delta >= 0 ? '+' : ''}${delta}`,
        content,
        sha: file.sha,
        branch: 'main'
      })
    });

    if (write.ok) return { duplicate: false, sf: next };
    if (write.status !== 409) throw new Error(`GitHub write failed: ${write.status}`);
  }
  throw new Error('Leaderboard changed concurrently; retry later');
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') {
      if (origin !== ALLOWED_ORIGIN) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: {
        'access-control-allow-origin': origin,
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'content-type'
      }});
    }

    const url = new URL(request.url);
    if (url.pathname !== '/api/reward' || request.method !== 'POST') return json({ error: 'Not found' }, 404, origin || ALLOWED_ORIGIN);
    if (origin && origin !== ALLOWED_ORIGIN) return json({ error: 'Origin not allowed' }, 403, origin);
    if (!env.GITHUB_TOKEN) return json({ error: 'Server not configured' }, 500, origin || ALLOWED_ORIGIN);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin || ALLOWED_ORIGIN); }

    const username = String(body.username || '').trim().toLowerCase();
    const eventId = String(body.event_id || '');
    const score = Number(body.score);

    if (!validUsername(username)) return json({ error: 'Invalid username' }, 400, origin || ALLOWED_ORIGIN);
    if (!validEventId(eventId)) return json({ error: 'Invalid event_id' }, 400, origin || ALLOWED_ORIGIN);
    if (!Number.isInteger(score) || score < -MAX_SCORE || score > MAX_SCORE || score === 0) return json({ error: 'Invalid score' }, 400, origin || ALLOWED_ORIGIN);

    try {
      const result = await updateLeaderboard(username, score, eventId, env);
      return json({ ok: true, ...result }, 200, origin || ALLOWED_ORIGIN);
    } catch (error) {
      console.error(error);
      return json({ error: 'Unable to update leaderboard' }, 503, origin || ALLOWED_ORIGIN);
    }
  }
};
