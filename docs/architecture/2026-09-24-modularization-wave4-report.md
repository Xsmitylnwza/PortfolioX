# PortfolioX modularization — Wave 4 report

Date: 2026-09-24 · Branch: `codex/portfoliox-modularization-wave4-5` · Base: `f0a117c` · Status: **PASS for the safe runtime seams**. No push or deployment occurred.

## Decision and ownership

The runtime split moved pure or self-contained work out of three entry files. The gallery render/input loop and GL teardown stay together in `GalleryScene.jsx`; the scroll-wave render/visibility loop and teardown stay together in `ScrollPerspectiveWave.jsx`; room-transition timers/state remain together in `App.jsx`. Extracting those closure-heavy blocks merely to hit an LOC target would create a larger callback/ref interface and risk stage continuity.

| Owner | Before | Entry after | Extracted owners |
| --- | ---: | ---: | --- |
| `GalleryScene.jsx` | 1,169 lines / 58,279 B | 875 / 45,339 B | `GallerySceneShaders.js` 187; `GallerySceneGeometry.js` 115; `GalleryScenePosterTexture.js` 20 |
| `ScrollPerspectiveWave.jsx` | 1,203 / 53,046 B | 708 / 33,035 B | `ScrollPerspectiveWaveCapture.js` 253; `ScrollPerspectiveWaveShaders.js` 104; `ScrollPerspectiveWaveAnimatedRaster.js` 161 |
| `App.jsx` | 615 / 25,498 B | 573 / 23,785 B | `AppPageRoutes.jsx` 51 |

The three entry files are 831 lines shorter together (2,987 → 2,156; **27.8%**). Counting all new owners, their source is 60 lines and 1,170 B larger (2,987 → 3,047 lines; 136,823 → 137,993 B). This measures edit locality, not a bundle-size or speed gain. The exploratory 450–650-line runtime-core targets were not forced: gallery input/render/cleanup and App's transition controller remain cohesive owners. Future splits require a smaller interface and another lifecycle gate.

`AppPageRoutes.jsx` owns lazy page routes and redirects; `App.jsx` still owns the persistent stage, loader, poster handoff and room timing. `GallerySceneGeometry.js` creates only grid/sculpture resources and returns them to the existing loop/teardown. `ScrollPerspectiveWaveCapture.js` owns DOM/media discovery and rasterization, while `ScrollPerspectiveWaveAnimatedRaster.js` owns decoder lifecycle behind one adapter. The design route map now includes every new owner on its actual consuming routes.

## Context recovery found by the new gate

The gallery's existing context-loss path left an attached but blank canvas after a real `WEBGL_lose_context` restore: a 36×24 canvas probe went from 90 drawn pixels to 0. The fix pauses its RAF on loss and recreates the complete renderer session on restoration without unmounting the React stage host. The scroll wave uses the same restart boundary and re-establishes its media/follower resources. Afterward the gallery probe had 89 drawn pixels before loss and 334 after restoration, with no page error. The scroll-wave canvas is transparent in the sampled first view, so its recovery check requires a **new canvas node**, an active wave bus and no page error rather than claiming pixel evidence it cannot supply. Both recovery probes pass. No new no-WebGL fallback UI was invented; that design remains an open decision in `DESIGN.md` §7.

## Verification

| Gate | Result |
| --- | --- |
| Pre-edit source hashes | `App.jsx` `CDA4E4A4...`, `GalleryScene.jsx` `82BD82CE...`, `ScrollPerspectiveWave.jsx` `A8275C27...`; baseline browser captures were taken before edits |
| Project route parity | 24 route/states, 138 targets, **0 differences** against the current-tree Wave 4 baseline; media interactions applicable to the captures pass |
| Global route parity | 15 route/states, 126 targets, **0 differences** across home, experience, stack, contact and persona |
| Lifecycle | Home → Veluma → home **10 times in each of 3 environments**; Experience/Stack/Contact swaps, scroll and resize; 0 failures, 0 browser errors, no full reload; canvas count and global listener count return to baseline after every cycle. RAF samples stay within one scheduled frame of baseline, with no accumulation. Simulated `document.hidden` pauses scheduled RAFs from 4 → 2 on desktop motion and 2 → 1 on mobile, then restores 4 and 2 respectively |
| WebGL recovery | Gallery and Project Details wave context-loss/restore probes pass after the fix; gallery stage screenshot visually reviewed |
| Media kinds | GIF + Escape, video + button, image + backdrop across desktop motion, mobile and reduced motion: **9/9** |
| Mechanical | `test:design` 48/48, comparator tests 5/5, project-data tests 3/3, direct ESLint on Wave 4 files, full design check and Vite build pass |
| Isolated staged tree | Fresh `npm ci`, full design check/build, 6 Veluma/Keshi route-states and 15 global route-states with 0 failures; both WebGL context-recovery probes pass on the staged source alone |

First-view screenshots of home and Keshi after the final change were visually reviewed. Dynamic WebGL frames differ over time; exact static DOM/computed-style and interaction parity is paired with the lifecycle and recovery evidence rather than pixel equality. The lifecycle probe counts scheduled RAF callbacks and global listeners, not GPU memory or every listener on detached nodes; its visibility check simulates the document state rather than backgrounding an OS tab. The full checker still shows 4,029 recorded design-debt fingerprints. It shows 52 raw ESLint diagnostics in an isolated install of the staged tree and 92 in the dirty working tree; the ratchet reports no new failure in either. All browser artifacts are local under `output/playwright/modularization-wave4-*`.
