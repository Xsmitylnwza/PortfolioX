# PortfolioX modularization — Wave 2 report

Date: 2026-09-24 · Branch: `codex/portfoliox-modularization-wave2-3` · Base: `cfe62f2` · Status: **PASS**. Wave 2 was activated by the owner after the conditional [plan](2026-09-24-modularization-plan.md). No deployment or push occurred.

## Decision and change

The Veluma data pilot moved an 85-line record out of the 367-line shared array. Its ordered export and all 24 route/state browser captures matched the pre-edit baseline. That gave a concrete locality gain for a project-specific edit, so the same mechanical move was applied to the other six independent records. `src/data/projects.js` remains the stable ordered export and owns `featuredProjects` and `galleryMediaRevision`; `PROJECT_DECISIONS` stays in the lazy detail route.

| Measure | Before | After |
| --- | ---: | ---: |
| `src/data/projects.js` | 367 lines / 18,873 B | 34 lines / 1,268 B |
| Per-project data modules | 0 | 7 files, 14–85 lines each |
| Total project-data source | 367 lines / 18,873 B | 382 lines / 19,160 B |

The shared entry is **90.7% shorter**; total source grew by 15 lines and 287 B of import/export scaffolding. This is an edit-locality improvement, not a bundle-size or speed claim. `DESIGN.md` now identifies the per-project directory and ordered entrypoint as the source of truth. `RENDER_TARGETS` maps changed data to gallery, persona and project-detail consumers.

## Verification

| Gate | Result |
| --- | --- |
| Source baseline | Current-tree snapshot `e6a17a56d91c90fa77a9c35ba1b9eb1502e754291b433d952ee53740aabeb503` before data moves |
| Veluma pilot | Data deep equality; **24 captures / 138 targets / 0 differences**; project-data tests and scoped design check pass |
| All seven records | Exported project data, featured IDs and `galleryMediaRevision` serialized to byte-identical JSON before/after; SHA-256 both `4370CC07997F8F87587A6D9ADDB57425750BF8936FB3FB4D0744857B16D89605` |
| Full browser parity | Current working tree and isolated staged tree each pass **24 captures / 138 targets / 0 differences** against Wave 2 baseline; expandable media and 3/3 home navigation states pass |
| Data contract | **3/3 tests**: unique ordered IDs, featured references/revision, gallery labels/descriptions and local media sources |
| HMR behavior | Cover-path change in isolated pre-split and post-split fixture trees both remounted the gallery canvas, caused **0 full page reloads**, and left **1 canvas**; fixture files were restored byte-for-byte |
| Mechanical | Scoped design check, full design check and Vite build pass in the isolated staged tree; existing 4,029 debt fingerprints and ratcheted diagnostics remain baseline debt |

The output captures and data snapshots are local under `output/playwright/modularization-wave2-*` and `output/playwright/wave2-staged-final-tree/output/playwright/`. The staged tree was built from `git write-tree`, installed with `npm ci`, and tested separately from the dirty working tree.

The D5 employment/education fact audit found presentation differences, not a verified factual change: Experience, Persona and `site.js` abbreviate some role titles and dates differently, and Persona intentionally shows three roles while Experience shows Freelance too. No employment claim was rewritten or centralized without a canonical evidence review. Wave 3 CSS work begins after this Wave 2 commit.
