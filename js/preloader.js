(function () {
  'use strict';

  const LOGO_URL = 'https://raw.githubusercontent.com/mehdiq1980/steemflags/275937b489fd47e79ec71d509dae12ca8dc772e6/assets/steemflags_logo.png';

  function initPreloader() {
    const preloader = document.getElementById('sf-preloader');
    if (!preloader || preloader.dataset.initialized === '1') return;
    preloader.dataset.initialized = '1';

    const progressCircle = preloader.querySelector('.sf-loader-ring-progress');
    const canvas = preloader.querySelector('.sf-loader-flag-wave');
    const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let progress = 0;
    let finished = false;
    let waveFrame = 0;
    let flagImage = null;
    let resizeObserver = null;

    function setProgress(value) {
      progress = Math.max(0, Math.min(100, Math.round(value)));
      if (progressCircle) {
        progressCircle.style.strokeDasharray = '100';
        progressCircle.style.strokeDashoffset = String(100 - progress);
      }
    }

    function resizeCanvas() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    }

    // The cloth is represented by vertical strips. The hoist edge stays almost fixed;
    // wave amplitude grows toward the free edge, producing the characteristic flag motion.
    function drawFlagCloth(time) {
      if (!canvas || !flagImage || !flagImage.complete || !flagImage.naturalWidth) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) resizeCanvas();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Coordinates are normalized to the official logo. Only this polygon is drawn.
      const left = w * 0.092;
      const right = w * 0.92;
      const top = h * 0.028;
      const bottom = h * 0.36;
      const cols = Math.max(28, Math.min(64, Math.round(w / 5)));
      const t = time * 0.001;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, bottom * 0.97);
      ctx.bezierCurveTo(w * 0.83, h * 0.34, w * 0.72, h * 0.40, w * 0.61, h * 0.36);
      ctx.bezierCurveTo(w * 0.50, h * 0.32, w * 0.41, h * 0.40, w * 0.30, h * 0.36);
      ctx.bezierCurveTo(w * 0.20, h * 0.33, w * 0.13, h * 0.38, left, h * 0.34);
      ctx.closePath();
      ctx.clip();

      // Draw narrow source strips with a phase-delayed displacement. This creates
      // propagating folds instead of rotating the whole logo.
      const sourceW = flagImage.naturalWidth;
      const sourceH = flagImage.naturalHeight;
      for (let i = 0; i < cols; i++) {
        const u0 = i / cols;
        const u1 = (i + 1) / cols;
        const x0 = left + (right - left) * u0;
        const x1 = left + (right - left) * u1;
        const amp = 0.8 + Math.pow(u0, 1.7) * 5.8;
        const phase = t * 3.0 - u0 * 10.5;
        const wave = Math.sin(phase) * amp + Math.sin(phase * 0.47 + 1.4) * amp * 0.22;
        const depth = Math.cos(phase) * amp * 0.34;
        const shear = Math.sin(phase + 0.7) * amp * 0.10;
        const sy = sourceH * 0.028;
        const sh = sourceH * 0.34;
        const sx = sourceW * u0;
        const sw = Math.max(1, sourceW * (u1 - u0));
        ctx.save();
        ctx.translate(x0, top + wave);
        ctx.transform(1, shear / Math.max(1, h), depth / Math.max(1, w), 1, 0, 0);
        ctx.drawImage(flagImage, sx, sy, sw, sh, 0, 0, x1 - x0 + 1, bottom - top + 2);
        ctx.restore();
      }
      ctx.restore();
    }

    function animateFlagWave(time) {
      if (!motionOK || finished) return;
      drawFlagCloth(time);
      waveFrame = window.requestAnimationFrame(animateFlagWave);
    }

    function stopFlagWave() {
      if (waveFrame) window.cancelAnimationFrame(waveFrame);
      waveFrame = 0;
      if (resizeObserver) resizeObserver.disconnect();
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

    function onReady() {
      if (finished) return;
      window.clearTimeout(fallback);
      animateToReady();
    }

    flagImage = new Image();
    flagImage.decoding = 'async';
    flagImage.onload = function () {
      resizeCanvas();
      drawFlagCloth(performance.now());
      if (motionOK) waveFrame = window.requestAnimationFrame(animateFlagWave);
    };
    flagImage.src = LOGO_URL;

    if (window.ResizeObserver && canvas) {
      resizeObserver = new ResizeObserver(resizeCanvas);
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener('resize', resizeCanvas, { passive: true });
    }

    setProgress(1);

    const fallback = window.setTimeout(function () {
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
