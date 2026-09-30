# PortfolioX — Design Rules

**สถานะ: DRAFT (จบขั้น 4 ของ [AI Design Harness Plan](docs/design/AI-DESIGN-HARNESS-PLAN.md))**
วันที่: 2026-09-22 · แก้ล่าสุดโดย: harness ขั้น 3

**บังคับใช้ได้แล้ว:** central tokens ที่ [`src/styles/tokens.css`](src/styles/tokens.css),
กฎ `design/token-usage` ทั้งสี่ตระกูล (CSS + static JSX), `design/ownership-boundaries`
และคำสั่งเดียว `npm run check:design` — ดู §3 และ §6
**ยังไม่มี:** Playwright / reference screenshot บนดิสก์ (ยังตรึง dpr ไม่ได้), ผลพิสูจน์ต่อ output (ขั้น 5)

ตารางใน §2 คือสิ่งที่ถูกตัดสินไปแล้วพร้อม source ส่วน §7 คือสิ่งที่ยัง **ไม่** ถูกตัดสิน — ห้ามเดา

ลำดับตัดสินข้อขัดแย้ง: คำสั่งผู้ใช้ปัจจุบัน → ข้อยกเว้นเฉพาะโปรเจกต์ที่ยอมรับและระบุ scope → กฎร่วมปัจจุบัน → ประวัติการทดลอง
โค้ดบอกพฤติกรรมจริง แต่ไม่ได้ทำให้สิ่งที่ขัดเจตนากลายเป็น approved direction โดยอัตโนมัติ

---

## 1. Shared direction

