# Project-page quality contract (draft)

Status: working contract for the Keshi review, 2026-09-23. It records testable responsibilities, not approval of a particular material or a shared page template. The current owner request reopens the suitability of Liquid Glass as a repeatable container; the existing production recipe remains the comparison reference until a replacement is selected.

## What is shared

Every project detail page should let a visitor find these answers without decoding the art direction:

1. What does the product do?
2. What did the owner personally build and decide?
3. What real behavior can the visitor inspect?
4. Which approved artifact supports each important claim?
5. What is the system boundary, limitation, or next decision?

These are **content roles**. The sequence, media scale, background composition, interaction hook, and visual rhythm belong to each project. A common section order would conflict with `DESIGN.md` A19–A22.

## Visual hierarchy contract

At each story beat, the intended first glance is **claim → real media/behavior → specific annotation → next beat**. The media is usually the strongest object after the section heading. An annotation exists to explain a visible detail; repeating the same timer value or generic media label is not enough reason for a large surface.

Judge hierarchy at the page level. A caption that looks attractive in a crop can become a row of competing slabs when Focus and Relax appear together, then two Atmosphere captions appear in the next beat. The Discipline proof caption also overlaps a dark screenshot, so a darker material must be checked for obscuring meaningful evidence. Use full desktop and 390px mobile renders, including repeated surfaces, before approving a component for reuse.

The 2026-09-23 opaque-black alternative failed this hierarchy test: it became the strongest stop beneath already-dark product media. Its rejection is recorded in `DESIGN-DISCOVERY.md`. Dark-translucent replacements are experimental until the owner has seen them in full context.

The material test cannot solve every imbalance. At 390px, the current Proof caption measures about 151px high beside a product capture that is about 170px high. A generic annotation is nearly as large as the evidence it names. The next structural pass should replace it with a short, mark-specific annotation tied to an approved capture, or remove it until that evidence exists; merely making its fill darker would reinforce the wrong hierarchy.

## Component jobs and ownership

| Role | Must communicate | Ownership boundary |
| --- | --- | --- |
| Media frame | A real product capture, recorded behavior, or approved illustration with a truthful label | Owns crop, loading/playback/lightbox and media attributes. Preserve the existing `CaseMediaFrame` DOM contracts. |
| Annotation | A specific visible fact, state change, or evidence boundary | Owns copy and internal type hierarchy. Its material should recede behind the media. It need not always have a container. |
| State surface | A state that changes meaningfully, such as Focus → Relax | Owns state semantics, not page-wide motion. If optics are used, test contrast and backdrop behavior on the actual background. |
| System explanation | A relationship or boundary that cannot be seen in product media | Use a diagram only when it adds information; avoid repeating the same browser/agent → API → storage path in multiple sections. |
| Ownership/decision note | The owner's contribution, decision, trade-off, or limit | Must be grounded in source evidence and easy to locate; a role label alone is insufficient. |

Material owns fill, edge, radius, optics and shadow. Layout wrappers own position and exterior spacing. Content layout owns interior padding and type. Page motion owns scene transforms; a caption may add only its own local feedback. Tokens come from `src/styles/tokens.css`, with project themes overriding semantic roles.

## Keshi pilot: what to review next

- Keep the real Focus/Relax media and red environment as anchors. Evaluate all five rendered glass surfaces together, rather than the Focus caption alone.
- Test dark-translucent caption treatments at several opacity levels. Hold copy, geometry, type, media, and position fixed for the material comparison. Reject any treatment that turns paired captions into the dominant objects or hides the grid entirely.
- Review whether `25:00` and `05:00` need to be restated at this size when the media already shows them. That is a **later copy/hierarchy test**, separate from the material test.
- Move from a product interval to visible Discipline evidence before spending a full chapter on Atmosphere or Hermes. This is a proposed narrative revision, not an accepted implementation.
- Add a verified account of the owner's contribution and tighten Hermes wording to what the source proves. Do not invent session data or turn the current dashboard screenshot into proof of recorded focus time.

## Acceptance checks for a shared component

1. Render the complete project beat and the complete page at desktop and 390px mobile. Check repeated instances, not only a single crop.
2. The primary media and section claim remain more salient than the annotation on first glance; the next beat remains discoverable.
3. Text stays readable over the real composite background, including any fallback without backdrop optics. Measure contrast on rendered pixels before fixing numeric thresholds in `DESIGN.md`.
4. Keyboard focus, touch targets, reduced motion, media/lightbox behavior, and wave/media discovery still work.
5. Run the design checker for changed source and inspect the actual render. Existing recorded debt does not excuse new literals or changed DOM contracts.

## Open decisions

The owner selected the 27% translucent matte material family for Keshi. The exact blur/edge treatment, which Keshi captions deserve a container, shared type/spacing scales outside migrated scope, and how much material may vary by project remain open. A rendered full-page selection is required before replacing the production optical recipe and promoting the final matte recipe into the current `DESIGN.md` decision ledger.
