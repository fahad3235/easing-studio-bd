// Node unit tests for js/logic.js. Run: node tests/logic.test.js
'use strict';
var L = require('../js/logic.js');
var passed = 0, failed = 0;
function eq(actual, expected, label) {
  if (actual === expected) { passed++; }
  else { failed++; console.log('FAIL ' + label + ': got ' + JSON.stringify(actual) + ', want ' + JSON.stringify(expected)); }
}
function close(actual, expected, tol, label) {
  if (Math.abs(actual - expected) <= tol) { passed++; }
  else { failed++; console.log('FAIL ' + label + ': got ' + actual + ', want ~' + expected); }
}
function ok(v, label) { if (v) { passed++; } else { failed++; console.log('FAIL ' + label); } }

// Bezier endpoints and known values
eq(L.bezierPoint(0, 0.25, 0.1, 0.25, 1).x, 0, 'bezier t=0 x');
eq(L.bezierPoint(1, 0.25, 0.1, 0.25, 1).y, 1, 'bezier t=1 y');
close(L.bezierYatX(0.5, 0.11, 0, 0.5, 0), 0.25, 0.03, 'ease-in-quad at 0.5 ~ 0.25 (hand-solved: x(t)=0.5 at t~=0.631, y=t^3~=0.251)');
close(L.bezierYatX(0, 0.42, 0, 1, 1), 0, 0, 'yatX 0');
close(L.bezierYatX(1, 0.42, 0, 1, 1), 1, 0, 'yatX 1');
close(L.bezierYatX(0.5, 0, 0, 1, 1), 0.5, 1e-6, 'linear yatX 0.5');
// ease-out-quad (0.5,1,0.89,1): at x=0.5, y should be well above 0.5
ok(L.bezierYatX(0.5, 0.5, 1, 0.89, 1) > 0.7, 'ease-out-quad fast start');
// ease-in-cubic slow start
ok(L.bezierYatX(0.5, 0.32, 0, 0.67, 0) < 0.35, 'ease-in-cubic slow start');
// Monotonic samples increase for ease
var s = L.sampleCurve(0.25, 0.1, 0.25, 1, 20);
ok(s.length === 21, 'sample count 21');
var mono = true;
for (var i = 1; i < s.length; i++) if (s[i][1] < s[i - 1][1] - 1e-9) mono = false;
ok(mono, 'ease samples monotonic');
// curvePath starts at (20, 220.9) for y=0 and is a string
ok(typeof L.curvePath(0.25, 0.1, 0.25, 1) === 'string' && L.curvePath(0.25, 0.1, 0.25, 1).indexOf('M 20.0 220.9') === 0, 'curvePath starts at origin');
// parseBezier
var b = L.parseBezier('cubic-bezier(0.25, 0.1, 0.25, 1)');
ok(b && b.x1 === 0.25 && b.y2 === 1, 'parseBezier ok');
eq(L.parseBezier('cubic-bezier(1.5, 0, 0.5, 1)'), null, 'parseBezier rejects x>1');
eq(L.parseBezier('cubic-bezier(0.25, 0.1, 0.25)'), null, 'parseBezier rejects 3 args');
eq(L.parseBezier('ease'), null, 'parseBezier rejects keyword');
ok(L.parseBezier('cubic-bezier(0.34, 1.56, 0.64, 1)') !== null, 'parseBezier allows y overshoot');
eq(L.parseBezier('cubic-bezier(0.25, 3, 0.25, 1)'), null, 'parseBezier rejects y>2');
eq(L.bezierCss(0.25, 0.1, 0.25, 1), 'cubic-bezier(0.25, 0.1, 0.25, 1)', 'bezierCss');
// parseSteps
var st = L.parseSteps('steps(4, end)');
ok(st && st.n === 4 && st.jump === 'end', 'parseSteps 4 end');
ok(L.parseSteps('steps(6, jump-none)') !== null, 'parseSteps jump-none');
eq(L.parseSteps('steps(0)'), null, 'parseSteps rejects 0');
eq(L.parseSteps('steps(21)'), null, 'parseSteps rejects 21');
eq(L.parseSteps('steps(4, bogus)'), null, 'parseSteps rejects bad jump');
// Presets
eq(L.PRESETS.length, 18, 'preset count 18');
ok(L.presetById('ease-out-back') !== null, 'preset ease-out-back exists');
eq(L.presetById('nope'), null, 'presetById unknown null');
ok(L.PRESETS.every(function (p) { return typeof p.css === 'string' && p.css.length > 0; }), 'all presets have css');
ok(L.presetById('steps-4').bezier === null, 'steps preset has no bezier');
// Bengali digits
eq(L.toBnDigits('2026'), '\u09e8\u09e6\u09e8\u09ec', 'toBnDigits 2026');
eq(L.toBnDigits('1.5s'), '\u09e7.\u09ebs', 'toBnDigits keeps dot and letters');
eq(L.formatNum('12', 'bn'), '\u09e7\u09e8', 'formatNum bn');
eq(L.formatNum('12', 'en'), '12', 'formatNum en');
// clampNum
eq(L.clampNum('0.5', 0, 1, 0), 0.5, 'clampNum string');
eq(L.clampNum(5, 0, 1, 0), 1, 'clampNum high');
eq(L.clampNum('abc', 0, 1, 0.25), 0.25, 'clampNum fallback');
// validateImport
var good = { app: 'easing-studio-bd', version: 1, items: [{ name: 'soft', css: 'cubic-bezier(0.25, 0.1, 0.25, 1)' }, { name: 'steppy', css: 'steps(4, end)' }] };
ok(L.validateImport(good).ok, 'validateImport good');
eq(L.validateImport({ app: 'other', version: 1, items: [] }).ok, false, 'validateImport bad app');
eq(L.validateImport({ app: 'easing-studio-bd', version: 1, items: [{ name: 'x', css: 'bogus' }] }).ok, false, 'validateImport bad css');
eq(L.validateImport({ app: 'easing-studio-bd', version: 1, items: [{ name: 'x', css: 'ease' }, { name: 'x', css: 'linear' }] }).ok, false, 'validateImport dup name');
eq(L.validateImport(null).ok, false, 'validateImport null');
var exported = JSON.parse(L.exportPayload([{ name: 'a', css: 'linear' }]));
eq(exported.app, 'easing-studio-bd', 'exportPayload app');
eq(exported.items.length, 1, 'exportPayload items');

console.log('logic tests: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
