const ALLOWED_ORIGIN = 'https://mehdiq1980.github.io';
const MAX_SCORE = 20;

function json(data, status = 200, origin = ALLOWED_ORIGIN) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type'
    }
  });
}

function validUsername(value) {
  return /^[a-z0-9.-]{3,32}$/.test(String(value || '').trim().toLowerCase());
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      if (origin && origin !== ALLOWED_ORIGIN) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': origin || ALLOWED_ORIGIN,
          'access-control-allow-methods': 'GET, POST, OPTIONS',
          'access-control-allow-headers': 'content-type'
        }
      });
    }

    const url = new URL(request.url);
    const responseOrigin = origin || ALLOWED_ORIGIN;

    if (origin && origin !== ALLOWED_ORIGIN) {
      return json({ error: 'Origin not allowed' }, 403, origin);
    }

    if (!env.DB) {
      return json({ error: 'D1 database binding DB is not configured' }, 500, responseOrigin);
    }

    // GET /api/leaderboard
    // Returns all accounts ordered by D2E, highest first.
    if (url.pathname === '/api/leaderboard' && request.method === 'GET') {
      try {
        const { results } = await env.DB.prepare(`
          SELECT Username, D2E, SteemReward
          FROM accounts
          ORDER BY D2E DESC, Username ASC
        `).all();

        return json({ success: true, accounts: results }, 200, responseOrigin);
      } catch (error) {
        console.error(error);
        return json({ error: 'Unable to read leaderboard' }, 503, responseOrigin);
      }
    }

    // GET /api/account?username=...
    // Returns one account from D1 and creates the account on first login.
    if (url.pathname === '/api/account' && request.method === 'GET') {
      const username = String(url.searchParams.get('username') || '').trim().toLowerCase();
      if (!validUsername(username)) {
        return json({ error: 'Invalid username' }, 400, responseOrigin);
      }

      try {
        await env.DB.prepare(`
          INSERT INTO accounts (Username, D2E, SteemReward, Energy, Flag)
          VALUES (?, 0, 0, 0, '')
          ON CONFLICT(Username) DO NOTHING
        `).bind(username).run();

        const account = await env.DB.prepare(`
          SELECT Username, D2E, SteemReward, Energy, Flag
          FROM accounts
          WHERE lower(Username) = ?
          LIMIT 1
        `).bind(username).first();

        return json({ success: true, account: account || null }, 200, responseOrigin);
      } catch (error) {
        console.error(error);
        return json({ error: 'Unable to read/create account' }, 503, responseOrigin);
      }
    }

    // POST /api/reward
    // Applies the game's score directly to D2E.
    // A positive score increases D2E; a negative score decreases it, never below zero.
    if (url.pathname === '/api/reward' && request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON' }, 400, responseOrigin);
      }

      const username = String(body.username || '').trim().toLowerCase();
      const score = Number(body.score);

      if (!validUsername(username)) {
        return json({ error: 'Invalid username' }, 400, responseOrigin);
      }

      if (!Number.isInteger(score) || score < -MAX_SCORE || score > MAX_SCORE || score === 0) {
        return json({ error: 'Invalid score' }, 400, responseOrigin);
      }

      try {
        await env.DB.prepare(`
          INSERT INTO accounts (Username, D2E, SteemReward, Energy, Flag)
          VALUES (?, MAX(0, ?), 0, 0, '')
          ON CONFLICT(Username) DO UPDATE SET
            D2E = MAX(0, accounts.D2E + excluded.D2E)
        `).bind(username, score).run();

        const account = await env.DB.prepare(`
          SELECT Username, D2E, SteemReward, Energy, Flag
          FROM accounts
          WHERE Username = ?
          LIMIT 1
        `).bind(username).first();

        return json({ success: true, account }, 200, responseOrigin);
      } catch (error) {
        console.error(error);
        return json({ error: 'Unable to update account' }, 503, responseOrigin);
      }
    }

    return json({ error: 'Not found' }, 404, responseOrigin);
  }
};
