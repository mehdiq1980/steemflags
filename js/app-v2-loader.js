const app = document.getElementById('app');

async function startSteemFlags() {
  try {
    // Cache-bust the application module so the latest UI/assets code is loaded after deployment.
    await import('./app-v2.js?v=20260826-menu-fix-01');
    await import('./asset-bar.js?v=20260826-assetbar-03');
  } catch (error) {
    console.error('Steem Flags module load failed:', error);
    if (app) {
      const detail = String(error?.message || error || 'Module failed to load').replace(/[<>&]/g, '');
      app.innerHTML = '<main class="appShell"><section class="card hero"><p class="eyebrow">STEEM FLAGS</p><h1>Unable to load the game</h1><p class="muted">Module error: ' + detail + '</p><p class="muted">Please refresh the page.</p></section></main>';
    }
    window.dispatchEvent(new CustomEvent('steemflags:ready', { detail: { success: false, error } }));
  }
}

startSteemFlags();
