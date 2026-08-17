export async function onRequestGet(context) {
  const limit = Math.min(Math.max(Number(context.request.url ? new URL(context.request.url).searchParams.get('limit') || 10 : 10), 1), 100);
  try {
    const result = await context.env.DB.prepare(
      'SELECT username, sf FROM leaderboard ORDER BY sf DESC, updated_at ASC, username ASC LIMIT ?'
    ).bind(limit).all();
    return Response.json({ leaderboard: result.results || [] }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Leaderboard GET failed', error);
    return Response.json({ error: 'Leaderboard unavailable' }, { status: 503 });
  }
}
