(function () {
  'use strict';

  function initPreloader() {
    const preloader = document.getElementById('sf-preloader');
    if (!preloader || preloader.dataset.initialized === '1') return;
    preloader.dataset.initialized = '1';

    const progressCircle = preloader.querySelector('.sf-loader-ring-progress');
    const turbulence = preloader.querySelector('#sfFlagWave feTurbulence');
    const displacement = preloader.querySelector('#sfFlagWave feDisplacementMap');
    let progress = 0;
    let finished = false;
    let waveFrame = 0;
    const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setProgress(value) {
      progress = Math.max(0, Math.min(100, Math.round(value)));
      if (progressCircle) {
        progressCircle.style.strokeDasharray = '100';
        progressCircle.style.strokeDashoffset = String(100 - progress);
      }
    }

    function animateFlagWave(time) {
      if (!motionOK || finished || !turbulence || !displacement) return;
      const t = time * 0.001;
      const x = 0.018 + Math.sin(t * 1.55) * 0.004;
      const y = 0.055 + Math.cos(t * 1.15) * 0.012;
      const strength = 8 + (Math.sin(t * 1.8) + 1) * 2.5;
      turbulence.setAttribute('baseFrequency', x.toFixed(4) + ' ' + y.toFixed(4));
      displacement.setAttribute('scale', strength.toFixed(2));
      waveFrame = window.requestAnimationFrame(animateFlagWave);
    }

    function stopFlagWave() {
      if (waveFrame) window.cancelAnimationFrame(waveFrame);
    }

    function finish() {
      if (finished) return;
      finished = true;
      stopFlagWave();
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

    setProgress(1);
    if (motionOK) waveFrame = window.requestAnimationFrame(animateFlagWave);

    const fallback = window.setTimeout(function () {
      if (!finished) animateToReady();
    }, 3500);

    function onReady() {
      if (finished) return;
      window.clearTimeout(fallback);
      animateToReady();
    }

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
