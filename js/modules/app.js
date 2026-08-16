const app = document.getElementById('app');

export function initApp() {
  if (!app) return;

  app.innerHTML = `
    <main class="appShell">
      <section class="card hero">
        <p class="eyebrow">STEEM FLAGS</p>
        <h1>Steem Flags</h1>
        <p class="muted">The modular game interface is ready.</p>
        <button id="startGame" type="button">Start Game</button>
      </section>
    </main>
  `;
}
