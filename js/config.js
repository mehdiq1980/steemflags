// Cloudflare Worker API for the global Steem Flags leaderboard.
window.STEEM_FLAGS_API_URL = 'https://steemflags.mehdiq.workers.dev';

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
    if (response.ok) window.dispatchEvent(new CustomEvent('steemflags:sf-changed'));
    return response.ok;
  } catch (error) {
    console.warn('Global SF submission failed:', error);
    return false;
  }
};
