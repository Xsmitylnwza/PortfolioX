# PortfolioX Design Discovery

## Audience and product job

- Primary readers: recruiters, hiring managers, and technical interviewers.
- The portfolio must remain art-first while making product behavior, ownership, and evidence quick to verify.
- Project pages may have different choreography, but they need a shared quality contract and shared evaluation harness.

## Criteria log

### Current work priority — 2026-09-22

User requests establishing design direction, styling architecture and enforceable shared standards before further UI fixes or A/B experiments. Review the complete relevant system against that foundation before selecting changes. See [foundation review](DESIGN-FOUNDATION-REVIEW.md) for source findings and the proposed structure; proposals are not yet approved standards.

Historical rounds below preserve reactions, not current numeric defaults. Round 12's 8px blur was subsequently rejected after backdrop sampling was corrected; the current selected recipe records 1.3px. The prototype's material selection does not establish acceptance of its production rendering.

### Current Keshi surface review — 2026-09-23

The owner rejected the opaque-black alternative in `design/ab/keshi-caption-surface-r1/`. In the owner's words, “สีดำนี้มันสะดุดแล้วมันคอนทราสต์เกินไป”: the dark slab pulls attention away from the surrounding media and would dominate a page if repeated. The cropped, single-caption comparison did not answer the visual-hierarchy question. The owner specifically requested translucent dark options that still show the background faintly, and a view of the full page at real scale.

Criteria from this reaction:

1. Do not advance the opaque-black caption as a candidate shared material.
2. Test multiple dark-translucency levels over the real Keshi background while holding copy, geometry, type and placement constant. These are candidates, not approved opacity values.
3. Judge repeated captions in the context of the whole page and media hierarchy, including mobile, before deciding whether any surface should be reused elsewhere.
4. A caption must support the state and evidence without becoming the strongest visual stop on every section. Choosing a material and deciding where a container belongs are separate decisions.

### Keshi matte direction selected — 2026-09-23

After viewing the full-page comparison, the owner chose the **27% translucent matte** family: “พอเป็นด้านโปร่ง 27% ... มันดูดีมาก” and said Liquid Glass stands out too much. This selects the material family for the next Keshi surface, not an exact blur or border recipe. The requested next study tests a little blur and a highlighted edge around that same matte base.

Criteria from this selection:

1. The red grid remains faintly visible through a near-black matte surface; a fully opaque dark slab and the optical Liquid Glass treatment are not the target.
2. Hold the 27% fill, geometry, copy, placement, media, and page context constant while comparing blur and edge treatments.
3. Check all repeated captions at desktop and mobile page scale; a stronger edge must not make every caption compete with the product media.
4. Make the chosen surface reusable by separating its material from each project's wrapper and content layout. Reuse its role and recipe only where an annotation needs a boundary; other beats may have no surface.

### Round 1 — 2026-09-21 — Keshi is the nearest baseline, not the benchmark

User reaction:

- Keshi Pomodoro is currently closest to the intended direction, but it is not refined or luxurious enough to become the template.
- Liquid Glass is expected to represent information and state, not act as a decorative translucent slab.
- Real demo video is useful evidence and should remain prominent.
- Story sections and diagrams that do not add understanding, evidence, or a real relationship should be removed.
- The existing wave feels refined, but coupling wave behavior to individual containers makes reuse and tuning difficult and raises implementation error risk.
- A/B testing must happen before Keshi is promoted into a shared template.

Criteria produced from this round:

1. Every glass surface must encode a state, hierarchy, control, caption, or evidence boundary.
2. Every story beat must add new evidence or explain a real relationship; otherwise it is removed.
3. Real product media leads; diagrams support only behavior or system boundaries that media cannot show alone.
4. Wave motion is a page-level narration system with explicit motion groups, not a styling requirement attached to every visual container.
5. Keshi remains a candidate reference until blind A/B tests produce a stable preferred direction.

### Round 1 addendum — elements already working

- Preserve the real GIF/video demo treatment.
- Preserve rounded media frames.
- Preserve clean white typography with low visual noise.
- Preserve the red environmental frame/background.
- Focus the redesign on information representation and Liquid Glass material behavior.

## Open decisions

- Preferred Liquid Glass placement and density.
- Which Keshi story beats survive usefulness review.
- Motion-group API that separates wave ownership from card/container styling.

### Round 2 — 2026-09-21 — Reject all first-round candidates

User reaction:

