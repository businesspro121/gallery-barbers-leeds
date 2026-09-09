/* ============================================================================
   GALLERY BARBERS — booking flow

   Three steps + a review pane. The service menu is read straight out of the
   Services section of index.html, so prices only ever live in one place.

   Availability is DEMO by default: slots come from the shop's opening hours in
   config.js, not from a real diary. Nothing here claims a time is confirmed —
   the wording, the badge and the success screen all say so plainly. Flip
   `booking.live` to true only when `booking.endpoint` returns real availability.
   ========================================================================= */
(function () {
  'use strict';

  var CFG  = window.GB_CONFIG || {};
  var BOOK = CFG.booking || {};
  var doc  = document;

  var $  = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  var form = $('#bookForm');
  if (!form) return;

  var els = {
    steps:      $('#bookSteps'),
    panes:      $$('.step', form),
    service:    $('#service'),
    svcDetail:  $('#serviceDetail'),
    barber:     $('#barber'),
    date:       $('#date'),
    slots:      $('#timeSlots'),
    slotsEmpty: $('#slotsEmpty'),
    summary:    $('#bookSummary'),
    back:       $('#backBtn'),
    next:       $('#nextBtn'),
    submit:     $('#submitBtn'),
    submitLbl:  $('#submitLabel'),
    actions:    $('#formActions'),
    errBox:     $('#errSummary'),
    errList:    $('#errSummaryList'),
    success:    $('#bookSuccess'),
    successTtl: $('#successTitle'),
    successMsg: $('#successMsg'),
    successAct: $('#successActions'),
    error:      $('#bookError'),
    errorMsg:   $('#errorMsg'),
    retry:      $('#retryBtn'),
    live:       $('#bookLive'),
    notes:      $('#notes'),
    notesCount: $('#notesCount')
  };

  var LAST_STEP = 4;
  var step = 1;
  var services = [];

  var DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  /* ═════════════════════════════════════════ 1. READ THE SERVICE LIST ════ */
  function readServices() {
    services = $$('.svc').map(function (li) {
      var cat = li.closest('.svc__cat');
      return {
        name:  text(li, '.svc__name'),
        price: text(li, '.svc__price'),
        dur:   text(li, '.svc__dur'),
        desc:  text(li, '.svc__desc'),
        cat:   cat ? text(cat, '.svc__cat-head h3') : 'Services',
        el:    li
      };
    });
  }

  function text(ctx, sel) {
    var el = ctx.querySelector(sel);
    return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
  }

  function buildServiceMenu() {
    if (!els.service) return;
    var groups = {}, order = [];

    services.forEach(function (s) {
      if (!groups[s.cat]) { groups[s.cat] = []; order.push(s.cat); }
      groups[s.cat].push(s);
    });

    var ph = doc.createElement('option');
    ph.value = '';
    ph.textContent = 'Choose a service…';
    els.service.appendChild(ph);

    order.forEach(function (cat) {
      var g = doc.createElement('optgroup');
      g.label = cat;
      groups[cat].forEach(function (s) {
        var o = doc.createElement('option');
        o.value = s.name;
        o.textContent = s.name + ' — ' + s.price;
        g.appendChild(o);
      });
      els.service.appendChild(g);
    });

    els.service.addEventListener('change', function () {
      paintServiceDetail();
      clearError('service');
    });
  }

  function currentService() {
    if (!els.service || !els.service.value) return null;
    for (var i = 0; i < services.length; i++) {
      if (services[i].name === els.service.value) return services[i];
    }
    return null;
  }

  function paintServiceDetail() {
    if (!els.svcDetail) return;
    var s = currentService();
    if (!s) { els.svcDetail.hidden = true; return; }
    els.svcDetail.hidden = false;
    els.svcDetail.innerHTML =
      '<p class="choice__name">' + esc(s.name) + '</p>' +
      '<p class="choice__meta">' + esc(s.price) + ' &middot; ' + esc(s.dur) + '</p>' +
      (s.desc ? '<p class="field__hint" style="margin-top:.35rem">' + esc(s.desc) + '</p>' : '') +
      '<p class="field__hint" style="margin-top:.5rem">Prices are placeholders until the shop confirms them.</p>';
  }

  /* "Book this service" in the price list jumps here with it pre-selected. */
  function wireServiceButtons() {
    $$('[data-book-service]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var li = btn.closest('.svc');
        var name = li ? text(li, '.svc__name') : btn.getAttribute('data-book-service');
        if (els.service) {
          els.service.value = name;
          paintServiceDetail();
          clearError('service');
        }
        showResult(null);
        goTo(1, false);
        var target = doc.getElementById('book');
        if (target) target.scrollIntoView({ behavior: prefersMotion() ? 'smooth' : 'auto', block: 'start' });
        window.setTimeout(function () { if (els.service) els.service.focus({ preventScroll: true }); }, 400);
        announce(name + ' selected. Continue to choose a date and time.');
      });
    });
  }

  function prefersMotion() {
    return doc.documentElement.getAttribute('data-motion') === 'full';
  }

  /* ══════════════════════════════════════════════ 2. DATE + SLOTS ═══════ */
  function initDate() {
    if (!els.date) return;

    var today = new Date();
    var max = new Date();
    max.setDate(max.getDate() + (BOOK.maxDaysAhead || 60));

    els.date.min = iso(today);
    els.date.max = iso(max);

    els.date.addEventListener('change', function () {
      clearError('date');
      buildSlots();
    });
  }

  function iso(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function parseDate(v) {
    if (!v) return null;
    var p = v.split('-');
    if (p.length !== 3) return null;
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d.getTime()) ? null : d;
  }

  function hoursFor(d) {
    var h = CFG.hours || {};
    return h[DAY_KEYS[d.getDay()]] || null;
  }

  function buildSlots() {
    if (!els.slots) return;
    els.slots.innerHTML = '';
    clearError('time');

    var d = parseDate(els.date.value);
    if (!d) { setSlotsMessage('Pick a date first and we’ll show you the times.'); return; }

    var open = hoursFor(d);
    if (!open) {
      setSlotsMessage('We’re closed that day — please pick another date.');
      return;
    }

    var stepMin  = BOOK.slotMinutes || 30;
    var startMin = toMinutes(open[0]);
    var endMin   = toMinutes(open[1]);

    /* For today, don't offer a time that has already gone. */
    var floor = -1;
    var now = new Date();
    if (iso(now) === els.date.value) {
      floor = now.getHours() * 60 + now.getMinutes() + (BOOK.leadTimeHours || 2) * 60;
    }

    var made = 0;
    for (var m = startMin; m <= endMin - stepMin; m += stepMin) {
      if (m < floor) continue;
      els.slots.appendChild(slotEl(m));
      made++;
    }

    if (!made) {
      setSlotsMessage('No times left today — try tomorrow, or message the shop and we’ll fit you in.');
    } else {
      els.slotsEmpty.hidden = true;
      els.slots.hidden = false;
    }
  }

  function slotEl(minutes) {
    var label = fmtTime(minutes);
    var id = 'slot-' + minutes;
    var wrap = doc.createElement('label');
    wrap.className = 'slot';
    wrap.setAttribute('for', id);
    wrap.innerHTML =
      '<input type="radio" name="time" id="' + id + '" value="' + label + '">' +
      '<span class="slot__box">' + label + '</span>';
    wrap.querySelector('input').addEventListener('change', function () { clearError('time'); });
    return wrap;
  }

  function toMinutes(hhmm) {
    var p = String(hhmm).split(':');
    return (+p[0]) * 60 + (+p[1] || 0);
  }
  function fmtTime(m) {
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }

  function setSlotsMessage(msg) {
    els.slotsEmpty.textContent = msg;
    els.slotsEmpty.hidden = false;
    els.slots.hidden = true;
  }

  /* ══════════════════════════════════════════════════ 3. VALIDATION ═════ */
  var RULES = {
    service: {
      step: 1,
      get: function () { return els.service ? els.service.value.trim() : ''; },
      test: function (v) { return !!v; },
      label: 'Service'
    },
    date: {
      step: 2,
      get: function () { return els.date.value; },
      test: function (v) {
        var d = parseDate(v);
        if (!d) return false;
        var today = new Date(); today.setHours(0, 0, 0, 0);
        if (d < today) return false;
        return !!hoursFor(d);
      },
      label: 'Date'
    },
    time: {
      step: 2,
      get: function () { var r = form.querySelector('input[name="time"]:checked'); return r ? r.value : ''; },
      test: function (v) { return !!v; },
      label: 'Time'
    },
    name: {
      step: 3,
      get: function () { return $('#name').value.trim(); },
      test: function (v) { return v.length >= 2; },
      label: 'Full name'
    },
    phone: {
      step: 3,
      get: function () { return $('#phone').value.trim(); },
      test: function (v) {
        var digits = v.replace(/[^\d+]/g, '');
        return /^(\+?44|0)\d{9,11}$/.test(digits);
      },
      label: 'Phone'
    },
    email: {
      step: 3,
      get: function () { return $('#email').value.trim(); },
      test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
      label: 'Email'
    },
    consent: {
      step: 3,
      get: function () { return $('#consent').checked; },
      test: function (v) { return v === true; },
      label: 'Permission to contact you'
    }
  };

  function fieldEl(key) {
    return key === 'service' ? els.service
      : key === 'time' ? form.querySelector('input[name="time"]')
      : doc.getElementById(key);
  }

  function setError(key, on) {
    var msg = doc.getElementById('err-' + key);
    if (msg) msg.hidden = !on;
    var el = fieldEl(key);
    if (el && el.type !== 'radio') el.setAttribute('aria-invalid', String(on));
    else if (el) el.setAttribute('aria-invalid', String(on));
  }
  function clearError(key) { setError(key, false); }

  function validate(keys) {
    var bad = [];
    keys.forEach(function (k) {
      var ok = RULES[k].test(RULES[k].get());
      setError(k, !ok);
      if (!ok) bad.push(k);
    });
    return bad;
  }

  function keysForStep(n) {
    return Object.keys(RULES).filter(function (k) { return RULES[k].step === n; });
  }

  function showSummaryOfErrors(bad) {
    if (!bad.length) { els.errBox.hidden = true; return; }
    els.errList.innerHTML = '';
    bad.forEach(function (k) {
      var li = doc.createElement('li');
      var a = doc.createElement('a');
      a.href = '#';
      a.textContent = RULES[k].label + ' — ' +
        (doc.getElementById('err-' + k) ? doc.getElementById('err-' + k).textContent.trim() : 'needs attention');
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var el = fieldEl(k);
        if (el) el.focus();
      });
      li.appendChild(a);
      els.errList.appendChild(li);
    });
    els.errBox.hidden = false;
    els.errBox.focus();
  }

  /* ═══════════════════════════════════════════════ 4. STEP MACHINERY ════ */
  function goTo(n, announceIt) {
    step = Math.max(1, Math.min(LAST_STEP, n));

    els.panes.forEach(function (p) {
      p.hidden = Number(p.getAttribute('data-step')) !== step;
    });

    $$('.steps__item', els.steps).forEach(function (item, i) {
      var idx = i + 1;
      var visualStep = Math.min(step, 3);
      item.setAttribute('data-state',
        idx < visualStep ? 'done' : idx === visualStep ? 'current' : 'todo');
    });

    els.back.hidden = step === 1;
    els.next.hidden = step === LAST_STEP;
    els.submit.hidden = step !== LAST_STEP;
    els.errBox.hidden = true;

    if (step === LAST_STEP) buildSummary();
    if (announceIt !== false) {
      announce(step === LAST_STEP ? 'Review your booking request.' : 'Step ' + step + ' of 3.');
      var pane = els.panes.filter(function (p) { return !p.hidden; })[0];
      var legend = pane && pane.querySelector('legend');
      if (legend) {
        legend.setAttribute('tabindex', '-1');
        legend.focus({ preventScroll: true });
      }
    }
  }

  function buildSummary() {
    var s = currentService();
    var d = parseDate(els.date.value);
    var rows = [
      ['Service', s ? s.name + ' (' + s.price + ')' : '—'],
      ['Barber', els.barber.value.trim() || 'No preference'],
      ['Date', d ? d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
      ['Time', RULES.time.get() || '—'],
      ['Name', $('#name').value.trim()],
      ['Phone', $('#phone').value.trim()],
      ['Email', $('#email').value.trim()]
    ];
    var notes = els.notes.value.trim();
    if (notes) rows.push(['Notes', notes]);

    els.summary.innerHTML = rows.map(function (r) {
      return '<div class="summary__row"><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
    }).join('');
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function announce(msg) { if (els.live) els.live.textContent = msg; }

  /* ═══════════════════════════════════════════════════ 5. SUBMITTING ════ */
  function payload() {
    var s = currentService();
    var d = parseDate(els.date.value);
    return {
      service:  s ? s.name : '',
      price:    s ? s.price : '',
      barber:   els.barber.value.trim() || 'No preference',
      date:     els.date.value,
      dateLong: d ? d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '',
      time:     RULES.time.get(),
      name:     $('#name').value.trim(),
      phone:    $('#phone').value.trim(),
      email:    $('#email').value.trim(),
      notes:    els.notes.value.trim(),
      source:   'gallerybarbers.website',
      submittedAt: new Date().toISOString()
    };
  }

  function whatsappUrl(p) {
    var lines = [
      CFG.whatsappGreeting || "Hi Gallery Barbers, I'd like to book an appointment.",
      '',
      'Service: ' + p.service + (p.price ? ' (' + p.price + ')' : ''),
      'Barber: ' + p.barber,
      'Date: ' + p.dateLong,
      'Time: ' + p.time,
      'Name: ' + p.name,
      'Phone: ' + p.phone,
      'Email: ' + p.email
    ];
    if (p.notes) lines.push('Notes: ' + p.notes);
    lines.push('', 'Sent from the website — please confirm if that time works.');
    return 'https://wa.me/' + (CFG.whatsapp || '447955040765') +
      '?text=' + encodeURIComponent(lines.join('\n'));
  }

  function setLoading(on) {
    els.submit.disabled = on;
    els.back.disabled = on;
    els.submitLbl.innerHTML = on
      ? '<span class="spinner" aria-hidden="true"></span> Sending…'
      : 'Send booking request';
    if (on) announce('Sending your request.');
  }

  function showResult(which) {
    var showForm = which === null;
    form.hidden = !showForm;
    els.success.hidden = which !== 'ok';
    els.error.hidden = which !== 'fail';
    if (which === 'ok') els.success.focus();
    if (which === 'fail') els.error.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    /* Re-check everything, not just the last step. */
    var bad = validate(Object.keys(RULES));
    if (bad.length) {
      goTo(RULES[bad[0]].step);
      showSummaryOfErrors(bad);
      return;
    }

    var p = payload();

    if (BOOK.mode === 'endpoint' && BOOK.endpoint) {
      setLoading(true);
      fetch(BOOK.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(p)
      })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json().catch(function () { return {}; });
        })
        .then(function () {
          setLoading(false);
          successEndpoint(p);
        })
        .catch(function (err) {
          setLoading(false);
          els.errorMsg.textContent =
            'We couldn’t send that just now (' + err.message + '). Please try again, or ' +
            'message the shop directly — they’ll sort you out straight away.';
          showResult('fail');
          announce('Sending failed.');
        });
      return;
    }

    /* Default: hand off to WhatsApp. Opened inside the click so the browser
       treats it as a user gesture rather than a pop-up. */
    var url = whatsappUrl(p);
    var win = window.open(url, '_blank', 'noopener');
    successWhatsApp(p, url, !win);
  });

  function successWhatsApp(p, url, blocked) {
    els.successTtl.textContent = blocked ? 'One tap to send' : 'Nearly done — press send';
    els.successMsg.innerHTML = blocked
      ? 'Your request is ready. Tap below to open WhatsApp with everything filled in, ' +
        'then press send.'
      : 'We’ve opened WhatsApp with your details for <strong>' + esc(p.service) +
        '</strong> on <strong>' + esc(p.dateLong) + ' at ' + esc(p.time) +
        '</strong>. Press send in WhatsApp and we’ll confirm your slot.';

    els.successAct.innerHTML =
      '<a class="btn btn--wa" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' +
        '<svg class="btn__icon" aria-hidden="true"><use href="#i-whatsapp"></use></svg>' +
        (blocked ? 'Open WhatsApp' : 'Open WhatsApp again') +
      '</a>' +
      '<a class="btn btn--ghost" href="tel:' + esc(CFG.phone || '+447955040765') + '">' +
        '<svg class="btn__icon" aria-hidden="true"><use href="#i-phone"></use></svg>Call instead' +
      '</a>' +
      '<button class="btn btn--quiet" type="button" data-book-again>Make another request</button>';

    showResult('ok');
    announce('Your booking request is ready to send on WhatsApp.');
  }

  function successEndpoint(p) {
    var ref = 'GB-' + Date.now().toString(36).toUpperCase().slice(-6);
    els.successTtl.textContent = 'Request received';
    els.successMsg.innerHTML =
      'Thanks ' + esc(p.name.split(' ')[0]) + ' — we’ve got your request for <strong>' +
      esc(p.service) + '</strong> on <strong>' + esc(p.dateLong) + ' at ' + esc(p.time) +
      '</strong>.' + (BOOK.live ? '' : ' We’ll confirm the exact time by phone or WhatsApp.') +
      '<br><span class="field__hint">Reference ' + ref + '</span>';
    els.successAct.innerHTML =
      '<a class="btn btn--wa" href="' + esc(whatsappUrl(p)) + '" target="_blank" rel="noopener noreferrer">' +
        '<svg class="btn__icon" aria-hidden="true"><use href="#i-whatsapp"></use></svg>Message the shop' +
      '</a>' +
      '<button class="btn btn--quiet" type="button" data-book-again>Make another request</button>';
    showResult('ok');
    announce('Booking request sent. Reference ' + ref);
  }

  /* ═══════════════════════════════════════════════════════ 6. EVENTS ════ */
  els.next.addEventListener('click', function () {
    var bad = validate(keysForStep(step));
    if (bad.length) { showSummaryOfErrors(bad); return; }
    goTo(step + 1);
  });

  els.back.addEventListener('click', function () { goTo(step - 1); });

  els.retry.addEventListener('click', function () {
    showResult(null);
    goTo(LAST_STEP);
  });

  doc.addEventListener('click', function (e) {
    if (!e.target.closest('[data-book-again]')) return;
    form.reset();
    if (els.service) els.service.value = '';
    paintServiceDetail();
    if (els.slots) els.slots.innerHTML = '';
    setSlotsMessage('Pick a date first and we’ll show you the times.');
    Object.keys(RULES).forEach(clearError);
    showResult(null);
    goTo(1);
  });

  /* Clear a field's error as soon as it becomes valid again. */
  Object.keys(RULES).forEach(function (k) {
    var el = fieldEl(k);
    if (!el) return;
    var ev = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'input';
    el.addEventListener(ev, function () {
      if (RULES[k].test(RULES[k].get())) clearError(k);
    });
    el.addEventListener('blur', function () {
      if (RULES[k].get()) setError(k, !RULES[k].test(RULES[k].get()));
    });
  });

  if (els.notes && els.notesCount) {
    els.notes.addEventListener('input', function () {
      els.notesCount.textContent = els.notes.value.length;
    });
  }

  /* ══════════════════════════════════════════════════════════ BOOT ═════ */
  readServices();
  buildServiceMenu();
  wireServiceButtons();
  initDate();
  paintServiceDetail();
  goTo(1, false);
})();
