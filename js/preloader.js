(function () {
  'use strict';

  const LOGO_URL = 'https://raw.githubusercontent.com/mehdiq1980/steemflags/275937b489fd47e79ec71d509dae12ca8dc772e6/assets/steemflags_logo.png';

  function initPreloader() {
    const preloader = document.getElementById('sf-preloader');
    if (!preloader || preloader.dataset.initialized === '1') return;
    preloader.dataset.initialized = '1';

    const progressCircle = preloader.querySelector('.sf-loader-ring-progress');
    const canvas = preloader.querySelector('.sf-loader-flag-wave');
    const baseLogo = preloader.querySelector('.sf-loader-logo-base');
    const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let progress = 0;
    let finished = false;
    let waveFrame = 0;
    let flagImage = null;
    let resizeObserver = null;
    let fallback = 0;

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

    function clothPath(ctx, w, h) {
      // Exact animation mask is deliberately confined to the fabric silhouette.
      // The pole, badge, text and all lower logo artwork remain outside this path.
      const left = w * 0.090;
      const right = w * 0.905;
      ctx.beginPath();
      ctx.moveTo(left, h * 0.028);
      ctx.lineTo(right, h * 0.028);
      ctx.lineTo(right, h * 0.285);
      ctx.bezierCurveTo(w * 0.835, h * 0.305, w * 0.755, h * 0.350, w * 0.665, h * 0.345);
      ctx.bezierCurveTo(w * 0.555, h * 0.338, w * 0.500, h * 0.300, w * 0.405, h * 0.315);
      ctx.bezierCurveTo(w * 0.295, h * 0.333, w * 0.205, h * 0.345, left, h * 0.305);
      ctx.closePath();
    }

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

      // First render the official logo exactly as supplied. This guarantees that
      // every part except the fabric is pixel-stable.
      ctx.drawImage(flagImage, 0, 0, w, h);

      const left = w * 0.090;
      const right = w * 0.905;
      const top = h * 0.028;
      const bottom = h * 0.345;
      const cols = Math.max(36, Math.min(72, Math.round(w / 4)));
      const t = time * 0.001;
      const sourceW = flagImage.naturalWidth;
      const sourceH = flagImage.naturalHeight;
      const sy = sourceH * 0.028;
      const sh = sourceH * 0.317;

      // Only the fabric mask can receive the deformation.
      ctx.save();
      clothPath(ctx, w, h);
      ctx.clip();

      for (let i = 0; i < cols; i++) {
        const u0 = i / cols;
        const u1 = (i + 1) / cols;
        const x0 = left + (right - left) * u0;
        const stripW = (right - left) / cols + 1.2;

        // Pinned at the pole, increasingly flexible toward the free edge.
        const influence = Math.pow(u0, 1.85);
        const primary = Math.sin(t * 4.15 - u0 * 12.5) * (1.0 + influence * 7.2);
        const secondary = Math.sin(t * 6.1 - u0 * 20.0 + 0.9) * influence * 1.7;
        const waveY = primary + secondary;
        const depth = Math.cos(t * 4.15 - u0 * 12.5) * influence * 2.6;
        const shear = Math.sin(t * 4.15 - u0 * 12.5 + 0.8) * influence * 0.075;

        // Subtle perspective compression makes the fabric fold rather than slide.
        const scaleX = 1 - influence * 0.055 + depth * 0.002;
        const sourceX = sourceW * u0;
        const sourceStripW = Math.max(1, sourceW * (u1 - u0));

        ctx.save();
        ctx.translate(x0, top + waveY);
        ctx.transform(scaleX, shear, 0, 1, 0, 0);
        ctx.drawImage(flagImage, sourceX, sy, sourceStripW, sh, 0, 0, stripW, bottom - top + 2);
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

    // The base <img> is retained as the authoritative source but hidden visually;
    // the canvas draws it unchanged first and then deforms only the fabric mask.
    if (baseLogo) baseLogo.style.visibility = 'hidden';

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