- W, X, Y, and Z were all rejected.
- The test did not prove that any Liquid Glass material would work against the real Keshi environment because the original rendered background was absent.
- Layout exploration was premature and confounded the material decision.
- The next comparison must isolate the Liquid Glass recipe before discussing layout style.

Criteria produced from this round:

1. Liquid Glass candidates are evaluated on a capture of the actual Keshi rendered environment, not a recreated red gradient.
2. Material tests keep content, dimensions, position, radius, and typography identical; only the glass recipe changes.
3. No layout candidate advances until a preferred material family is selected.
4. The first A/B round is recorded as noisy and produces no winner.

### Round 3 — 2026-09-21 — A and C lead, neither is final

User reaction:

- A and C scored highest, but neither is strong enough to adopt.
- A is too bright and visually sharp; its highlight and edge separate from the site instead of blending into it.
- C has an unnatural blur and does not feel restrained, luxurious, or expensive.
- The next material should feel clearer and more glass-like rather than foggy.

Criteria produced from this round:

1. Keep A and C as reference anchors for the next material test.
2. A-derived material reduces edge brightness and highlight intensity without becoming flat.
3. C-derived material reduces dark fill, blur radius, and contrast processing so the background remains legible through the glass.
4. Prefer clear depth and a restrained specular edge over milky frost or heavy blur.

### Round 4 — 2026-09-21 — Move from frosted panel to water lens

Reference reaction:

- The desired material is closer to a clear water droplet than frosted glass.
- The rounded boundary must read as a crisp convex rim, not a blurred soft edge.
- The material needs transparency, controlled blur, gloss, and directional light along the curved edge.
- The reference image is material inspiration only; its text and composition are not instructions for the portfolio.

Criteria produced from this round:

1. Preserve background legibility through the center of the surface.
2. Use a two-level rim: a restrained outer boundary and an inner specular contour.
3. Concentrate highlights along curved corners and one directional edge instead of brightening the whole panel.
4. Use a subtle lower shadow or dark rim to make the surface feel convex and water-like.
5. Reject milky fill, uniform glow, and blur that erases the Keshi grid.

### Round 5 — Interactive optics required

G/H rejected as generic. User expects stronger, responsive specular reflection, water-like transparency and rounded optical depth. Static CSS corner highlights do not meet this criterion. Research and reuse existing implementations before further material invention. The next prototype vendors MIT-licensed rdev/liquid-glass-react for real displacement and mouse-dependent borders, with pointer-directed highlights. Still a prototype against captured Keshi imagery; no live-wave integration or final material approval is implied.

### Round 6 — Luxurious motion, stable geometry

User accepted the optical direction and requested three refinements: remove elastic scale deformation, slow the pointer reflection so it does not flash at every small movement, and add a slight translucent haze without increasing blur. The material geometry must stay fixed while only the reflected light travels across it.

### Round 7 — Optical material accepted; test screen depth next

User accepted the current Liquid Glass material family. The next blind comparison must preserve that material, the real Keshi background, stable geometry, slow reflection, haze, blur, content, size, and placement. The only tested variable is the depth treatment that makes the surface feel more three-dimensional and project out of the screen.

### Round 8 — First depth test failed to separate

User reaction: “มันแยกไม่ออก” — the four candidates were visually indistinguishable. The code differed, but the visible contrast budget was too small: both surface-optics runs stayed inside faint highlights, while both physical-projection runs used shadows too soft to change the glass silhouette at evaluation size.

Criteria produced from this round:

1. A candidate is not a distinct design merely because its CSS differs; the depth profile must be recognisable within 2–3 seconds at the real evaluation size.
2. Every depth round must include clearly separated profiles: baseline, thick optical edge, convex water lens, and lifted glass volume.
3. Before presenting a blind page, measure pixel difference inside the glass region and reject candidates that remain visually near-identical to the baseline.
4. Keep the approved material, blur, haze, layout, content, and slow reflection fixed; spend the larger contrast budget only on depth cues.

### Round 9 — Reject synthetic lens volume; return to accepted baseline

User reaction:

- Every new 3D candidate was rejected as worse than the accepted material before the depth experiment.
- “3D” was interpreted incorrectly. The request meant a restrained sense of lift created by the outer shadow and border/rim, not a convex lens effect painted into the glass interior.
- Internal meniscus lines, caustic bulges, thick dark lower lips, and distorted inner contours make the material strange and must not be introduced.

Criteria produced from this round:

