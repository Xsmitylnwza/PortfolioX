# PortfolioX maintainability: App, WebGL, and case CSS

Date: 2026-09-28. Base: merged React/TSX quality work on `main` (`95b0b7d`). Status: proposed execution plan; no source refactor is included here.

## Goal and scope

Make active code easier to change without altering routes, content, art direction, media behavior, stage continuity, or production availability. This plan covers the three next steps requested by the owner:

2. App room/curtain transitions.
3. Gallery and scroll-wave WebGL ownership.
4. Project-detail CSS ownership and optional loading pilot.

The previously suggested growth-gate redesign is **out of scope**. Keep the current gate and its reduce-only baselines. Do not spend a wave on parked components or switch routing frameworks; `/project/:id` and its per-case lazy JS entries already exist.

## Source truth and constraints

| Surface | Current state | Constraint for the refactor |
| --- | --- | --- |
| `src/App.tsx` | 564 lines; the `App` function spans 526 lines. It owns boot, visible/pending room state, enter/exit timers, poster flight, route classes, stage mounting and the view tree. | Preserve loader, curtain, history, custom events, `data-route-phase`, `data-wave-host`, and the persistent gallery stage. |
| `src/components/GalleryScene.tsx` | 875 lines; one effect owns OGL setup, poster textures, input, RAF, context recovery and cleanup. Geometry, shaders and poster rasterization already have owners. Its canvas is appended before the current cleanup callback is assigned, so a later initialization error can leave a partial context. | Keep one persistent stage and pair every acquired GL resource/listener with disposal, including partial initialization. |
| `src/components/ScrollPerspectiveWave.tsx` | 708 lines; one effect owns media/capture resources, scroll sync, RAF, observers, context recovery and cleanup. Capture, animated-raster and shader helpers already exist. It likewise appends a canvas before assigning cleanup. | Preserve `data-wave-follow`, `data-media-kind`, direct-child media discovery, Lenis/native scroll, reduced-motion fallback and shared-stage synchronization; dispose after partial initialization failure. |
| Project CSS | ModeNote 2,337 lines; FreeFlow 2,129 lines. `ProjectDetailsStyles.ts` imports all case CSS in a deliberate order; the emitted combined case CSS asset is 268,685 uncompressed bytes. ModeNote base and story files both set `.case-section--modenote` background, with the story rule intentionally winning. | Keep semantic tokens, grayscale chrome, original-color media and the proven production cascade. Size alone does not justify splitting: exact same-context selectors repeat in only six ModeNote and two FreeFlow groups. |

The quality gate pins 20 existing functions over 180 lines by exact content fingerprint, including the large functions above. An edit to one of them fails until that function is reduced under 180 lines and its old allowance is retired. Since step 1 is skipped, each affected owner needs an **atomic final green refactor**. Develop and compare in an isolated checkout, but do not publish an intermediate failing tree, widen the baseline or add an App size exception. A named renderer/GL exception is a contingency only if a cohesive setup/teardown cannot be separated safely; it must have an owner, reason and review trigger.

## Shared proof contract for every rendering slice

1. Capture a fresh before manifest for the exact merged source tree and record emitted JS/CSS assets, active route list, viewport/DPR, fonts and reduced-motion state. Reuse the strict case/global comparator; a missing route or target is inconclusive.
2. Run `npm run check:quality` and the relevant tooling suites. For room and WebGL changes, repeat gallery → case → gallery, direct entry, back/forward, slow/rejected case import, media close/focus/scroll-lock, WebGL context recovery and repeated lifecycle navigation. For either GL engine, force an initialization failure just after canvas acquisition and prove the canvas, context and acquired listeners/resources are released.
3. Inspect the rendered result at desktop, mobile and reduced motion. Preserve `data-wave-follow`, `data-media-kind`, `data-poster-transition-target`, `data-cursor` / `data-cursor-text`, direct-child media discovery and the page's actual visual composition. Build/lint success is not visual acceptance.
4. Record changed owner files, old/new lines and bytes, imports and route consumers. Retire only legacy size/function allowances made obsolete by the slice. Revert only that slice if its proof fails; retain unrelated dirty work.

## Step 2 — room transition controller

**Aim:** make `App` a readable composition of the stage, page shell and transition controller, with one small interface for navigation and poster handoff. Keep the route table and lazy case registry in their current owners.

