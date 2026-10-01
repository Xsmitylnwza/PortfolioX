# AI Design Harness — ขั้น 1: ล็อก pilot / current decisions และเก็บ before-state

วันที่: 2026-09-22 · แผน: [AI-DESIGN-HARNESS-PLAN.md](../AI-DESIGN-HARNESS-PLAN.md) §6 ขั้น 1
สถานะ: **ขั้น 1 เสร็จ** · ยังไม่มี rules ที่บังคับใช้ ยังไม่มี tokens ยังไม่มี checker

เอกสารนี้คือหลักฐาน before-state และการล็อกขอบเขตที่ขั้น 2–5 จะอ้างอิง
ไม่มีการแก้ application code ในขั้นนี้ — ทุกไฟล์ที่เพิ่มอยู่ใน `scripts/` และ `docs/` ยกเว้น `DESIGN.md` (draft) และ `.claude/launch.json`

---

## 1. Before-state ที่เก็บได้

### 1.1 Source snapshot

| รายการ | ค่า |
| --- | --- |
| คำสั่ง | `node scripts/design-snapshot.mjs` |
| ปลายทาง | [`phase-1-snapshot/`](phase-1-snapshot/) (`manifest.json` + สำเนา source ครบ) |
| git HEAD | `92f1e424dd22cd8dda3acae6cfca614b9578807c` (branch `main`) |
| checkout สะอาดหรือไม่ | **ไม่** — 34 path ใน maintained scope เป็น modified/untracked |
| treeHash | `89f2639f377cb398bb06e004f4aa1916c323cec293552f07ff268356accbabbf` |
| จำนวนไฟล์ | 76 |

เก็บเป็น **สำเนาไฟล์จริง** ไม่ใช่แค่ hash เพราะขั้น 2 ต้องเอา rules ที่เพิ่งตั้งไป lint *source ก่อนแก้* เพื่อให้ debt baseline
พิสูจน์ได้ว่ามาจาก pre-edit source ไม่ใช่จากผลหลัง migrate หาก HEAD สะอาด hash อย่างเดียวก็พอ แต่ checkout นี้ dirty

Scope นิยามที่ [`scripts/design-scope.mjs`](../../../scripts/design-scope.mjs) ใช้ร่วมกันระหว่าง snapshot กับ checker ที่จะสร้าง
เพื่อไม่ให้ "สิ่งที่ hash" กับ "สิ่งที่ lint" เพี้ยนจากกัน กันออก: `node_modules`, `dist`, `output`, `artifacts`, `design`, `public`, `tmp`, `tmp-*`, `.git`, `.vercel`, `.playwright-cli`, `.impeccable`

### 1.2 Before-render / computed values

| รายการ | ค่า |
| --- | --- |
| ผลลัพธ์ | [`phase-1-before-render.json`](phase-1-before-render.json) |
| นิยาม probe | [`scripts/design-probe.mjs`](../../../scripts/design-probe.mjs) — selectors, properties, routes, viewports |
| driver | browser pane ในตัวของ session (Chromium) เรียก `buildCollectorSource()` ผ่าน Vite dev server |
| readiness | `await document.fonts.ready` ก่อนทุกครั้ง; `fontsStatus: "loaded"` ทุก capture |
| capture | 4 ชุด = {pilot, non-pilot} × {desktop 1440×900, mobile 390×844} |
| target ที่วัดได้ | 100% (ไม่มี `found: false`) |

**ข้อจำกัดที่ต้องรู้ก่อนเทียบ after:** pane เป็นคนกำหนด `devicePixelRatio` ไม่ใช่ probe และ Chrome snap ค่า used border width เข้ากับ device pixel
`border-top-width: 1px` จึงอ่านได้ `1px` ที่ dpr 1/2 แต่ `0.8px` ที่ dpr 1.25 — เทียบ after กับ before **ที่ dpr เดียวกันเท่านั้น**
หรือเทียบค่าที่ประกาศแทน การ pin dpr ต้องรอ Playwright setup ในขั้น 4

**ยังไม่ได้เก็บ:** reference screenshot ลงดิสก์ การ capture ภาพเป็นส่วนของ Playwright setup ขั้น 4
ขั้น 1 ล็อกแค่ computed values + reference state ตรวจด้วยตาแล้วว่าหน้า pilot render ถูกต้อง (frame + white pill label + glass caption)

---

## 2. Pilot scope ที่ล็อก

