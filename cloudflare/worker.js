const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
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
  if (!/^[a-z0-9.-]{3,32}$/.test(username)) return null;
  return username;
}

function newId() {
  return crypto.randomUUID();
}

async function ensurePlayer(db, username) {
  await db.prepare(`INSERT INTO players (username) VALUES (?) ON CONFLICT(username) DO NOTHING`).bind(username).run();
}

async function getLeaderboard(db, limit = 100) {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 100);
  const result = await db.prepare(`
    SELECT username, total_points, games_played, correct_answers, total_questions
    FROM players
    ORDER BY total_points DESC, username ASC
    LIMIT ?
  `).bind(safeLimit).all();

  return result.results.map((row, index) => ({
    rank: index + 1,
    username: row.username,
    sf: Number(row.total_points || 0),
    points: Number(row.total_points || 0),
    games: Number(row.games_played || 0),
    correctAnswers: Number(row.correct_answers || 0),
    questions: Number(row.total_questions || 0)
  }));
}

async function getPlayer(db, username) {
  const row = await db.prepare(`
    SELECT username, total_points, games_played, correct_answers, total_questions
    FROM players WHERE username = ?
  `).bind(username).first();
  if (!row) return null;

  const rankRow = await db.prepare(`
    SELECT COUNT(*) + 1 AS rank FROM players WHERE total_points > ?
  `).bind(row.total_points).first();

  return {
    username: row.username,
    sf: Number(row.total_points || 0),
    points: Number(row.total_points || 0),
    games: Number(row.games_played || 0),
    correctAnswers: Number(row.correct_answers || 0),
    questions: Number(row.total_questions || 0),
    rank: Number(rankRow?.rank || 1)
  };
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

  if (request.method === "GET" && path === "/api/leaderboard") {
    const limit = url.searchParams.get("limit");
    const username = normalizeUsername(url.searchParams.get("username"));
    const rows = await getLeaderboard(env.DB, limit);
    const me = username ? await getPlayer(env.DB, username) : null;
    return json({ success: true, leaderboard: rows, me });
  }

  if (request.method === "GET" && path === "/api/leaderboard/me") {
    const username = normalizeUsername(url.searchParams.get("username"));
    if (!username) return json({ success: false, error: "Invalid username" }, 400);
    return json({ success: true, player: await getPlayer(env.DB, username) });
  }

  // Compatibility endpoint used by the current Steem Flags frontend.
  // It stores the user's current SF balance in the leaderboard record.
  if (request.method === "POST" && path === "/api/leaderboard") {
    let body;
    try { body = await request.json(); } catch { return json({ success: false, error: "Invalid JSON" }, 400); }

    const username = normalizeUsername(body?.username);
    const sf = Number(body?.sf);
    if (!username || !Number.isSafeInteger(sf) || sf < 0) {
      return json({ success: false, error: "Invalid username or SF" }, 400);
    }

    await ensurePlayer(env.DB, username);
    await env.DB.prepare(`
      UPDATE players
      SET total_points = ?, sf_balance = ?, updated_at = CURRENT_TIMESTAMP
      WHERE username = ?
    `).bind(sf, sf, username).run();

    return json({ success: true, player: await getPlayer(env.DB, username) });
  }

  if (request.method === "POST" && path === "/api/game/start") {
    let body;
    try { body = await request.json(); } catch { return json({ success: false, error: "Invalid JSON" }, 400); }
    const username = normalizeUsername(body?.username);
    if (!username) return json({ success: false, error: "Invalid username" }, 400);

    await ensurePlayer(env.DB, username);
    const sessionId = newId();
    await env.DB.prepare(`
      INSERT INTO game_sessions (id, username, question_number, score, status)
      VALUES (?, ?, 0, 0, 'active')
    `).bind(sessionId, username).run();
    return json({ success: true, sessionId, username, score: 0 });
  }

  if (request.method === "POST" && path.startsWith("/api/game/") && path.endsWith("/answer")) {
    return json({ success: false, error: "Answer endpoint is not enabled yet; authoritative question validation must be connected first." }, 501);
  }

  return json({ success: false, error: "Not found" }, 404);
}

export default {
  async fetch(request, env) {
    try { return await handle(request, env); }
    catch (error) {
      console.error(error);
      return json({ success: false, error: "Internal server error" }, 500);
    }
  }
};
