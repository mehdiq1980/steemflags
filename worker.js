const ALLOWED_ORIGIN = 'https://mehdiq1980.github.io';
const MAX_SCORE = 20;
const ENERGY_PRICE = 10;
const DAILY_ENERGY_PURCHASE_LIMIT = 10;

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
function todayUTC() { return new Date().toISOString().slice(0, 10); }
async function ensurePurchaseTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS energy_purchases (Username TEXT NOT NULL, PurchaseDate TEXT NOT NULL, Quantity INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (Username, PurchaseDate), FOREIGN KEY (Username) REFERENCES accounts(Username))`).run();
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') {
      if (origin && origin !== ALLOWED_ORIGIN) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: { 'access-control-allow-origin': origin || ALLOWED_ORIGIN, 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type' } });
    }
    const url = new URL(request.url);
    const responseOrigin = origin || ALLOWED_ORIGIN;
    if (origin && origin !== ALLOWED_ORIGIN) return json({ error: 'Origin not allowed' }, 403, origin);
    if (!env.DB) return json({ error: 'D1 database binding DB is not configured' }, 500, responseOrigin);

    if (url.pathname === '/api/leaderboard' && request.method === 'GET') {
      try {
        const { results } = await env.DB.prepare(`SELECT Username, D2E, SteemReward, Energy FROM accounts ORDER BY D2E DESC, Username ASC`).all();
        return json({ success: true, accounts: results }, 200, responseOrigin);
      } catch (error) { console.error(error); return json({ error: 'Unable to read leaderboard' }, 503, responseOrigin); }
    }

    if (url.pathname === '/api/account' && request.method === 'GET') {
      const username = String(url.searchParams.get('username') || '').trim().toLowerCase();
      if (!validUsername(username)) return json({ error: 'Invalid username' }, 400, responseOrigin);
      try {
        await env.DB.prepare(`INSERT INTO accounts (Username, D2E, SteemReward, Energy, Flag) VALUES (?, 0, 0, 0, '') ON CONFLICT(Username) DO NOTHING`).bind(username).run();
        const account = await env.DB.prepare(`SELECT Username, D2E, SteemReward, Energy, Flag FROM accounts WHERE lower(Username) = ? LIMIT 1`).bind(username).first();
        return json({ success: true, account: account || null }, 200, responseOrigin);
      } catch (error) { console.error(error); return json({ error: 'Unable to read/create account' }, 503, responseOrigin); }
    }

    // GET /api/shop/energy?username=...
    // Returns the current D1 purchase status for today's UTC date.
    if (url.pathname === '/api/shop/energy' && request.method === 'GET') {
      const username = String(url.searchParams.get('username') || '').trim().toLowerCase();
      if (!validUsername(username)) return json({ error: 'Invalid username' }, 400, responseOrigin);
      try {
        await ensurePurchaseTable(env.DB);
        const account = await env.DB.prepare(`SELECT Username, D2E, Energy FROM accounts WHERE Username = ? LIMIT 1`).bind(username).first();
        if (!account) return json({ success: false, error: 'Account not found' }, 404, responseOrigin);
        const date = todayUTC();
        const purchase = await env.DB.prepare(`SELECT Quantity FROM energy_purchases WHERE Username = ? AND PurchaseDate = ? LIMIT 1`).bind(username, date).first();
        const purchasedToday = Math.max(0, Number(purchase?.Quantity) || 0);
        return json({ success: true, D2E: Math.max(0, Number(account.D2E) || 0), Energy: Math.max(0, Number(account.Energy) || 0), purchasedToday, remaining: Math.max(0, DAILY_ENERGY_PURCHASE_LIMIT - purchasedToday), price: ENERGY_PRICE, dailyLimit: DAILY_ENERGY_PURCHASE_LIMIT }, 200, responseOrigin);
      } catch (error) { console.error(error); return json({ error: 'Unable to read purchase status' }, 503, responseOrigin); }
    }

    if (url.pathname === '/api/reward' && request.method === 'POST') {
      let body; try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, responseOrigin); }
      const username = String(body.username || '').trim().toLowerCase(); const score = Number(body.score);
      if (!validUsername(username)) return json({ error: 'Invalid username' }, 400, responseOrigin);
      if (!Number.isInteger(score) || score < -MAX_SCORE || score > MAX_SCORE || score === 0) return json({ error: 'Invalid score' }, 400, responseOrigin);
      try {
        await env.DB.prepare(`INSERT INTO accounts (Username, D2E, SteemReward, Energy, Flag) VALUES (?, MAX(0, ?), 0, 0, '') ON CONFLICT(Username) DO UPDATE SET D2E = MAX(0, accounts.D2E + excluded.D2E)`).bind(username, score).run();
        const account = await env.DB.prepare(`SELECT Username, D2E, SteemReward, Energy, Flag FROM accounts WHERE Username = ? LIMIT 1`).bind(username).first();
        return json({ success: true, account }, 200, responseOrigin);
      } catch (error) { console.error(error); return json({ error: 'Unable to update account' }, 503, responseOrigin); }
    }

    // POST /api/shop/energy: charge 10 D2E and add 1 Energy, max 10/day.
    if (url.pathname === '/api/shop/energy' && request.method === 'POST') {
      let body; try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, responseOrigin); }
      const username = String(body.username || '').trim().toLowerCase();
      if (!validUsername(username)) return json({ error: 'Invalid username' }, 400, responseOrigin);
      const date = todayUTC();
      try {
        await ensurePurchaseTable(env.DB);
        await env.DB.prepare(`INSERT INTO accounts (Username, D2E, SteemReward, Energy, Flag) VALUES (?, 0, 0, 0, '') ON CONFLICT(Username) DO NOTHING`).bind(username).run();
        const account = await env.DB.prepare(`SELECT Username, D2E, Energy FROM accounts WHERE Username = ? LIMIT 1`).bind(username).first();
        if (!account) return json({ error: 'Account not found' }, 404, responseOrigin);
        const purchases = await env.DB.prepare(`SELECT Quantity FROM energy_purchases WHERE Username = ? AND PurchaseDate = ? LIMIT 1`).bind(username, date).first();
        const purchasedToday = Math.max(0, Number(purchases?.Quantity) || 0); const d2e = Math.max(0, Number(account.D2E) || 0);
        if (d2e < ENERGY_PRICE) return json({ success: false, error: 'Insufficient D2E', D2E: d2e, Energy: Number(account.Energy) || 0, purchasedToday }, 400, responseOrigin);
        if (purchasedToday >= DAILY_ENERGY_PURCHASE_LIMIT) return json({ success: false, error: 'Daily energy purchase limit reached', D2E: d2e, Energy: Number(account.Energy) || 0, purchasedToday }, 400, responseOrigin);
        const results = await env.DB.batch([
          env.DB.prepare(`UPDATE accounts SET D2E = D2E - ?, Energy = Energy + 1 WHERE Username = ? AND D2E >= ?`).bind(ENERGY_PRICE, username, ENERGY_PRICE),
          env.DB.prepare(`INSERT INTO energy_purchases (Username, PurchaseDate, Quantity) VALUES (?, ?, 1) ON CONFLICT(Username, PurchaseDate) DO UPDATE SET Quantity = Quantity + 1`).bind(username, date)
        ]);
        if (!results?.[0]?.meta?.changes) return json({ success: false, error: 'Purchase could not be completed' }, 409, responseOrigin);
        const updated = await env.DB.prepare(`SELECT Username, D2E, SteemReward, Energy, Flag FROM accounts WHERE Username = ? LIMIT 1`).bind(username).first();
        const purchase = await env.DB.prepare(`SELECT Quantity FROM energy_purchases WHERE Username = ? AND PurchaseDate = ? LIMIT 1`).bind(username, date).first();
        return json({ success: true, account: updated, purchasedToday: Number(purchase?.Quantity) || 0, price: ENERGY_PRICE }, 200, responseOrigin);
      } catch (error) { console.error(error); return json({ error: 'Unable to complete energy purchase' }, 503, responseOrigin); }
    }
    return json({ error: 'Not found' }, 404, responseOrigin);
  }
};