1. The selected material remains the Round 6 optical baseline without any Round 8/9 depth overrides.
2. Preserve the entire interior recipe: refraction, haze, blur, tint, reflection face, and content legibility.
3. If elevation is revisited, change only the external cast shadow and the existing border/rim; never paint a new 3D form inside the glass.
4. “More 3D” means subtle separation from the page plane, not a thicker or more convex object.
5. Do not run another depth round unless the user explicitly asks; the pre-depth baseline is adopted.

### Round 10 — Apply selected material to the real Keshi page

The accepted optical material is integrated into the live Keshi project-detail route as a page-scoped component. It is limited to horizontal overlays whose aspect ratio matches the approved prototype: Focus/Relax captions, atmosphere captions, and proof caption. A real render showed that using the same square displacement map on tall flow and architecture cards pinched their corners into a synthetic star shape, so those cards retain the existing material. The shared page wave remains unchanged; only reflected light follows the pointer inside the local glass surfaces.

### Round 11 — Production integration must clear legacy paint first

User rejected the first production render because the elements were visibly broken and did not match the accepted prototype. Runtime inspection confirmed the new glass component was layered over the old `rgba(0,0,0,.3)` fill, `blur(6px)`, partial bottom-only radius, and inset accent. Resetting those legacy visual properties restored the clear material, proving that production Liquid Glass must own the complete visual surface rather than decorate an existing card.

### Round 12 — Reuse the A/B winner literally

User rejected the cleaned fallback because it reduced the selected Liquid Glass to a transparent border and ignored the actual A/B winner. The production component was rebuilt from the same layer model as `optical.html`: SVG displacement, `.glass__warp`, dual pointer-directed border layers, reflection face, reflection rim, stable geometry, and 0.035 pointer easing. Legacy elements now act only as transparent positioning slots; padding and icon space are inside a new glass container. The only deliberate production difference is blur increased from 1.3px to 8px for the live page, following explicit feedback on the real Keshi background.

### Round 13 — 2026-09-22 — Macro art direction: spiral gallery, poster identity, artistic continuity

Triggered by the AI Design Harness plan step 5: before tuning any more component-level rules, the user set the site's overall direction, which prior rounds had not addressed directly.

User reaction:

- The intended feeling on first landing is walking through a circular, spiral art gallery — pillars coiling upward like a spiral staircase, with the portfolio's work floating on the walls as you pass. The existing `cylinderGrid` orbit rings in `GalleryScene.jsx` are a first attempt at this, but not good enough yet.
- The site overall must feel artistic, strange, and hard to predict, with a spirit rather than a polished-but-soulless finish; it does not need to be perfect. Also elegant, expensive-looking, and professional in substance.
- The clearest concrete complaint: the current project cover posters look obviously AI-generated. They need a full redo, and the user wants to research better poster-making solutions — deliberately useful for both PortfolioX and separate paid poster work on a Fastwork app, so the research is worth doing properly.
- Asked whether the artistic, unpredictable register should continue once a visitor leaves the gallery and enters a project case study (art-first) or shift toward a calmer, more scannable register (recruiter-readable), the user chose to keep the artistic register continuous — explicitly on the condition that the underlying evidence stays findable. In the user's words: information must still be findable, but the *presentation* should have a roller-coaster rhythm, ups and downs, that keeps a visitor excited and wanting to keep scrolling. Each section should be hard to predict from a pattern, but the whole site still reads as one consistent art direction, and each project should carry its own gimmick rather than reusing a shared template.

Criteria produced from this round:

1. The cylindrical/spiral gallery walk is the accepted North Star for the landing experience. Whether to evolve the existing orbit system or rebuild the traversal is not decided by this conversation; candidate approaches go through blind A/B before either is adopted (`design-ab-loop`).
2. Sitewide personality: artistic, has spirit over polish, strange and hard to predict, elegant, expensive-looking; substance (the actual work and its description) stays professional.
3. Project cover posters are rejected as visibly AI-generated and are queued for a full redo, informed by research into real poster-making approaches — shared work with the user's separate Fastwork poster task.
4. The artistic/unpredictable register continues from the gallery into project case studies; it is not replaced by a calmer register there. This holds only together with criterion 5 — it is not license to bury evidence.
5. Evidence and factual content (what was built, what the owner did, the technical claims) must stay findable and legible regardless of how unpredictable the surrounding presentation is. Art governs the frame, rhythm, and surprise; it does not govern whether a fact can be found. This is how criterion 4 coexists with `PRODUCT.md`'s recruiter-readable positioning.
6. Pacing follows a roller-coaster philosophy: deliberate rises and falls in visual/emotional intensity across a page, not a flat, evenly-paced scroll. The goal is to keep a visitor engaged and wanting to continue, not merely to alternate contrast for its own sake.
7. Each project should be hard to predict from the others — no shared section-order template — while the whole site still reads as one coherent, recognisable art direction. Each project should carry a distinct gimmick or hook of its own.

