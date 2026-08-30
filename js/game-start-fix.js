(() => {
  // Do not implement a second game-start path here.
  // app-v2.js owns the real New Game flow (including energy/account handling).
  const runOfficialNewGame = () => {
    const button = document.getElementById('newGameButton');
    if (!button || button.disabled) return false;
    if (typeof button.onclick !== 'function') return false;
    Promise.resolve(button.onclick()).catch(error => console.error('New Game failed:', error));
    return true;
  };

  window.addEventListener('steemflags:new-game', event => {
    if (!runOfficialNewGame()) return;
    event.stopImmediatePropagation();
  }, true);
})();