**Preparation:** characterize the current transitions before editing `App`: cold boot on home and a direct project URL; gallery poster selection; route-to-route navigation; quick repeated selection; history back/forward; loading timeout, rejected chunk, navigation away and unmount. Use the existing runtime/lifecycle probes first and add only the missing assertions. Record the event/state sequence, including `roomContent`, `pendingRoom`, entering/exiting, curtain and cleanup.

**Refactor seam:** one room controller owns phase transitions, timers and DOM phase classes. The poster flight remains part of that controller or an internal collaborator, not a pass-through hook with many state setters. `App` consumes a view state and a few actions (`navigateToRoom`, poster selection and completion) and renders the existing stage/page/curtain tree. Make the transition rules pure where possible; keep the browser effects at the controller edge. Avoid a generic state-machine framework or a new abstraction for every boolean.

**Gate consequence:** a one-line edit to the 526-line `App` function cannot be an independently green slice under the current fingerprint policy. Rehearse the complete extraction in an isolated checkout, then prepare one bounded locally reviewable result whose final `App` function is under 180 lines, whose file is under 500 lines, and which retires its obsolete function and owner caps in the same change. Do not change timings or visual styling during this slice. Packaging or publishing a PR requires a later owner instruction.

**Acceptance:** all existing route and curtain paths remain observable; no stuck loading class or late callback after unmount; the persistent stage never blanks on document swaps. Strict before/after route captures and lifecycle/slow/failure probes pass. Rollback is a revert of this PR only.

## Step 3 — WebGL resource ownership, one engine at a time

**Preparation and go/no-go:** measure current frame timing, canvas/context count and resource lifetime on home, a project page and a document room. The gallery RAF intentionally remains active outside persona while a detail page may also run the scroll-wave RAF. Treat simultaneous loops as a measured cost question, not an assumed bug; pausing the stage has previously blanked it. Sketch the runtime interface against the actual mutable values. If `start`/`sync`/`dispose` would require a broad parameter bag or add more call-site knowledge than it removes, stop the extraction and record that decision rather than split for LOC alone. The partial-initialization leak remains open in that case; do not claim Step 3 complete or silently waive the gate. The owner can then choose a different seam or a separately reviewed renderer exception. When extraction proceeds, treat leak repair as a distinct corrective behavior inside the engine slice: force failure after canvas append before changing cleanup and prove the before/after difference.

**Gallery slice:** keep the React wrapper responsible for host/ref and props. Move the OGL lifetime behind a narrow runtime interface such as `start`, `sync` and `dispose`; internal functions can own scene/texture creation, input/selection, frame updates and teardown without passing a large mutable parameter list through shallow wrappers. Reuse the current Geometry, PosterTexture, Shaders and Types modules. Install incremental disposal from the first canvas/context acquisition, including when later setup throws; pair pointer, wheel, keyboard, viewport, visibility and context listeners with removal at the same ownership seam. The final local result must remove/retire all changed oversized Gallery fingerprints and bring new functions under 180 lines; avoid a permanent broad size exception.

**Scroll-wave slice:** in a separate local slice, let one runtime own GL/media/capture creation, recapture scheduling, render/scroll synchronization and disposal. Reuse the existing Capture, AnimatedRaster and Shaders modules. Install disposal immediately after the canvas/context is created, then extend it as resources are acquired. Preserve direct-child media discovery, capture fallbacks, DOM styles restored at cleanup and context-loss recovery. Retire the changed wave fingerprints only when the final runtime is under the configured function budget.

**Acceptance for each slice:** new modules stay under 500 lines and new functions under 180; retire the corresponding legacy function fingerprints and owner cap if the old owner drops below 500. Use a test-only injected renderer/setup factory to throw immediately after canvas append, without a production failure flag. The cleanup leaves no retained canvas, listener, observer or capture timer, and releases GL resources/context where supported; normal context recovery and media fallbacks also work. Repeated room cycles, route screenshots/DOM and stage continuity match baseline. Report frame timing and memory observations without claiming a speed gain from LOC reduction. Revert only the affected engine slice on failure.

## Step 4 — case CSS locality and a measured loading decision

**First, within current files:** audit rule ownership and actual overrides in ModeNote and FreeFlow. Remove a superseded declaration only when the flattened rule order and computed result prove it has no effect. Keep project-specific selectors in their owner file and shared behavior in common files. Reuse semantic tokens; do not mint a token per raw literal or round spacing during cleanup. Work on one case per local slice.

