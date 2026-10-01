# Overnight loop — page table

Pages the loop re-designs, one worktree/branch/worker each. Everything else under
`/project/*` (Decrypt, Zucchini) is **out of scope and must come out unchanged**.

Accepted references (the loop compares against these, never edits them):
`/project/modenote` (pilot, accepted 2026-10-01) and the *style* of `/project/veluma`
as it is today. Taste record: [`../2026-10-01-taste-ledger.md`](../2026-10-01-taste-ledger.md);
rules: DESIGN.md A29–A33.

| Page | Route | Branch (`<D>` = unique run id, e.g. `20261001-231500`) | Dev port | Owner files (edit only these; bare filenames are in `src/components/`) | Data record |
| --- | --- | --- | --- | --- | --- |
| FreeFlow | `/project/freeflow` | `loop/<D>-freeflow` | 5201 | `src/components/ProjectDetailsFreeflow.tsx`, `ProjectDetailsFreeflow.css` | `src/data/projects/freeflow.ts` |
| Hermes Command Center | `/project/hermes-command-center` | `loop/<D>-hermes` | 5202 | `src/components/ProjectDetailsHermes.tsx`, `ProjectDetailsHermes.css` | `src/data/projects/hermes-command-center.ts` |
| Keshi (Pomodoro) | `/project/keshi-pomodoro` and `?layout=next` | `loop/<D>-keshi` | 5203 | `src/components/ProjectDetailsKeshi.tsx`, `ProjectDetailsKeshiNext.tsx`, `ProjectDetailsKeshiNext.css`, `ProjectDetailsKeshiStory.css`, `ProjectDetailsKeshiStoryOverrides.css`, `ProjectDetailsKeshiVelumaSurface.css` | `src/data/projects/keshi-pomodoro.ts` |
| Veluma | `/project/veluma` | `loop/<D>-veluma` | 5204 | `src/components/ProjectDetailsMux.tsx`, `ProjectDetailsMux.css` | `src/data/projects/veluma.ts` |

A page may also edit its data record's **copy** (labels, descriptions, ordering of
its own media). It may not add, remove or swap media files.

Branch names above describe the requested worktree names. Orca may prefix the
actual Git branch (e.g. `Xsmitylnwza/`); always use the returned branch/id rather
than assuming the requested name is the Git ref.

## Single-owner files (workers never edit; ask the coordinator)

`src/styles/tokens.css`, `src/styles/detail-surface.css`, `src/main.tsx`, `src/index.css`,
`src/components/ProjectDetails.css`, `ProjectDetailsLayouts.css`, `ProjectDetailsLightbox.css`,
`ProjectDetailsProcess.css`, `ProjectDetailsStories.css`, `ProjectDetailsStorySharedOverrides.css`
(shared with **Decrypt** — editing it changes an out-of-scope page), `ProjectDetailsStyles.ts`,
`ProjectDetailsShared.tsx`, `ProjectDetailsPrimitives.tsx`, `ProjectDetailsMedia*.ts(x)`,
`ProjectDetailsShell.tsx`, `AppPageRoutes.tsx`, `src/features/**`, `DESIGN.md`, `AGENTS.md`,
everything under `scripts/`, `docs/`, `public/`.

## Per-page rules

- **FreeFlow** — no extra rule beyond the common ones.
- **Hermes** — product screenshots are **not approved for public use** (PRODUCT.md,
  DESIGN.md A14). Use only what the page already ships (the cover). Add no capture, mock
  of the real Discord UI, channel names, ids or numbers. `docs/projects/hermes-*` is not in
  the repo for this run; copy may only be shortened or rephrased from the existing page and
  data record, never extended. Layout must work with a cover-only media set.
- **Keshi** — `?layout=next` is a separate render state and must still render. Story
  files are shared in pattern with Decrypt but not in file: Decrypt must be byte-identical
  in appearance (verify with the screenshot of `/project/decrypt-password` before/after).
- **Veluma** — relayout only: new arrangement, **same visual style** (surfaces, type,
  tokens, chrome). A separate automation is preparing the agreed v4 demo clips; do not touch the media
  list. Render available gallery items with safe empty/single/multiple states; composition
  must not assume exactly N clips. Keep captions attached to their media records rather
  than applying captions for today's clips to future clips by index. The new arrangement must differ from
  Veluma's current section order **and** from ModeNote's.


Only the coordinator's separate media-integration task may replace Veluma's
media list after the layout author settles. It uses the exact approved
hero/start/arrange/canvas specification and verified eight-file handoff at
C:/letmecook/PortfolioX/tmp/veluma-media/handoff.json. Page workers preserve the
current list and associate source labels/descriptions with stable media paths
before rearranging them; do not select future captions by a reordered index.
