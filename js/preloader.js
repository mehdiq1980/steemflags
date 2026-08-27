(function () {
  'use strict';

  const LOGO = './assets/steemflags_logo.png';

  function ensurePreloader() {
    let preloader = document.getElementById('sf-preloader');
    if (preloader) return preloader;
    preloader = document.createElement('div');
    preloader.id = 'sf-preloader';
    preloader.setAttribute('role', 'status');
    preloader.setAttribute('aria-label', 'Loading Steem Flags');
    preloader.innerHTML = '<div class="sf-loader-inner"><div class="sf-loader-logo" aria-hidden="true"><img class="sf-loader-logo-base" src="' + LOGO + '" alt="Steem Flags official logo" decoding="async" fetchpriority="high"></div><svg class="sf-loader-ring" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="sfRingGradient" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#fff"/><stop offset="50%" stop-color="#fff"/><stop offset="100%" stop-color="#fff"/></linearGradient></defs><circle class="sf-loader-ring-track" cx="50" cy="50" r="46" pathLength="100"></circle><circle class="sf-loader-ring-progress" cx="50" cy="50" r="46" pathLength="100"></circle></svg></div>';
    document.body.insertBefore(preloader, document.body.firstChild);
    return preloader;
  }

  function initPreloader() {
    const preloader = ensurePreloader();
    if (!preloader || preloader.dataset.initialized === '1') return;
    preloader.dataset.initialized = '1';
    const progressCircle = preloader.querySelector('.sf-loader-ring-progress');
    let progress = 0;
    let finished = false;
    let fallback;

    function setProgress(value) {
      progress = Math.max(0, Math.min(100, Math.round(value)));
      if (progressCircle) progressCircle.style.strokeDashoffset = String(100 - progress);
    }
    function finish() {
      if (finished) return;
      finished = true;
      setProgress(100);
      window.setTimeout(function () {
        preloader.classList.add('sf-loaded');
        window.setTimeout(function () { preloader.remove(); }, 650);
      }, 180);
    }
    function animateToReady() {
      const timer = window.setInterval(function () {
        if (progress >= 100) { window.clearInterval(timer); finish(); return; }
        setProgress(progress + 2);
      }, 20);
    }
    function onReady() {
      if (finished) return;
      window.clearTimeout(fallback);
      animateToReady();
    }

    setProgress(1);
    fallback = window.setTimeout(function () { if (!finished) animateToReady(); }, 5000);
    window.addEventListener('steemflags:ready', onReady, { once: true });
    window.addEventListener('load', function () { window.setTimeout(onReady, 120); }, { once: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPreloader, { once: true });
  else initPreloader();
})();
