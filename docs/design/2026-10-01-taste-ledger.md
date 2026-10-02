# Taste ledger — Project Details re-design

Working record for the owner's taste session. Not yet part of DESIGN.md; it
becomes the source for the DESIGN.md rewrite once the ModeNote pilot is
accepted.

- **Visual reference:** `/project/veluma` (`ProjectDetailsMux.tsx/.css`) as
  rendered on 2026-10-01 at 1440×900 and 390×844.
- **Pilot page:** `/project/modenote`. The taste captured here becomes the
  reference applied to every other Project Details page.
- Every decision is tagged **system** (applies to all pages) or **identity**
  (this project only, not transferred).

## Decisions — 2026-10-01

| # | Decision | Tag | Owner answer |
| --- | --- | --- | --- |
| T1 | Page length follows the project's complexity. No fixed viewport budget. | system | "ขึ้นอยู่กับความซับซ้อนของ project" |
| T2 | Hero: title, one-line description and meta on the left; one strong product image on the right. Clean. **Since 2026-10-02 (T10) this is a fixed template** — one shared `CaseSplitHero`, no per-project variant. | system | Yes — "ชอบ clean clean" |
| T3 | Section head: mono eyebrow in the left gutter, Syne heading in the content column, two lines at most. | system | Yes |
| T4 | Cards sit in horizontal rows of equal height: icon, short label, chips. One `paper` tile per group is the focal point. No tall narrow text columns. | system | Yes |
| T5 | Media is the largest element and the hero of each section: real product recordings, asymmetric grid (one lead, smaller supports), pill label top-left, kind badge. | system | Yes |
| T6 | Copy is short — one or two lines per card — and phrased abstract and striking ("Return → reveal → start → shape the Canvas."), while staying factual (§4). | system | Yes — "เน้น abstract เท่ๆ" |
| T7 | "Built with" uses the shared inline icon row (`StackBlock`). | system | Yes |
| T9 | Layout arrangement must differ per project — slightly, not a template. The system (T2–T8) is shared; section order, grid rhythm, media placement and the signature section vary per project. Reaffirms A22 for the new standard. ~~Hero may vary too (owner chose option ข: e.g. full-bleed media, or split with sides swapped)~~ — **reversed 2026-10-02 by T10:** the Hero is one fixed template and is no longer part of what varies. Proposed mechanism: shared section-pattern vocabulary + one project-specific signature section + `data-section-pattern` order check against accepted pages + a per-project composition brief approved before implementation. | system | "อยากให้มีวิธีการจัด layout แตกต่างกันไปในแต่ละ project … ไม่อยากให้มันทำเป็น template จนเกินไป" |
| T8 | Project Details get a shared semantic spacing + type scale in `tokens.css`, derived from Veluma's real values (not a new rhythm). Partially closes DESIGN.md G2/G3. | system | Option A (owner, during ModeNote pilot) |
| T10 | One Hero template for every project, matching the current Veluma hero (`CaseSplitHero`, `.case-split-hero*`): copy left, 8:5 media right (frame enforced by a specificity-scoped rule under `.case-split-hero__media`), stacked on mobile. Reverses the Hero part of T9. | system | 2026-10-02: "ปรับแผนพอ hero section มัน unique แล้วมันแปลกๆไม่สวย ปรับให้มันเป็น template แบบ veluma ปัจจุบันทุกเรื่องหน่อย" |

## Pilot status

- 2026-10-01: owner accepted the ModeNote pilot as rendered ("ถือว่าใช้ได้"):
  6-section layout, v2 demo clips (`public/assets/modenote/demo-v2/`) with
  "Fictional demo" labels and one disclosure line, Interface proof as an
  even 3-up step sequence. Not committed.
- Accepted as-is, flagged for later: 3-up clips are small (~360px at 1440)
  against T5; "low latency" chip is an inherited speed claim not shown by the
  clips; v2 captions are still drafts pending owner copy approval in the
  ModeNote repo.

- ModeNote stays as-is until the overnight loop has run; revisit it afterwards
  (owner, 2026-10-01). Candidate fix then: Interface proof as large
  alternating clips, which also moves ModeNote further from Veluma. Until
  then, ModeNote and Veluma are both accepted references the order check
  compares other pages against.

- 2026-10-02: heroes unified (T10). Veluma, ModeNote, FreeFlow, Hermes and
  Keshi now all render `CaseSplitHero`; per-page hero CSS deleted; token
  `--space-hero-gap` added. Keshi lost its extra line "Focus that leaves
  evidence." and its meta row. Decrypt and Zucchini untouched. The loop bundle
  in `tmp/design-loop-seed/ready-v3` still carries the old "Hero may vary"
  rule — a future loop run must re-freeze it.

## Open

- Which ModeNote elements are **identity** (proposed: original-colour product
  poster, dual realtime/durable capture diagram as the signature gimmick,
  Thai–English media, maintenance notice).
- Motion / scroll feel of Veluma that still frames cannot show.
