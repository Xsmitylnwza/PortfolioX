# Design foundation review — 2026-09-22

Status: initial source audit and proposed contract; not an approved design system or completed whole-site visual audit.

## Current direction

Pause UI tuning and new A/B rounds while establishing design direction, styling ownership, and evaluation rules. Preserve PortfolioX's art-first identity and project individuality; shared standards should make implementation and review consistent without forcing every project into the same composition.

The design-discovery skill is useful for converting concrete visual reactions into criteria. It does not itself provide CSS architecture, component boundaries, token governance, or enforcement. Its explicit recommendation to pair criteria with lint and screenshot review is the bridge to that engineering work.

## Findings from the current checkout

| Evidence | Gap | Consequence |
| --- | --- | --- |
| `PRODUCT.md` describes audience, art-first positioning, shared world and accessibility | Direction exists, but there is no root `DESIGN.md` governing production styling | Agents interpret broad adjectives separately |
| `docs/design/DESIGN-DISCOVERY.md` records chronological feedback; `design/ab/.../SELECTED.md` holds the selected recipe | Historical and current rules are not clearly separated; discovery Round 12 still describes 8px blur, which was subsequently rejected | An agent can follow a previously valid but superseded instruction |
| `ProjectDetails.jsx`, `ProjectDetails.css`, `ProjectDetailsStories.css` each span thousands of lines | Large shared files combine multiple page responsibilities; CSS includes repeated overrides and `!important` | Ownership and change impact are difficult to reason about; size alone is not proof of a bug |
| `--case-*` and `--story-*` variables already exist | Tokens are not absent, but allowed overrides and ownership are not expressed as an enforceable contract | New pages can invent independent values or layer material on old surfaces |
| `package.json` uses React/Vite and CSS; no Tailwind dependency is declared | A CSS-versus-Tailwind decision has not been justified by requirements | Changing syntax alone would not fix inconsistent decisions |
| `eslint.config.js` targets JS/JSX, with React hooks/refresh checks | No configured CSS token, specificity, or material-ownership enforcement was found | A build can pass while styles conflict |
| Keshi checks originally verified filter values and layer presence | Rendered material did not match the accepted reference even when those checks passed | Structural tests cannot establish visual acceptance |

## Proposed source-of-truth structure

These are proposed responsibilities, not new approved rules or implemented files.

| Artifact | Owns |
| --- | --- |
| `PRODUCT.md` (existing) | Audience, product purpose, truthful claims, brand intent |
| Root `DESIGN.md` (proposed) | Current accepted visual direction, shared invariants, permitted project variation, links to canonical examples |
| `docs/design/STYLE-ARCHITECTURE.md` (proposed) | Tokens, CSS ownership, component boundaries, overrides, motion and backdrop layering |
| `docs/design/QUALITY-GATES.md` (proposed) | What is checked automatically, what needs rendered review, and acceptance evidence |
| `docs/design/DECISIONS.md` (proposed) | Current decisions with scope, rationale, status and superseded references |
| Project briefs and selected references (existing) | Project-specific composition, content evidence and accepted examples |
| `DESIGN-DISCOVERY.md` (existing) | Historical reactions; not an independent competing source of current values |

Current explicit user decisions take precedence. An accepted scoped project exception must be recorded rather than hidden in a late CSS override. A prototype's visual selection and its production acceptance are separate statuses.

## Proposed styling direction

- Keep CSS for now. Evaluate CSS Modules for project/component isolation before any migration; Tailwind remains an option only if it solves a demonstrated need.
- Separate raw palette/scale values, semantic tokens, material recipes, layout primitives, project composition and motion ownership.
- A material component owns its fill, border, radius, optics and shadow. A layout wrapper owns position and spacing around it. Content padding must have one declared owner.
- Give variants names tied to purpose and an explicit API. Avoid independent one-off recipes and caller overrides of private component internals.
- Keep shared motion at page level. Specify how transforms, clipping, opacity, and filters interact with backdrop sampling.
- Give each agent a scoped target, accepted reference, allowed variables, forbidden changes, and required evidence. If a task requires changing a locked decision, surface that conflict before modifying the reference.
- Any new enforcement starts with a baseline of existing violations. Do not silently turn this review into a whole-site rewrite.

## Review coverage before choosing fixes

| Area | Questions to resolve | Output |
| --- | --- | --- |
| Brand and direction | What is shared across the portfolio, and where is each project's identity free? | Shared/variable boundary |
| Typography and color | Which roles, hierarchy, contrast and content colors are intentional? | Semantic tokens with measured acceptance |
| Spacing and layout | Who owns padding, widths, rhythm, breakpoints and overflow? | Layout contracts |
| Materials | Where does glass communicate meaning; what are the supported shapes, backgrounds and fallback behavior? | Canonical material examples in real context |
| Components | What should be shared, composed per project, or stay project-specific? | Ownership and dependency map |
| Story and diagrams | What does each section add; does it communicate evidence or a real relationship? | Keep/change/remove inventory with reasons |
| Media | Are crop, aspect ratio, rounded frame, loading and captions consistent? | Media contract |
| Motion | Are wave, pointer reflection, transitions and reduced motion compatible? | Motion contract |
| Accessibility and responsive behavior | Can people read and operate each state on keyboard, touch and narrow screens? | Route/state verification matrix |
| CSS and agent workflow | Where do overrides conflict, and what may an agent change? | Enforcement and migration plan |

Cover the shared shell/gallery, each currently exposed project detail page, and Experience/Stack/Contact/navigation. Inventory current routes first; historical plans are not proof that a route is still active. Review coverage does not automatically authorize redesign of every reviewed area.

## Evaluation and sequence

1. Inventory current sources, components, routes and competing rules; label accepted, experimental and superseded decisions.
2. Agree on the shared/variable boundary and write the draft direction and styling contract using existing examples.
3. Review all in-scope areas against that contract and record evidence, impact and priority before selecting fixes.
4. Introduce scoped enforcement: CSS lint/token checks, component boundaries and meaningful browser checks. Use documented exceptions and a legacy baseline.
5. Pilot the contract on one bounded Keshi section against the real live background. Test whether another implementation can follow the same contract without inventing another material.
6. Only then run visual comparisons for unresolved design choices, with one controlled variable and explicit acceptance criteria.

Automation can check token usage, overflow, semantics and state behavior. Human visual review still owns art direction, material character, storytelling usefulness and match to the accepted example. Numeric thresholds must be measured or explicitly proposed, not invented as already verified standards. Owner preference comparisons are design selection, not statistical evidence of visitor conversion.

## Immediate deliverable boundary

This review creates a foundation proposal only. No UI, CSS framework, layout, motion system, production material or historical implementation-plan status is changed. Root design contracts and enforcement remain to be authored and evaluated through the foundation work.
