// Easing Studio BD - pure logic (no DOM). Runs unchanged in Node and the browser.
// All Bengali strings are \uXXXX escapes so every source file stays pure ASCII.
(function (root) {
  'use strict';

  // Preset easings. `css` is a verbatim CSS easing string (usable in
  // element.animate() and in stylesheets). Bezier presets carry their
  // control points so the curve editor can draw them.
  var PRESETS = [
    { id: 'linear', css: 'linear', bezier: [0, 0, 1, 1],
      en: 'Linear', bn: '\u09b2\u09bf\u09a8\u09bf\u09af\u09bc\u09be\u09b0' },
    { id: 'ease', css: 'ease', bezier: [0.25, 0.1, 0.25, 1],
      en: 'Ease', bn: '\u0987\u09af\u09bc\u09c7\u099c' },
    { id: 'ease-in', css: 'ease-in', bezier: [0.42, 0, 1, 1],
      en: 'Ease In', bn: '\u0987\u09af\u09bc\u09c7\u099c \u0987\u09a8' },
    { id: 'ease-out', css: 'ease-out', bezier: [0, 0, 0.58, 1],
      en: 'Ease Out', bn: '\u0987\u09af\u09bc\u09c7\u099c \u0986\u0989\u099f' },
    { id: 'ease-in-out', css: 'ease-in-out', bezier: [0.42, 0, 0.58, 1],
      en: 'Ease In Out', bn: '\u0987\u09af\u09bc\u09c7\u099c \u0987\u09a8-\u0986\u0989\u099f' },
    { id: 'ease-in-quad', css: 'cubic-bezier(0.11, 0, 0.5, 0)', bezier: [0.11, 0, 0.5, 0],
      en: 'Ease In Quad', bn: '\u0987\u09a8 \u0995\u09cb\u09af\u09bc\u09be\u09a1' },
    { id: 'ease-out-quad', css: 'cubic-bezier(0.5, 1, 0.89, 1)', bezier: [0.5, 1, 0.89, 1],
      en: 'Ease Out Quad', bn: '\u0986\u0989\u099f \u0995\u09cb\u09af\u09bc\u09be\u09a1' },
    { id: 'ease-in-out-quad', css: 'cubic-bezier(0.45, 0, 0.55, 1)', bezier: [0.45, 0, 0.55, 1],
      en: 'Ease In Out Quad', bn: '\u0987\u09a8-\u0986\u0989\u099f \u0995\u09cb\u09af\u09bc\u09be\u09a1' },
    { id: 'ease-in-cubic', css: 'cubic-bezier(0.32, 0, 0.67, 0)', bezier: [0.32, 0, 0.67, 0],
      en: 'Ease In Cubic', bn: '\u0987\u09a8 \u0995\u09bf\u0989\u09ac\u09bf\u0995' },
    { id: 'ease-out-cubic', css: 'cubic-bezier(0.33, 1, 0.68, 1)', bezier: [0.33, 1, 0.68, 1],
      en: 'Ease Out Cubic', bn: '\u0986\u0989\u099f \u0995\u09bf\u0989\u09ac\u09bf\u0995' },
    { id: 'ease-in-out-cubic', css: 'cubic-bezier(0.65, 0, 0.35, 1)', bezier: [0.65, 0, 0.35, 1],
      en: 'Ease In Out Cubic', bn: '\u0987\u09a8-\u0986\u0989\u099f \u0995\u09bf\u0989\u09ac\u09bf\u0995' },
    { id: 'ease-in-quart', css: 'cubic-bezier(0.5, 0, 0.75, 0)', bezier: [0.5, 0, 0.75, 0],
      en: 'Ease In Quart', bn: '\u0987\u09a8 \u0995\u09cb\u09af\u09bc\u09be\u09b0\u09cd\u099f' },
    { id: 'ease-out-quart', css: 'cubic-bezier(0.25, 1, 0.5, 1)', bezier: [0.25, 1, 0.5, 1],
      en: 'Ease Out Quart', bn: '\u0986\u0989\u099f \u0995\u09cb\u09af\u09bc\u09be\u09b0\u09cd\u099f' },
    { id: 'ease-in-out-quart', css: 'cubic-bezier(0.76, 0, 0.24, 1)', bezier: [0.76, 0, 0.24, 1],
      en: 'Ease In Out Quart', bn: '\u0987\u09a8-\u0986\u0989\u099f \u0995\u09cb\u09af\u09bc\u09be\u09b0\u09cd\u099f' },
    { id: 'ease-out-back', css: 'cubic-bezier(0.34, 1.56, 0.64, 1)', bezier: [0.34, 1.56, 0.64, 1],
      en: 'Ease Out Back', bn: '\u0986\u0989\u099f \u09ac\u09cd\u09af\u09be\u0995' },
    { id: 'ease-in-out-back', css: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)', bezier: [0.68, -0.6, 0.32, 1.6],
      en: 'Ease In Out Back', bn: '\u0987\u09a8-\u0986\u0989\u099f \u09ac\u09cd\u09af\u09be\u0995' },
    { id: 'steps-4', css: 'steps(4, end)', bezier: null,
      en: 'Steps 4', bn: '\u09a7\u09be\u09aa 4' },
    { id: 'steps-6-jump', css: 'steps(6, jump-none)', bezier: null,
      en: 'Steps 6 Jump', bn: '\u09a7\u09be\u09aa 6' }
  ];

  function presetById(id) {
    for (var i = 0; i < PRESETS.length; i++) {
      if (PRESETS[i].id === id) return PRESETS[i];
    }
    return null;
  }

  // Cubic bezier point for P0=(0,0), P1=(x1,y1), P2=(x2,y2), P3=(1,1).
  function bezierPoint(t, x1, y1, x2, y2) {
    var u = 1 - t;
    var x = 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t;
    var y = 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t;
    return { x: x, y: y };
  }

  // Eased progress y for a given linear progress x (Newton + bisection).
  // Returns null for non-monotonic curves (x decreasing somewhere).
  function bezierYatX(x, x1, y1, x2, y2) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    var t = x;
    for (var i = 0; i < 8; i++) {
      var p = bezierPoint(t, x1, y1, x2, y2);
      var dx = p.x - x;
      if (Math.abs(dx) < 1e-6) return p.y;
      // derivative of x(t)
      var u = 1 - t;
      var d = 3 * u * u * x1 + 6 * u * t * (x2 - x1) + 3 * t * t * (1 - x2);
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
      if (t < 0) t = 0;
      if (t > 1) t = 1;
    }
    var lo = 0, hi = 1;
    for (var j = 0; j < 30; j++) {
      var mid = (lo + hi) / 2;
      var pm = bezierPoint(mid, x1, y1, x2, y2);
      if (Math.abs(pm.x - x) < 1e-6) return pm.y;
      if (pm.x < x) lo = mid; else hi = mid;
    }
    return bezierPoint((lo + hi) / 2, x1, y1, x2, y2).y;
  }

  // n+1 [x, y] samples across the curve (for the SVG path + race math).
  function sampleCurve(x1, y1, x2, y2, n) {
    var out = [];
    var steps = (typeof n === 'number' && n > 0) ? Math.floor(n) : 100;
    for (var i = 0; i <= steps; i++) {
      var x = i / steps;
      out.push([x, bezierYatX(x, x1, y1, x2, y2)]);
    }
    return out;
  }

  // SVG path (viewBox 300x300, plot area x:20..280, y range -0.5..1.7) for a curve.
  function curvePath(x1, y1, x2, y2) {
    function px(x) { return (20 + x * 260).toFixed(1); }
    function py(y) { return (280 - ((y + 0.5) / 2.2) * 260).toFixed(1); }
    var pts = sampleCurve(x1, y1, x2, y2, 60);
    var d = 'M ' + px(pts[0][0]) + ' ' + py(pts[0][1]);
    for (var i = 1; i < pts.length; i++) d += ' L ' + px(pts[i][0]) + ' ' + py(pts[i][1]);
    return d;
  }

  function clampNum(v, lo, hi, fallback) {
    var n = Number(v);
    if (!isFinite(n)) return fallback;
    if (n < lo) return lo;
    if (n > hi) return hi;
    return n;
  }

  // Parse "cubic-bezier(a, b, c, d)". x values must be in [0, 1]; y in [-2, 2].
  function parseBezier(str) {
    if (typeof str !== 'string') return null;
    var m = str.trim().match(/^cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/);
    if (!m) return null;
    var v = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
    for (var i = 0; i < 4; i++) if (!isFinite(v[i])) return null;
    if (v[0] < 0 || v[0] > 1 || v[2] < 0 || v[2] > 1) return null;
    if (v[1] < -2 || v[1] > 2 || v[3] < -2 || v[3] > 2) return null;
    return { x1: v[0], y1: v[1], x2: v[2], y2: v[3] };
  }

  function bezierCss(x1, y1, x2, y2) {
    return 'cubic-bezier(' + x1 + ', ' + y1 + ', ' + x2 + ', ' + y2 + ')';
  }

  // Validate a steps() easing string: steps(N, jump) with N 1..20.
  function parseSteps(str) {
    if (typeof str !== 'string') return null;
    var m = str.trim().match(/^steps\(\s*(\d+)\s*(?:,\s*(jump-start|jump-end|jump-none|jump-both|start|end)\s*)?\)$/);
    if (!m) return null;
    var n = Number(m[1]);
    if (n < 1 || n > 20) return null;
    return { n: n, jump: m[2] || 'end' };
  }

  var BN_DIGITS = ['\u09e6', '\u09e7', '\u09e8', '\u09e9', '\u09ea', '\u09eb', '\u09ec', '\u09ed', '\u09ee', '\u09ef'];
  function toBnDigits(s) {
    return String(s).replace(/[0-9]/g, function (d) { return BN_DIGITS[Number(d)]; });
  }

  function formatNum(v, lang) {
    var s = String(v);
    return lang === 'bn' ? toBnDigits(s) : s;
  }

  // Strict validation for imported saved-easing JSON.
  // Shape: { app: 'easing-studio-bd', version: 1, items: [{name, css, x1,y1,x2,y2}] }
  function validateImport(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, error: 'not-object' };
    if (data.app !== 'easing-studio-bd' || data.version !== 1) return { ok: false, error: 'bad-header' };
    if (!Array.isArray(data.items) || data.items.length > 50) return { ok: false, error: 'bad-items' };
    var items = [];
    var seen = {};
    for (var i = 0; i < data.items.length; i++) {
      var it = data.items[i];
      if (!it || typeof it !== 'object') return { ok: false, error: 'bad-item' };
      if (typeof it.name !== 'string' || !it.name.trim() || it.name.length > 40) return { ok: false, error: 'bad-name' };
      if (typeof it.css !== 'string' || !it.css.trim() || it.css.length > 60) return { ok: false, error: 'bad-css' };
      if (seen[it.name]) return { ok: false, error: 'dup-name' };
      seen[it.name] = true;
      var b = parseBezier(it.css);
      var s = parseSteps(it.css);
      if (it.css !== 'linear' && it.css !== 'ease' && it.css !== 'ease-in' &&
          it.css !== 'ease-out' && it.css !== 'ease-in-out' && !b && !s) {
        return { ok: false, error: 'bad-css' };
      }
      items.push({ name: it.name.trim(), css: it.css.trim() });
    }
    return { ok: true, items: items };
  }

  function exportPayload(items) {
    return JSON.stringify({ app: 'easing-studio-bd', version: 1, items: items }, null, 2);
  }

  var api = {
    PRESETS: PRESETS, presetById: presetById, bezierPoint: bezierPoint,
    bezierYatX: bezierYatX, sampleCurve: sampleCurve, curvePath: curvePath,
    clampNum: clampNum, parseBezier: parseBezier, bezierCss: bezierCss,
    parseSteps: parseSteps, toBnDigits: toBnDigits, formatNum: formatNum,
    validateImport: validateImport, exportPayload: exportPayload
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.EasingLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
