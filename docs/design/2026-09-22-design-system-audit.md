# PortfolioX design system and AI guardrails audit

Date: 2026-09-22
Status: source/configuration audit; recommendations, not newly approved design rules.

## Verdict and scope

PortfolioX has a recognizable direction, semantic color tokens, project briefs, and substantial scoped design experiments. It does not yet have an enforceable production design system that a fresh AI session can reliably follow. The main gap is the connection between accepted decisions, implementation ownership, executable checks, and production acceptance.

The owner confirmed PortfolioX as the target. Reviewed the current dirty checkout without changing application code. Used the design-rules-file skill as an audit framework. No browser was controlled, no fresh render inspected, and no contrast/font-loading/performance acceptance claimed. Historical screenshots and previous experiment results are not current visual verification. Did not run a build or new A/B experiment.

## Existing strengths

- `PRODUCT.md`: audience, art-first/recruiter-readable positioning, distinct project stories, shared black/red world, evidence boundaries and accessibility intent.
- `docs/design/DESIGN-DISCOVERY.md`: feedback and rejected directions; explicitly warns that historical values are not current defaults.
- `docs/design/DESIGN-FOUNDATION-REVIEW.md`: already proposes direction, styling architecture, decisions and quality contracts; explicitly not approved or implemented.
- `src/index.css`, `src/components/ProjectDetails.css`, `src/components/ProjectDetailsStories.css`: real global, case and story variables. Tokens are not absent.
- `design/ab/keshi-liquid-glass-material-r1/SELECTED.md`: a scoped selected recipe and production limitations. Production CSS currently contains the documented 1.3px blur; this source agreement does not prove visual acceptance.
- `docs/design/implementation/phase-6-final-qa.md`: useful viewport, interaction, composite contrast and evidence requirements. Integrated QA remains marked planned.
- `docs/projects/` and the cover spec preserve project identity and truthful capability boundaries.

## Prioritized gaps

| Priority | Finding and evidence | Required clarification or control | Acceptance evidence |
| --- | --- | --- | --- |
| P0 | No root `DESIGN.md` or root `AGENTS.md`; design instructions exist inside experimental subfolders. | Provide one production entry point and precedence order. Separate owner decisions, accepted references, experiments and superseded values. | A fresh reader can identify the current rule and its scope without reconstructing chat history. |
| P0 | Key sources including `PRODUCT.md`, `docs/`, `design/` are currently untracked. | Include canonical rules and necessary reference metadata in a reviewed, reproducible repository handoff; classify bulky/generated/private artifacts separately. | A clean checkout has the same instructions and can run required checks. This audit does not commit anything. |
| P0 | `package.json` runs `eslint .`; `eslint.config.js` ignores only `dist`. A live run entered browser-extension JavaScript under `output/chrome-audit-desktop/Default/Extensions/`. | Define production, tooling and experiment lint scopes; exclude generated output/browser profiles and configure Node/CommonJS tooling appropriately. | Full lint completes against intentional sources; seeded violations in maintained tooling are still caught. |
| P0 | `.github/workflows/deploy.yml` runs install, build and rsync, with no lint/design/visual gate. | Add PR validation and required checks before deploy, using a documented legacy baseline where necessary. | A deliberately broken rule blocks the workflow; existing unrelated debt is visible rather than silently ignored. |
| P1 | ESLint covers JS/JSX and React rules, not CSS design constraints. | Introduce CSS parsing/token checks, override and specificity policy, with a ratchet baseline. | New violations fail; seeded raw values, prohibited overrides and unapproved exceptions fail. |
| P1 | Palette roles exist, but a complete governed typography/spacing/radius/layer/motion contract is not centralized. Raw material values remain in component CSS. | Define primitive → semantic → component ownership, allowed project overrides and material recipe exceptions. Do not blindly prohibit every literal in artwork or shaders. | Every governed value has an owner; new UI consumes the approved roles. Font loading and composite contrast are verified in a render before numeric claims become rules. |
| P1 | Shared case/story CSS and project renderers mix responsibilities. Glass integration history records legacy fill/filter conflicts. | Specify that material owns visual surface; layout owns placement; padding has one owner; page motion owns shared transforms. Define public variants and forbid caller overrides of private internals. | A material can be integrated into a real page without hidden legacy paint; unrelated project surfaces remain unchanged. |
| P1 | Current AI evaluation is mostly local material/layout experiments. | Define task fixtures for new section, existing-section edit, responsive fix and material integration, each with expected constraints and evidence. | Compare identical tasks with/without the rules using independent runs; log model/settings, inputs, violations, owner judgments and revision cost. |
| P1 | `metrics-check.cjs` prints counts, and `image-diff.cjs` prints differences; they do not themselves exit nonzero when documented design thresholds fail. `check-optical.cjs` prints booleans without asserting them. | Put assertions and exit codes in a reproducible runner; distinguish measurement utilities from acceptance gates. | Known-bad fixtures cause nonzero exit for each claimed gate; valid fixtures pass. |
| P1 | Existing pixel-difference thresholds measure candidate separation, not taste, readability or correctness. | Keep separation metrics only for their intended experiment. Use stable visual references for regressions, and owner review for art direction. | A visibly different but rejected design cannot pass as higher quality solely because its delta is larger. |
| P1 | Capture/check scripts hardcode a user-specific Playwright installation and localhost port. | Declare reproducible tooling, configurable base URL, setup instructions, deterministic font/media/motion readiness. | Another checkout can produce the same review artifacts without the author's machine paths. |
| P1 | QA matrix exists but remains planned. | Turn routes × states × viewports into executed coverage; include seven current project IDs, gallery, experience, stack, contact, navigation, aliases and explicit handling of `/persona`. | Record passed/failed/not-run, screenshots, keyboard behavior, reduced motion, zoom, loading/error/fallback states and browser coverage. |
| P2 | Copy rules prevent invented claims, but a production-wide verified-capability registry is not centralized. | Link each project's real capabilities, ownership, limits and approved media to source evidence. Preserve detail as well as honesty. | A new AI can write useful project copy without inventing features or deleting real ones out of caution. |

