# AI Design Harness — ขั้น 2: feedback loop ขั้นต่ำ และ debt baseline

วันที่: 2026-09-22 · แผน: [AI-DESIGN-HARNESS-PLAN.md](../AI-DESIGN-HARNESS-PLAN.md) §6 ขั้น 2
สถานะ: **ขั้น 2 เสร็จ** · ยังไม่มี tokens, ยังไม่ migrate, ยังไม่มี runner รวม (`check:design`)

---

## 1. กฎที่ตั้งนี้ตรวจอะไร (และทำไมตั้งได้ก่อนสรุป design system)

กฎเดียวที่เปิดใช้คือ `design/token-usage` มันเป็นกฎ **เชิงโครงสร้าง** ไม่ใช่กฎเชิงรสนิยม

| กฎนี้ **ไม่ได้** พูดว่า | กฎนี้พูดว่า |
| --- | --- |
| สี secondary ควรเป็นค่าอะไร | `color` ต้องมาจาก token ที่ประกาศไว้ ไม่ใช่ literal |
| caption ควรใหญ่เท่าไร | (ยังไม่เปิด — ดู §2) |
| radius ของ media frame ควรเป็นเท่าไร | (ยังไม่เปิด) |

ผลคือ **การเปลี่ยน design direction ในอนาคตไม่กระทบกฎ** — เปลี่ยนค่าใน token definition แล้วจบ
สิ่งที่เปลี่ยนแล้วแพงคือ *ชื่อ/ความหมาย* ของ token ซึ่งแผนกันไว้ด้วยการ migrate เฉพาะ pilot slice ก่อน (ขั้น 3)
ถ้าชื่อไม่เวิร์ก ก็แก้ตอนที่มีผู้ใช้ไม่กี่จุด ไม่ใช่ทั้งเว็บ

และ baseline ทำให้การตั้งกฎวันนี้ **ไม่บังคับให้ต้องแก้โค้ดเก่าเลย**

---

## 2. Scope ที่เปิด / ยังไม่เปิด

[`scripts/design-check.config.mjs`](../../../scripts/design-check.config.mjs) นิยาม 4 ตระกูล

| ตระกูล | สถานะ | เหตุผล |
| --- | --- | --- |
| `color` | **เปิด** | registry ปัจจุบัน (`src/index.css` `:root`) มี color token จริงอยู่แล้ว กฎจึงมี "คำตอบที่ถูก" ให้ไปใช้ได้ |
| `spacing` | ปิด | ยังไม่มี spacing token กลาง ถ้าเปิดตอนนี้จะรายงานทุก length ในโค้ดโดยไม่มีตัวแทนที่ถูกต้องให้เลือก |
| `typography` | ปิด | เหตุผลเดียวกัน (ไม่มี type scale กลาง) |
| `shape` | ปิด | เหตุผลเดียวกัน (ไม่มี radius/size scale กลาง) |

สามตระกูลที่ปิดจะเปิดในขั้น 3 พร้อม `src/styles/tokens.css`
**debt ของตระกูลเหล่านั้นจะถูกดึงจาก snapshot ก่อนแก้ชุดเดิม** (`phase-1-snapshot`) ไม่ใช่จาก checkout หลัง migrate
— งาน migration จึงกลายเป็นหนี้เดิมไม่ได้

---

## 3. ผลงานขั้น 2

### 3.1 แก้ lint scope

[`eslint.config.js`](../../../eslint.config.js)

| ก่อน | หลัง |
| --- | --- |
| `globalIgnores(['dist'])` เท่านั้น → `eslint .` ไล่เข้า browser-extension JS ใต้ `output/chrome-audit-desktop/` จนไม่จบ | ignore `dist, output, artifacts, design, public, tmp, tmp-*, .playwright-cli, .impeccable, .vercel` + snapshot source |
| config เดียวใช้ `globals.browser` กับทุกไฟล์ | แยก 2 block: `src/**` (browser + React rules) กับ `scripts/**` + `*.config.mjs` (node globals, ไม่มี React rules) |

ผล: `npm run lint` จบใน ~13 วินาที ได้ **2 errors, 1 warning** เท่ากับ `eslint src` เดิมพอดี (ไม่มี finding ใหม่ที่ถูกซ่อน)
สาม finding นั้นเป็นหนี้ React ที่มีอยู่ก่อน ไม่ได้แก้ในขั้นนี้และไม่ได้ blanket ignore:
`Cursor.jsx:58` (`set-state-in-effect`), `TechStackList.jsx:110` (`only-export-components`), `useDocumentRoomReveal.js:104` (`exhaustive-deps`)