**Then, optional CSS-loading pilot:** select one case only after mapping *all* stylesheets that set its selectors and variables, including base/story pairs and shared rules. ModeNote's base and story stylesheets are an ordered unit: the story file currently overrides the base background and story-heading width. Moving only the base file would reverse those results. Choose an actually isolated case, or move its complete ordered case-owned CSS group while keeping shared rules eager. Measure the current case CSS request and expected saved transfer. If worth testing, remove every stylesheet in that selected group from `ProjectDetailsStyles.ts` and import the group from only its lazy entry in the same order. Keep `AppPageRoutes.tsx`'s eager `DocumentRoom.css` and `ProjectDetails.css` imports ahead of lazy themes; that ordering previously fixed a production-only cascade regression. Inspect Vite's graph to prove the selected group left the common chunk. In the same slice update `RENDER_TARGETS` and ownership documentation; update `MOVED_CSS_DEBT_PATHS` and applicable `STRICT_SCOPES.files` if a stylesheet path changes. Compare production rule order and computed/rendered results for direct entries and both A → B → A / B → A → B route orders on desktop, mobile and reduced motion, including the Keshi ↔ Decrypt pair. A known raw media-frame value must still fail the strict design scope in any moved path.

**Decision:** keep the shared CSS chunk if the saving is small or any cascade/render difference appears. Do not scatter 2,000-line stylesheets into many chapter files merely to lower per-file LOC. For an accepted pilot, record uncompressed and transferred bytes, route requests and source edit locality; claim a performance gain only if transfer/execution measurements support it.

## Local execution order and later publication

1. App transition slice after characterization evidence.
2. Gallery runtime slice, then scroll-wave runtime slice. Do not combine the two GL lifecycles in one change.
3. ModeNote CSS cleanup slice, then FreeFlow CSS cleanup slice. Decide on one-case CSS-loading pilot only after those results and a measured benefit.

Keep each completed slice local for owner review. **This plan does not authorize a commit, push, PR, merge or deployment.** If the owner later asks to publish a slice, package it as a separate reviewable and revertable PR. A later authorized production merge requires its own quality and visual/interaction gates, backup and post-deploy verification for the affected route. The parked-source decision remains KEEP until the owner separately changes it.

## Review convergence

The smaller alternatives are to leave a cohesive WebGL engine intact if extraction adds a broad interface, and to keep CSS shared if a route-specific pilot saves little or changes the cascade. App still needs a deliberate controller seam because its room/curtain lifecycle is spread through one frozen oversized function.

| Pass | Finding and correction | Remaining proof |
| --- | --- | --- |
| 1, source trace | The initial draft did not name every DOM discovery attribute, implied CSS debt paths always move, and could force a WebGL split solely to meet LOC. Added the explicit attributes, made debt-path updates conditional, and added a runtime-interface go/no-go. | Browser parity, resource lifetime and CSS request savings must be measured during their slices. |
| 2, end-to-end reread | No new blocker after following `App` → route shell/curtain, Gallery setup → RAF → disposal, ScrollWave discovery → recapture → disposal, and `ProjectDetailsStyles.ts` → emitted CSS. Added an explicit check that the pilot CSS import actually leaves the common chunk and that renderer caps/fingerprints retire when reduced. | The existing function-fingerprint gate forces each changed oversized owner to land atomically green. |
| 3, counterexamples | No new blocker after considering repeated navigation, rejected imports, history changes, unmount, context loss, reduced motion, reversed CSS load order and a pilot with no transfer gain. | Stop or revert only the failing slice; no performance gain is assumed in advance. |
| 4, sub-agent review | Three major gaps: a ModeNote base-only CSS pilot would reverse same-specificity story overrides; the delivery text implied future PR/deploy authorization; and both GL engines can leak a canvas/context when setup throws before cleanup assignment. | Treat coupled case CSS as one ordered group, make every external publication action owner-authorized, and require disposal from first acquisition plus forced partial-init failure proof. | Recheck the full plan after correction. |
| 5, owner full reread | No new blocker or major after tracing the real App route/curtain controller, Gallery and ScrollWave acquisition/RAF/cleanup paths, exact fingerprint gate, and eager-base/lazy-theme CSS order. | Added the explicit fallback if a GL interface becomes too broad and kept the eager route-shell CSS imports in the pilot contract. | Runtime behavior, partial-init cleanup and transfer saving remain execution-time proof gates. |
| 6, owner counterexample reread | No new blocker or major after testing the plan against failure after canvas append, a reversed ModeNote base/story load, untracked work, repeated navigation, reduced motion, and an attempted merge without fresh owner authorization. | The plan stops or reverts the affected local slice; it does not call incomplete evidence a pass. | No further plan change; execution stays local until separately authorized. |
