// Easing Studio BD - DOM wiring. Pure ASCII source; Bengali via \u escapes.
(function () {
  'use strict';
  var L = window.EasingLogic;
  var LS_KEY = 'easing-studio-bd-v1';
  var $ = function (id) { return document.getElementById(id); };

  var state = {
    lang: 'en',
    bezier: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
    css: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    activePreset: 'ease',
    custom: false,
    saved: []
  };

  // Short UI strings. Keep Bengali strings simple to stay ASCII-safe.
  var STR = {
    tagline: { en: 'Design CSS easings, see them move, and race them.',
      bn: '\u09b8\u09bf\u098f\u09b8\u098f\u09b8 \u0987\u09af\u09bc\u09bf\u099c\u09bf\u0982 \u09a1\u09bf\u099c\u09be\u0987\u09a8 \u0995\u09b0\u09c1\u09a8' },
    presetsH: { en: 'Preset easings', bn: '\u09aa\u09cd\u09b0\u09bf\u09b8\u09c7\u099f \u0987\u09af\u09bc\u09bf\u099c\u09bf\u0982' },
    curveH: { en: 'Bezier curve editor', bn: '\u0995\u09be\u09b0\u09cd\u09ad \u098f\u09a1\u09bf\u099f\u09b0' },
    curveHint: { en: 'Drag the two handles, or type numbers. x stays in 0-1.',
      bn: '\u09b9\u09cd\u09af\u09be\u09a8\u09cd\u09a1\u09c7\u09b2 \u099f\u09be\u09a8\u09c1\u09a8 \u09ac\u09be \u09b8\u0982\u0996\u09cd\u09af\u09be \u09b2\u09bf\u0996\u09c1\u09a8' },
    cssLabel: { en: 'CSS easing', bn: '\u09b8\u09bf\u098f\u09b8\u098f\u09b8 \u0987\u09af\u09bc\u09bf\u099c\u09bf\u0982' },
    copyBtn: { en: 'Copy CSS', bn: '\u0995\u09aa\u09bf \u0995\u09b0\u09c1\u09a8' },
    copied: { en: 'Copied!', bn: '\u0995\u09aa\u09bf \u09b9\u09af\u09bc\u09c7\u099b\u09c7!' },
    resetBtn: { en: 'Reset to ease', bn: '\u0987\u09af\u09bc\u09c7\u099c-\u098f \u09ab\u09bf\u09b0\u09c1\u09a8' },
    previewH: { en: 'Live preview', bn: '\u09b2\u09be\u0987\u09ad \u09aa\u09cd\u09b0\u09bf\u09ad\u09bf\u0989' },
    playBtn: { en: 'Play animation', bn: '\u0985\u09cd\u09af\u09be\u09a8\u09bf\u09ae\u09c7\u09b6\u09a8 \u099a\u09be\u09b2\u09be\u09a8' },
    durationLabel: { en: 'Duration (seconds)', bn: '\u09b8\u09ae\u09af\u09bc\u0995\u09be\u09b2' },
    propertyLabel: { en: 'Animated property', bn: '\u09aa\u09cd\u09b0\u09aa\u09be\u09b0\u09cd\u099f\u09bf' },
    raceH: { en: 'Easing race', bn: '\u0987\u09af\u09bc\u09bf\u099c\u09bf\u0982 \u09b0\u09c7\u09b8' },
    raceHint: { en: 'Lane A uses your current easing. Pick a rival for lane B.',
      bn: '\u09b2\u09c7\u09a8 A \u0986\u09aa\u09a8\u09be\u09b0 \u0987\u09af\u09bc\u09bf\u099c\u09bf\u0982 \u09ac\u09cd\u09af\u09ac\u09b9\u09be\u09b0 \u0995\u09b0\u09c7' },
    raceBtn: { en: 'Start race', bn: '\u09b0\u09c7\u09b8 \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c1\u09a8' },
    raceRunning: { en: 'Racing...', bn: '\u09b0\u09c7\u09b8 \u099a\u09b2\u099b\u09c7...' },
    savedH: { en: 'My saved easings', bn: '\u0986\u09ae\u09be\u09b0 \u09b8\u09c7\u09ad \u0995\u09b0\u09be \u0987\u09af\u09bc\u09bf\u099c\u09bf\u0982' },
    saveBtn: { en: 'Save current easing', bn: '\u09b8\u09c7\u09ad \u0995\u09b0\u09c1\u09a8' },
    exportBtn: { en: 'Export JSON', bn: '\u099c\u09c7\u09b8\u09a8 \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f' },
    importBtn: { en: 'Import JSON', bn: '\u099c\u09c7\u09b8\u09a8 \u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f' },
    eraseBtn: { en: 'Erase all saved', bn: '\u09b8\u09ac \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09c1\u09a8' },
    emptySaved: { en: 'No saved easings yet.', bn: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u09b8\u09c7\u09ad \u09a8\u09c7\u0987' },
    nameNeeded: { en: 'Type a name first.', bn: '\u09aa\u09cd\u09b0\u09a5\u09ae\u09c7 \u09a8\u09be\u09ae \u09b2\u09bf\u0996\u09c1\u09a8' },
    savedOk: { en: 'Saved.', bn: '\u09b8\u09c7\u09ad \u09b9\u09af\u09bc\u09c7\u099b\u09c7' },
    dupName: { en: 'That name is already used.', bn: '\u098f\u0987 \u09a8\u09be\u09ae\u09c7 \u0986\u099b\u09c7' },
    importOk: { en: 'Imported.', bn: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09b9\u09af\u09bc\u09c7\u099b\u09c7' },
    importBad: { en: 'Import rejected: invalid file.', bn: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09ac\u09be\u09a4\u09bf\u09b2' },
    erased: { en: 'All saved easings erased.', bn: '\u09b8\u09ac \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7' },
    eraseHint: { en: 'Type DELETE to confirm erase.', bn: 'DELETE \u09b2\u09bf\u0996\u09c7 \u09a8\u09bf\u09b6\u09cd\u099a\u09bf\u09a4 \u0995\u09b0\u09c1\u09a8' },
    playing: { en: 'Playing...', bn: '\u099a\u09b2\u099b\u09c7...' },
    done: { en: 'Done.', bn: '\u09b6\u09c7\u09b7' },
    leaderA: { en: 'Lane A leads', bn: '\u09b2\u09c7\u09a8 A \u098f\u0997\u09bf\u09af\u09bc\u09c7' },
    leaderB: { en: 'Lane B leads', bn: '\u09b2\u09c7\u09a8 B \u098f\u0997\u09bf\u09af\u09bc\u09c7' },
    leaderTie: { en: 'Tied', bn: '\u09a1\u09cd\u09b0' },
    winnerA: { en: 'Lane A led most of the race.', bn: '\u09b2\u09c7\u09a8 A \u09ac\u09c7\u09b6\u09bf\u09b0\u09ad\u09be\u0997 \u09b8\u09ae\u09af\u09bc \u098f\u0997\u09bf\u09af\u09bc\u09c7 \u099b\u09bf\u09b2' },
    winnerB: { en: 'Lane B led most of the race.', bn: '\u09b2\u09c7\u09a8 B \u09ac\u09c7\u09b6\u09bf\u09b0\u09ad\u09be\u0997 \u09b8\u09ae\u09af\u09bc \u098f\u0997\u09bf\u09af\u09bc\u09c7 \u099b\u09bf\u09b2' },
    winnerTie: { en: 'Dead heat - both led equally.', bn: '\u09a1\u09cd\u09b0 \u09b9\u09af\u09bc\u09c7\u099b\u09c7' }
  };

  function t(key) { return STR[key][state.lang] || STR[key].en; }
  function fmt(v) { return L.formatNum(v, state.lang); }

  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ lang: state.lang, saved: state.saved })); } catch (e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      var d = JSON.parse(raw);
      if (d.lang === 'bn' || d.lang === 'en') state.lang = d.lang;
      if (Array.isArray(d.saved)) {
        var v = L.validateImport({ app: 'easing-studio-bd', version: 1, items: d.saved });
        if (v.ok) state.saved = v.items;
      }
    } catch (e) {}
  }

  function px(x) { return (20 + x * 260).toFixed(1); }
  function py(y) { return (280 - ((y + 0.5) / 2.2) * 260).toFixed(1); }

  function renderCurve() {
    var b = state.bezier;
    var act = state.activePreset ? L.presetById(state.activePreset) : null;
    if (act && !act.bezier) {
      // Steps easings have no bezier curve: hide the path, keep handles parked.
      $('curvePath').setAttribute('d', '');
    } else {
      $('curvePath').setAttribute('d', L.curvePath(b.x1, b.y1, b.x2, b.y2));
    }
    $('handle1').setAttribute('cx', px(b.x1));
    $('handle1').setAttribute('cy', py(b.y1));
    $('handle2').setAttribute('cx', px(b.x2));
    $('handle2').setAttribute('cy', py(b.y2));
    $('line1').setAttribute('x1', px(0)); $('line1').setAttribute('y1', py(0));
    $('line1').setAttribute('x2', px(b.x1)); $('line1').setAttribute('y2', py(b.y1));
    $('line2').setAttribute('x1', px(1)); $('line2').setAttribute('y1', py(1));
    $('line2').setAttribute('x2', px(b.x2)); $('line2').setAttribute('y2', py(b.y2));
    $('inX1').value = b.x1; $('inY1').value = b.y1;
    $('inX2').value = b.x2; $('inY2').value = b.y2;
    $('cssOutput').textContent = state.css;
    var nameEl = $('currentName');
    if (nameEl) nameEl.textContent = state.custom ? 'Custom' : (presetName(state.activePreset) || 'Custom');
  }

  function presetName(id) {
    var p = L.presetById(id);
    if (!p) return null;
    return state.lang === 'bn' ? p.bn : p.en;
  }

  function setBezier(b, css, presetId) {
    state.bezier = b;
    state.css = css;
    state.activePreset = presetId || null;
    state.custom = !presetId;
    renderCurve();
    renderPresets();
  }

  function setCustomFromInputs() {
    var x1 = L.clampNum($('inX1').value, 0, 1, state.bezier.x1);
    var y1 = L.clampNum($('inY1').value, -2, 2, state.bezier.y1);
    var x2 = L.clampNum($('inX2').value, 0, 1, state.bezier.x2);
    var y2 = L.clampNum($('inY2').value, -2, 2, state.bezier.y2);
    setBezier({ x1: x1, y1: y1, x2: x2, y2: y2 }, L.bezierCss(x1, y1, x2, y2), null);
  }

  function renderPresets() {
    var grid = $('presetGrid');
    grid.innerHTML = '';
    L.PRESETS.forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'preset-btn' + (state.activePreset === p.id ? ' active' : '');
      btn.textContent = state.lang === 'bn' ? p.bn : p.en;
      btn.title = p.css;
      btn.addEventListener('click', function () {
        if (p.bezier) {
          setBezier({ x1: p.bezier[0], y1: p.bezier[1], x2: p.bezier[2], y2: p.bezier[3] }, p.css, p.id);
        } else {
          state.css = p.css; state.activePreset = p.id; state.custom = false;
          renderCurve(); renderPresets();
        }
      });
      grid.appendChild(btn);
    });
    // Steps presets have no bezier: show a flat placeholder curve note.
    var active = L.presetById(state.activePreset);
    if (active && !active.bezier) {
      $('curvePath').setAttribute('d', '');
    }
  }

  function renderSaved() {
    var list = $('savedList');
    list.innerHTML = '';
    if (!state.saved.length) {
      var em = document.createElement('p');
      em.className = 'muted';
      em.textContent = t('emptySaved');
      list.appendChild(em);
      return;
    }
    state.saved.forEach(function (it) {
      var row = document.createElement('div');
      row.className = 'saved-row';
      var span = document.createElement('span');
      span.textContent = it.name + ' - ' + it.css;
      var apply = document.createElement('button');
      apply.type = 'button'; apply.textContent = 'Apply';
      apply.addEventListener('click', function () {
        var b = L.parseBezier(it.css);
        if (b) setBezier(b, it.css, null);
        else { state.css = it.css; state.activePreset = null; state.custom = true; renderCurve(); renderPresets(); }
      });
      var del = document.createElement('button');
      del.type = 'button'; del.textContent = 'Delete';
      del.addEventListener('click', function () {
        state.saved = state.saved.filter(function (s) { return s.name !== it.name; });
        save(); renderSaved();
      });
      row.appendChild(span); row.appendChild(apply); row.appendChild(del);
      list.appendChild(row);
    });
  }

  function renderRaceSelect() {
    var sel = $('raceB');
    sel.innerHTML = '';
    L.PRESETS.forEach(function (p) {
      var o = document.createElement('option');
      o.value = p.id;
      o.textContent = (state.lang === 'bn' ? p.bn : p.en) + ' (' + p.css + ')';
      sel.appendChild(o);
    });
    sel.value = 'linear';
  }

  function applyLang() {
    document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';
    Object.keys(STR).forEach(function (k) {
      var el = document.querySelector('[data-i18n="' + k + '"]');
      if (el) el.textContent = t(k);
    });
    $('langBtn').textContent = state.lang === 'bn' ? 'English' : '\u09ac\u09be\u0982\u09b2\u09be';
    $('durVal').textContent = fmt($('durRange').value);
    renderPresets(); renderSaved(); renderRaceSelect(); renderCurve();
  }

  function propKeyframes(prop) {
    if (prop === 'scale') return [{ transform: 'scale(0.4)' }, { transform: 'scale(1.4)' }];
    if (prop === 'fade') return [{ opacity: 0.1 }, { opacity: 1 }];
    if (prop === 'spin') return [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }];
    return [{ transform: 'translateX(0px)' }, { transform: 'translateX(220px)' }];
  }

  function playPreview() {
    var dot = $('previewDot');
    var dur = Number($('durRange').value) * 1000;
    $('previewStatus').textContent = t('playing');
    dot.getAnimations().forEach(function (a) { a.cancel(); });
    var anim = dot.animate(propKeyframes($('propSelect').value), { duration: dur, easing: state.css, fill: 'forwards' });
    anim.onfinish = function () { $('previewStatus').textContent = t('done'); };
  }

  function startRace() {
    var bPreset = L.presetById($('raceB').value) || L.presetById('linear');
    var dur = Number($('durRange').value) * 1000;
    var dotA = $('raceDotA'), dotB = $('raceDotB');
    dotA.getAnimations().forEach(function (a) { a.cancel(); });
    dotB.getAnimations().forEach(function (a) { a.cancel(); });
    $('raceResult').textContent = t('raceRunning');
    $('raceLeader').textContent = '';
    var counts = { a: 0, b: 0, tie: 0 };
    var bBezier = bPreset.bezier;
    var aBezier = state.bezier;
    var animA = dotA.animate(
      [{ transform: 'translateX(0px)' }, { transform: 'translateX(220px)' }],
      { duration: dur, easing: state.css, fill: 'forwards' });
    var animB = dotB.animate(
      [{ transform: 'translateX(0px)' }, { transform: 'translateX(220px)' }],
      { duration: dur, easing: bPreset.css, fill: 'forwards' });
    function easedProgress(bezier, css, linearT) {
      if (bezier) return L.bezierYatX(linearT, bezier[0], bezier[1], bezier[2], bezier[3]);
      if (css.indexOf('steps') === 0) {
        var s = L.parseSteps(css);
        if (s) return Math.min(1, Math.floor(linearT * s.n) / s.n + (s.jump === 'end' || s.jump === 'jump-end' ? 0 : 1 / s.n));
      }
      if (css === 'linear') return linearT;
      return linearT;
    }
    var raf;
    function tick() {
      var now = performance.now();
      var tA = animA.currentTime == null ? 0 : Math.min(1, animA.currentTime / dur);
      var tB = animB.currentTime == null ? 0 : Math.min(1, animB.currentTime / dur);
      var pA = easedProgress(aBezier, state.css, tA);
      var pB = easedProgress(bBezier, bPreset.css, tB);
      if (pA > pB + 0.005) { counts.a++; $('raceLeader').textContent = t('leaderA'); }
      else if (pB > pA + 0.005) { counts.b++; $('raceLeader').textContent = t('leaderB'); }
      else { counts.tie++; $('raceLeader').textContent = t('leaderTie'); }
      if (tA < 1 || tB < 1) { raf = requestAnimationFrame(tick); }
    }
    raf = requestAnimationFrame(tick);
    var done = 0;
    function oneDone() {
      done++;
      if (done < 2) return;
      cancelAnimationFrame(raf);
      if (counts.a > counts.b) $('raceResult').textContent = t('winnerA');
      else if (counts.b > counts.a) $('raceResult').textContent = t('winnerB');
      else $('raceResult').textContent = t('winnerTie');
    }
    animA.onfinish = oneDone;
    animB.onfinish = oneDone;
  }

  function initDrag(handleId, which) {
    var el = $(handleId);
    el.addEventListener('pointerdown', function (ev) {
      ev.preventDefault();
      el.setPointerCapture(ev.pointerId);
      function move(e) {
        var svg = $('curveSvg');
        var r = svg.getBoundingClientRect();
        var pxv = (e.clientX - r.left) / r.width * 300;
        var pyv = (e.clientY - r.top) / r.height * 300;
        var x = L.clampNum((pxv - 20) / 260, 0, 1, state.bezier[which === 1 ? 'x1' : 'x2']);
        var y = L.clampNum(((280 - pyv) / 260) * 2.2 - 0.5, -0.5, 1.7, 0.5);
        var b = { x1: state.bezier.x1, y1: state.bezier.y1, x2: state.bezier.x2, y2: state.bezier.y2 };
        if (which === 1) { b.x1 = Math.round(x * 100) / 100; b.y1 = Math.round(y * 100) / 100; }
        else { b.x2 = Math.round(x * 100) / 100; b.y2 = Math.round(y * 100) / 100; }
        setBezier(b, L.bezierCss(b.x1, b.y1, b.x2, b.y2), null);
      }
      function up() {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
      }
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
    });
  }

  function download(name, text) {
    var a = document.createElement('a');
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(text);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  document.addEventListener('DOMContentLoaded', function () {
    load();
    renderRaceSelect();
    $('langBtn').addEventListener('click', function () {
      state.lang = state.lang === 'bn' ? 'en' : 'bn';
      save(); applyLang();
    });
    ['inX1', 'inY1', 'inX2', 'inY2'].forEach(function (id) {
      $(id).addEventListener('change', setCustomFromInputs);
    });
    $('resetBtn').addEventListener('click', function () {
      setBezier({ x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 }, 'ease', 'ease');
    });
    $('copyBtn').addEventListener('click', function () {
      var done = function () { $('copyMsg').textContent = t('copied'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(state.css).then(done).catch(done);
      } else { done(); }
    });
    $('playBtn').addEventListener('click', playPreview);
    $('durRange').addEventListener('input', function () {
      $('durVal').textContent = fmt($('durRange').value);
    });
    $('raceBtn').addEventListener('click', startRace);
    $('saveBtn').addEventListener('click', function () {
      var name = $('saveName').value.trim();
      if (!name) { $('dataMsg').textContent = t('nameNeeded'); return; }
      if (state.saved.some(function (s) { return s.name === name; })) { $('dataMsg').textContent = t('dupName'); return; }
      state.saved.push({ name: name, css: state.css });
      $('saveName').value = '';
      save(); renderSaved();
      $('dataMsg').textContent = t('savedOk');
    });
    $('exportBtn').addEventListener('click', function () {
      download('easing-studio-bd.json', L.exportPayload(state.saved));
    });
    $('importFile').addEventListener('change', function () {
      var f = $('importFile').files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var v = L.validateImport(JSON.parse(reader.result));
          if (!v.ok) { $('dataMsg').textContent = t('importBad'); return; }
          var names = {};
          state.saved.forEach(function (s) { names[s.name] = true; });
          v.items.forEach(function (it) { if (!names[it.name]) { state.saved.push(it); names[it.name] = true; } });
          save(); renderSaved();
          $('dataMsg').textContent = t('importOk');
        } catch (e) { $('dataMsg').textContent = t('importBad'); }
      };
      reader.readAsText(f);
    });
    $('eraseBtn').addEventListener('click', function () {
      if ($('eraseInput').value !== 'DELETE') { $('dataMsg').textContent = t('eraseHint'); return; }
      state.saved = []; $('eraseInput').value = '';
      save(); renderSaved();
      $('dataMsg').textContent = t('erased');
    });
    initDrag('handle1', 1);
    initDrag('handle2', 2);
    applyLang();
  });
})();
