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
  const username = value.trim();
  if (!/^[a-z0-9.-]{3,32}$/i.test(username)) return null;
  return username;
}

function newId() {
  return crypto.randomUUID();
}

async function ensurePlayer(db, username) {
  await db
    .prepare(
      `INSERT INTO players (username)
       VALUES (?)
       ON CONFLICT(username) DO NOTHING`
    )
    .bind(username)
    .run();
}

async function leaderboard(db, limit = 100) {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 100);
  const result = await db
    .prepare(
      `SELECT username, total_points, games_played, correct_answers, total_questions
       FROM players
       ORDER BY total_points DESC, username ASC
       LIMIT ?`
    )
    .bind(safeLimit)
    .all();

  return result.results.map((row, index) => ({
    rank: index + 1,
    username: row.username,
    points: row.total_points,
    games: row.games_played,
    correctAnswers: row.correct_answers,
    questions: row.total_questions
  }));
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
    return json({ success: true, leaderboard: await leaderboard(env.DB, limit) });
  }

  if (request.method === "GET" && path === "/api/leaderboard/me") {
    const username = normalizeUsername(url.searchParams.get("username"));
    if (!username) return json({ success: false, error: "Invalid username" }, 400);

    const row = await env.DB
      .prepare(
        `SELECT username, total_points, games_played, correct_answers, total_questions
         FROM players WHERE username = ?`
      )
      .bind(username)
      .first();

    if (!row) return json({ success: true, player: null });

    const rankRow = await env.DB
      .prepare(
        `SELECT COUNT(*) + 1 AS rank
         FROM players
         WHERE total_points > ?`
      )
      .bind(row.total_points)
      .first();

    return json({
      success: true,
      player: {
        username: row.username,
        points: row.total_points,
        games: row.games_played,
        correctAnswers: row.correct_answers,
        questions: row.total_questions,
        rank: rankRow.rank
      }
    });
  }

  if (request.method === "POST" && path === "/api/game/start") {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: "Invalid JSON" }, 400);
    }

    const username = normalizeUsername(body?.username);
    if (!username) return json({ success: false, error: "Invalid username" }, 400);

    await ensurePlayer(env.DB, username);

    const sessionId = newId();
    await env.DB
      .prepare(
        `INSERT INTO game_sessions (id, username, question_number, score, status)
         VALUES (?, ?, 0, 0, 'active')`
      )
      .bind(sessionId, username)
      .run();

    return json({ success: true, sessionId, username, score: 0 });
  }

  // Intentionally does NOT accept a client-supplied score or SF amount.
  // The answer-validation logic will be connected to the authoritative
  // question bank in the next migration/implementation step.
  if (request.method === "POST" && path.startsWith("/api/game/") && path.endsWith("/answer")) {
    return json(
      {
        success: false,
        error: "Answer endpoint is not enabled yet; authoritative question validation must be connected first."
      },
      501
    );
  }

  return json({ success: false, error: "Not found" }, 404);
}

export default {
  async fetch(request, env) {
    try {
      return await handle(request, env);
    } catch (error) {
      console.error(error);
      return json({ success: false, error: "Internal server error" }, 500);
    }
  }
};
