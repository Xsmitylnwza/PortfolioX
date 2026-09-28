# PortfolioX modularization — Wave 0–1 report

Date: 2026-09-24 · Branch: `codex/portfoliox-modularization-wave0-1` · Base commit: `0221811` · Status: **PASS for Wave 0 and the bounded Wave 1 pilot (1a–1c)**. Wave 1d and Waves 2–5 remain conditional work in the [plan](2026-09-24-modularization-plan.md).

The original working tree was dirty. No pre-existing edits were reset, stashed, committed, pushed, or deployed. `ProjectDetails.jsx` kept its central CSS import order. The six moved code sections (media source helpers, lightbox, media frame, actions, stack block, Mux layout) were compared against the Wave 0 source snapshot and are text-identical after line-ending normalization.

## Scope and measured size

| Source | Before | After |
| --- | ---: | ---: |
| `src/components/ProjectDetails.jsx` | 3,994 lines / 151,745 B | 3,284 lines / 129,313 B |
| `ProjectDetailsMedia.jsx` | — | 293 lines / 9,057 B |
| `ProjectDetailsMediaSource.js` | — | 50 lines / 1,457 B |
| `ProjectDetailsShared.jsx` | — | 67 lines / 2,240 B |
| `ProjectDetailsFormat.js` | — | 1 line / 70 B |
| `ProjectDetailsMux.jsx` | — | 319 lines / 10,500 B |
| **Total of these JSX/JS files** | **3,994 lines / 151,745 B** | **4,014 lines / 152,637 B** |

The route file is **710 lines (17.8%) shorter**. Total source is 20 lines and 892 B larger due to module imports and exports; no bundle-size or speed improvement is claimed. `ProjectDetailsMedia.jsx` owns frame and lightbox behavior, pure media-source rules live in `ProjectDetailsMediaSource.js`, shared actions/stack renderers live in `ProjectDetailsShared.jsx`, and Mux's story is local to `ProjectDetailsMux.jsx`.

Two edit-locality probes used the file an agent must open to own the change. A Mux story edit moves from the 3,994-line route file to the 319-line Mux file (92.0% smaller file footprint). A shared media-label edit moves to the 293-line media file (92.7% smaller footprint). Both still have one owning edit file; locating it from the route shell adds one explicit import hop. These are **source-navigation measurements**, not measured reductions in model tokens or developer time.

## Evidence and gates

| Gate | Result |
| --- | --- |
| Wave 0 source snapshot | 88 maintained UI files; tree hash `a47bb2a049245d935700c99e553abb7e029b2c02078720ae4a63dca11e594304` |
| Wave 0 browser baseline | 8 route states (7 projects + Keshi preview) × 3 environments = **24 captures**, 0 failures; 21 expandable-media interactions pass, Hermes 3 states marked N/A; 3/3 home→project→home flows pass |
| Strict comparator self-test | 24 captures / 138 targets / 0 differences; 5 tests pass, including missing route, missing target and changed-style rejection; the capture tool also rejects a stale source manifest before creating an output directory |
| After media extraction | Source hash `d0060fc4bec67fb06c82becc938a568279f9df8d770ce03c5ebdf1eaa3c17438`; **24 captures / 138 targets / 0 differences** against Wave 0 |
| After shared primitives | Source hash `ba24d0e291010bd9202503454b480223a124b4266cd094b3c1384a4c8c410328`; **24 captures / 138 targets / 0 differences** |
| After Mux extraction | Source hash `2d88dca2fa23ef20e6da55137614a2c73187976683955792742309e427392b24`; **24 captures / 138 targets / 0 differences**, 0 browser console/page errors, 3/3 navigation flows pass |
| Media-kind smoke | **9/9**: GIF + Escape, video + close button, image + backdrop, each on desktop motion, mobile fallback and desktop reduced motion. Focus and scroll lock restored |
| Mechanical checks | Scoped final design check, full design check and Vite build pass; `test:design` **46/46**, `test:modularization` **5/5**; 4,029 pre-existing debt fingerprints and 52 ratcheted ESLint diagnostics remain unchanged |

Evidence is local under `output/playwright/modularization-wave0-20260924-a/`, `modularization-wave0-before-v2/`, `modularization-wave1a-after-v2/`, `modularization-wave1b-after/`, `modularization-wave1c-after/` and `modularization-wave1c-media-smoke/`. The browser comparison checks exact route/state and target sets, heading/text hashes, all media-frame attributes and URLs, selected computed styles and dimensions, wave/media marker counts, interactions, navigation and browser errors. Desktop and mobile first-view screenshots for all eight route states, Mux reduced-motion first view and Mux's lower desktop/mobile story were visually inspected; no new layout issue was found.

`npm run check:design -- --base HEAD` still exits `needs-scope` for **13 unrelated pre-existing dirty files** whose routes are not mapped. The final check explicitly named every new module and passed; `--full` also passed. The base-scoped failure is reported separately and was not cleared by changing unrelated work.

`npm run design:baseline:prune` was attempted after the passing full check and **refused by its own safety gate** because `design-check.config.mjs` changed to register the new render routes. The debt baseline was left untouched; recapturing it would violate Wave 0's immutable pre-edit baseline rule. This does not change the zero-new-violation result, but debt pruning remains a separate harness-maintenance task.

Limits: screenshot captures cover the first viewport, with additional Mux scroll samples. Animated WebGL frames cannot be treated as pixel-identical golden images. The full-page text/heading and media contracts were compared, but this does not prove every possible animation frame. No production environment was changed.
