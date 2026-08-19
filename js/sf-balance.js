// Read the logged-in user's SF balance from the public leaderboard data.
export async function loadLeaderboardSF(username) {
  const name = String(username || '').trim().toLowerCase();
  if (!name) return 0;

  try {
    const response = await fetch(`./data/leaderboard.json?v=${Date.now()}`, {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`Leaderboard request failed: ${response.status}`);

    const data = await response.json();
    const value = data?.players?.[name]?.sf;
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  } catch (error) {
    console.warn('Unable to load SF balance from leaderboard.json', error);
    return 0;
  }
}

export async function refreshLeaderboardSF(username, element) {
  if (!element) return 0;
  const balance = await loadLeaderboardSF(username);
  element.textContent = String(balance);
  return balance;
}
