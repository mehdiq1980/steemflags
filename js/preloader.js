(function () {
  'use strict';

  const preloaderMarkup = `
    <div id="sf-preloader" role="status" aria-label="Loading Steem Flags">
      <div class="sf-loader-inner">
        <svg class="sf-loader-ring" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <linearGradient id="sfRingGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#005cff"/>
              <stop offset="65%" stop-color="#087cff"/>
              <stop offset="100%" stop-color="#72c8ff"/>
            </linearGradient>
          </defs>
          <circle class="sf-loader-ring-track" cx="50" cy="50" r="46" pathLength="100"></circle>
          <circle class="sf-loader-ring-progress" cx="50" cy="50" r="46" pathLength="100"></circle>
          <circle class="sf-loader-spark" cx="50" cy="4" r="1.15"></circle>
        </svg>

        <div class="sf-loader-logo" aria-hidden="true">
          <img src="assets/steemflags-logo.svg" alt="">
        </div>

        <div class="sf-loader-status">
          <p class="sf-loader-title">Loading...</p>
          <p class="sf-loader-percent" aria-live="polite">0</p>
        </div>
      </div>
    </div>`;

  function initPreloader() {
    if (document.getElementById('sf-preloader')) return;

    document.body.insertAdjacentHTML('afterbegin', preloaderMarkup);

    const preloader = document.getElementById('sf-preloader');
    const progressCircle = preloader.querySelector('.sf-loader-ring-progress');
    const percentText = preloader.querySelector('.sf-loader-percent');
    const spark = preloader.querySelector('.sf-loader-spark');
    let progress = 0;
    let finished = false;

    function setProgress(value) {
      progress = Math.max(0, Math.min(100, Math.round(value)));
      if (progressCircle) progressCircle.style.strokeDashoffset = String(100 - progress);
      if (percentText) percentText.textContent = String(progress);

      if (spark) {
        const angle = (progress / 100) * Math.PI * 2 - Math.PI / 2;
        const x = 50 + 46 * Math.cos(angle);
        const y = 50 + 46 * Math.sin(angle);
        spark.setAttribute('cx', x.toFixed(2));
        spark.setAttribute('cy', y.toFixed(2));
        spark.classList.toggle('sf-active', progress > 0 && progress < 100);
      }
    }

    function hidePreloader() {
      if (finished || !preloader) return;
      finished = true;
      preloader.classList.add('sf-loaded');
      window.setTimeout(() => preloader.remove(), 650);
    }

    function finishLoading() {
      if (finished) return;
      const timer = window.setInterval(() => {
        setProgress(progress + 2);
        if (progress >= 100) {
          window.clearInterval(timer);
          window.setTimeout(hidePreloader, 280);
        }
      }, 18);
    }

    setProgress(8);

    // The progress is deliberately capped while the application is bootstrapping.
    // It cannot reach 100% until app-v2.js explicitly reports that the full page
    // initialization (components, menu, session/account restore) has completed.
    const progressTimer = window.setInterval(() => {
      if (progress >= 92) {
        window.clearInterval(progressTimer);
        return;
      }
      const step = progress < 55 ? 2 : progress < 78 ? 1 : 0.5;
      setProgress(progress + step);
    }, 140);

    function onAppReady(event) {
      window.clearInterval(progressTimer);
      finishLoading();
      window.removeEventListener('steemflags:ready', onAppReady);
      window.__steemFlagsReady = event?.detail || { success: true };
    }

    window.addEventListener('steemflags:ready', onAppReady, { once: true });

    // Protect against a very fast cached module completing before this listener
    // is registered.
    if (window.__steemFlagsReady) onAppReady({ detail: window.__steemFlagsReady });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreloader, { once: true });
  } else {
    initPreloader();
  }
})();
