# Veluma surface execution report — 2026-09-30

Historical first-phase report. The owner's subsequent instruction to scan and
fix every remaining occurrence authorized T6 across all project routes,
including Hermes. Current scope and results are in the
[full rollout report](2026-09-30-detail-surface-rollout-report.md); its signal-tag,
Keshi halo and rollout findings supersede the remaining-work notes below.

T1–T5 and T7 implemented locally. T6 remains behind the explicit owner review
boundary in the spec; no other project material was migrated. No commit, push
or deployment was performed. The existing Vite server on 5391 was reused.

## Changed owners and routes

| Owner | Change | Impact |
| --- | --- | --- |
| `src/styles/detail-surface.css`, `src/styles/tokens.css` | CSS-only base/dark/paper recipe and semantic roles; no backdrop sampling | Veluma and default Keshi |
| `src/main.tsx` | Imports material after index, before the existing ordered stage imports | Shared import graph; opt-in surfaces only |
| `ProjectDetailsMux.css/tsx` | Adds tier/sheen attributes, removes overridden recipe and no-op filter declarations; retains SVG refraction | `/project/veluma` |
| `ProjectDetailsKeshi.tsx`, `ProjectDetailsKeshiVelumaSurface.css` | Replaces repeated selector lists with attributes and wrapper geometry; retains paper content and original signal-tag treatment | `/project/keshi-pomodoro` |
| `ProjectDetails.css` | Documents reveal backdrop-root behavior; no declaration change | Shared case shell |
| `scripts/design-check.config.mjs`, `scripts/stylelint-design-boundaries.mjs`, `scripts/design-check.test.mjs` | Registers material routes; forbids non-none backdrop filters and consumer styling of material/sheens | Design harness |
| `DESIGN.md`, `scripts/quality-parked-sources.json`, `CaseMatteSurface.tsx/css` | A28, A26 superseded, unused parked component and manifest entries removed after Wave 5 review | No live CaseMatte consumer |
| `design/audit/veluma-surface.cjs` | Computed snapshot, cross-engine audit and wheel-driven evidence | Seven case routes audited |

Geometry, spacing, typography, radius and media contracts are retained. Actual
consumers reviewed: `ScrollPerspectiveWaveCapture.ts` direct-child media selectors,
`ScrollPerspectiveWave.tsx` follower discovery, `ProjectDetailsMedia.tsx` media and
poster attributes, and `PosterSelectTransition.tsx` target discovery. No wrappers
were added and no existing motion/media/cursor attribute was removed.

## Verification

- `npm run check:quality`: pass, including strict app/tools typechecks, lint,
  boundaries, growth budgets, design ratchet and Vite build/source graph. The
  existing 50 ESLint warnings remain diagnostics; no new gated failures.
- `npm run check:design -- --base HEAD`: pass on the final source state.
- `node --test scripts/design-check.test.mjs`: 57/57 pass, including new material
  filter, ownership, tier alias and actual material-file fixtures.
- `git diff --check`: pass.
- Chromium baseline: 265 Veluma nodes and 374 Keshi nodes, including generated
  pseudos, at 1440×900 and 390×844. All four final comparisons have zero
  differences, allowing only backdropFilter becoming none. Computed properties
  compare exactly; rects allow 0.05 CSS px numerical drift. Reveal/wave transforms
  are normalized only inside the evidence browser. Intermediate filter-only and
  overridden-declaration cleanup captures are retained with the same exact styles
  and mobile geometry; desktop tech-stack subpixel drift is documented.
- Installed Google Chrome and Firefox: all 80 material nodes (Veluma 34, Keshi
  46) have backdrop-filter none. The other five audited routes have zero opt-ins.
  Firefox has final-state evidence, not a pre-edit baseline.
- Wheel-driven screenshots cover hero/states/atmosphere/proof/rhythm/facts/
  architecture for Keshi and shifts/agents/pipeline for Veluma. Normal-motion
  screenshots show the grid through both materials; revealed sections have
  opacity 1. Visual inspection found the captured text readable. This does not
  establish measured composite contrast for every animated frame or owner acceptance.

Evidence index: [artifacts/veluma-surface/README.md](../../artifacts/veluma-surface/README.md).
Final exact comparison: [after-chromium-report.json](../../artifacts/veluma-surface/after-chromium-report.json).
Normal render: [Veluma](../../artifacts/veluma-surface/natural-chromium-veluma-1440-case-mux-system.png)
and [Keshi](../../artifacts/veluma-surface/natural-chromium-keshi-pomodoro-1440-case-keshi-rhythm.png).

## Cleanup and observations

- Mux CSS: 826 → 646 lines. Keshi surface CSS: 183 → 57 lines.
- No raw recipe colors remain in either migrated recipe stylesheet. Tokens are
  shared at root; existing Veluma/Keshi radii remain distinct.
- One rule per tier assigns semantic roles. The material alone paints opted-in
  elements; route wrappers keep geometry. Adding another consumer uses attributes
  without editing shared selectors.
- SVG removal experiment changes eight generated pseudo filters at each viewport.
  It was retained as required by T2.4; it filters sheen, never the backdrop.
- Baseline preservation exposed an existing difference from Veluma: twelve Keshi
  rhythm tags use black .22 fill and white .32 rim. Those roles were preserved,
  rather than silently changing their paint during migration.
- The original color audit found an unchanged chromatic gradient on
  `.case-keshi-rhythm__loop::before` outside the material (desktop Keshi). Veluma
  and the other case routes have zero findings. The next-layout URL also reports
  that existing gradient. The all-chrome-grayscale acceptance item therefore
  remains open; removing it would conflict with the requested exact baseline
  preservation and should be reviewed separately. See
  [project-detail-colors.json](../../artifacts/veluma-surface/project-detail-colors.json).
- `npm run design:baseline:prune` refused because the guard rules changed since
  the baseline was captured. Baseline was not widened, re-captured or edited.

## Remaining owner boundary

Review the current Veluma/Keshi renders before T6, as required by spec §6.
FreeFlow, ModeNote, Zucchini, Decrypt and Hermes remain on their existing systems.
Hermes requires the additional explicit review specified in T6. No radius
unification or reuse of prior rejected route redesign proposals was performed.
