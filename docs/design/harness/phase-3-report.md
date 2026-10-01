# AI Design Harness — ขั้น 3: central tokens และ pilot migration

วันที่: 2026-09-22 · แผน: [AI-DESIGN-HARNESS-PLAN.md](../AI-DESIGN-HARNESS-PLAN.md) §6 ขั้น 3
สถานะ: **ขั้น 3 เสร็จ** · ยังไม่มี runner รวม (`check:design`), ยังไม่มี A/B pilot

---

## 1. ทำอะไรไป

| ผลงาน | ไฟล์ |
| --- | --- |
| Central tokens (primitive → semantic → theme) | [`src/styles/tokens.css`](../../../src/styles/tokens.css) |
| Global import + compatibility aliases | [`src/index.css`](../../../src/index.css) |
| Pilot slice migrate | `ProjectDetails.css`, `ProjectCoverMedia.css`, `ProjectDetailsStories.css` |
| Strict migrated scope | [`scripts/design-check.config.mjs`](../../../scripts/design-check.config.mjs) |
| Rules entry point สำหรับ agent | [`AGENTS.md`](../../../AGENTS.md) |
| กฎปัจจุบัน | [`DESIGN.md`](../../../DESIGN.md) |

**ไม่มีค่า design ใหม่ถูกคิดขึ้นในขั้นนี้** ทุกค่าใน `tokens.css` ยกมาจากสิ่งที่เว็บ render อยู่แล้ว

---

## 2. Token architecture

```
Layer 1  --palette-black-900: #0b0b0b              ค่าดิบ ไม่มีความหมาย
Layer 2  --color-media-surface: var(--palette-black-900)    ← component ใช้ชั้นนี้
Layer 3  .case-section--keshi { --color-media-surface: var(--palette-black-880) }
```

**การ reuse ที่เกิดขึ้นจริง ไม่ใช่ token-ต่อ-ค่า:**

| Token | ใครใช้ |
| --- | --- |
| `--color-chip-ink` | `.case-media__label`, `.case-media__kind`, `.case-media__kind-dot` |
| `--color-chip-surface` | `.case-media__label`, `.case-media__kind` |
| `--color-chip-edge`, `--color-chip-lift` | `.case-media__label`, `.case-media__kind` |
| `--type-size-chip`, `--type-tracking-chip` | `.case-media__label`, `.case-media__kind` |
| `--radius-pill` | `.case-media__label`, `.case-media__kind`, `.case-media__kind-dot` |
| `--border-width-hairline` | frame border, chip borders, `::after` hairline |
| `--color-media-surface` | frame ทุกโปรเจกต์ + override ของ Keshi + override ของ cover |

`.case-media__frame { background: #0b0b0b }` ตรงกับ `--bg-dark` ที่มีอยู่แล้วพอดี → reuse ไม่สร้างใหม่

**Compatibility aliases:** ชื่อเดิม 23 ตัวใน `index.css` (`--text-primary`, `--bg-dark`, `--font-mono`, …)
กลายเป็น forwarder ไป semantic role ทำให้ CSS อีก 27 ไฟล์ไม่ต้องแก้อะไรเลย
ตรวจก่อนทำแล้วว่า **ไม่มีชื่อใดถูก redefine ใน scoped selector** จึงปลอดภัยที่จะ alias ที่ `:root`

---

## 3. กฎ cascade — วัดจริง ไม่ได้เดา

custom property resolve ที่จุดที่ **ประกาศ** และค่าที่ resolve แล้วเท่านั้นที่ inherit ลงไป
แปลว่า theme ที่ override *primitive* ใต้ role จะไม่มีผล ต้อง override *role*

ทดสอบบน `/project/keshi-pomodoro` ของจริง (`--color-chip-surface: var(--palette-white)` ประกาศที่ `:root`):

| ทำอะไร | `.case-media__label` background | ตีความ |
| --- | --- | --- |
| เริ่มต้น | `rgb(255, 255, 255)` | — |
| override `--palette-white` บน `.case-section--keshi` | `rgb(255, 255, 255)` — **ไม่เปลี่ยน** | primitive override ที่ descendant ไม่ re-resolve role |
| override `--color-chip-surface` บน `.case-section--keshi` | `rgb(255, 0, 0)` — **เปลี่ยน** | role override คือวิธีที่ถูก |
| คืนค่า | `rgb(255, 255, 255)` | ไม่มีอะไรค้าง |

**ข้อควรระวังที่พบระหว่างทดสอบ:** ตอนแรกผมทดสอบด้วยการ override `--palette-black-880` บน `.case-section--keshi`
แล้วเห็นว่าสี **เปลี่ยน** ซึ่งดูเหมือนขัดกับกฎ — แต่ไม่ขัด เพราะ `--color-media-surface` ถูกประกาศ *ในบล็อก theme นั้นเอง* (Layer 3)
primitive override ที่ scope เดียวกับที่ประกาศ role จึงมีผล **เป็นความบังเอิญของ scope ไม่ใช่ pattern ที่ควรลอก**
comment ใน `tokens.css` ถูกแก้ให้ตรงกับผลวัดแล้ว

