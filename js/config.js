// GitHub-only leaderboard storage.
// No Cloudflare Worker or external leaderboard API is used.
window.STEEM_FLAGS_API_URL = '';

// Kept as a no-op for compatibility with the existing frontend.
// Global leaderboard updates are handled through the GitHub data/workflow layer.
window.submitGlobalSF = async function submitGlobalSF() {
  return false;
};