รายการ ignore ผูกกับ `EXCLUDED_DIRS` ใน [`scripts/design-scope.mjs`](../../../scripts/design-scope.mjs) ซึ่ง snapshot ใช้ชุดเดียวกัน

### 3.2 กฎ CSS

[`scripts/stylelint-design-tokens.mjs`](../../../scripts/stylelint-design-tokens.mjs) — stylelint plugin ที่ **parse ค่า** ด้วย `postcss-value-parser`
ไม่ได้ใช้ regex นับคำ จึงเดินเข้าไปใน `calc()`, gradient, multi-layer `box-shadow` และ shorthand ได้

ช่องเลี่ยงที่ปิดไว้ (ทุกข้อมี fixture ที่ทำให้ fail จริง):

| ช่องเลี่ยง | ตัวอย่าง |
| --- | --- |
| hex ดิบ | `color: #ff0000` |
| color function ดิบ | `background-color: rgba(255,0,0,.5)` |
| named color | `border-top-color: crimson` |
| local variable | `--local-red: #f00; color: var(--local-red)` |
| raw fallback | `color: var(--text-primary, #f00)` |
| token ที่ไม่มีจริง | `color: var(--color-nope)` |
| token ผิดตระกูล | `color: var(--font-body)` |
| literal ซ่อนใน gradient / shadow / color-mix | `linear-gradient(180deg, #101010, …)` |

Diagnostic ที่ออกมามี `file:line:col` + rule + ค่าที่ผิด + ตระกูล token ที่ต้องใช้ ตามที่ feedback loop ในแผนกำหนด เช่น

```
16:21  ✖  Raw color value "crimson" in "border-top-color".
           Use a declared color token (var(--…)) instead.   design/token-usage
```

### 3.3 ข้อยกเว้นที่ลงทะเบียน

| id | ไฟล์ | ตระกูลที่ยกเว้น | เหตุผล |
| --- | --- | --- | --- |
| `token-definitions` | `src/index.css` (`:root`) | ทั้งหมด | เป็นที่นิยาม token ค่าดิบคือสาระของไฟล์ |
| `keshi-liquid-glass-material` | `src/components/KeshiLiquidGlass.css` | **`color` เท่านั้น** | canonical source ของวัสดุที่เลือก (DESIGN.md A6/A10/A11) ถ้าส่งค่าพวกนี้ผ่าน semantic role การเปลี่ยน palette ที่ไม่เกี่ยวกันจะไปแก้วัสดุที่ล็อกไว้ |

ไม่มี blanket exemption ระดับไฟล์ — `families` ทำให้ข้อยกเว้นเรื่องวัสดุ **ไม่** พ่วงยกเว้น spacing ของไฟล์เดียวกันตอนที่เปิด family นั้น
มี test ยืนยันทั้งเรื่อง families ที่จำกัด และเรื่องที่ข้อยกเว้นไม่รั่วไปไฟล์อื่น

### 3.4 Fixtures และ feedback loop

`npm run test:design` → [`scripts/design-check.test.mjs`](../../../scripts/design-check.test.mjs) — **26 tests ผ่านทั้งหมด**

ครอบคลุม: known-bad 10 กรณี, known-good 6 กรณี, exception 3 กรณี, baseline fingerprint 5 กรณี
และ **feedback loop เต็มรอบ 1 รอบ**:

```
.case-media__label { color: #151513; background-color: #ffffff; }   → 2 errors
.case-media__label { color: var(--text-primary); background-color: var(--paper); }  → 0 errors
```

Test ที่เกี่ยวกับ fingerprint **import ฟังก์ชันจริง** จาก `design-baseline.mjs` ไม่ได้เขียนลอจิกซ้ำในไฟล์เทสต์
มิฉะนั้น test อาจผ่านทั้งที่ implementation เพี้ยนไปแล้ว

### 3.5 Debt baseline

[`scripts/design-baseline.mjs`](../../../scripts/design-baseline.mjs) — lint **snapshot ก่อนแก้** ไม่ใช่ working tree
ถ้าไม่มี snapshot มันจะ refuse ไม่ยอม derive baseline จาก checkout ปัจจุบัน

