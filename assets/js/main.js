/* ============================================================================
   GALLERY BARBERS — site behaviour
   Vanilla JS, no dependencies, no build step.

   Everything here degrades gracefully:
     • no JS      → the page is fully readable and every link works
     • reduced motion → animation is skipped, never faked with a delay
     • no consent → the Google Map is simply not loaded
   ========================================================================= */
(function () {
  'use strict';

  var CFG  = window.GB_CONFIG || {};
  var doc  = document;
  var root = doc.documentElement;

  var $  = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var motionOK = function () { return root.getAttribute('data-motion') === 'full'; };

  /* ══════════════════════════════════════════════════ 1. CONFIG WIRE-UP ══ */
  function applyConfig() {
    var phone = CFG.phone || '+447955040765';
    var waNum = CFG.whatsapp || '447955040765';
    var greet = CFG.whatsappGreeting || "Hi Gallery Barbers, I'd like to book an appointment.";
    var waUrl = 'https://wa.me/' + waNum + '?text=' + encodeURIComponent(greet);

    $$('[data-tel-link]').forEach(function (a) { a.href = 'tel:' + phone; });
    $$('[data-phone-display]').forEach(function (el) {
      el.textContent = CFG.phoneDisplay || phone;
    });
    $$('[data-wa-link]').forEach(function (a) {
      a.href = waUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });

    if (CFG.maps && CFG.maps.directionsUrl) {
      $$('[data-directions-link]').forEach(function (a) { a.href = CFG.maps.directionsUrl; });
    }
    if (CFG.maps && CFG.maps.reviewsUrl) {
      $$('[data-reviews-link]').forEach(function (a) { a.href = CFG.maps.reviewsUrl; });
    }

    /* Social: a placeholder only becomes a real link once a URL exists. */
    var social = CFG.social || {};
    $$('[data-social]').forEach(function (el) {
      var key = el.getAttribute('data-social');
      var url = social[key];
      if (!url || el.tagName === 'A') return;          // already live, or still empty
      var a = doc.createElement('a');
      a.className = 'social-link';
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('data-social', key);
      a.innerHTML = el.innerHTML.replace(/\s*&mdash;\s*URL needed/i, '')
                                .replace(/\s*—\s*URL needed/i, '');
      el.replaceWith(a);
    });

    /* Opening hours — rendered from config so there is one source of truth. */
    renderHours();

    var y = new Date().getFullYear();
    ['year', 'mapYear'].forEach(function (id) {
      var el = doc.getElementById(id);
      if (el) el.textContent = y;
    });
  }

  function renderHours() {
    var lists = $$('#hoursList, #hoursListAside');
    var h = CFG.hours;
    if (!lists.length || !h) return;

    var days = [
      ['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'],
      ['thu', 'Thursday'], ['fri', 'Friday'], ['sat', 'Saturday'], ['sun', 'Sunday']
    ];
    var fmt = function (t) {
      var p = t.split(':');
      var hh = parseInt(p[0], 10);
      return p[1] === '00' ? hh + ':00' : hh + ':' + p[1];
    };

    /* Collapse consecutive days that share the same hours: "Mon – Sat". */
    var rows = [], run = null;
    days.forEach(function (d) {
      var v = h[d[0]];
      var key = v ? v.join('-') : 'closed';
      if (run && run.key === key) { run.end = d[1]; }
      else { run = { key: key, start: d[1], end: d[1], val: v }; rows.push(run); }
    });

    var html = rows.map(function (r) {
      var label = r.start === r.end ? r.start : r.start + ' – ' + r.end;
      var value = r.val ? fmt(r.val[0]) + ' – ' + fmt(r.val[1]) : 'Closed';
      return '<div class="hours__row' + (r.val ? '' : ' is-closed') + '">' +
             '<span>' + label + '</span><span>' + value + '</span></div>';
    }).join('');
    lists.forEach(function (list) { list.innerHTML = html; });
  }

  /* ═══════════════════════════════════════════════════════ 2. HEADER ═════ */
  function initHeader() {
    var header = $('#siteHeader');
    if (!header) return;
    var ticking = false;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ══════════════════════════════════════════════════ 3. MOBILE NAV ══════ */
  function initMobileNav() {
    var toggle = $('#navToggle');
    var panel  = $('#mobileNav');
    if (!toggle || !panel) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      root.style.overflow = open ? 'hidden' : '';
      if (open) {
        var first = panel.querySelector('a');
        if (first) first.focus();
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) { setOpen(false); toggle.focus(); }
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false); toggle.focus();
      }
    });

    /* Close the drawer if the viewport grows past the desktop breakpoint. */
    var mq = window.matchMedia('(min-width: 900px)');
    var onChange = function (e) { if (e.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ═══════════════════════════════════════════════════ 4. SCROLL SPY ═════ */
  function initScrollSpy() {
    var links = $$('.nav__link');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (l) {
      var id = l.getAttribute('href').slice(1);
      var sec = doc.getElementById(id);
      if (sec) map[id] = l;
    });

    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { seen[en.target.id] = en.isIntersecting; });
      var current = null;
      Object.keys(map).forEach(function (id) { if (seen[id] && !current) current = id; });
      links.forEach(function (l) { l.removeAttribute('aria-current'); });
      if (current && map[current]) map[current].setAttribute('aria-current', 'true');
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    Object.keys(map).forEach(function (id) { io.observe(doc.getElementById(id)); });
  }

  /* ════════════════════════════════════════════════════ 5. REVEALS ═══════ */
  function initReveals() {
    var els = $$('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window) || !motionOK()) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        obs.unobserve(en.target);          // reveal once, then stop watching
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ══════════════════════════════════════════════ 6. HERO PARALLAX ═══════ */
  /* Hero only, background layer only, small delta — never on text. */
  function initParallax() {
    var media = $('#heroMedia');
    var hero  = media && media.closest('.hero');
    if (!media || !hero || !motionOK()) return;
    if (window.matchMedia('(hover: none) and (max-width: 640px)').matches) return;

    var ticking = false, active = true;

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        active = e[0].isIntersecting;
        media.style.willChange = active ? 'transform' : '';
      }, { threshold: 0 }).observe(hero);
    }

    function update() {
      var h = hero.offsetHeight || 1;
      var p = Math.min(1, Math.max(0, window.scrollY / h));
      media.style.transform = 'translate3d(0,' + (p * 9).toFixed(2) + '%,0)';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!active || ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* ════════════════════════════════════════════════ 7. COUNT-UP STATS ════ */
  function initCounters() {
    var els = $$('[data-count-to]');
    if (!els.length) return;

    if (!('IntersectionObserver' in window) || !motionOK()) {
      els.forEach(function (el) { el.textContent = el.getAttribute('data-count-to'); });
      return;
    }

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        countUp(en.target);
        obs.unobserve(en.target);
      });
    }, { threshold: 0.5 });

    els.forEach(function (el) { io.observe(el); });
  }

  function countUp(el) {
    var target   = parseFloat(el.getAttribute('data-count-to')) || 0;
    var decimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;
    var dur = 1400, t0 = null;

    el.textContent = (0).toFixed(decimals);
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);            // easeOutCubic
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) window.requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals);
    }
    window.requestAnimationFrame(frame);
  }

  /* ══════════════════════════════════════════════════ 8. TRUST STRIP ═════ */
  function initStrip() {
    var track = $('#stripTrack');
    if (!track || !motionOK()) return;
    /* Duplicate the items so translateX(-50%) loops without a seam. */
    track.innerHTML += track.innerHTML;
  }

  /* ═══════════════════════════════════════════ 9. GALLERY + LIGHTBOX ═════ */
  function initGallery() {
    var grid    = $('#galleryGrid');
    var filters = $$('.filter');
    var empty   = $('#galleryEmpty');
    if (!grid) return;

    var tiles = $$('.tile', grid);

    function applyFilter(cat) {
      var shown = 0;
      tiles.forEach(function (t) {
        var match = cat === 'all' || t.getAttribute('data-cat') === cat;
        t.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      filters.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === cat));
      });
    }

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyFilter(btn.getAttribute('data-filter'));
      });
    });

    /* ── lightbox ── */
    var dlg   = $('#lightbox');
    var img   = $('#lbImg');
    var cap   = $('#lbCap');
    var catEl = $('#lbCat');
    var count = $('#lbCount');
    if (!dlg || !dlg.showModal) return;

    var items = [], index = 0, opener = null;

    function collect() {
      items = $$('.tile:not([hidden]) .tile__btn[data-full]', grid);
    }

    function show(i) {
      if (!items.length) return;
      index = (i + items.length) % items.length;
      var btn = items[index];
      var thumb = btn.querySelector('img');
      img.src = btn.getAttribute('data-full');
      img.alt = thumb ? thumb.alt : '';
      cap.textContent = btn.getAttribute('data-cap') || '';
      catEl.textContent = btn.getAttribute('data-cat-label') || '';
      count.textContent = (index + 1) + ' / ' + items.length;
    }

    function open(btn) {
      collect();
      var i = items.indexOf(btn);
      if (i < 0) return;
      opener = btn;
      show(i);
      root.style.overflow = 'hidden';
      dlg.showModal();
    }

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.tile__btn[data-full]');
      if (btn) open(btn);
    });

    /* Release the scroll lock and hand focus back. Safe to call twice — some
       engines never fire `close`, so this is driven from every exit path
       rather than from that one event. */
    function restore() {
      root.style.overflow = '';
      img.removeAttribute('src');
      if (opener) { opener.focus(); opener = null; }
    }
    function close() {
      var trigger = opener;
      restore();
      if (dlg.open) dlg.close();
      /* Re-focus after close(): the browser restores focus itself as the dialog
         closes, which would otherwise overwrite what restore() just set. */
      if (trigger) trigger.focus();
    }

    $('#lbNext').addEventListener('click', function () { show(index + 1); });
    $('#lbPrev').addEventListener('click', function () { show(index - 1); });
    $('#lbClose').addEventListener('click', close);

    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
      else if (e.key === 'Home') { e.preventDefault(); show(0); }
      else if (e.key === 'End') { e.preventDefault(); show(items.length - 1); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });

    /* click the backdrop to dismiss */
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) close();
    });

    dlg.addEventListener('cancel', restore);   /* native Escape */
    dlg.addEventListener('close', restore);    /* backstop */
  }

  /* ═══════════════════════════════════════════ 10. CONSENT + THE MAP ═════ */
  var CONSENT_KEY = 'gb-consent';

  function readConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function writeConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
  }

  function mapSrc() {
    var m = CFG.maps || {};
    var q = encodeURIComponent(m.query || 'Gallery Barbers, Leeds Kirkgate Market, Leeds LS2 7HJ');
    /* Official Maps Embed API when a key is configured; otherwise the standard
       keyless Google Maps embed. Both keep Google's branding and attribution. */
    return m.apiKey
      ? 'https://www.google.com/maps/embed/v1/place?key=' + encodeURIComponent(m.apiKey) + '&q=' + q + '&zoom=17'
      : 'https://www.google.com/maps?q=' + q + '&z=17&output=embed';
  }

  function loadMap() {
    var holder  = $('#mapHolder');
    var consent = $('#mapConsent');
    if (!holder || holder.querySelector('iframe')) return;

    var frame = doc.createElement('iframe');
    frame.src = mapSrc();
    frame.title = 'Google Map showing Gallery Barbers, Stall 10–11, Leeds Kirkgate Market';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.allowFullscreen = true;
    holder.appendChild(frame);
    if (consent) consent.remove();
  }

  function initConsent() {
    var bar    = $('#cookiebar');
    var okBtn  = $('#cookieOk');
    var mapBtn = $('#cookieMapOk');
    var loadBtn = $('#loadMapBtn');
    var state  = readConsent();

    if (loadBtn) {
      loadBtn.addEventListener('click', function () {
        writeConsent('maps');
        loadMap();
      });
    }

    if (state === 'maps') loadMap();

    if (!bar) return;
    if (!state) {
      /* Let the hero land before asking anything. No non-essential script is
         waiting on this answer, so a short delay costs nothing. */
      window.setTimeout(function () { bar.hidden = false; }, 900);
    }
    if (okBtn) okBtn.addEventListener('click', function () {
      writeConsent('essential'); bar.hidden = true;
    });
    if (mapBtn) mapBtn.addEventListener('click', function () {
      writeConsent('maps'); bar.hidden = true; loadMap();
    });
  }

  /* ══════════════════════════════════════════════ 11. MOTION TOGGLE ══════ */
  function initMotionToggle() {
    var btn   = $('#motionToggle');
    var state = $('#motionState');
    if (!btn) return;

    function paint() {
      var reduced = !motionOK();
      if (state) state.textContent = reduced ? 'off' : 'on';
      btn.setAttribute('aria-pressed', String(reduced));
      btn.setAttribute('aria-label',
        reduced ? 'Animation is off. Turn animation on.' : 'Animation is on. Turn animation off.');
    }

    btn.addEventListener('click', function () {
      var next = motionOK() ? 'reduced' : 'full';
      root.setAttribute('data-motion', next);
      try { localStorage.setItem('gb-motion', next); } catch (e) {}
      paint();
      if (next === 'full') { initStrip(); initParallax(); }
      else {
        $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
        var media = $('#heroMedia');
        if (media) media.style.transform = '';
      }
    });

    paint();
  }

  /* ════════════════════════════════════════════ 12. STICKY MOBILE CTA ════ */
  function initCtaBar() {
    var bar = $('#ctaBar');
    if (!bar) return;

    var hero    = $('.hero');
    var booking = $('#book');
    var pastHero = false, inBooking = false;

    function paint() {
      var on = pastHero && !inBooking;
      bar.classList.toggle('is-visible', on);
      /* The cookie notice reads this so the two never stack on top of each other. */
      doc.body.classList.toggle('cta-on', on);
    }

    if (!('IntersectionObserver' in window)) { bar.classList.add('is-visible'); return; }

    if (hero) {
      new IntersectionObserver(function (e) {
        pastHero = !e[0].isIntersecting; paint();
      }, { threshold: 0, rootMargin: '-70% 0px 0px 0px' }).observe(hero);
    } else { pastHero = true; }

    /* Don't cover the booking form while someone is filling it in. */
    if (booking) {
      new IntersectionObserver(function (e) {
        inBooking = e[0].isIntersecting; paint();
      }, { threshold: 0 }).observe(booking);
    }
    paint();
  }

  /* ══════════════════════════════════════════════════════════ BOOT ═══════ */
  function boot() {
    applyConfig();
    initHeader();
    initMobileNav();
    initScrollSpy();
    initReveals();
    initParallax();
    initCounters();
    initStrip();
    initGallery();
    initConsent();
    initMotionToggle();
    initCtaBar();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
