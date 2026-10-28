# Easing Studio BD

An offline, bilingual (English / Bangla) CSS easing playground. Design easings
with a draggable cubic-bezier curve editor, watch them move in a live preview,
race your easing against a preset, and save your favourites — all without a
server, an account, or a single network request.

## Features

1. **18 preset easings** — linear, ease family, quad/cubic/quart curves,
   overshoot "back" easings, and steps() easings, each one-click loadable.
2. **Interactive bezier curve editor** — drag the two control-point handles on
   the SVG curve, or type exact numbers (x clamped to 0–1, y to −2–2). The CSS
   string updates live.
3. **Live animation preview** — slide, scale, fade, or spin a dot with your
   current easing, at a duration from 0.3s to 5s, using the real Web Animations
   API (not a simulation).
4. **Easing race** — lane A runs your easing, lane B runs a rival preset; a
   live leader readout and a final verdict based on which lane led most frames.
5. **Saved easings** — name and save custom easings in localStorage, apply or
   delete them, export/import them as strict-validated JSON, and erase them all
   with a typed-DELETE confirmation.
6. **Bilingual UI** — EN / Bangla toggle, persisted, with Bengali digits for
   numbers in Bangla mode. Fully responsive (checked at 390px).

## Stack

Vanilla HTML + CSS + JavaScript. No build step, no dependencies, no CDN.
`js/logic.js` is dependency-free and runs unchanged in Node (for tests) and
in the browser; `js/app.js` only wires the DOM.

## Run locally

Open `index.html` in any modern browser, or serve the folder:

```sh
npx serve .
# or
python3 -m http.server 8000
```

## Testing

```sh
node tests/logic.test.js   # 42 unit tests (bezier math, parsing, validation)
node tests/smoke.js        # 17 headless-Chrome checks via raw CDP
```

The smoke test needs `/opt/meta-chromium/chrome` (or edit the `CHROME`
path at the top of `tests/smoke.js` to point at your Chromium).

## How the race verdict works

Both lanes animate for the same duration. On every animation frame the
eased progress of each lane is computed from its easing definition, and the
lane ahead is counted. The verdict names the lane that led the most frames
(or a dead heat). Equal durations mean both lanes always finish together —
the race is about the shape of the motion, not the finish time.

## Limitations

- Steps() easings have no bezier curve, so the editor hides the curve while
  one is active; the numeric inputs keep showing the last bezier values.
- Bezier y values outside 0–1 (overshoot) draw outside the 0–1 band; the
  plot area covers y from −0.5 to 1.7, and typed y values are clamped to −2–2.
- Saved easings live only in this browser's localStorage; export JSON to
  keep them.
- This is a design playground, not a CSS specification reference: easing
  names follow common community usage (e.g. easings.net conventions).

## Status

MVP complete. See `TEST_RESULTS.md` for the verified test run.