---

## 4. พิสูจน์ว่าหน้าตาไม่เปลี่ยน

เทียบ computed values หลัง migrate กับ [`phase-1-before-render.json`](phase-1-before-render.json)
ด้วย `compareAgainstBefore()` ใน [`scripts/design-probe.mjs`](../../../scripts/design-probe.mjs)
(selector/property ชุดเดิมเป๊ะ ไม่ได้นิยามใหม่)

| Capture | dpr เทียบกันได้ | ค่าที่เทียบ | ค่าที่เปลี่ยน |
| --- | --- | --- | --- |
| `pilot-keshi/desktop` | ✅ 1 → 1 | 144 | **0** |
| `pilot-keshi/mobile` | ✅ 2 → 2 | 144 | **0** |
| `nonpilot-zucchini/desktop` | ✅ 1 → 1 | 81 | **0** |
| `nonpilot-zucchini/mobile` | ✅ 2 → 2 | 81 | **0** |
| **รวม** | | **450** | **0** |

รวมถึง **glass sentinel ทั้งสามจุด** (`backdrop-filter: blur(1.3px) saturate(1.04) url(#keshi-glass-…)`,
rim `rgba(255,255,255,0.26)`, shadow `0 12px 40px rgba(0,0,0,0.25)`, radius 32px/21.6px) — ไม่ขยับ

และ **project override ไม่ drift**: Zucchini ยังเป็น `rgb(5,5,5)` / `rgba(255,255,255,0.44)` / `15.2px`
ส่วน Keshi ยังเป็น `rgb(9,9,9)` / `rgba(255,248,236,0.16)` / `12.48px` เหมือนก่อน migrate

`npm run build` ผ่าน

---

## 5. Token เปลี่ยนแล้ว consumer เปลี่ยนตามจริงไหม

เกณฑ์จบขั้น 3 ข้อหนึ่งคือ "เปลี่ยน token แล้ว consumers เปลี่ยนตาม" ทดสอบบนหน้าจริง:

| ทำอะไร | ผล |
| --- | --- |
| `--color-chip-surface` → เขียว ที่ `:root` | chip background เปลี่ยนเป็นเขียว ✅ |
| `--palette-black-880` → น้ำเงิน ที่ `:root` | frame background เปลี่ยนเป็นน้ำเงิน ✅ (role re-resolve ที่ scope ที่ประกาศ) |
| `--color-media-surface` → ส้ม ที่ theme scope | frame เปลี่ยน แต่ chip ไม่เปลี่ยน ✅ (role แยกกันจริง) |
| คืนค่าทั้งหมด | กลับสู่ค่าเดิมทุกตัว ✅ |

---

## 6. Strict migrated scope

โค้ดที่ migrate แล้ว **เสียสิทธิ์ใช้ debt baseline** ไม่งั้นการเอาค่าดิบกลับเข้าไปจะถูกประวัติของตัวเองยกโทษให้

ขอบเขต: `ProjectDetails.css` + `ProjectCoverMedia.css`, selector subject ที่ match
`.case-media__frame` / `.case-media__label` / `.case-media__kind`, ทั้งสี่ตระกูล

พิสูจน์แล้ว — ใส่ `border-radius: 999px` และ `background: #151513` กลับเข้า `.case-media__kind-dot`
(ทั้งสองอยู่ใน baseline จริง):

```
exit=1
  strict-scope hits     2
  NEW violations        2
    + … | .case-media__kind-dot | border-radius: 999px;  (1 > 0) [STRICT SCOPE — no baseline allowance]
    + … | .case-media__kind-dot | background: #151513;   (1 > 0) [STRICT SCOPE — no baseline allowance]
```

ไฟล์ถูก revert แล้ว, `--verify` บน tree ปัจจุบัน = exit 0

---

## 7. ข้อบกพร่องสองข้อที่ harness จับตัวเองได้

ทั้งสองข้อโผล่จากการรันจริง ไม่ใช่จากการอ่านโค้ด และถูกแก้แล้วพร้อม test

### 7.1 Composite property ปฏิเสธ token ที่ถูกต้อง

หลัง migrate รอบแรก มี **1 violation ใหม่** ที่อธิบายไม่ได้:

```
box-shadow: inset 0 0 0 var(--border-width-hairline) var(--color-media-hairline);
```

สาเหตุ: `box-shadow` ถูกจัดเป็นตระกูล `color` ตระกูลเดียว → `--border-width-hairline` (shape) จึงถูกมองว่าผิดตระกูล
แต่ `box-shadow` เป็น **composite** — มันพก offset *และ* สี

แก้: เพิ่ม `COMPOSITE_PROPERTY_FAMILIES` — `box-shadow`/`text-shadow` รับ color+shape+spacing,
`border*`/`outline` รับ color+shape ฯลฯ **การตรวจค่าดิบยังใช้ตระกูลหลักเหมือนเดิม** hex ดิบใน box-shadow ยัง error
(3 tests คุมไว้ รวมถึง test ว่าข้อผ่อนผันนี้ไม่รั่วไปหา `color` ธรรมดา)

