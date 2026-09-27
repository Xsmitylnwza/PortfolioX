# AGENTS.md

Instructions for AI agents working in this repository.

## Design work

Read [`DESIGN.md`](DESIGN.md) before changing anything that renders. Do not read
it end to end for every task — go to the section the task touches:

| Task | Section |
| --- | --- |
| Changing colour, spacing, type or radius | §3 Implementation levers, then [`src/styles/tokens.css`](src/styles/tokens.css) |
| Editing the global stage, route shell, utilities or reset | [`docs/design/GLOBAL-CSS-OWNERSHIP.md`](docs/design/GLOBAL-CSS-OWNERSHIP.md); keep `src/main.tsx` import order |
| Changing Project Details colour or borders | §2.1 A25/A27 and §3 Project Details palette: grayscale chrome only; red stage and original-colour product media are the exceptions |
| Touching Keshi captions | §2.1 A26: `CaseMatteSurface` is selected; optical Liquid Glass is historical and must not be reintroduced |
| Editing one project-detail stylesheet | [`docs/design/PROJECT-DETAILS-CSS-OWNERSHIP.md`](docs/design/PROJECT-DETAILS-CSS-OWNERSHIP.md); keep project selectors in that project's file and shared behavior in the common files |
| Writing project copy or claims | §4 Content truth |
| Anything where the right answer is not written down | §7 Known gaps — **ask, do not invent** |

### Rules that are mechanically enforced

Governed values must come from a declared token in `src/styles/tokens.css` —
in stylesheets **and** in static JSX `style={{ }}`, under the same config. Raw
colours, lengths, radii and type sizes are new violations. The diagnostic names
the file, line, offending value and the token family to use.

Two more rules: an unregistered `!important`, and styling a locked material's
internals (`.keshi-liquid-glass__*`) from another stylesheet. The second is the
exact failure that broke the first production glass integration.

```bash
npm run check:design -- --files <path...> --mode fast   # while iterating
npm run check:design -- --base HEAD                     # before handing work over
npm run design:baseline:prune                           # after a final run passes
```

One command picks the scope, runs what applies, and prints scope / checked /
skipped / existing debt / new failures / routes to look at. There is no default
scope — it exits 1 rather than report "pass" for nothing. A file with no route
mapping exits 1 as `needs-scope`; add it to `RENDER_TARGETS` or say which route
to check. There is no `--fix`.

Legacy code carries recorded debt and is exempt. **Migrated code is not**: the
media-frame chrome (`.case-media__frame`, `.case-media__label`,
`.case-media__kind*`) is a strict scope with no baseline allowance.

### Things that will get a change rejected

- Adding a raw colour or length to migrated code, then pointing at the baseline
- Creating a new token for every raw value to make the linter pass. Reuse the
  semantic role that *means* the right thing first
- Overriding a **primitive** in a project theme. Themes override the semantic
  role; a primitive override does not re-resolve a role declared at `:root`
  (measured — see [phase-3 report](docs/design/harness/phase-3-report.md) §3)
- Disabling a rule or widening the baseline to clear an error. If you are stuck
  in a constraint conflict, say so instead of looping
- Treating "the build passed" or "the linter is green" as visual acceptance.
  They are not. Look at the render
- Pruning the baseline to make a failure go away. Prune is reduce-only, re-lints
  from scratch, and refuses to run on a failing tree or against changed rules
- Rounding spacing into a tidier scale during unrelated work. That is a redesign

### Preserve these when refactoring

`data-wave-follow` (page motion), `data-media-kind`, `data-poster-transition-target`,
`data-cursor` / `data-cursor-text`, and the direct-child relationships media
discovery relies on. Check the real consumer after extracting a component, not
just the component's own render.

## Other instructions

- Before editing a legacy component with no active route, read the [Wave 5 reachability decision](docs/architecture/2026-09-24-modularization-wave5-report.md). `Hero.css` and `KeshiLiquidGlass.css` are active even though their namesake JSX modules are parked.
- Source changes stay local for owner review. Do not commit, push or deploy
  unless asked ([`PRODUCT.md`](PRODUCT.md) § Capabilities and Constraints).
- Never put private data, identifiers, secrets, unverified metrics or
  unsupported deployment claims into public assets or copy.
- Hermes product screenshots are **not** approved for public use.

## AI change contract

Before a source edit, identify its owner file and affected routes. Keep unrelated
files alone, reuse established components and semantic tokens, and add an
abstraction only for two live consumers or a clear complexity boundary.
For a handoff, report changed owners and route impact, the quality-gate result,
render/interaction evidence for visual changes, and any remaining uncertainty.
`npm run check:quality` runs strict app and tooling typechecks, lint, boundaries,
growth budgets, the design ratchet and one Vite build whose graph is checked
against route declarations. A green mechanical gate still needs render review.
