(function () {
  'use strict';

  const preloaderMarkup = `
    <div id="sf-preloader" role="status" aria-label="Loading Steem Flags">
      <div class="sf-loader-inner">
        <div class="sf-loader-logo" aria-hidden="true">
          <div class="sf-loader-ring"></div>
          <div class="sf-loader-flag"><div class="sf-loader-cloth"></div></div>
        </div>
        <h1 class="sf-loader-title">Steem Flags</h1>
        <p class="sf-loader-subtitle">Preparing the game…</p>
        <div class="sf-loader-bar" aria-hidden="true"></div>
      </div>
    </div>`;

  function initPreloader() {
    if (document.getElementById('sf-preloader')) return;

    document.body.insertAdjacentHTML('afterbegin', preloaderMarkup);

    const preloader = document.getElementById('sf-preloader');
    const app = document.getElementById('app');
    let finished = false;

    function hidePreloader() {
      if (finished || !preloader) return;
      finished = true;
      preloader.classList.add('sf-loaded');
      window.setTimeout(() => preloader.remove(), 650);
    }

    if (app) {
      const observer = new MutationObserver(() => {
        const heading = app.querySelector('h1');
        if (heading && !heading.textContent.includes('Loading Steem Flags')) {
          observer.disconnect();
          hidePreloader();
        }
      });
      observer.observe(app, { childList: true, subtree: true });
    }

    window.addEventListener('load', () => window.setTimeout(hidePreloader, 900), { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreloader, { once: true });
  } else {
    initPreloader();
  }
})();