This round sets direction; it does not resolve typography (G2), composite contrast (G8), or interaction states (G7). Those remain open until measured or decided in their own rounds.

### Round 14 — 2026-09-22 — Stage colour: three alternatives tried live, the original red confirmed

Round 13 left open whether red should stay the base environment colour. Tested live, in the browser, on the actual site (runtime CSS custom-property overrides, nothing written to disk) rather than described in the abstract.

Method: pulled real references via the `inspo` tool filtered to vibe "luxe" (Nordiska Museet — deep burgundy; StandardVision — muted warm-gray with gold accent; Synapse Studio — warm stone, colour-free). Applied three candidate stage treatments to the live gallery and the live Keshi case study in turn: a deep burgundy (`#3d0f1c`), a warm terracotta/rust (`#5c2416`), and a near-black stage with red pushed to a pure accent role (`#0c0a0a`).

User reaction:

- Burgundy read as frightening / gothic, "a completely different feeling from the bright red," rejected immediately.
- Near-black made the gallery's orbiting panels lose their presence against the background — quiet to the point of feeling empty, and quietly unsettling in its own way, not luxurious.
- Terracotta kept the panels visible but was still rejected in the final comparison — “ไม่สวยสักสีเลย” (none of the colours were beautiful), all read as duller than what already ships.
- Directly stated: the current saturated red looks better than every alternative tried.

Root cause, stated plainly: the reference search was filtered to vibe "luxe," which pulled quiet/muted palettes (museum, architecture firm, cocktail bar). Round 13 had already established the desired personality includes "แปลก คาดเดาไม่ได้... รถไฟเหาะ... ตื่นเต้นอยากเลื่อนต่อ" (strange, unpredictable, roller-coaster excitement) — an energy the "luxe" reference category does not carry. The search target did not match the brief; muting the red fought the excitement criterion from the previous round instead of serving it.

Criteria produced from this round:

1. The existing saturated red/black stage is confirmed, not merely defaulted to. It is not reopened without a specific, evidence-backed reason.
2. "Looks more expensive" is not achieved by desaturating or darkening the base stage colour. If that feeling is still wanted, the lever is material quality, motion craft, typography or detail — a different question from stage colour.
3. When sourcing outside references for a personality that includes excitement or unpredictability, do not filter to "luxe" alone; a "loud" or "playful" vibe filter better matches that half of the brief, and quiet-luxury references should not be trusted to answer it.

### Round 15 — 2026-09-22 — Display font: Syne confirmed by feel, not by frequency

The user pushed back on closing G2's heading font by pointing at existing usage counts (Syne in 17 files vs Instrument Serif in 1): "ไม่ดูที่ซ้ำ... กูจะไปตอบได้ไงว่าให้เลือกใช้ฟอนต์ไหนทั้งที่กูยังไม่เข้าใจตัวของฟอนต์จริง ๆ เลยว่ามันสื่อความหมายอะไร" — frequency of use is not evidence of the right feeling, and the question can't be answered without seeing what each face actually communicates.

Applied three candidate fonts live to the real "Keshi Pomodoro" H1 in turn — the current Syne, Instrument Serif (already in the palette, used once), and Permanent Marker (in the palette, unused, chosen to show the far end of the range) — and described each plainly as shown: Syne reads confident/modern/tech-startup; Instrument Serif reads fashion-editorial/gallery-placard/poetic; Permanent Marker reads handwritten/cartoon/sketchbook, too far from the "looks expensive" criterion for a main heading.

User reaction: Syne is the best of the three as shown.

Criteria produced from this round:

1. Display/section-heading font is Syne, confirmed by how it read on the real heading, not merely by its existing prevalence in the codebase.
2. Evidence/body, control and caption/mono type roles remain open (G2); this round closes only the display role.
3. Method note: when a font or colour decision is contested, show it live on real content rather than argue from statistics or describe it in words — this was already true for colour (Round 14) and held for type.
