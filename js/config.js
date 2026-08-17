// Global leaderboard API configuration.
// Keep the API same-origin by default so the frontend works when the backend
// is mounted under the same public origin. A separate deployment may override
// this value before app.js loads.
window.STEEM_FLAGS_API_URL = window.STEEM_FLAGS_API_URL || window.location.origin;

window.submitGlobalSF = async function submitGlobalSF(username, sf) {
  const base = String(window.STEEM_FLAGS_API_URL || '').replace(/\/$/, '');
  if (!base || !username) return false;
  try {
    const response = await fetch(`${base}/api/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, sf: Number(sf) }),
      cache: 'no-store'
    });
    return response.ok;
  } catch (error) {
    console.warn('Global SF submission failed:', error);
    return false;
  }
};