### 2.1 โจทย์หลัก — media frame chrome

เลือกตามข้อกำหนดของแผน ("simple existing caption/media slice")

| รายการ | ค่า |
| --- | --- |
| Component | `CaseMediaFrame` — [`src/components/ProjectDetails.jsx:396`](../../../src/components/ProjectDetails.jsx:396) |
| CSS ฐาน | [`ProjectDetails.css:326`](../../../src/components/ProjectDetails.css:326) `.case-media__frame`, `:349` `::after`, `:399` `.case-media__kind`, `:422` `.case-media__kind-dot`, `:544` `.case-media__label` |
| CSS override ของ Keshi | [`ProjectDetailsStories.css:152`](../../../src/components/ProjectDetailsStories.css:152) (aspect-ratio) และ `:157` (`border-color` / `border-radius` / `background`) |
| จำนวน call site | 24 จุดใน `ProjectDetails.jsx` |

**ทำไมเลือกอันนี้:** เป็น primitive ที่ reuse จริงอยู่แล้ว (ไม่ต้องสร้าง component ใหม่เพื่อให้ครบ deliverable),
มี governed literal ครบทั้งสี่ตระกูลที่ contract คุม (color / spacing / typography / shape),
และมี project override ที่ต้องรอดจาก migration — ซึ่งเป็นสิ่งที่ต้องพิสูจน์

Governed literal ที่มีอยู่จริงใน slice นี้ (จากโค้ด ไม่ใช่การประมาณ):

| ตระกูล | ค่าดิบที่เจอ |
| --- | --- |
| color | `#0b0b0b`, `#090909`, `#151513`, `#ffffff`, `rgba(255,248,236,0.14/0.16/0.18/0.28/0.06/0.05/0.08)`, `rgba(0,0,0,0.28/0.34/0.22/0.08)`, `rgba(255,253,249,0.7)` |
| spacing | `0.8rem`, `0.85rem`, `0.3rem 0.58rem 0.3rem 0.48rem`, `0.32rem 0.66rem`, `0.38rem`, `1rem` |
| typography | `0.52rem`, `0.14em` |
| shape | `0.95rem`, `0.78rem`, `999px`, `0.36rem`, `1px`, `2px`, `3px` |

### 2.2 Regression sentinel — glass integration

`KeshiLiquidGlass` คือ sentinel ไม่ใช่โจทย์ **ห้ามเปิด redesign optics หรือแตะ direction ที่ล็อกไว้ (DESIGN.md A6–A12)**

| Sentinel target | Selector |
| --- | --- |
| outer surface | `.case-keshi-state__glass` |
| inner material | `.case-keshi-state__glass .keshi-liquid-glass__glass` |
| second consumer | `.case-keshi-atmosphere__glass` |

ค่าที่ต้องไม่ขยับ (desktop, dpr 1): `backdrop-filter: blur(1.3px) saturate(1.04) url(#keshi-glass-…)`,
`border-radius: 32px`, inner `border-top-color: rgba(255,255,255,0.26)`, inner `box-shadow: rgba(0,0,0,0.25) 0px 12px 40px 0px`

### 2.3 Consumers ที่ต้องตรวจ (explicit mapping — ไม่มี dependency graph ใน v1)

| Role | Route | เหตุผล |
| --- | --- | --- |
| pilot | `/project/keshi-pomodoro` | โจทย์หลัก + sentinel อยู่หน้าเดียวกัน |
| non-pilot consumer | `/project/zucchini-review` | ใช้ primitive ชุดเดียวกันผ่าน renderer อื่นและ override ของตัวเอง |

**หลักฐานว่าคู่นี้แยกสิ่งที่ต้องพิสูจน์ได้จริง** — chip primitive เหมือนกันเป๊ะ แต่ frame chrome ต่างกันตาม project:

| Target | Keshi | Zucchini |
| --- | --- | --- |
| frame `background-color` | `rgb(9, 9, 9)` | `rgb(5, 5, 5)` |
| frame `border-top-color` | `rgba(255, 248, 236, 0.16)` | `rgba(255, 255, 255, 0.44)` |
| frame `border-top-left-radius` | `12.48px` | `15.2px` |
| label chip | `rgb(21,21,19)` บน `rgb(255,255,255)`, 8.32px mono, radius 999px | **เหมือนกันทุกค่า** |
| kind chip | padding `4.8px 9.28px 4.8px 7.68px`, gap `6.08px` | **เหมือนกันทุกค่า** |

