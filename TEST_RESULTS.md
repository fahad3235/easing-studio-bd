# Test results — Easing Studio BD (2026-10-28, 15:00 slot)

## Unit tests — 42/42 pass (`node tests/logic.test.js`)

- Bezier endpoints (t=0 -> 0, t=1 -> 1); linear identity at 0.5.
- Hand-solved check: cubic-bezier(0.11, 0, 0.5, 0) at x=0.5 gives y ~= 0.251
  (x(t)=0.5 at t~=0.631, y=t^3); asserted 0.25 +/- 0.03.
- Ease-out-quad starts fast (y(0.5) > 0.7); ease-in-cubic starts slow
  (y(0.5) < 0.35); ease samples monotonic over 21 points.
- curvePath starts at the origin point (20.0, 220.9) in the SVG plot area.
- parseBezier: accepts overshoot y (1.56); rejects x outside 0-1, 3 args,
  keywords, y outside -2-2.
- parseSteps: accepts steps(4, end) and steps(6, jump-none); rejects 0, 21,
  unknown jumps.
- 18 presets, all with CSS strings; steps presets carry no bezier.
- Bengali digits: 2026 -> Bengali digits; formatNum honours lang.
- clampNum: string coercion, clamping, fallback.
- validateImport: good file passes; wrong app, bad CSS, duplicate names,
  and null all rejected. exportPayload round-trips through validation.

## Smoke tests — 17/17 pass (`node tests/smoke.js`, raw CDP, headless Chromium)

- h1 renders; 18 preset buttons; default CSS is cubic-bezier(0.25, 0.1, 0.25, 1).
- Curve path drawn by default (>50 chars); preset click switches CSS to ease-out.
- Custom numeric inputs (0.5, 0, 0.5, 1) produce cubic-bezier(0.5, 0, 0.5, 1).
- Steps 4 preset shows steps(4, end) and hides the curve path.
- Preview play finishes with status "Done." (Web Animations API, 1.5s).
- Race produces a verdict string after both lanes finish.
- Save lists the easing; it persists across a page reload.
- Bangla toggle flips the language button to "English" and renders Bengali
  digits in the duration readout.
- Typed-DELETE erases all saved easings.
- 390px viewport: zero horizontal overflow.
- 0 console/page errors.

## Repairs

- 1 test-side fix only: the smoke expectation for the preview status was
  "Done" but the app renders "Done." — expectation corrected, app unchanged.
  The preview animation itself was verified working in an isolated CDP debug
  run (running at 400/800/1200ms, finished at 1500ms).
- 0 app-logic bugs found in testing.

## Source hygiene

- All shipped sources are pure ASCII (Bengali rendered via \uXXXX escapes in
  JS and numeric entities in HTML); verified with grep -P for non-ASCII bytes.
- Zero network requests by design (static files only).
