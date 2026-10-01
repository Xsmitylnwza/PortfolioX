# Keshi story and content-role contract — proposal

**Status:** Proposed for review, 2026-09-23. No copy, chapter order, or component placement in this document is approved or implemented. The plain Keshi route still uses the order in `KeshiLayout`; `?layout=next` is a separate preview, not a decision.

## Job of the page

A recruiter or interviewer should be able to skim the real timer, understand the Focus/Relax rhythm, see what the Discipline view can actually show, and find the owner's contribution and the system boundary. Keshi can be a **quality reference** for those outcomes without becoming the section-order template for other projects. This follows [PRODUCT.md](../../PRODUCT.md), [DESIGN.md](../../DESIGN.md) A2–A3 and A19–A22, and the earlier [review plan](2026-09-05-design-review-plan.md) §4.1.

## Current sequence and the proposed Keshi sequence

The default renderer currently runs **Hero → Focus/Relax → Atmosphere/settings → Hermes loop → Discipline → Architecture** ([source](../../src/components/ProjectDetails.jsx)). The first concrete record appears after an extensive conceptual Hermes diagram. The same issue survives in the unapproved `?layout=next` preview, which changes pacing but leaves Hermes before Discipline. The proposed sequence below moves the app's own evidence ahead of its integration story. It is specific to Keshi.

| Proposed beat | Visitor question | Primary evidence and editorial job | Gate |
| --- | --- | --- | --- |
| 1. Timer / thesis | What is Keshi? | `main_page` product capture; one sentence names timer and Discipline. Show `Full Stack Developer` as the recorded role and a concise private-access status for live/repo. | Role label exists in project data; concrete personal work still needs evidence. Current public CTAs are intentionally disabled. |
| 2. Focus → Relax | What changes during a session? | Actual Focus `25:00` and Relax `05:00` captures. State labels support the app images; a transition claim needs a linked demo or product code. | Keep caption subordinate to the timers in full-page view. |
| 3. Discipline / recorded state | What can I review afterward? | A selected day and its actual habit or focus mark, with a caption pointing to that mark. | Current capture shows **no focused learning time recorded**. Until a safe linked-session capture exists, describe this honestly as a dashboard/empty-state view, not proof that the shown Focus session became a record. |
| 4. Atmosphere / settings | How can I shape the session? | Theme demo leads; settings is a smaller supporting detail. | Remove repeated generic claims if media itself already shows the control. |
| 5. System boundary / optional Hermes | Where does state live and what may Hermes do? | One concise relationship diagram only for the browser/Pomodoro API/storage/approved-agent boundary that screenshots cannot show. | Do not call a specific feedback loop “live” or promise a next-session cue without a trace or capture. Avoid repeating the same architecture in two diagrams. |
| 6. Ownership / decision / limit | What did the owner build and learn? | Named contribution tied to code or an artifact; one consequential choice and its limitation. | `role: Full Stack Developer` alone does not prove scope. Obtain project source/history or owner-approved notes before writing specifics. |

The page can change rhythm between these beats, but each beat must add evidence or a new relationship. Media leads; annotations explain what is visible. At full-page scale, one primary visual should win each beat. Repeated captions must not become a sequence of equally loud visual stops. This is an acceptance question for desktop **and** mobile, not a selected material recipe.

## Exact copy candidates supported by current sources

These are **proposed replacements**, not approved production copy. They deliberately say less than the current page where the supporting evidence is thin.

| Location | Proposed English copy | Support and limit |
| --- | --- | --- |
| Hero description | “A Focus/Relax timer with a Discipline view for reviewing sessions and habits.” | [Project data](../../src/data/projects.js) lists the timer, Discipline, session/habit features, and real media. It does not establish a measured outcome. |
| Hero role label | “Role · Full Stack Developer” | Exact `role` in project data. Add a contribution sentence only after checking the Keshi project source or owner notes. |
| State labels | “Focus · 25:00” / “Relax · 05:00” | Visible in `focus_mode.png` and `relax_mode.png`; avoid implying that a static pair proves automatic switching. |
| Current Discipline capture | “No focused learning time is recorded in this capture.” | The actual `discipline_dashboard.webp` screen shows this empty state. Replace with a mark-specific caption only when a suitable, approved capture exists. |
| Integration boundary | “Pomodoro owns the active execution state. Hermes can read it; approved workflows can write back.” | [Hermes source of truth](../projects/hermes-command-center-source-of-truth.md) §7 supports this bounded relationship. It does not prove the page's specific quiet-cue loop. |

