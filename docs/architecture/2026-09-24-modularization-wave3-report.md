# PortfolioX modularization — Wave 3 report

Date: 2026-09-24 · Branch: `codex/portfoliox-modularization-wave2-3` · Base: `2835bd8` · Status: **PASS**. No push or deployment occurred.

## Decision and change

Wave 3 moved contiguous CSS blocks into files with clear owners, in the same effective import order. No selector, declaration, value or rule was removed. The shared Project Details CSS is now imported as base → layouts → lightbox → process before project-specific files. The global entry is imported as foundation/tokens → room stage → site utilities → late stage overrides.

| Former file | Before | Current owner files | Current entry |
| --- | ---: | --- | ---: |
| `src/components/ProjectDetails.css` | 1,370 lines / 29,996 B | base 514; layouts 464; lightbox 174; process 218 | 514 lines / 11,406 B |
| `src/index.css` | 826 lines / 18,977 B | foundation 77; room stage 266; utilities 434; late stage 49 | 77 lines / 2,374 B |

The `ProjectDetails.css` entry is **62.5% shorter** and `index.css` is **90.7% shorter**. Total CSS source bytes and lines are unchanged. Both original files were reconstructed byte-for-byte by concatenating their new sections in import order. The production build emitted byte-identical CSS assets to the pre-split staged Wave 2 build: `index-DNkJ3JCm.css` (37,836 B) and `ProjectDetails-Bgx0LxVp.css` (284,027 B).

`MOVED_CSS_DEBT_PATHS` maps the new paths back to their original declaration identities without increasing allowances. All files carrying migrated media selectors remain in `STRICT_SCOPES`; `RENDER_TARGETS` maps the global styles to every active route, including experience, stack, contact and persona. [Global CSS ownership](../design/GLOBAL-CSS-OWNERSHIP.md) and [Project Details CSS ownership](../design/PROJECT-DETAILS-CSS-OWNERSHIP.md) record where an agent should edit next.

No supposedly unused utility was deleted: the static search found candidates, but dynamic and parked consumers were not proven absent. ModeNote/FreeFlow project CSS and the 57-line cover contract were left in place because their current ownership is clear and moving them would add cascade risk without measured edit-locality benefit.

## Verification

| Gate | Result |
| --- | --- |
| Source baseline | Current-tree snapshot `104b18f0d45f52b9edb8c67a3e0a796a8506bb6a420cb3329e12959bf607ff8b` before Wave 3 |
| Project Details CSS slice | Exact ordered CSS reconstruction; **24 project route/states / 138 targets / 0 differences** against Wave 2 baseline; all applicable media interactions passed |
| Global CSS slice | Exact ordered CSS reconstruction; **15 global route/states / 126 targets / 0 differences** across home, experience, stack, contact and persona, including 3 menu-navigation flows |
| Final project sweep | **24 project route/states / 138 targets / 0 differences** after both CSS moves |
| Media-kind smoke | **9/9** GIF/video/image and Escape/button/backdrop combinations across desktop motion, mobile fallback and desktop reduced motion |
| Mechanical | Full design check and Vite build pass; `test:design` **48/48**, `test:modularization` **5/5**, `test:project-data` **3/3**; no new token/strict-scope failure |

One initial media-smoke run reported focus outside the lightbox immediately after the dialog became visible. The component schedules focus on the next animation frame; a five-run repro observed one immediate false reading and five correct readings after that frame. The smoke harness now waits for the app's focus frame, and the full 9-case rerun passes. This was a test-timing correction, not a CSS behavior change.

Desktop and mobile first views of the five global routes were visually inspected. Animated WebGL frames are not pixel-stable, so visual review is paired with identical built CSS, strict DOM/computed-style comparisons, route navigation and media interaction evidence. Captures and comparison reports are local under `output/playwright/modularization-wave3-*`.

The full checker still reports 4,029 recorded debt fingerprints and 52 ratcheted ESLint diagnostics from the existing baseline. `check:design --base HEAD` reports `needs-scope` for seven unrelated parked dirty files; it is not a passing Wave 3 gate. The scoped final/full checks cover every Wave 3 source path and pass. `design:baseline:prune` refuses because the route configuration changed, so the baseline was neither pruned, recaptured nor widened. These two limits remain for later scope/baseline maintenance, separate from Wave 3 parity.
