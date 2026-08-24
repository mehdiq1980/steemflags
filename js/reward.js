const API_BASE = 'https://steemflags.mehdiq.workers.dev';

export async function saveGameResult({username, score, eventId}) {
  const account = String(username ?? '').trim().toLowerCase();
  const amount = Number(score);
  const id = String(eventId ?? '').trim();
  if (!/^[a-z0-9.-]{3,32}$/.test(account) || !Number.isInteger(amount) || amount < -20 || amount > 20 || !id) {
    return { success: false, error: 'Invalid game result' };
  }
  try {
    const response = await fetch(`${API_BASE}/api/game/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: account, score: amount, eventId: id }),
      cache: 'no-store'
    });
    const data = await response.json();
    if (!response.ok || !data?.success) return { success: false, error: data?.error || `GAME_RESULT_${response.status}` };
    return data;
  } catch (error) {
    console.error('Unable to save game result', error);
    return { success: false, error: 'GAME_RESULT_NETWORK_ERROR' };
  }
}
