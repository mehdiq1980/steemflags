// Set this to the public URL of the deployed backend API.
// Example: window.STEEM_FLAGS_API_URL = 'https://your-api.example.com';
window.STEEM_FLAGS_API_URL = window.STEEM_FLAGS_API_URL || '';
window.submitGlobalSF = async function submitGlobalSF(username, sf) {
  const base = String(window.STEEM_FLAGS_API_URL || '').replace(/\/$/, '');
  if (!base || !username) return false;
  try {
    const response = await fetch(`${base}/api/leaderboard`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, sf: Number(sf) }) });
    return response.ok;
  } catch (error) {
    console.warn('Global SF submission failed:', error);
    return false;
  }
};
