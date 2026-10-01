# Keshi as a project-page quality reference — review, 2026-09-23

Status: review and first comparison in progress. This document proposes a shared quality contract; it does not promote Keshi's current composition or glass material to a sitewide template.

## What the current page actually shares

| Area | Observed source | Design-system implication |
| --- | --- | --- |
| Media | `CaseMediaFrame` in `src/components/ProjectDetails.jsx` is already reused; it owns the lightbox and media attributes. | Keep one media behavior contract, then permit project-specific crops and sequencing. Preserve `data-wave-follow`, `data-media-kind`, `data-poster-transition-target`, cursor attributes, and media discovery's direct-child relationships. |
| Glass | `KeshiLiquidGlass` appears on the Keshi Focus/Relax captions, two atmosphere captions, and the proof caption. Other project pages do not render it. | Treat the current optical recipe as an existing Keshi baseline. Its appearance and semantic placement are under review at the owner's request; do not generalize it while that decision is open. |
| Page composition | Keshi, FreeFlow, ModeNote, and Hermes use different chapter orders and visual hooks. | Share layout constraints and content roles, not a fixed section order. This preserves `DESIGN.md` A19–A22 while allowing common implementation standards. |
| Styling | `src/styles/tokens.css` and `npm run check:design` already govern selected values. Much of the legacy CSS remains in the recorded baseline. | New shared components should consume semantic roles; a project theme overrides roles rather than primitives. Do not use baseline debt as permission for new values. |

## Issues the Keshi reference must resolve before wider use

1. **The Focus caption's visual job is unclear.** In the supplied image, the large optical surface competes with the timer and state text. `KeshiState` wraps cue, time, and description in a glass surface below the real app capture. The first comparison changes only that surface material while preserving the live background, content, geometry, type, and media. A preference here selects a direction to investigate, not a sitewide component.
2. **The evidence arrives late.** Current order is Hero → Focus/Relax → Atmosphere → Hermes loop → Discipline proof → Architecture (`KeshiLayout` in `ProjectDetails.jsx`). The earlier project review proposed moving Discipline immediately after Focus/Relax so a reader sees what a session records before reading about atmosphere or integration. This remains a proposed narrative revision.
3. **Ownership is hard to locate.** The current Keshi hero omits the role stored in `src/data/projects.js`, and the rendered page has no concise contribution/decision/limitation beat. A role label alone would still be too thin; the page needs a specific, verified account of what the owner built and decided.
4. **Some proof and copy are ahead of the visible evidence.** The Discipline capture demonstrates the dashboard interface, but the selected day shows no focused learning time. The proof caption repeats generic media labels instead of annotating an actual mark. The Hermes loop and Architecture also repeat the browser/agent → API → storage relationship, while phrases such as “live loop” and “next-session cue” need source-backed qualification before they become reusable claims.

## Proposed shared quality contract

Every project page should make five facts easy to find: what the product does, what the owner built, one real behavior, its supporting evidence, and a meaningful decision or boundary. Those are **content roles**, not mandatory chapters. A project chooses its own sequence, visual hook, pacing, and approved media.

Component roles should be explicit: `media frame` presents evidence, `annotation` explains a visible detail, `state surface` distinguishes an actual state, `system diagram` explains a relationship the media cannot show, and `boundary note` separates verified behavior from an illustration. The material for each role is a design choice. A liquid-glass surface is not a default container.

For implementation, separate material ownership (fill, edge, radius, optics, shadow), wrapper layout (position and external spacing), content layout (internal padding and type), and page motion. Preserve the existing media and wave DOM contracts when changing a component.

## First decision gate: Focus caption material

The first comparison placed the current optical surface beside an opaque matte/ink surface on one cropped Focus caption. The owner rejected that test's matte option: it is too dark and draws attention away from other content, especially if repeated across a page. The second comparison tested several dark-translucency levels over the live Keshi background on **all** caption uses and shows the full-page context at desktop and mobile sizes. Copy, type, size, radius, position, and media remained constant. This is a design preference comparison, not a visitor-conversion experiment. Only after a surface direction is chosen should placement, density, and layout be compared.

The [round-2 full-page study](../../design/ab/keshi-caption-surface-r2/READOUT.md) now shows the existing surface, three optical veils (16/27/38%), and a 27% translucent matte treatment. It confirms that a material can be quiet enough for Focus/Relax while the oversized Proof annotation still competes with its image on mobile. No treatment has been accepted as the sitewide standard.

After the owner reacts, record the exact preference as a criterion in `DESIGN-DISCOVERY.md`, then update `DESIGN.md` only for the chosen rule and its scope. A later round can test whether that rule produces better outputs on another project without forcing Keshi's page structure onto it.

## Source boundaries

- `PRODUCT.md`: audience, art direction, evidence and ownership requirements.
- `DESIGN.md` §§2, 3, 4, 7: accepted direction, existing optical baseline, token rules, content truth, and open gaps.
- `docs/design/DESIGN-DISCOVERY.md`: prior reactions; Round 1 already said Keshi was closest but not a template, and Round 2 rejected material tests without the real background.
- `docs/design/2026-09-05-design-review-plan.md` §4.1: earlier Keshi narrative proposal and the Discipline capture limitation.
- `src/components/ProjectDetails.jsx`, `src/components/KeshiLiquidGlass.*`, `src/components/ProjectDetailsStories.css`, and `src/data/projects.js`: current implementation and claims.
