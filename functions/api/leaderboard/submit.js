export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const username = String(body?.username || '').trim().toLowerCase();
    const sf = Number(body?.sf);
    if (!/^[a-z0-9.-]{3,32}$/.test(username) || !Number.isInteger(sf) || sf < 0 || sf > 1000000000) {
      return Response.json({ error: 'Invalid leaderboard data' }, { status: 400 });
    }
    await context.env.DB.prepare(
      `INSERT INTO leaderboard (username, sf, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(username) DO UPDATE SET sf = excluded.sf, updated_at = datetime('now')
       WHERE excluded.sf > leaderboard.sf`
    ).bind(username, sf).run();
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Leaderboard POST failed', error);
    return Response.json({ error: 'Leaderboard unavailable' }, { status: 503 });
  }
}