| ข้อ | สาระ | Source |
| --- | --- | --- |
| ผู้อ่าน | recruiters, hiring managers, technical interviewers ที่ประเมิน new-grad SWE จากหลักฐานงานจริง | [PRODUCT.md](PRODUCT.md) §Users |
| จุดยืน | art-first และ recruiter-readable — แต่ละโปรเจกต์มี choreography ของตัวเองภายในโลกเดียวกัน ไม่ยุบเป็น card grid | [PRODUCT.md](PRODUCT.md) §Positioning |
| สภาพแวดล้อมร่วม | black/red editorial room, display typography, metal/glass material language, authored motion | [PRODUCT.md](PRODUCT.md) §Brand Commitments |
| ขอบเขตที่ identity เปลี่ยนได้ | **ยังไม่ตัดสิน** — ดู [Known gaps](#7-known-gaps) ข้อ G1 | [audit](docs/design/2026-09-22-design-system-audit.md) §Direction decisions |
| ภาษา | ตรงไปตรงมา อิงหลักฐาน ไม่ใช้ marketing hype; configured / executed / delivered / verified เป็นสถานะคนละอย่าง | [PRODUCT.md](PRODUCT.md) §Brand Commitments, §Product Principles 4 |
| Accessibility | semantic headings/lists, visible keyboard focus, reduced-motion, readable contrast, large touch targets, responsive ที่ไม่ทำให้ diagram อ่านไม่ออก | [PRODUCT.md](PRODUCT.md) §Accessibility |

---

## 2. Current decisions ledger

สถานะ: **accepted** = ตัดสินแล้วและมีหลักฐาน · **experimental** = เลือกใน prototype แต่ยังไม่ผ่าน production acceptance · **superseded** = เคยเป็นค่าปัจจุบัน ตอนนี้ไม่ใช่แล้ว · **open** = ยังไม่มีคำตอบ

### 2.1 Accepted

| # | กฎ / การตัดสิน | ขอบเขต | Source |
| --- | --- | --- | --- |
| A1 | ทุก glass surface ต้องสื่อ state, hierarchy, control, caption หรือ evidence boundary — ห้ามเป็นแผ่นโปร่งแสงตกแต่ง | ทั้งเว็บ | [DESIGN-DISCOVERY](docs/design/DESIGN-DISCOVERY.md) Round 1 criterion 1 |
| A2 | ทุก story beat ต้องเพิ่มหลักฐานใหม่หรืออธิบายความสัมพันธ์จริง ไม่งั้นตัดทิ้ง | case studies | DESIGN-DISCOVERY Round 1 criterion 2 |
| A3 | Media ของจริงนำ; diagram สนับสนุนเฉพาะ behavior/boundary ที่ media แสดงไม่ได้ | case studies | DESIGN-DISCOVERY Round 1 criterion 3 |
| A4 | Wave motion เป็นระบบเล่าเรื่องระดับหน้า ไม่ใช่สไตล์ที่ผูกกับทุก container | shared motion | DESIGN-DISCOVERY Round 1 criterion 4 |
| A5 | เก็บ GIF/video demo treatment, rounded media frames, white typography noise ต่ำ, red environmental frame | shared | DESIGN-DISCOVERY Round 1 addendum |
| A6 | Liquid Glass ที่เลือก = optical material ของ Round 6: refraction ใส, geometry นิ่ง (ไม่มี elastic deform), reflection ตามเมาส์ช้า, haze บาง, rim โค้งสะท้อนแสง | ดู A8 | [SELECTED.md](design/ab/keshi-liquid-glass-material-r1/SELECTED.md) §Locked qualities; DESIGN-DISCOVERY Round 6, 9 |
| A7 | ห้ามใส่ convex interior bands, meniscus lines, caustic bulges, dark lower lips หรือรูปทรง 3D สังเคราะห์ในเนื้อแก้ว; ถ้าจะปรับ elevation ให้แตะเฉพาะ cast shadow ภายนอกกับ border/rim เดิม | glass material | SELECTED.md §Rejected depth treatment; DESIGN-DISCOVERY Round 9 |
| A8 | Glass ใช้เฉพาะ horizontal information overlay ใน route Keshi (Focus/Relax caption, atmosphere caption, proof caption); การ์ด flow/architecture ทรงสูงคงวัสดุเดิม เพราะ square displacement map บีบมุมจนเป็นดาว | `/project/keshi-pomodoro` เท่านั้น | SELECTED.md §Production integration; DESIGN-DISCOVERY Round 10 |
| A9 | Production glass ต้องเป็นเจ้าของ visual surface ทั้งหมด — legacy fill/blur/partial radius/inset accent ต้องถูก reset ให้ slot เป็นแค่ตำแหน่ง | glass consumers | DESIGN-DISCOVERY Round 11; [KeshiLiquidGlass.css:5](src/components/KeshiLiquidGlass.css:5) |
| A10 | Blur ของ production glass = 1.3px ตาม prototype ที่เลือก; 8px ถูกปฏิเสธหลังแก้ live backdrop sampling | glass material | SELECTED.md §Production integration |
| A11 | blur, saturation และ SVG refraction ต้องรันด้วยกันใน `backdrop-filter` บน outer surface — ใส่บน filtered child แล้ว Gallery grid ยังคม | glass material | SELECTED.md §Production integration (live-backdrop correction) |
| A12 | `ScrollPerspectiveWave` เป็นระบบ motion ระดับหน้าเพียงระบบเดียว; glass เพิ่มแค่ pointer reflection ช้า | shared motion | SELECTED.md §Production integration |
| A13 | ห้ามใส่ private data, identifiers, secrets, unverified metrics หรือ deployment claim ที่พิสูจน์ไม่ได้ลง public asset/copy | ทั้งเว็บ | [PRODUCT.md](PRODUCT.md) §Capabilities and Constraints |
| A14 | Hermes screenshots ที่ sanitize แล้วยัง **ไม่** อนุมัติให้ใช้สาธารณะ | Hermes | [PRODUCT.md](PRODUCT.md) §Evidence on Hand |
| A15 | source changes อยู่ในเครื่องเพื่อให้เจ้าของ review ก่อน commit/push/deploy | workflow | [PRODUCT.md](PRODUCT.md) §Capabilities and Constraints |
| A16 | North Star ของ landing experience คือ gallery ทรงกระบอก/สไปรัล — เดินวนดูผลงานที่ลอยบนผนัง; `cylinderGrid` orbit ที่มีอยู่เป็นความพยายามแรกแต่ยังไม่พอ วิธี implement จริงต้องผ่าน A/B ก่อนเลือก ไม่ใช่ข้อสรุปจากบทสนทนา | landing / gallery | DESIGN-DISCOVERY Round 13 criterion 1 |
| A17 | Sitewide personality: มีความเป็นศิลปะ มีจิตวิญญาณมากกว่าความเนี้ยบ แปลก คาดเดาไม่ได้ เรียบหรู ดูแพง; เนื้องาน/คำอธิบายยังต้องโปรเฟสชันนอล | ทั้งเว็บ | DESIGN-DISCOVERY Round 13 criterion 2 |
| A18 | โปสเตอร์ปกโปรเจกต์ปัจจุบันถูกปฏิเสธว่าดูเป็น AI generate ชัดเจน ต้องทำใหม่ทั้งหมด โดยค้นคว้าวิธีทำโปสเตอร์ที่ดีกว่านี้ก่อน (ใช้ร่วมกับงาน Fastwork แยกของเจ้าของ) | project covers | DESIGN-DISCOVERY Round 13 criterion 3 |
| A19 | ความรู้สึกศิลปะ/คาดเดาไม่ได้ต่อเนื่องจาก gallery เข้าสู่ case study — **ไม่**เปลี่ยนเป็นโหมดนิ่ง/ปลอดภัยกว่า | case studies | DESIGN-DISCOVERY Round 13 criterion 4 |
| A20 | Evidence และเนื้อหาข้อเท็จจริง (สิ่งที่สร้างจริง, บทบาทของเจ้าของ, technical claim) ต้องหาเจอและอ่านออกเสมอ ไม่ว่าบรรยากาศรอบข้างจะคาดเดายากแค่ไหน — art ควบคุม frame/จังหวะ/ความประหลาดใจ ไม่ควบคุมว่าจะหาข้อเท็จจริงเจอไหม **เงื่อนไขคู่กับ A19 เสมอ** | case studies | DESIGN-DISCOVERY Round 13 criterion 5; ประสาน [PRODUCT.md](PRODUCT.md) §Positioning "recruiter-readable" |
| A21 | จังหวะการเล่าแบบ "รถไฟเหาะ" — ขึ้นลงของความเข้มข้นทางภาพ/อารมณ์ตลอดหน้าอย่างตั้งใจ ไม่ใช่จังหวะเรียบเดียวตลอด เป้าหมายคือให้คนดูตื่นเต้นและอยากเลื่อนต่อ | motion / pacing | DESIGN-DISCOVERY Round 13 criterion 6 |
| A22 | แต่ละโปรเจกต์ต้องเดาแพทเทิร์นจากโปรเจกต์อื่นไม่ได้ — ห้ามใช้ shared section-order template; แต่ทั้งเว็บยังต้องอ่านเป็น art direction เดียวกัน และแต่ละโปรเจกต์ต้องมี gimmick/hook ของตัวเอง | composition | DESIGN-DISCOVERY Round 13 criterion 7 |
| A23 | สีแดง/ดำของเดิมคือ stage color ที่ยืนยันแล้ว — ทดสอบ live 3 ทางเลือก (burgundy, terracotta, near-black+accent) บนหน้าเว็บจริงแล้วแพ้สีเดิมทั้งหมด "ดูแพงขึ้น" ต้องมาจาก material/motion/typography/detail ไม่ใช่การลดความอิ่มตัวของสีพื้น | ทั้งเว็บ | DESIGN-DISCOVERY Round 14 criterion 1–2 |
| A24 | ฟอนต์ display/section heading = **Syne** ยืนยันแล้ว — ทดสอบ live เทียบ Syne vs Instrument Serif (แกลเลอรี่/บทกวี) vs Permanent Marker (ลายมือ/การ์ตูน) บนหัวข้อจริงของ Keshi แล้วเลือก Syne ตรงกับที่ใช้อยู่แล้ว 17/18 จุดพอดี | display/heading | DESIGN-DISCOVERY Round 15 |
| A25 | **หน้า `/project/:id` ใช้สีดำ ขาว และระดับเทาเท่านั้นสำหรับ UI chrome**: ตัวหนังสือ, icon, diagram ที่เว็บวาดเอง, chip, container, border, shadow และ state marker ห้ามยืมเขียว/ส้ม/เหลือง/ม่วงหรือสีแบรนด์จากแอปมาเป็น accent สีแดงสงวนไว้ให้ background stage เท่านั้น ภาพ/วิดีโอเดโมจริงคงสีต้นฉบับเพราะเป็นหลักฐาน | project details ทุกหน้า | คำสั่งเจ้าของ 2026-09-23: “ใช้แค่สองสี... สีดำกับสีขาวและโทนที่ไล่ความเข้ม... สีเขียว สีส้ม...ห้ามใช้เด็ดขาด” |
| A26 | Caption บน Keshi ใช้วัสดุ **ด้านโปร่ง 27% + blur 2px** ผ่าน `CaseMatteSurface`; material เป็นเจ้าของ fill/edge/blur/shadow, wrapper เป็นเจ้าของตำแหน่ง, content เป็นเจ้าของข้อความและ layout ภายใน ไม่มี optical refraction/animated rim | Keshi pilot; reuse ตามบทบาทหลังตรวจหน้าอื่น | การเลือกของเจ้าของ 2026-09-23; `src/components/CaseMatteSurface.*` |
| A27 | เส้นขอบขาวต้องมีหน้าที่ระบุ focus, selection, grouping หรือ evidence boundary ถ้าเป็นแค่กรอบตกแต่งให้ตัดออก ป้าย media สีขาวมุมซ้ายบนของ demo เป็น element ที่เจ้าของเลือกเก็บ | project details chrome | คำสั่งเจ้าของ 2026-09-23; ตำแหน่งเส้นขอบในภาพอ้างอิงยังต้องพิสูจน์ก่อนแก้เฉพาะจุด |

**การทบทวนปัจจุบัน (2026-09-23):** A6–A11 เป็นบันทึกสูตร optical glass เดิม ไม่ใช่ทิศทางสำหรับงานใหม่หลัง A26; อย่านำกลับมาใช้กับ caption หรือขยายไปทุกหน้า `CaseMatteSurface` เป็นวัสดุที่เลือกแล้วบน Keshi แต่บทบาท/รูปทรงของ container ในแต่ละ story beat ยังต้องทดสอบ ดู [criteria log](docs/design/DESIGN-DISCOVERY.md), [quality contract draft](docs/design/PROJECT-PAGE-QUALITY-CONTRACT-DRAFT.md) และ [material component contract](docs/design/CASE-MATTE-SURFACE-SPEC.md)

**การทดลองปัจจุบัน (2026-09-24):** ตามคำสั่งล่าสุด หน้า Keshi ใช้ surface สามระดับจากสูตร Veluma (`ProjectDetailsKeshiVelumaSurface.css`) แทน matte caption เดิมเพื่อดูผลบนหน้าเต็ม: พื้นโปร่งและแผ่นขาวใช้ค่าสูตร Veluma, จุดรองเข้มเพิ่มความเข้มจากสูตร inset ของ Veluma นี่เป็นการทดลองบน route จริง ยังไม่ใช่การอนุมัติให้เปลี่ยนกฎวัสดุของทุกโปรเจกต์; A26 บันทึกการเลือกก่อนการทดลองนี้

### 2.1a Decisions made during harness work

| # | การตัดสิน | ผลต่อ pixel | Source |
| --- | --- | --- | --- |
| D1 | รวมค่า spacing ที่ใกล้กันของ chip: inset `0.85rem`/`0.8rem` → **`0.8rem`**, block padding `0.32rem`/`0.3rem` → **`0.3rem`** | label chip ขยับเข้า 0.8px และเตี้ยลง 0.63px (25.52px → 24.89px) — วัดแล้ว ไม่กระทบ kind chip, frame หรือ glass sentinel | คำสั่งเจ้าของ 2026-09-22 ("รวมเลย") ตอบ gap G3a; หลักฐาน [phase-3 report](docs/design/harness/phase-3-report.md) §11 |

Inline padding ของ kind chip **ไม่ถูกรวม** (`0.48rem` นำ / `0.58rem` ตาม) เพราะ status dot อยู่ขอบนำ ความต่างจึงเป็น optical balance ไม่ใช่ค่าซ้ำ การยุบจะเป็น redesign ที่ไม่มีใครขอ

### 2.2 Experimental (เลือกแล้วใน prototype แต่ยังไม่มี production acceptance)

| # | สิ่งที่เลือก | ทำไมยังไม่ accepted | Source |
| --- | --- | --- | --- |
| E1 | ค่า optical ทั้งชุดที่ render อยู่บน `/project/keshi-pomodoro` ตอนนี้ (1.3px blur, saturate(1.04), SVG displacement, rim rgba(255,255,255,.26), shadow 0 12px 40px rgba(0,0,0,.25), radius 2rem) | ตรงกับข้อตกลงใน source แต่ยังไม่มีการยืนยัน render จากเจ้าของ | [audit](docs/design/2026-09-22-design-system-audit.md) §Existing strengths; before-render capture ด้านล่าง |
| E2 | Keshi เป็น "baseline ที่ใกล้ที่สุด" ไม่ใช่ template ของทุกโปรเจกต์ | ต้องผ่าน blind A/B ก่อนจะเลื่อนเป็น shared template | DESIGN-DISCOVERY Round 1 criterion 5 |

### 2.3 Superseded

| # | เคยเป็น | ตอนนี้ | Source |
| --- | --- | --- | --- |
| S1 | Glass blur 8px บนหน้าจริง | 1.3px (A10) — 8px ถูกปฏิเสธหลังแก้ backdrop sampling | DESIGN-DISCOVERY หัวข้อ Current work priority + Round 12; SELECTED.md |
| S2 | Depth candidates รอบ 8/9 (convex lens, thick optical edge, lifted volume) | ปฏิเสธทั้งหมด กลับไปใช้ Round 6 baseline (A6/A7) | DESIGN-DISCOVERY Round 9 |
| S3 | Layout candidates W/X/Y/Z รอบแรก | ปฏิเสธทั้งหมด; material ต้องเลือกก่อน layout | DESIGN-DISCOVERY Round 2 |
| S4 | Cleaned fallback ที่ลด glass เหลือ transparent border | ปฏิเสธ; ต้อง reuse layer model ของ `optical.html` ตรง ๆ | DESIGN-DISCOVERY Round 12 |
| S5 | `.case-keshi-state__caption` เคยเป็นเจ้าของ padding/border/background/backdrop-filter ของ caption | ตอนนี้เป็น layout slot เปล่า — `KeshiLiquidGlass.css` reset ทิ้งหมด (A9) กฎเดิมใน `ProjectDetailsStories.css:239` เป็น dead code สำหรับ route นี้ | วัดจาก render: [phase-1-before-render.json](docs/design/harness/phase-1-before-render.json) `pilot-caption-slot` |

### 2.4 Open

ดู [Known gaps](#7-known-gaps)

---

## 3. Implementation levers

Canonical source: [`src/styles/tokens.css`](src/styles/tokens.css) — import ครั้งเดียวจาก `src/index.css`

Global CSS ownership และลำดับ imports ใน `src/main.jsx`: [`GLOBAL-CSS-OWNERSHIP.md`](docs/design/GLOBAL-CSS-OWNERSHIP.md). `index.css` ถือ font/tokens/reset; stage, utilities และ late overrides อยู่คนละไฟล์โดยรักษาลำดับเดิม

โครงสร้าง **primitive → semantic role → scoped project theme**

| Layer | ตัวอย่าง | ใครแก้ |
| --- | --- | --- |
| 1. primitive | `--palette-black-900: #0b0b0b` | เปลี่ยนค่าดิบของทั้งระบบ |
| 2. semantic role | `--color-media-surface: var(--palette-black-900)` | **ชั้นที่ component ใช้** |
| 3. project theme | `.case-section--keshi { --color-media-surface: var(--palette-black-880) }` | ให้โปรเจกต์ต่างจากค่ากลาง |

### กฎ cascade ที่ต้องรู้ก่อนเพิ่ม theme

custom property resolve ที่จุดที่ **ประกาศ** และค่าที่ resolve แล้วเท่านั้นที่ inherit ลงไป
`--role: var(--primitive)` ที่ประกาศบน `:root` ถูก resolve ที่ `:root` แล้ว — override `--primitive` ที่ลูก **ไม่ทำให้ role เปลี่ยน**

**วัดจริงแล้ว ไม่ใช่เดา:** override `--palette-white` บน `.case-section--keshi` → `.case-media__label` ยังเป็น `rgb(255,255,255)`;
override `--color-chip-surface` ที่เดียวกัน → เปลี่ยนตาม ([phase-3 report](docs/design/harness/phase-3-report.md) §3)

→ **theme override semantic role เสมอ ไม่ override primitive**

### สิ่งที่ migrate แล้ว (strict scope — ไม่มีสิทธิ์ใช้ baseline)

`.case-media__frame` / `.case-media__label` / `.case-media__kind*` ใน
`ProjectDetails.css`, `ProjectDetailsLayouts.css`, `ProjectDetailsLightbox.css`,
`ProjectDetailsProcess.css` และ `ProjectCoverMedia.css` — ค่าดิบใน selector เหล่านี้เป็น error เสมอ

### ยังไม่ migrate

CSS อีก 27 ไฟล์ (~5,297 governed literals ณ snapshot เดิม) ยังอยู่ใน debt baseline
`CaseMatteSurface.css` เป็น material source ปัจจุบันของ annotation บน Keshi; `KeshiLiquidGlass.css` เป็นไฟล์ optical เก่าที่ยังมี Keshi content-layout selectors ระหว่าง migration ห้ามใช้เป็น reference ของ material ใหม่
ชื่อเดิม (`--text-primary`, `--bg-dark`, …) ยังใช้ได้ เป็น compatibility alias ที่ forward ไป semantic role

### Ownership ที่ตกลงแล้ว

- **Material เป็นเจ้าของพื้นผิว, wrapper เป็นเจ้าของตำแหน่ง, padding มีเจ้าของเดียว** (A9) — ยืนยันจาก render: `.case-keshi-state__caption` วัดได้ padding `0px` ทุกด้าน
- **Reusable primitive ที่มีจริงแล้ว:** `CaseMediaFrame` ([ProjectDetailsMedia.jsx](src/components/ProjectDetailsMedia.jsx)) ใช้ใน project stories หลายหน้า; `ProjectDetails.jsx` เป็น route shell, ส่วน Veluma/Mux อยู่ใน [`ProjectDetailsMux.jsx`](src/components/ProjectDetailsMux.jsx)
- **DOM contract ที่ห้ามทำหาย:** `data-wave-*`, `data-media-kind`, `data-poster-transition-target`, `data-cursor*` และความสัมพันธ์ direct-child ที่ media discovery ใช้

### Project Details palette และเส้นขอบ (A25/A27)

- Scope คือ UI ที่ PortfolioX วาดบน `/project/:id` ทุกหน้า: ข้อความ, icon/SVG, diagram, chip, control, container, border, shadow และ decorative gradient ใช้ได้เฉพาะสีที่ช่อง RGB เท่ากัน (ดำ/ขาว/เทา; alpha เปลี่ยนได้) สีแดงเป็นของ **background stage** เท่านั้น ไม่ใช้เป็น accent ใน UI ของโปรเจกต์
- ภาพ/วิดีโอเดโมที่เป็นหลักฐานคงสีต้นฉบับ ไม่ใส่ filter grayscale และไม่แต่งภาพให้ต่างจากแอปจริง ป้ายสีขาวมุมซ้ายบนของ `CaseMediaFrame` เป็น chrome ที่เลือกเก็บ
- โปรเจกต์ยังต่างกันผ่าน media, การจัดองค์ประกอบ, จังหวะเรื่อง, typography และ motion ไม่สร้าง project-specific accent สีเขียว/ส้ม/เหลือง/ม่วงตามแอป
- ใช้ semantic roles `--color-detail-*` ใน [`src/styles/tokens.css`](src/styles/tokens.css) สำหรับ chrome; ห้ามเพิ่ม literal chromatic หรือ token ที่แก้เป็นสีอื่นใน detail stylesheet. เส้นขอบต้องบอก focus/selection/grouping/evidence boundary; ถ้าไม่มีหน้าที่ให้ตัดออก
- ตรวจ CSS ด้วย design checker และอ่านค่า computed ของ chrome ทุก route ด้วย `design/audit/project-detail-colors.cjs`; การเลือกว่าขอบช่วยลำดับสายตาหรือไม่ยังเป็น visual review ไม่ใช่ผลจาก linter

## 4. Content truth

| โปรเจกต์ | Source of truth |
| --- | --- |
| Hermes Command Center | [source-of-truth](docs/projects/hermes-command-center-source-of-truth.md), [capture plan](docs/projects/hermes-demo-capture-plan.md) — media ยังไม่อนุมัติ (A14) |
| Veluma | [product vision](docs/projects/veluma-product-vision.md) — mood/สี/บุคลิกเป็นส่วนหนึ่งของ product purpose |
| ทุกโปรเจกต์ | ข้อมูลแต่ละโปรเจกต์ใน [`src/data/projects/`](src/data/projects/) ผ่าน ordered exports ใน [`src/data/projects.js`](src/data/projects.js); media ใน `public/assets/` |
| Cover | [cover spec](docs/design/2026-09-05-project-cover-spec.md) |

ให้รายละเอียดได้ แต่ห้าม invent capability และห้ามลบข้อมูลจริงทิ้งเพราะกลัวกล่าวเกินจริง

---

## 5. Examples

**วัสดุปัจจุบัน:** `src/components/CaseMatteSurface.*` — ด้านโปร่ง 27% + blur 2px; `design/ab/keshi-matte-r3/` เก็บภาพเปรียบเทียบก่อนเลือก

**ประวัติที่ถูกแทน:** `design/ab/keshi-liquid-glass-material-r1/` (`optical.html` / `optical.jsx` / `optical.css` / `optical-haze.css`) — เคยเป็น prototype selection ก่อน A26

**ปฏิเสธพร้อมเหตุผล:** ดูตาราง [Superseded](#23-superseded) — S2 (3D สังเคราะห์), S3 (layout ก่อน material), S4 (glass ที่ถูกลดเหลือ border), S1 (blur 8px)

---

## 6. Verification

`npm run check:design` เป็น entry point ของ token/ownership/build checks; ดูข้อจำกัดของ scope และ debt baseline ด้านล่าง

| คำสั่ง | ทำอะไร |
| --- | --- |
| **`npm run check:design -- --files <path...> [--mode fast\|final]`** | **entry point เดียว** — เลือก scope, รันเฉพาะที่เกี่ยว, พิมพ์ scope/checked/skipped/debt/failures/route ที่ต้องดู |
| `npm run check:design -- --base <ref>` | derive scope จาก diff; รายงาน untracked แยก |
| `npm run check:design -- --full` | maintained sources ทั้งชุด |
| `npm run design:baseline:prune` | ลดหนี้ที่แก้แล้ว (reduce-only, refuse ถ้า tree fail หรือกฎเปลี่ยน) |
| `npm run lint` | ESLint — scope แก้แล้วในขั้น 2 (ไม่เข้า `output/`, แยก node/browser config) |
| `npm run lint:css` | stylelint + กฎ `design/token-usage` แบบดิบ (แสดงหนี้ทั้งหมด) |
| `npm run design:baseline:verify` | ตรวจว่ามี **violation ใหม่** เทียบ baseline หรือไม่ — exit 1 ถ้ามี |
| `npm run test:design` | fixtures 26 ตัวของ harness เอง |
| `npm run design:snapshot` | เก็บ snapshot ก่อนแก้ → `docs/design/harness/phase-1-snapshot/` |
| `npm run design:baseline` | derive debt baseline จาก snapshot (ไม่ใช่จาก working tree) |

**กฎที่บังคับใช้แล้ว:** `design/token-usage` ทั้งสี่ตระกูล — `color`, `spacing`, `typography`, `shape`
Legacy 5,297 literals อยู่ใน baseline (ไม่ต้องไล่แก้) แต่ **โค้ดใหม่และ strict scope ไม่มีสิทธิ์ใช้ baseline**
รายละเอียดและข้อจำกัด: [phase-2](docs/design/harness/phase-2-report.md) · [phase-3](docs/design/harness/phase-3-report.md)

| เครื่องมือวัด | ทำอะไร |
| --- | --- |
| [`scripts/design-probe.mjs`](scripts/design-probe.mjs) | นิยาม selectors/properties ที่ใช้วัด computed values ของ pilot, non-pilot consumer และ glass sentinel — re-run ได้ทั้งก่อนและหลัง migration |

**build ผ่านไม่เท่ากับ visual acceptance** และ mechanical check ผ่านไม่ได้แปลว่าเจ้าของรับงานแล้ว

---

## 7. Known gaps

สิ่งที่ยังไม่ตัดสินหรือยังไม่ได้วัด — **ห้ามเติมคำตอบจากรสนิยมของ AI**

| # | Gap | ทำไมยังเปิดอยู่ |
| --- | --- | --- |
| G1 | ขอบเขตที่ project identity (layout, material, imagery) เปลี่ยนจาก shared world ได้แค่ไหน | **เรื่อง composition เปิดกว้างขึ้นบางส่วน** — Round 13 (A22) ยืนยันว่าแต่ละโปรเจกต์ต้องไม่ใช้ shared section-order template และต้องมี gimmick ของตัวเอง **เรื่องสีพื้นหลักปิดแล้ว** — ดู A23 |
| G2 | Typography roles (evidence / caption / control) และเกณฑ์ readability ขั้นต่ำ | **Display/section heading ปิดแล้ว = Syne** (ดู A24) ที่เหลือ (evidence, control, readability minimum) ยังไม่ตัดสิน |
| G3 | Spacing / radius / control-size scale กลาง | **มีบางส่วนแล้ว** สำหรับ pilot slice; ที่เหลือยังเป็น literal กระจายใน 27 ไฟล์ |
| G3b | `width` / `height` ยังไม่ถูกคุม — `--size-chip-dot` จึงไม่มีอะไรบังคับ | สอง property นี้ส่วนใหญ่เป็น structural (`100%`, `auto`, fluid) การคุมแบบเหมารวมจะได้ false positive จำนวนมาก ต้องนิยาม control/icon size ให้ชัดก่อน |
| G4 | Composition: alignment และ content constraint ร่วม โดยไม่บังคับ section order เดียวกัน | **ตอบบางส่วนแล้ว** — A22 ยืนยันหลักการ (ห้าม template เดียวกัน, ต้องมี gimmick ต่อโปรเจกต์) แต่ยังไม่มีเกณฑ์ alignment/content constraint ที่วัดได้ |
| G5 | Matte surface: supported backgrounds, aspect ratios, fallback browsers, touch behavior | A26 ใช้จริงบน Keshi; การ reuse ข้ามโปรเจกต์ยังต้องตรวจ render และ contrast |
| G6 | Motion: ownership ของ transform, interruption, reduced motion, easing | **ตอบบางส่วนแล้ว** — A21 ให้หลักการ pacing ("รถไฟเหาะ" ขึ้นลงตั้งใจ) แต่ยังไม่มีกลไกที่วัดได้ (transform ownership, interruption, easing curve จริง) |
| G7 | Interaction states (focus / hover / active / disabled / loading / error / no-WebGL / no-optics) | **Deprioritized ตามคำสั่งเจ้าของ 2026-09-22** — โฟกัสความสวยงามก่อน ไม่ใช่ว่าตัดสินแล้ว; ความเสี่ยงจริงที่พบ: `GalleryScene.jsx` ไม่มี fallback ถ้า WebGL ใช้ไม่ได้ ยังไม่มี fallback UI |
| G8 | Composite contrast ของ text บนผิวด้านโปร่ง | ต้องวัดจาก render composite จริง ยังไม่ได้วัด |
| G12 | รูปทรง/การวาง caption และเส้นขอบขาวที่เป็น decorative | A27 บอกเกณฑ์แล้ว แต่ยังต้องเทียบ element แบบเต็มหน้าและชี้ selector ของเส้นในภาพอ้างอิงก่อนแก้เฉพาะจุด |
| G9 | Media/diagram: crop, caption, loading, playback controls, provenance | ยังไม่ตัดสิน |
| G10 | Verified-capability registry รวมศูนย์ | มี brief รายโปรเจกต์ แต่ยังไม่รวม |
| G11 | เกณฑ์ "ดูเป็น AI" ของโปสเตอร์ปก — ยังไม่มีนิยามที่ตรวจได้ว่าโปสเตอร์ใหม่ผ่านหรือไม่ | A18 ยืนยันว่าต้องทำใหม่ทั้งหมด แต่ยังไม่มี reference/solution ที่เลือกแล้ว รอ research |

### Open work items

| # | งาน | เหตุผล | Source |
| --- | --- | --- | --- |
| W1 | ค้นคว้าวิธีทำ project cover poster ที่ไม่ดูเป็น AI generate แล้วทำใหม่ทั้ง 7 โปรเจกต์ | A18 — ปฏิเสธโปสเตอร์ปัจจุบันทั้งหมด งานนี้ใช้ร่วมกับงาน poster ของ Fastwork ของเจ้าของ | DESIGN-DISCOVERY Round 13 |
| W2 | A/B ทดสอบวิธี implement gallery ทรงกระบอก/สไปรัล (ปรับของเดิม vs รื้อโครงสร้างใหม่) ก่อนเลือกนำไปใช้จริง | A16 — North Star ตกลงแล้ว แต่วิธีทำยังไม่ตัดสิน | DESIGN-DISCOVERY Round 13 |

### พบระหว่างเก็บหลักฐานขั้น 1 (ยังไม่ได้แก้ อยู่นอก pilot scope)

- ที่ 390×844 ปุ่ม `MENU` แบบ fixed ทับข้อความ section heading บนหน้า Keshi — บันทึกไว้เพื่อไม่ให้ภายหลังถูกเข้าใจผิดว่าเป็น regression ของ harness

---

## Sources

- [AI Design Harness Plan](docs/design/AI-DESIGN-HARNESS-PLAN.md) — แผนที่เอกสารนี้เดินตาม
- [Phase 1 report](docs/design/harness/phase-1-report.md) — pilot scope, supported syntax, runtime exceptions, reference states
- [Phase 2 report](docs/design/harness/phase-2-report.md) — lint scope, กฎ token, debt baseline และข้อจำกัด
- [Phase 3 report](docs/design/harness/phase-3-report.md) — token extraction, pilot migration, cascade evidence และ strict scope
- [Phase 4 report](docs/design/harness/phase-4-report.md) — runner, ownership rules, JSX rule, prune และ temporal fixture
- [Phase 5 report](docs/design/harness/phase-5-report.md) — A/B round 1 (ปิดแบบ inconclusive) และ Round 13 macro direction
- [AGENTS.md](AGENTS.md) — entry point สำหรับ AI agent
- [Design system audit](docs/design/2026-09-22-design-system-audit.md)
- [Foundation review](docs/design/DESIGN-FOUNDATION-REVIEW.md) — ข้อเสนอ ยังไม่อนุมัติ
- [Design discovery](docs/design/DESIGN-DISCOVERY.md) — ประวัติ feedback
- [PRODUCT.md](PRODUCT.md)
- [Selected Keshi material](design/ab/keshi-liquid-glass-material-r1/SELECTED.md)
- [QA matrix](docs/design/implementation/phase-6-final-qa.md)