```
node scripts/design-baseline.mjs --capture --family color
  families enabled      color
  snapshot violations   1779 (1580 distinct)
  current checkout      1779
  drift snapshot-only   0
  drift current-only    0
```

drift = 0 ทั้งสองทาง → ยืนยันว่า application code ไม่ถูกแก้ระหว่างขั้น 1–2

Fingerprint = `rule | path | normalized selector | normalized declaration` + occurrence count
**ไม่ใช้ line number** เพราะการเลื่อนบรรทัดต้องไม่อ่านว่า "ของเก่าหาย ของใหม่โผล่"

พิสูจน์แล้วด้วยการรันจริง:

| ทดสอบ | ผล |
| --- | --- |
| `--verify` บน checkout สะอาด | exit 0, NEW = 0 |
| เติม `.harness-temporal-probe { color: #abcdef; }` ลง `Contact.css` | exit 1, NEW = 1 พร้อมชี้ fingerprint |
| แทรก 3 บรรทัดที่หัว `Hero.css` (เลื่อนทุกบรรทัดในไฟล์) | exit 0, NEW = 0 |

ทั้งสองไฟล์ถูก restore แล้ว และ `diff -rq` กับ snapshot ยืนยันว่า `src/` ไม่ต่างจากตอนขั้น 1

baseline เก็บ `rulesHash` (sha256 ของ rule + config) ไว้ด้วย เพื่อให้ขั้นถัดไปรู้ได้ว่า baseline นี้มาจากกฎชุดไหน
— แผนห้ามเอา baseline เก่ามาใช้ต่อโดยไม่ตรวจ compatibility

---

## 4. หนี้ที่พบ (color family)

**1779 violations, 1580 distinct, กระจายใน 29 ไฟล์**

| ไฟล์ | จำนวน |
| --- | --- |
| `ProjectDetailsStories.css` | 470 |
| `ProjectDetails.css` | 330 |
| `ProjectDetailsModeNote.css` | 231 |
| `ProjectDetailsFreeflow.css` | 137 |
| `ProjectDetailsHermes.css` | 93 |
| `PersonaReloadView.css` | 82 |
| `Experience.css` | 69 |
| (อีก 22 ไฟล์) | 367 |
| `KeshiLiquidGlass.css` | **0** — ข้อยกเว้นทำงานถูกต้อง |

**Pilot slice มีหนี้ 38 รายการ** (selector ที่ขึ้นต้นด้วย `.case-media__frame/__label/__kind`) — เป็นเป้าหมาย migration ของขั้น 3 ที่มีขอบเขตชัด เช่น

```
ProjectDetails.css | .case-media__label | color: #151513;
ProjectDetails.css | .case-media__label | background: #ffffff;
ProjectDetails.css | .case-media__kind-dot | background: #151513;
ProjectDetails.css | .case-media__frame | background: #0b0b0b;
ProjectDetailsStories.css | .case-section--keshi .case-media__frame | background: #090909;
```

ตัวเลข 1779 คือ**การวัด ไม่ใช่รายการงานที่ต้องทำ** แผนระบุชัดว่า v1 ไม่ทำ token migration ทั้งระบบ

---

## 5. ข้อจำกัดที่รู้ (ไม่ปิดบัง)

1. **Declaration หลายบรรทัด** — `box-shadow` ที่เขียนคร่อมหลายบรรทัดจะได้ fingerprint จากบรรทัดที่มี literal
   (เช่น `0 18px 42px rgba(0, 0, 0, 0.28),`) ถ้ามีคน reformat ให้อยู่บรรทัดเดียว fingerprint จะเปลี่ยน
   ผลคือมันจะรายงานเป็น **violation ใหม่ + หนี้เดิมหาย** → exit 1 ดังเดิม **fail ดัง ไม่ใช่เงียบแล้วผ่าน** ซึ่งเป็นทิศทางที่ปลอดภัย
   แก้ให้ดีกว่านี้ได้ด้วยการอ่าน declaration จาก PostCSS AST แทนการอ่านบรรทัด — ยกไปขั้น 4 พร้อม runner
2. **ยังไม่มี rule ฝั่ง static JSX** — ขั้น 2 ทำเฉพาะ CSS ตามที่แผนกำหนด ("เฉพาะที่จำเป็น… ก่อนเพิ่ม runner logic")
   จากการสำรวจในขั้น 1 หนี้ static-JSX ในโค้ดที่รันจริงเกือบเป็นศูนย์ rule นี้จึงเป็นงานกันโค้ดใหม่ ไปอยู่ขั้น 4