ถ้า migration ทำให้สองคอลัมน์นี้เท่ากันเมื่อไร แปลว่า project override หายไป = regression

### 2.4 Reference states

| รายการ | ค่าที่ตรึง |
| --- | --- |
| viewport | desktop 1440×900, mobile 390×844 (มาจาก QA plan เดิม ไม่ได้สร้าง matrix ใหม่) |
| fonts | `document.fonts.ready` resolved, `status: "loaded"` |
| reduced motion | `false` |
| root font size | `16px` |
| dpr | **ไม่ได้ตรึง** — บันทึกไว้ต่อ capture (ดู §1.2) |
| pointer | ไม่ขยับระหว่างวัด (pointer reflection ของ glass เขียน custom property ตามเมาส์) |
| scroll | ไม่ scroll ระหว่างวัด; ค่าที่วัดเป็น computed style ซึ่งไม่ขึ้นกับ wave transform |

---

## 3. Supported syntax ที่ checker จะรองรับ (ล็อกก่อน implement)

ประกาศตั้งแต่ตอนนี้เพื่อไม่ให้ขั้น 4 ขยาย scope ไปเป็น general dataflow analysis

**รองรับ:**

1. CSS declaration ที่เป็น literal ตรง ๆ ใน external stylesheet
2. CSS custom property ที่ประกาศในไฟล์ที่ checker เห็น และ `var(--x)` ที่ resolve ชื่อได้จาก declared registry
3. Static JSX `style={{ … }}` ที่เป็น object literal ซึ่งค่าเป็น string/number literal ตรง ๆ
4. `const` binding ในไฟล์เดียวกันที่ผูกกับ literal และไม่ถูก reassign

**ไม่รองรับ (ต้องออก diagnostic ว่า `unsupported`, ห้ามเงียบแล้วผ่าน):**

1. ค่าที่มาจาก props, state, hook, import ข้ามไฟล์ หรือ expression ที่ต้องรัน
2. template literal ที่ interpolate runtime value
3. การจำลอง CSS cascade — checker ตรวจ declaration ไม่ตรวจว่า declaration ไหนชนะ
4. `@media` query value (custom property ใช้ใน media query ไม่ได้ตาม spec)

---

## 4. Runtime exceptions ที่ลงทะเบียน (จาก source จริง)

ทุกข้อจำกัดที่ file + property + เหตุผล ไม่ใช่การยกเว้นทั้งไฟล์

| ไฟล์ | Property ที่เขียนตอน runtime | เหตุผล |
| --- | --- | --- |
| [`KeshiLiquidGlass.jsx:135-142`](../../../src/components/KeshiLiquidGlass.jsx:135) | `--keshi-glass-light-x/y`, `--keshi-glass-light-angle`, `--keshi-glass-border-angle`, `--keshi-glass-border-stop-one/two`, `--keshi-glass-border-screen-one/two`, `--keshi-glass-border-overlay-*` | pointer-derived optics ของวัสดุที่เลือก (A6) — เป็นมุม/เปอร์เซ็นต์/opacity ที่คำนวณจากตำแหน่งเมาส์ ไม่ใช่สีหรือ spacing |
| [`ScrollPerspectiveWave.jsx:54`](../../../src/components/ScrollPerspectiveWave.jsx:54) | `style.cssText` บน wave target | page motion system (A12) |
| [`ScrollPerspectiveWave.jsx:71-77`](../../../src/components/ScrollPerspectiveWave.jsx:71) | `translate`, `scale`, `transform`, `opacity`, `visibility`, `filter`, `backdropFilter` บน **clone node** | computed-style capture clone — เป็น coverage exclusion ที่ต้องแสดงในรายงาน ไม่ใช่การยกเว้นทั่วไป |
| [`GalleryScene.jsx:583,706,1079`](../../../src/components/GalleryScene.jsx:583) | `transform: translate3d(...)` บน label | ตำแหน่งที่ WebGL คำนวณ |
| [`BrushReveal.jsx:90-91`](../../../src/components/BrushReveal.jsx:90) | canvas `width` / `height` | canvas dimension จาก measured rect |
| [`PosterSelectTransition.jsx:155,207,228`](../../../src/components/PosterSelectTransition.jsx:155) | `transform`, `willChange` | transition geometry |
| [`Experience.jsx:155`](../../../src/components/Experience.jsx:155) | `--timeline-progress` | animation progress 0–1 |
| [`ProjectDetails.jsx:117-214`](../../../src/components/ProjectDetails.jsx:117) | `documentElement.style.overflow` | scroll lock ของ lightbox |