## Direction decisions still needing explicit boundaries

1. **Shared world versus project identity:** preserve the red/black environment and editorial readability; define where app identity color, layout, materials and imagery may vary. Cover identity color and case-study white/gray text are different scopes, not contradictory universal rules.
2. **Typography:** assign roles for display, section heading, evidence, caption and controls; decide minimum readability and line-length policies from actual renders. Preserve expressive type where it serves the composition.
3. **Composition:** define shared alignment and content constraints without making every case study use the same section order or card grid. Each story beat must add evidence or explain a relationship.
4. **Glass and depth:** define supported backgrounds, aspect ratios, purposes, fallback browsers and touch behavior. Current horizontal Keshi acceptance must not silently become a universal tall-card recipe.
5. **Motion:** distinguish navigation, page wave, local feedback and pointer reflection. Define transform ownership, interruption behavior, reduced motion and time-based easing expectations. Avoid translating “refined” into simply “slower.”
6. **Media and diagrams:** specify crop/readability, captions, loading, playback controls, source provenance and what makes a diagram informative. Do not make illustrative diagrams imply measured architecture or shipped behavior.
7. **Interaction states:** agree on focus, hover, active, disabled, loading, error and no-WebGL/no-optics fallbacks for the components that actually need them.
8. **Acceptance and exceptions:** identify which decisions are locked, which may be explored within scope, and which require an owner choice. Routine choices within an accepted contract should not repeatedly interrupt the owner.

## Suggested evaluation contract

Separate three layers; do not average a hard failure into an attractive overall score:

- **Automated blockers:** applicable JS/CSS checks, unsupported claims where mechanically detectable, broken routes/assets, overflow, keyboard/focus behavior, required fallbacks and reduced-motion behavior. Some claim review remains manual.
- **Visual/semantic review:** hierarchy, readability against actual backgrounds, material fidelity, story usefulness, product individuality and preservation of accepted references. AI feedback must cite a screenshot region or source, not merely declare a score.
- **Owner preference:** unresolved art direction only. A blind preference is an owner's selection, not evidence of conversion or universal quality.

For testing the rules file itself, hold content, scope, assets and environment fixed and vary the presence of the rules. Use a fresh reviewer and multiple bounded runs before drawing a reliability conclusion. For design-choice experiments, vary only the unresolved design dimension. These answer different questions.

## Checks performed

- `eslint src`: **2 errors, 1 warning**, exit 1.
  - `src/components/Cursor.jsx:58`: `react-hooks/set-state-in-effect`.
  - `src/components/TechStackList.jsx:110`: `react-refresh/only-export-components`.
  - `src/hooks/useDocumentRoomReveal.js:104`: `react-hooks/exhaustive-deps` warning.
- Full-scope ESLint: interrupted after observing it process browser-profile extension code under output; no completed whole-repo error count claimed.
- Read production workflow, lint configuration, token definitions, route/project inventory, selected material source, and representative evaluation utilities.
- Read-only inspection establishes configuration gaps, not current whole-site visual defects.

## Recommended next sequence

1. Consolidate existing accepted decisions into a draft root `DESIGN.md`, short root `AGENTS.md` entry point, and a scoped decisions ledger. Reuse the existing discovery history; do not restart preference discovery wholesale.
2. Specify styling ownership and QA in the already-proposed `STYLE-ARCHITECTURE.md` and `QUALITY-GATES.md`, referencing rather than duplicating rules.
3. Repair lint scope, introduce a CSS ratchet, connect executable gates to CI, and test them with known-bad fixtures.
4. Pilot one bounded real Keshi section. Measure production rendering and preserve the selected material and project individuality.
5. Evaluate whether fresh implementations follow the contract better; refine gaps before extending coverage across the site.

No framework migration is justified by these findings. CSS Modules may help isolation, but changing to Tailwind alone would not resolve rule ambiguity, surface ownership or missing acceptance gates.
