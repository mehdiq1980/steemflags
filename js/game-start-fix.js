(() => {
  const startLocalGame = () => {
    const game = window.__steemFlagsGame;
    if (!game) return false;
    const loginView = document.getElementById('loginView');
    const home = document.getElementById('homeView');
    const leaderboard = document.getElementById('leaderboardSection');
    const gameView = document.getElementById('gameView');
    const energy = document.getElementById('energyValue');
    const newButton = document.getElementById('newGameButton');
    const username = (() => {
      try { return JSON.parse(localStorage.getItem('steemFlagsAuthSession') || 'null')?.username || ''; }
      catch { return ''; }
    })();
    const currentEnergy = Number(energy?.textContent);
    if (!username || !Number.isFinite(currentEnergy) || currentEnergy <= 0) return false;

    game.reset();
    if (energy) energy.textContent = String(Math.max(0, currentEnergy - 1));
    if (newButton) newButton.disabled = true;
    if (loginView) loginView.hidden = true;
    if (home) home.hidden = true;
    if (leaderboard) leaderboard.hidden = true;
    if (gameView) gameView.hidden = false;
    game.next();
    return true;
  };

  document.addEventListener('click', event => {
    const button = event.target.closest?.('#newGameButton');
    if (!button) return;
    if (startLocalGame()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('steemflags:new-game', event => {
    if (startLocalGame()) {
      event.preventDefault?.();
      event.stopImmediatePropagation?.();
    }
  }, true);
})();