### 7.2 Strict scope จับผิดตัวจาก `:has()`

การ match pattern กับ selector ทั้งสตริงทำให้ 3 rule ที่ **ไม่เคย migrate** ถูกดึงเข้า strict scope:

```
.case-freeflow-hero__media:has(.case-media__frame--cover) .case-freeflow-hero__caption-motion
.modenote-story__hero:has(.case-media__frame--cover) h1
```

ที่นี่ `.case-media__frame--cover` เป็น **เงื่อนไขบน ancestor** declaration เป็นของ element ขวาสุด

แก้: `selectorSubjects()` ตัดเนื้อใน `:has()`/`:is()`/`:where()`/`:not()` ทิ้งก่อน แล้วเอาเฉพาะ compound ขวาสุด
(7 cases ใน test)

---

## 8. ข้อจำกัดที่ยังมี

1. **`width` / `height` ยังไม่ถูกคุม** → `--size-chip-dot` ไม่มีอะไรบังคับให้ใช้
   สอง property นี้ส่วนใหญ่เป็น structural (`100%`, `auto`, fluid) การคุมเหมารวมจะได้ false positive เยอะ
   ต้องนิยาม control/icon size ให้ชัดก่อน → `DESIGN.md` G3b
2. **ค่า spacing ที่ใกล้กันมากยังไม่รวม** — label ใช้ inset `0.85rem` / padding `0.32rem`,
   kind ใช้ `0.8rem` / `0.3rem` ต่างกัน 0.8px และ 0.32px
   **การรวมเปลี่ยน pixel ที่ render จริง** จึงไม่ทำเงียบ ๆ ใน migration → `DESIGN.md` G3a **ต้องให้เจ้าของตัดสิน**
3. **Declaration หลายบรรทัดยังใช้ line-based fingerprint** (ข้อจำกัดเดิมจากขั้น 2) — fail ดัง ไม่เงียบ ยกไปขั้น 4
4. **ยังไม่มี rule ฝั่ง static JSX, `!important`, material-override** → ขั้น 4
5. **dpr ยังตรึงไม่ได้** — เทียบ before/after ต้องคู่กับ dpr เดียวกัน ต้องรอ Playwright ขั้น 4
6. **ยังไม่มี reference screenshot บนดิสก์** → ขั้น 4
7. **Reusable component contract ยังไม่เขียน** → ขั้น 4

---

## 9. เกณฑ์จบขั้น 3

| เกณฑ์จากแผน | สถานะ | หลักฐาน |
| --- | --- | --- |
| เขียน DESIGN.md ตาม §4 และ design block ใน AGENTS.md | ✅ | `DESIGN.md` §1–§7, `AGENTS.md` (ชี้เฉพาะ section ที่เกี่ยว ไม่ให้อ่านทุกประวัติ) |
| สกัด palette/semantic roles และ spacing/typography/shape ที่ pilot ใช้สู่ tokens.css | ✅ | `src/styles/tokens.css` 3 layers |
| เชื่อม global import | ✅ | `@import './styles/tokens.css'` ใน `index.css` + alias 23 ตัว |
| migrate consumers ใน scope โดยรักษาหน้าตาเดิม | ✅ | 450 computed values, 0 เปลี่ยน |
| รักษา semantic scopes, alias resolution และ import precedence | ✅ | §3 วัดจริง; ไม่เพิ่ม cascade layer |
| ตรวจ before/after ทั้ง pilot และ non-pilot consumer | ✅ | §4 ทั้ง 4 capture |
| ประกาศ pilot เป็น strict scope | ✅ | `STRICT_SCOPES` + §6 |
| governed literals ใน baseline ถูกจับเป็น error ใน scope นี้จริง | ✅ | §6 exit 1 พร้อม `[STRICT SCOPE]` |
| เปลี่ยน token แล้ว consumers เปลี่ยนตาม | ✅ | §5 |
| ไม่ทิ้งค่าสีทดลองใน production | ✅ | override ทั้งหมดผ่าน JS แล้ว restore; `--verify` = 0 |
| ไม่เกิด project override drift | ✅ | §4 Zucchini และ Keshi ค่าเดิมทุกตัว |

**ตัวเลขสรุป:** debt 5,331 → 5,297 (migrate ได้ 28 fingerprint) · tests 26 → 38 ผ่านทั้งหมด · lint 3 finding เดิม (หนี้ React ก่อนหน้า) · build ผ่าน

---

## 10. ขั้นถัดไป (ขั้น 4)

- `scripts/design-check.mjs` — entry point เดียว พร้อม `--files` / `--base` / `--full` และ fast/final modes
- rule ฝั่ง static JSX, `!important`, material-override
- Playwright setup: ตรึง dpr, เก็บ reference screenshot, render evidence
- maintenance prune สำหรับหนี้ที่แก้แล้ว + temporal fixture
- reuse: ตรวจ DOM markers/refs/events หลัง extract ตาม contract ใน `AGENTS.md`
