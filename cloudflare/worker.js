const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Content-Type"
  }
});

function normalizeUsername(value) {
  if (typeof value !== "string") return null;
  const username = value.trim().toLowerCase();
  return /^[a-z0-9.-]{3,32}$/.test(username) ? username : null;
}

async function getAccount(db, username) {
  return await db.prepare(`SELECT Username, D2E, SteemReward, Energy, Flag FROM accounts WHERE Username = ?`).bind(username).first();
}

async function ensureAccount(db, username) {
  await db.prepare(`INSERT INTO accounts (Username, D2E, SteemReward, Energy, Flag) VALUES (?, 0, 0, 3, NULL) ON CONFLICT(Username) DO NOTHING`).bind(username).run();
  return getAccount(db, username);
}

async function ensureGameEventsTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS game_events (event_id TEXT PRIMARY KEY, Username TEXT NOT NULL, score INTEGER NOT NULL, created_at TEXT NOT NULL)`).run();
}

async function handle(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (request.method === "OPTIONS") return json({ ok: true });
  if (!env.DB) return json({ success: false, error: "D1 binding DB is not configured" }, 500);

  if (request.method === "GET" && path === "/api/health") {
    await env.DB.prepare("SELECT 1 AS ok").first();
    return json({ success: true, service: "steem-flags-api", database: "ok" });
  }

  if (request.method === "GET" && path === "/api/account") {
    const username = normalizeUsername(url.searchParams.get("username"));
    if (!username) return json({ success: false, error: "Invalid username" }, 400);
    const account = await ensureAccount(env.DB, username);
    return json({ success: true, account });
  }

  if (request.method === "POST" && path === "/api/game/start") {
    let body;
    try { body = await request.json(); } catch { return json({ success: false, error: "Invalid JSON" }, 400); }
    const username = normalizeUsername(body?.username ?? body?.Username);
    if (!username) return json({ success: false, error: "Invalid username" }, 400);
    await ensureAccount(env.DB, username);
    const result = await env.DB.prepare(`UPDATE accounts SET Energy = Energy - 1 WHERE Username = ? AND Energy > 0`).bind(username).run();
    if (!result.meta?.changes) return json({ success: false, error: "Not enough energy" }, 409);
    return json({ success: true, account: await getAccount(env.DB, username) });
  }

  if (request.method === "POST" && path === "/api/game/result") {
    let body;
    try { body = await request.json(); } catch { return json({ success: false, error: "Invalid JSON" }, 400); }
    const username = normalizeUsername(body?.username ?? body?.Username);
    const eventId = typeof body?.eventId === "string" ? body.eventId.trim() : "";
    const score = Number(body?.score);
    if (!username || !eventId || !Number.isInteger(score) || score < -20 || score > 20) {
      return json({ success: false, error: "Invalid game result" }, 400);
    }
    await ensureAccount(env.DB, username);
    await ensureGameEventsTable(env.DB);
    const existing = await env.DB.prepare(`SELECT event_id FROM game_events WHERE event_id = ?`).bind(eventId).first();
    if (existing) return json({ success: true, duplicate: true, account: await getAccount(env.DB, username) });

    const account = await getAccount(env.DB, username);
    const nextD2E = Math.max(0, Number(account?.D2E || 0) + score);
    await env.DB.batch([
      env.DB.prepare(`UPDATE accounts SET D2E = ? WHERE Username = ?`).bind(nextD2E, username),
      env.DB.prepare(`INSERT INTO game_events (event_id, Username, score, created_at) VALUES (?, ?, ?, ?)`).bind(eventId, username, score, new Date().toISOString())
    ]);
    return json({ success: true, duplicate: false, account: await getAccount(env.DB, username) });
  }

  if (request.method === "POST" && path === "/api/account") {
    let body;
    try { body = await request.json(); } catch { return json({ success: false, error: "Invalid JSON" }, 400); }

    const username = normalizeUsername(body?.Username ?? body?.username);
    if (!username) return json({ success: false, error: "Invalid username" }, 400);

    const d2eProvided = body?.D2E !== undefined;
    const energyProvided = body?.Energy !== undefined;
    const flagProvided = body?.Flag !== undefined;

    if (d2eProvided) {
      const d2e = Number(body.D2E);
      if (!Number.isSafeInteger(d2e) || d2e < 0) return json({ success: false, error: "Invalid D2E" }, 400);
    }
    if (energyProvided) {
      const energy = Number(body.Energy);
      if (!Number.isSafeInteger(energy) || energy < 0) return json({ success: false, error: "Invalid Energy" }, 400);
    }
    if (flagProvided && body.Flag !== null && typeof body.Flag !== "string") {
      return json({ success: false, error: "Invalid Flag" }, 400);
    }

    await ensureAccount(env.DB, username);

    if (d2eProvided || energyProvided || flagProvided) {
      const current = await getAccount(env.DB, username);
      const d2e = d2eProvided ? Number(body.D2E) : Number(current.D2E || 0);
      const energy = energyProvided ? Number(body.Energy) : Number(current.Energy || 0);
      const flag = flagProvided ? body.Flag : current.Flag;
      await env.DB.prepare(`UPDATE accounts SET D2E = ?, Energy = ?, Flag = ? WHERE Username = ?`).bind(d2e, energy, flag, username).run();
    }

    return json({ success: true, account: await getAccount(env.DB, username) });
  }

  if (request.method === "GET" && path === "/api/accounts") {
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 100, 1), 500);
    const result = await env.DB.prepare(`SELECT Username, D2E, SteemReward, Energy, Flag FROM accounts ORDER BY D2E DESC, Username ASC LIMIT ?`).bind(limit).all();
    return json({ success: true, accounts: result.results });
  }

  return json({ success: false, error: "Not found" }, 404);
}

export default {
  async fetch(request, env) {
    try {
      return await handle(request, env);
    } catch (error) {
      console.error(error);
      return json({ success: false, error: error.message || "Internal server error" }, 500);
    }
  }
};