ข้อยกเว้นเหล่านี้ **ไม่ใช่ทางผ่าน** ของสีหรือ spacing ทั่วไป — ตรวจแล้วว่าไม่มีไฟล์ไหนเขียนค่าสี/ระยะห่างตอน runtime

### Static JSX ที่ต้องอยู่ใน scope ของ checker

`style={{ … }}` ปรากฏใน 17 ไฟล์ ส่วนใหญ่เป็น `--reveal-index` (CSS var ไม่ใช่ governed value)
ไล่ดูทีละไฟล์แล้วพบว่า **ใน component ที่ mount จริง แทบไม่มี governed literal เลย**
มีที่เดียวคือ [`PersonaReloadView.jsx:123`](../../../src/components/PersonaReloadView.jsx:123) `width: '88%'`
ซึ่งเป็น structural percentage ที่ contract อนุญาตอยู่แล้ว

Governed literal ใน static JSX ที่เจอ (`fontSize: '0.9375rem'`, `marginBottom: '2rem'`, `borderRadius: '50%'`)
อยู่ใน **ไฟล์ที่ไม่มีใคร import**: `About.jsx`, `VHSTape.jsx`, `Squares.jsx`, `Scribbles.jsx`
(`MusicalText.jsx` ถูก import จาก `About.jsx` เท่านั้น จึงตายตามกัน)

ผลที่ตามมาสองข้อ:

1. AST check ยังจำเป็น แต่เหตุผลคือ **กันโค้ดใหม่** ไม่ใช่ล้างหนี้ที่มีอยู่ — หนี้ static-JSX ในโค้ดที่รันจริงเกือบเป็นศูนย์
2. ไฟล์ตายทั้ง 5 ไฟล์เป็นคำถามเรื่อง maintained scope: ถ้าปล่อยไว้ใน scope จะได้ debt baseline
   ที่ไม่มีใครเห็นผลจริง ถ้าตัดออกก็ต้องบันทึกว่าตัดเพราะอะไร **ยังไม่ตัดสินในขั้น 1** — ยกไปขั้น 2 พร้อมการตั้ง lint scope

---

## 5. เกณฑ์จบขั้น 1

| เกณฑ์จากแผน | สถานะ | หลักฐาน |
| --- | --- | --- |
| มี pre-edit evidence | ✅ | `phase-1-snapshot/manifest.json` (76 ไฟล์ + สำเนา), `phase-1-before-render.json` (4 capture, 0 target หาย) |
| pilot scope ทำซ้ำได้ | ✅ | §2 + `scripts/design-probe.mjs` (selector/property/route/viewport อยู่ใน source ไม่ใช่ใน transcript) |
| ทุกกฎมี source | ✅ | `DESIGN.md` §2 ทุกแถวมีคอลัมน์ Source ชี้ไฟล์+หัวข้อ |
| unresolved direction แยกเป็น gap ไม่เดาเป็นกฎ | ✅ | `DESIGN.md` §7 — G1–G10 พร้อมเหตุผลว่าทำไมยังเปิด |
| ไม่สร้างตัวเลข design ใหม่ | ✅ | ทุกค่าใน ledger มาจากโค้ดหรือเอกสารเดิม; ค่าที่ยังไม่ได้วัดอยู่ใน G2/G8 |
| ไม่แก้ application code | ✅ | `git status` — ไม่มีไฟล์ใต้ `src/` เปลี่ยนจาก harness งานนี้ |

---

## 6. สิ่งที่ยังไม่ทำ (ตามแผน ไม่ใช่การข้าม)

- ยังไม่มี ESLint/Stylelint rule, ยังไม่มี debt baseline → **ขั้น 2**
- ยังไม่มี `src/styles/tokens.css`, ยังไม่ migrate → **ขั้น 3**
- ยังไม่มี `scripts/design-check.mjs`, fixtures, fast/final modes → **ขั้น 4**
- ยังไม่มี Playwright setup, reference screenshot บนดิสก์, pin dpr → **ขั้น 4**
- ยังไม่มี A/B pilot → **ขั้น 5**
- `DESIGN.md` ยังเป็น DRAFT; `AGENTS.md` ยังไม่มี → **ขั้น 3**
