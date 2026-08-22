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

const REPO = "mehdiq1980/steemflags";
const LEADERBOARD_PATH = "data/leaderboard.json";
const ENERGY_PRICE = 10;
const DAILY_PURCHASE_LIMIT = 10;

function normalizeUsername(value) {
  if (typeof value !== "string") return null;
  const username = value.trim().toLowerCase();
  return /^[a-z0-9.-]{3,32}$/.test(username) ? username : null;
}

function newId() { return crypto.randomUUID(); }

async function ensurePlayer(db, username) {
  await db.prepare(`INSERT INTO players (username) VALUES (?) ON CONFLICT(username) DO NOTHING`).bind(username).run();
}

async function ensurePurchaseTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS energy_purchases (
    username TEXT NOT NULL COLLATE NOCASE,
    purchase_day TEXT NOT NULL,
    purchased INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (username, purchase_day)
  )`).run();
}

async function getLeaderboard(db, limit = 100) {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 100);
  const result = await db.prepare(`
    SELECT username, total_points, games_played, correct_answers, total_questions
    FROM players ORDER BY total_points DESC, username ASC LIMIT ?
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
  const row = await db.prepare(`SELECT username, total_points, games_played, correct_answers, total_questions FROM players WHERE username = ?`).bind(username).first();
  if (!row) return null;
  const rankRow = await db.prepare(`SELECT COUNT(*) + 1 AS rank FROM players WHERE total_points > ?`).bind(row.total_points).first();
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

function githubHeaders(env) {
  if (!env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN secret is not configured");
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json"
  };
}

async function getLeaderboardFile(env) {
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${LEADERBOARD_PATH}?ref=main`, {
    headers: githubHeaders(env), cache: "no-store"
  });
  if (!r.ok) throw new Error(`GitHub leaderboard read failed: ${r.status}`);
  const data = await r.json();
  const binary = atob(data.content.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  const content = new TextDecoder().decode(bytes);
  return { sha: data.sha, content, data: JSON.parse(content) };
}

async function updateLeaderboardFile(env, sha, leaderboard, username) {
  const content = JSON.stringify(leaderboard, null, 2) + "\n";
  const bytes = new TextEncoder().encode(content);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const encoded = btoa(binary);
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${LEADERBOARD_PATH}`, {
    method: "PUT",
    headers: githubHeaders(env),
    body: JSON.stringify({
      message: `Shop: buy energy for ${username}`,
      content: encoded,
      sha,
      branch: "main"
    })
  });
  if (!r.ok) throw new Error(`GitHub leaderboard write failed: ${r.status}`);
  return r.json();
}

async function readPublicBalance(env, username) {
  const file = await getLeaderboardFile(env);
  return Number(file.data?.players?.[username]?.sf || 0);
}

async function buyEnergyFromLeaderboard(env, username) {
  await ensurePurchaseTable(env.DB);
  const today = new Date().toISOString().slice(0, 10);
  const row = await env.DB.prepare(`SELECT purchased FROM energy_purchases WHERE username = ? AND purchase_day = ?`).bind(username, today).first();
  const purchased = Number(row?.purchased || 0);
  if (purchased >= DAILY_PURCHASE_LIMIT) return { ok: false, status: 400, error: "Daily purchase limit reached." };

  // The public GitHub leaderboard is the authoritative D2E balance for the Shop.
  // Retry once if another GitHub write changed the file SHA between read and write.
  for (let attempt = 0; attempt < 2; attempt++) {
    const file = await getLeaderboardFile(env);
    const current = Number(file.data?.players?.[username]?.sf || 0);
    if (current < ENERGY_PRICE) return { ok: false, status: 400, error: "Insufficient D2E balance", balance: current };

    file.data.players = file.data.players || {};
    file.data.players[username] = file.data.players[username] || { sf: 0 };
    file.data.players[username].sf = current - ENERGY_PRICE;
    file.data.updated_at = new Date().toISOString();

    try {
      await updateLeaderboardFile(env, file.sha, file.data, username);
      await env.DB.prepare(`INSERT INTO energy_purchases (username, purchase_day, purchased) VALUES (?, ?, 1)
        ON CONFLICT(username, purchase_day) DO UPDATE SET purchased = purchased + 1`).bind(username, today).run();
      return { ok: true, balance: current - ENERGY_PRICE, purchasedToday: purchased + 1 };
    } catch (error) {
      if (attempt === 1) throw error;
    }
  }
  throw new Error("Purchase failed");
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

  if (request.method === "GET" && path === "/api/shop/balance") {
    const username = normalizeUsername(url.searchParams.get("username"));
    if (!username) return json({ success: false, error: "Invalid username" }, 400);
    const balance = await readPublicBalance(env, username);
    return json({ success: true, username, d2e: balance });
  }

  if (request.method === "POST" && path === "/api/shop/buy-energy") {
    let body;
    try { body = await request.json(); } catch { return json({ success: false, error: "Invalid JSON" }, 400); }
    const username = normalizeUsername(body?.username);
    if (!username) return json({ success: false, error: "Invalid username" }, 400);
    const result = await buyEnergyFromLeaderboard(env, username);
    if (!result.ok) return json({ success: false, error: result.error, d2e: result.balance }, result.status);
    return json({ success: true, d2e: result.balance, purchasedToday: result.purchasedToday, price: ENERGY_PRICE });
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

  if (request.method === "POST" && path === "/api/leaderboard") {
    let body;
    try { body = await request.json(); } catch { return json({ success: false, error: "Invalid JSON" }, 400); }
    const username = normalizeUsername(body?.username);
    const sf = Number(body?.sf);
    if (!username || !Number.isSafeInteger(sf) || sf < 0) return json({ success: false, error: "Invalid username or SF" }, 400);
    await ensurePlayer(env.DB, username);
    await env.DB.prepare(`UPDATE players SET total_points = ?, sf_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?`).bind(sf, sf, username).run();
    return json({ success: true, player: await getPlayer(env.DB, username) });
  }

  if (request.method === "POST" && path === "/api/game/start") {
    let body;
    try { body = await request.json(); } catch { return json({ success: false, error: "Invalid JSON" }, 400); }
    const username = normalizeUsername(body?.username);
    if (!username) return json({ success: false, error: "Invalid username" }, 400);
    await ensurePlayer(env.DB, username);
    const sessionId = newId();
    await env.DB.prepare(`INSERT INTO game_sessions (id, username, question_number, score, status) VALUES (?, ?, 0, 0, 'active')`).bind(sessionId, username).run();
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
    catch (error) { console.error(error); return json({ success: false, error: error.message || "Internal server error" }, 500); }
  }
};
