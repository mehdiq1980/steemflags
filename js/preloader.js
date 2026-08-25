(function () {
  'use strict';

  function initPreloader() {
    const preloader = document.getElementById('sf-preloader');
    if (!preloader || preloader.dataset.initialized === '1') return;
    preloader.dataset.initialized = '1';

    const progressCircle = preloader.querySelector('.sf-loader-ring-progress');
    let progress = 0;
    let finished = false;
    let fallback = 0;

    function setProgress(value) {
      progress = Math.max(0, Math.min(100, Math.round(value)));
      if (progressCircle) {
        progressCircle.style.strokeDasharray = '100';
        progressCircle.style.strokeDashoffset = String(100 - progress);
      }
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
        if (progress >= 100) {
          window.clearInterval(timer);
          finish();
          return;
        }
        setProgress(progress + 2);
      }, 20);
    }

    function onReady() {
      if (finished) return;
      window.clearTimeout(fallback);
      animateToReady();
    }

    setProgress(1);

    fallback = window.setTimeout(function () {
      if (!finished) animateToReady();
    }, 3500);

    window.addEventListener('steemflags:ready', onReady, { once: true });
    window.addEventListener('load', function () {
      window.setTimeout(onReady, 120);
    }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreloader, { once: true });
  } else {
    initPreloader();
  }
})();