## Claim and evidence ledger

“Documented” means present in PortfolioX metadata or a design document; it is weaker than product-code or live-behavior verification. A still image proves the displayed state, not the workflow that produced it.

| Current or tempting claim | Evidence now | Status / required proof before stronger copy |
| --- | --- | --- |
| The app has Focus and Relax screens showing 25 and 5 minutes. | `focus_mode.png`, `relax_mode.png`; project data. | **Shown.** State relationship and automatic completion need video or source inspection. |
| A finished Focus session becomes the selected Discipline record. | Current Discipline capture says no focused learning time is recorded; [review plan](2026-09-05-design-review-plan.md) §4.1 notes the same gap. | **Unproved by current media.** Capture a public-safe completed session and its matching day/mark before telling this as a continuous journey. |
| Binary habit scoring, day-total formula, and 7D/30D views. | Project data contains a code illustration, descriptions, and media listing. | **Documented, not runtime-verified here.** Check Keshi product code and a readable capture before presenting formula or cross-view equivalence as verified implementation. |
| Hermes runs a “live loop,” fills missing evidence, or sends a quiet next-session cue. | Current diagram/copy asserts this. Hermes source of truth supports bounded Pomodoro read and approved writes, not this exact end-to-end sequence. | **Needs trace/capture.** Label a diagram as a proposed interaction if retained before verification; remove “live loop” until proven. |
| Per-user storage, scoped gateway, and idempotent writes make every pass safe. | Portfolio project data and page architecture claim this; Hermes documents bound integration practices. | **Partially documented.** Confirm exact Keshi API/storage implementation and a write/read-back example before using this as public proof. |
| The owner personally built the timer, Discipline system, gateway, and design. | `role: Full Stack Developer` only; no contribution ledger in this portfolio. | **Scope unknown.** Do not infer individual ownership from the role label. Collect source/history or an owner-confirmed contribution account. |
| Current screenshots are ready for public use. | Focus/Relax and Discipline captures visibly include an account label. | **Privacy review needed.** Check approval/redaction before reusing, cropping, or publishing new evidence; follow [PRODUCT.md](../../PRODUCT.md) and [DESIGN.md](../../DESIGN.md) A13. |

## Reusable content-role contract, without a shared chapter order

Every project page should expose five facts somewhere in its own choreography: **what the product does; what the owner did; one real behavior; the artifact that supports it; and a meaningful decision or limit.** No fixed count of sections, repeated grid, or mandated hero/architecture sequence follows from this contract ([DESIGN.md](../../DESIGN.md) A22, G4).

| Role | Content obligation | Component/material implication |
| --- | --- | --- |
| Product anchor | Name the product and one concrete job; lead with a real or clearly labeled illustrative artifact. | The main media is the beat's visual anchor. |
| Evidence | Identify the exact state, date/step, and visible detail supporting the adjacent claim. | A media frame presents the artifact; a short annotation points at it. |
| State | Differentiate actual states and transitions without inventing causality. | A state label or surface may encode the state; material is chosen after whole-page hierarchy review. |
| Relationship | Explain a boundary or dependency invisible in screenshots. | Use one semantic diagram, with meaningful linear mobile order; do not duplicate prose already in media. |
| Ownership | Tie a contribution and decision to an artifact or source. | Make it easy to find early, then substantiate it where the evidence fits the story. |
| Limitation | Separate shown, configured, executed, delivered, and verified behavior. | Attach the boundary to the relevant claim; do not hide it in a distant footer. |

For each proposed beat, an editor should be able to answer: **What new thing can the visitor now know? Where is its evidence? What draws the eye first at page scale?** If the beat adds no answer, remove or combine it. This contract proposes editorial acceptance criteria; the open typography, media, composite-contrast, and component-material rules in [DESIGN.md](../../DESIGN.md) §7 still require their own decisions.