3. **ยังไม่มีกฎ `!important` และกฎ scoped override ของ material internals** — เป็นสองในสามตระกูลที่แผนกำหนดสำหรับ v1 ยกไปขั้น 4
4. **ไฟล์ตาย 5 ไฟล์ยังอยู่ใน scope** — `About.jsx`, `VHSTape.jsx`, `Squares.jsx`, `Scribbles.jsx`, `MusicalText.jsx`
   ไม่มีใคร import แต่ยังถูกนับ ยังไม่ตัดสินว่าจะตัดออกจาก maintained scope หรือลบทิ้ง **เป็นคำถามที่ต้องให้เจ้าของตอบ** ไม่ใช่สิ่งที่ AI ควรตัดสินเอง
5. **ยังไม่มี prune** — แผนกำหนดให้มี maintenance prune หลัง final success เพื่อลดหนี้ที่แก้แล้ว ยังไม่ทำ (ขั้น 4)
6. **`npm run lint:css` แสดงหนี้ทั้ง 1779 รายการ** เพราะเป็นการเรียก stylelint ตรง ๆ
   ตัวที่รู้จัก baseline คือ `npm run design:baseline:verify` ขั้น 4 จะรวมสองอย่างนี้ไว้หลังคำสั่งเดียว

---

## 6. คำสั่งที่ใช้ได้ตอนนี้

```bash
npm run lint                    # ESLint, scope ที่แก้แล้ว
npm run lint:css                # stylelint ดิบ (แสดงหนี้ทั้งหมด)
npm run test:design             # fixtures 26 ตัว
npm run design:snapshot         # เก็บ snapshot ก่อนแก้
npm run design:baseline         # derive baseline จาก snapshot
npm run design:baseline:verify  # ตรวจว่ามี violation ใหม่หรือไม่ (exit 1 ถ้ามี)
```

`npm run check:design` ซึ่งเป็น entry point เดียวที่แผนกำหนด ยังไม่มี — อยู่ในขั้น 4

---

## 7. เกณฑ์จบขั้น 2

| เกณฑ์จากแผน | สถานะ | หลักฐาน |
| --- | --- | --- |
| แก้ lint scope | ✅ | `eslint .` จบใน 13 วิ, ไม่เข้า `output/`, แยก node/browser config |
| ตั้ง local rules เฉพาะที่จำเป็น | ✅ | 1 rule (`design/token-usage`), เปิดแค่ตระกูล `color` |
| พิสูจน์ raw-color error → semantic token → pass ด้วย fixtures **ก่อน** เพิ่ม runner logic | ✅ | test `feedback loop: error -> semantic token -> pass`; ยังไม่มี runner |
| ใช้ rules ที่ตั้งแล้วตรวจ pre-edit snapshot เพื่อเก็บ baseline | ✅ | `design-baseline.mjs --capture` อ่าน `phase-1-snapshot/source` และ refuse ถ้าไม่มี snapshot |
| cross-check กับ checkout ปัจจุบัน | ✅ | drift 0/0 บันทึกใน `design-check-baseline.json` |
| ห้ามรับหนี้จากการแก้ในขั้นถัดไป | ✅ | baseline ผูกกับ `treeHash` ของ snapshot + `rulesHash`; ตระกูลที่ยังปิดจะ capture จาก snapshot เดิมเมื่อเปิด |
| diagnostic ที่แก้ตามได้จริง | ✅ | มี file:line:col + rule + offending value + allowed family; test ยืนยันเนื้อความ |

---

## 8. ขั้นถัดไป (ขั้น 3)

- สร้าง `src/styles/tokens.css` (primitive → semantic → theme) โดย **ยกค่าที่ render อยู่ตอนนี้ขึ้นไป ไม่คิดค่าใหม่**
- migrate pilot slice 38 รายการ แล้วเทียบ computed values กับ [`phase-1-before-render.json`](phase-1-before-render.json) ทั้ง pilot และ non-pilot consumer
- เปิดตระกูล `spacing` / `typography` / `shape` แล้ว capture debt จาก snapshot เดิม
- ประกาศ pilot ที่ migrate เสร็จเป็น strict scope (ห้ามใช้ baseline)
- เขียน `DESIGN.md` ให้ครบตามสัญญา §4 และเพิ่ม design block ใน `AGENTS.md`
