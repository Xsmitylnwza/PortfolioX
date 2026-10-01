# Project detail surface rollout — 2026-09-30

The first migration covered Veluma and Keshi, leaving ModeNote and other
projects with legacy dark fills and blur. The owner's subsequent instruction
to scan and fix every occurrence authorized expansion across all seven
projects, including Hermes and the Keshi next-layout preview.

All information cards, captions, chips and case controls now opt into the
shared base/dark/paper material. It uses transparent grayscale fill, rim,
shadow and optional sheen, with no backdrop sampling. Existing layout,
spacing, type, radii and product media remain unchanged. Disabled controls,
semantic icons, status dots and connectors retain their distinct roles.

## Changed owners and route impact

| Owner | Responsibility and affected routes |
| --- | --- |
| `src/styles/detail-surface.css`, `src/styles/tokens.css`, `src/main.tsx` | Shared material, semantic roles and import order; all seven project detail routes |
| `ProjectDetailsMux.tsx/css` | Veluma material consumers and removal of duplicated material paint |
| `ProjectDetailsKeshi.tsx`, `ProjectDetailsKeshiVelumaSurface.css`, `ProjectDetailsKeshiStory.css` | Keshi and next preview; material attributes, wrapper geometry and removal of stacked dark fill/chromatic halo |
| `ProjectDetailsModeNote.tsx`, `ProjectDetailsModeNoteProofs.tsx`, `ProjectDetailsModeNoteStory.css` | ModeNote lifecycle cards, handoff and supporting chrome |
| `ProjectDetailsFreeflow.tsx/css` | FreeFlow cards, captions and controls |
| `ProjectDetailsZucchini.tsx`, `ProjectDetailsZuchStory.css` | Zucchini rating, calculation and result surfaces |
| `ProjectDetailsDecrypt.tsx` | Decrypt cards and captions; preserves positioned mutation arrows |
| `ProjectDetailsHermes.tsx/css` | Hermes cards and context/mode controls; selected states use paper tier |
| `TechStackList.tsx` | Material opt-in only for the `case` variant; document-room stack does not opt in |
| `ProjectDetails.css` | Documents the reveal ancestor backdrop-root behavior |
| `scripts/stylelint-design-boundaries.mjs`, design config/tests | Guard against material backdrop sampling and external sheen styling; mappings cover all eight render states |
| `scripts/quality-function-baseline.json` | Removes obsolete Hermes exemption after extracting a derived descriptor helper; no new exemption |
| `CaseMatteSurface.tsx/css`, `scripts/quality-parked-sources.json` | Removes unused historical component and manifest entries after reachability review |
| `DESIGN.md`, CSS ownership document | Records the current material owner and expanded scope |

## Verification

- `npm run check:quality`: passed, including strict app/tooling typechecks,
  lint, boundaries, growth, design ratchet, build and route graph. Existing
  ESLint warnings remain; no lint errors or new design failures.
- `node --test scripts/design-check.test.mjs`: 57/57 passed.
- `node scripts/quality-growth.mjs`: passed with zero function exemptions.
- `npm run check:design -- --base HEAD`: passed for the expanded scope.
- `git diff --check`: passed after removing an extra trailing blank line.
- Geometry snapshots at 1440×900 and 390×844: zero differences above
  0.1 CSS px in all 16 route/viewport combinations. Motion was normalized
  only inside the audit browser; product motion code remains unchanged.
- Installed Chrome and Firefox: each checked all 16 normal-motion renders;
  zero material failures or page errors. Tests checked grayscale fill,
  material/pseudo backdrop filters, surface width and revealed content.
- Hermes: each browser checked 17 enabled context/mode combinations across
  eight contexts; selected context/mode remained unique and used paper tier.
- Color audit: zero chrome hue violations across all eight render states;
  original-color media are excluded.

Evidence: [geometry report](../../artifacts/detail-surface-rollout/after-report.json),
[Chrome report](../../artifacts/detail-surface-rollout/chrome-browser-report.json),
[Firefox report](../../artifacts/detail-surface-rollout/firefox-browser-report.json),
[color audit](../../artifacts/detail-surface-rollout/project-detail-colors.json).
Audit scripts: `design/audit/detail-surface-rollout.cjs` and
`design/audit/detail-surface-browser.cjs`.

Render inspection confirmed transparent cards with the stage grid visible
in ModeNote, FreeFlow, Zucchini, Decrypt and Hermes. Examples:
[ModeNote desktop](../../artifacts/detail-surface-rollout/chrome-modenote-1440.png),
[ModeNote mobile](../../artifacts/detail-surface-rollout/chrome-modenote-390.png),
[FreeFlow desktop](../../artifacts/detail-surface-rollout/chrome-freeflow-1440.png),
[FreeFlow mobile](../../artifacts/detail-surface-rollout/chrome-freeflow-390.png),
[Zucchini desktop](../../artifacts/detail-surface-rollout/chrome-zucchini-review-1440.png),
[Zucchini mobile](../../artifacts/detail-surface-rollout/chrome-zucchini-review-390.png).
Hermes evidence stays local under the existing private-media constraint.

## Remaining uncertainty

Mechanical and browser verification are not owner visual acceptance. No
formal contrast certification or physical touch-device check was performed.
The existing fixed mobile MENU can overlap scrolled content; this material
migration preserves that geometry. Animated stage screenshots cannot support
a pixel-identical comparison, so geometry and computed styles provide the
comparison evidence.

Baseline prune refused because rule configuration changed; no baseline was
recaptured or widened. All changes remain local for owner review. No commit,
push or deployment was performed. This report supersedes the scope and
remaining-work notes in the historical first-phase report.
