/* ============================================================================
   GALLERY BARBERS — hero cloth
   ----------------------------------------------------------------------------
   A barber's cape, pinned along the top and moving in the draught, with the
   shop's name woven into it. Verlet cloth physics on a Three.js plane.

   This is the vanilla-JS port of components/ui/woven-cloth.tsx. Same simulation,
   same palette; it runs directly on a <canvas> in the page rather than inside a
   sandboxed iframe, so it costs one script instead of five.

   It is strictly an enhancement. The hero photograph paints immediately and
   stays put underneath; the cloth only ever fades in on top of it, and only when
   all of the following hold:
     • the visitor has not asked for reduced motion
     • the browser reports a connection that is not 2g / save-data
     • WebGL is available
     • the browser is idle after load
   If anything fails, the hero is the photograph and nothing is lost.
   ========================================================================= */
(function () {
  'use strict';

  var THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

  var canvas = document.getElementById('heroCloth');
  var hero = canvas && canvas.closest('.hero');
  if (!canvas || !hero) return;

  /* ── gates ──────────────────────────────────────────────────────────────── */
  function motionAllowed() {
    return document.documentElement.getAttribute('data-motion') === 'full';
  }
  function connectionOk() {
    var c = navigator.connection;
    if (!c) return true;
    if (c.saveData) return false;
    return !/(^|\W)(slow-)?2g$/.test(c.effectiveType || '');
  }
  function webglOk() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  if (!motionAllowed() || !connectionOk() || !webglOk()) return;

  /* ── the woven texture ──────────────────────────────────────────────────── */
  function makeClothTexture(THREE) {
    var W = 1280, H = 800;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var x = c.getContext('2d');

    /* charcoal ground */
    var g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1C1C20');
    g.addColorStop(0.5, '#141417');
    g.addColorStop(1, '#0D0D10');
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);

    /* antique-gold hem */
    x.strokeStyle = '#C6A15B'; x.lineWidth = 9;
    x.strokeRect(46, 46, W - 92, H - 92);
    x.strokeStyle = '#7A6030'; x.lineWidth = 3;
    x.strokeRect(66, 66, W - 132, H - 132);

    x.textAlign = 'center';
    x.textBaseline = 'middle';

    /* Tone-on-tone, the way a name is actually woven into dark cloth. Bright
       lettering here reads as a second headline and fights the real one. */
    x.fillStyle = '#6B5734';
    x.font = 'bold 74px Georgia, "Times New Roman", serif';
    x.fillText('G B', W / 2, 176);

    x.font = 'normal 20px "Helvetica Neue", Arial, sans-serif';
    x.fillStyle = '#54462A';
    x.fillText('· LEEDS ·', W / 2, 232);

    x.fillStyle = '#3E3E46';
    x.font = 'bold 112px Georgia, "Times New Roman", serif';
    x.fillText('GALLERY', W / 2, 372);
    x.fillText('BARBERS', W / 2, 488);

    x.fillStyle = '#54462A';
    x.font = '600 25px "Helvetica Neue", Arial, sans-serif';
    x.fillText('K I R K G A T E   M A R K E T', W / 2, 590);
    x.font = '600 19px "Helvetica Neue", Arial, sans-serif';
    x.fillStyle = '#453A22';
    x.fillText('S T A L L   1 0 – 1 1', W / 2, 632);

    /* weave: warp and weft threads */
    for (var yy = 0; yy < H; yy += 3) {
      x.strokeStyle = 'rgba(0,0,0,0.16)'; x.lineWidth = 1;
      x.beginPath(); x.moveTo(0, yy + .5); x.lineTo(W, yy + .5); x.stroke();
    }
    for (var xx = 0; xx < W; xx += 3) {
      x.strokeStyle = 'rgba(255,246,230,0.045)'; x.lineWidth = 1;
      x.beginPath(); x.moveTo(xx + .5, 0); x.lineTo(xx + .5, H); x.stroke();
    }

    /* slub noise, so the fabric is never flat */
    var id = x.getImageData(0, 0, W, H), d = id.data;
    for (var i = 0; i < d.length; i += 4) {
      var n = (Math.random() * 2 - 1) * 9;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    x.putImageData(id, 0, 0);

    var tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* ── simulation ─────────────────────────────────────────────────────────── */
  function run(THREE) {
    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    var camera;

    var BW = 4.4, BH = 2.75, GX = 40, GY = 26;
    var geo = new THREE.PlaneGeometry(BW, BH, GX, GY);
    var mat = new THREE.MeshPhongMaterial({
      map: makeClothTexture(THREE),
      side: THREE.DoubleSide,
      shininess: 8,
      specular: 0x2A2418,
      color: 0xffffff
    });
    scene.add(new THREE.Mesh(geo, mat));

    scene.add(new THREE.AmbientLight(0xFFE9D0, 0.58));
    var key = new THREE.DirectionalLight(0xFFF0DC, 1.05);
    key.position.set(-3, 3.5, 3.2); scene.add(key);
    var rim = new THREE.DirectionalLight(0xC6A15B, 0.5);
    rim.position.set(3, -1.5, 2.0); scene.add(rim);

    var pos = geo.attributes.position;
    var N = (GX + 1) * (GY + 1);
    var cur = new Float32Array(N * 3), prev = new Float32Array(N * 3), rest = new Float32Array(N * 3);
    var pinned = new Uint8Array(N);

    for (var i = 0; i < N; i++) {
      var ax = pos.getX(i), ay = pos.getY(i);
      cur[i * 3] = prev[i * 3] = rest[i * 3] = ax;
      cur[i * 3 + 1] = prev[i * 3 + 1] = rest[i * 3 + 1] = ay;
      cur[i * 3 + 2] = prev[i * 3 + 2] = rest[i * 3 + 2] = 0;
    }
    for (var ix0 = 0; ix0 <= GX; ix0++) pinned[ix0] = 1;   /* hang it from the top */

    var idx = function (ix, iy) { return ix + iy * (GX + 1); };
    var restH = BW / GX, restV = BH / GY;
    var GRAV = -3.1, DAMP = 0.985, DT = 0.016;

    function wind(ix, iy, t) {
      var cx = ix / GX, cy = iy / GY;
      var travel = t * 1.7 - cy * 4.2;
      var gust = 0.6 + 0.42 * Math.sin(t * 0.6) + 0.18 * Math.sin(t * 1.9 + 1.3);
      var amp = 4.3 * cy;
      return [
        Math.sin(t * 0.9 + cy * 2.2) * 0.6 * cy,
        -0.4 * cy,
        (Math.sin(travel + cx * 3.3) + 0.5 * Math.sin(travel * 1.7 + cx * 6.0)) * amp * gust
      ];
    }

    function solve(a, b, rl) {
      var dx = cur[b * 3] - cur[a * 3];
      var dy = cur[b * 3 + 1] - cur[a * 3 + 1];
      var dz = cur[b * 3 + 2] - cur[a * 3 + 2];
      var d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
      var diff = (d - rl) / d * 0.5;
      dx *= diff; dy *= diff; dz *= diff;
      var pa = pinned[a], pb = pinned[b];
      if (!pa && !pb) {
        cur[a * 3] += dx; cur[a * 3 + 1] += dy; cur[a * 3 + 2] += dz;
        cur[b * 3] -= dx; cur[b * 3 + 1] -= dy; cur[b * 3 + 2] -= dz;
      } else if (pa && !pb) {
        cur[b * 3] -= dx * 2; cur[b * 3 + 1] -= dy * 2; cur[b * 3 + 2] -= dz * 2;
      } else if (!pa && pb) {
        cur[a * 3] += dx * 2; cur[a * 3 + 1] += dy * 2; cur[a * 3 + 2] += dz * 2;
      }
    }

    function step(t) {
      for (var iy = 0; iy <= GY; iy++) {
        for (var ix = 0; ix <= GX; ix++) {
          var i = idx(ix, iy);
          if (pinned[i]) continue;
          var f = wind(ix, iy, t);
          for (var k = 0; k < 3; k++) {
            var j = i * 3 + k;
            var a = k === 0 ? f[0] : k === 1 ? (f[1] + GRAV) : f[2];
            var v = (cur[j] - prev[j]) * DAMP;
            prev[j] = cur[j];
            cur[j] = cur[j] + v + a * DT * DT;
          }
        }
      }
      for (var it = 0; it < 3; it++) {
        for (var y1 = 0; y1 <= GY; y1++)
          for (var x1 = 0; x1 < GX; x1++) solve(idx(x1, y1), idx(x1 + 1, y1), restH);
        for (var y2 = 0; y2 < GY; y2++)
          for (var x2 = 0; x2 <= GX; x2++) solve(idx(x2, y2), idx(x2, y2 + 1), restV);
      }
      for (var p = 0; p <= GX; p++) {
        for (var c2 = 0; c2 < 3; c2++) {
          cur[p * 3 + c2] = rest[p * 3 + c2];
          prev[p * 3 + c2] = rest[p * 3 + c2];
        }
      }
    }

    function commit() {
      for (var i = 0; i < N; i++) pos.setXYZ(i, cur[i * 3], cur[i * 3 + 1], cur[i * 3 + 2]);
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }

    function fit() {
      var w = hero.clientWidth || window.innerWidth;
      var h = hero.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      var aspect = w / h;
      camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
      var vFit = (BH / 2) / Math.tan(42 * Math.PI / 360);
      var hFit = (BW / 2) / Math.tan(42 * Math.PI / 360) / aspect;
      camera.position.set(0, 0.05, Math.max(vFit, hFit) * 1.16 + 0.4);
      camera.lookAt(0, -0.34, 0);   /* lift the cape clear of the headline */
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fit, 150);
    }, { passive: true });
    fit();

    var running = false, raf = 0, t = 0, inView = true;

    function loop() {
      if (!running) return;
      t += DT; step(t); commit();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    }
    function start() { if (running) return; running = true; raf = requestAnimationFrame(loop); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    /* settle the cloth before it is ever shown, so it fades in already hanging */
    for (var s = 0; s < 60; s++) step(s * DT);
    t = 60 * DT;
    commit();
    renderer.render(scene, camera);

    hero.classList.add('has-cloth');
    start();

    /* never burn a frame off-screen or in a background tab */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        inView = e[0].isIntersecting;
        if (inView && !document.hidden) start(); else stop();
      }, { threshold: 0 }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden || !inView) stop(); else start();
    });

    /* the footer motion toggle can switch it off mid-visit */
    new MutationObserver(function () {
      if (document.documentElement.getAttribute('data-motion') === 'full') {
        if (inView) start();
      } else {
        stop();
        hero.classList.remove('has-cloth');
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  }

  /* ── load Three.js once the browser has nothing better to do ────────────── */
  function boot() {
    import(THREE_URL)
      .then(function (THREE) { run(THREE); })
      .catch(function () { /* offline or blocked: the photograph is the hero */ });
  }

  function whenIdle() {
    if ('requestIdleCallback' in window) window.requestIdleCallback(boot, { timeout: 2500 });
    else setTimeout(boot, 1200);
  }

  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
})();
