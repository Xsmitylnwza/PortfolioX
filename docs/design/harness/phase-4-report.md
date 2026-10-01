# AI Design Harness — ขั้น 4: runner, กฎที่เหลือ และ prune

วันที่: 2026-09-22 · แผน: [AI-DESIGN-HARNESS-PLAN.md](../AI-DESIGN-HARNESS-PLAN.md) §6 ขั้น 4
สถานะ: **ขั้น 4 เสร็จเป็นส่วนใหญ่** — Playwright/reference screenshots **ยังไม่ทำ** (ดู §8)

---

## 1. คำสั่งเดียว

```bash
npm run check:design -- --files <path...> [--mode fast|final]
npm run check:design -- --base <git-ref>
npm run check:design -- --full
```

| สิ่งที่ทำ | พฤติกรรม |
| --- | --- |
| ไม่ระบุ scope | แสดง usage แล้ว **exit 1** — ไม่มี default scope เพราะการรายงานว่า "ผ่าน" จาก scope ว่างคือการโกหก |
| scope ว่างหลัง filter | exit 1 พร้อมบอกว่าไม่ได้ตรวจอะไรเลย |
| `--files` | ตรวจไฟล์ + route ที่ config map ไว้ |
| `--base <ref>` | diff กับ ref ที่ **ระบุเอง** ไม่เดา default branch; รายงาน untracked source แยกว่าไม่ได้ตรวจ |
| `--full` | maintained sources ทั้งชุด |
| `--mode fast` | lint + ratchet, **ไม่ build** |
| `--mode final` (default) | เพิ่ม build + ระบุ route ที่ต้องเปิดดู |
| `--fix` | **ไม่มี** ไม่เขียนทับโค้ด ไม่ขยาย baseline อัตโนมัติ |

ผลลัพธ์ชุดเดียวมี: scope, checked, skipped พร้อมเหตุผล, existing debt, new failures, route ที่ต้องดู และ timing

**Exit 0 บอกว่ากฎไม่ถูกละเมิด ไม่ได้บอกว่าดีไซน์ถูกต้อง** — ข้อความนี้พิมพ์ทุกครั้งที่ผ่าน

### needs-scope ไม่ใช่การผ่าน

ไฟล์ที่ไม่มี route mapping → **exit 1** พร้อมบอกให้เพิ่มใน `RENDER_TARGETS` หรือระบุ route
ไม่ผ่านเงียบ ๆ ด้วยการเดาว่า "คงไม่มีใครใช้"

```
NEEDS-SCOPE: no consumer route is mapped for these files.
    ? src/components/TVModal.css
RESULT: fail (needs-scope)
```

### Token registry เปลี่ยน → ขยาย scope เอง

ส่ง `--files src/styles/tokens.css` อย่างเดียว แต่ runner ตรวจ **CSS + JSX ทั้ง maintained scope**
เพราะการเปลี่ยน token ทำให้ consumer ที่ไม่ได้แก้พังได้ เงื่อนไขนี้ใช้กับ fast mode ด้วย

```
✓ design rules across ALL maintained CSS + JSX (token registry or rule config changed)
```

---

## 2. กฎที่เพิ่ม

### 2.1 `design/ownership-boundaries` (CSS)

| ตรวจ | เหตุผล |
| --- | --- |
| `!important` ที่ไม่ได้ลงทะเบียน | declaration ที่ชนะด้วยกำลัง ไม่ใช่ด้วยการเป็นเจ้าของ property — เป็นวิธีที่ contract A9 ถูกทำลายเงียบ ๆ |
| การ style internals ของ material ที่ล็อกจากไฟล์อื่น | Round 11 พังแบบนี้พอดี: กฎ legacy ทาทับ layer ของ glass component แล้ว production render เสีย |

`IMPORTANT_ALLOWANCES` ว่างเปล่าตั้งใจ — `!important` 139 จุดที่มีอยู่เป็น **หนี้ที่บันทึกไว้** ไม่ใช่ข้อยกเว้น
ไฟล์เจ้าของ style internals ของตัวเองได้ (มี test)

### 2.2 `design/token-usage-jsx` (static JSX)

ตรวจ `style={{ … }}` ด้วย **config ชุดเดียวกับฝั่ง CSS** — property จะถูกคุมใน stylesheet แต่ปล่อยใน style prop ไม่ได้

รองรับ: object literal ที่ค่าเป็น literal, `const` ที่ผูกกับ literal ในไฟล์เดียวกัน
**ไม่รองรับ** (รายงานว่า `unsupported` ไม่เงียบ): props/state/hook/import ข้ามไฟล์, template literal ที่ interpolate

พบ 49 finding — ตรงกับที่สำรวจไว้ในขั้น 1 ว่าหนี้ static-JSX เกือบทั้งหมดอยู่ใน**ไฟล์ที่ไม่มีใคร import**

---

## 3. ESLint เข้า ratchet ด้วย

ESLint ไม่มีกลไกหนี้ของตัวเอง ถ้าปล่อยไว้จะเกิดสองปัญหา:

1. `design/token-usage-jsx` จะ hard-fail ทันทีกับ 49 finding ที่มีอยู่ **ก่อน** กฎนี้เกิด
2. React error 2 ข้อที่ค้างมานานจะทำให้ `--full` ผ่านไม่ได้เลย

ทั้งสองเป็นหนี้เดิม จึงเข้า ratchet เหมือนกัน: **เห็นได้ ให้อภัย แต่เพิ่มไม่ได้**

- ใน `eslint.config.js` กฎ design เป็น `warn` (เพราะ ESLint ตัดสิน new vs debt ไม่ได้)
- ตัวที่ตัดสินคือ `design-baseline.mjs --verify` ซึ่งแยกออก
- warning ที่ไม่ใช่กฎ design **ไม่** เข้า ratchet — ไม่เอา style preference มาเป็น gate

---

## 4. Prune — ลดหนี้ได้อย่างเดียว

```bash
npm run design:baseline:prune
```

ป้องกันสามชั้น:

| ชั้น | พฤติกรรม |
| --- | --- |
| lint ใหม่ทุกครั้ง | ไม่เชื่อผลรันก่อนหน้า — ผลเก่า/ไม่ครบใช้ล้างหนี้ไม่ได้ |
| ตรวจ `rulesHash` | ถ้ากฎเปลี่ยนตั้งแต่ capture จะ **refuse** ไม่ยอม retire หนี้ที่วัดด้วยกฎคนละชุด |
| ปฏิเสธ tree ที่ fail | มี violation ใหม่ค้างอยู่ → refuse |

โครงสร้างเป็น reduce-only: entry ถูกลบหรือ count ถูกลด **ไม่มีทางเพิ่ม**

```
design-baseline --prune
  entries before   4210
  retired          28      ← 28 fingerprint ที่ migration ขั้น 3 แก้จริง
  count lowered    0
  entries after    4182
```

---

## 5. Temporal fixture — รันจริงครบวง

| ขั้น | ผล |
| --- | --- |
| 1. หนี้เดิมถูกบันทึก | `.case-media__label \| color: #151513;` อยู่ใน baseline |
| 2. migrate แล้ว verify ผ่าน | exit 0 |
| 3. prune | retired ✓ (หายจาก baseline) |
| 4. **เอาค่าเดิมกลับเข้าไป** | **exit 1** — `[STRICT SCOPE — no baseline allowance]` |
| 5. สั่ง prune ตอน tree fail | **exit 1** — "Refusing to prune from a failing tree" |

ไฟล์ revert แล้ว, `--verify` บน tree ปัจจุบัน = exit 0

---

## 6. ข้อบกพร่องที่เจอระหว่างทำ (แก้แล้วทั้งหมด)

| # | อาการ | สาเหตุจริง |
| --- | --- | --- |
| 1 | `spawnSync npm.cmd EINVAL` | Node 24 ไม่ยอม spawn `.cmd` โดยไม่มี shell — แก้ด้วยการเรียก `vite`/`eslint` ผ่าน JS entry point ด้วย node ตัวเดียวกัน ไม่ต้องใช้ shell เลย |
| 2 | รายงานถูกกลบด้วย git CRLF warning ไฟล์ละบรรทัด | `git()` ไม่ได้ capture stderr |
| 3 | regex ใน `RENDER_TARGETS` เป็น `tokens\.css` ที่ backslash หายไปตอนเขียนไฟล์ → `.` กลายเป็น wildcard | ESLint `no-useless-escape` จับได้; แก้เป็น RegExp literal ที่ escape `/` แทนการฝัง regex ใน string |
| 4 | **JSX-only scope ไม่ถูก gate** — ratchet ผูกกับ "มี CSS ใน scope" | แก้ให้ ratchet รันเมื่อมี UI source ใด ๆ เพราะตอนนี้มันคุมทั้ง CSS และ JSX |
| 5 | JSX debt ของ snapshot อ่านได้ 0 → จะถูกนับเป็นของใหม่ | flat config ใช้ `files: ['src/**']` ซึ่ง resolve เทียบ cwd — snapshot อยู่ path ซ้อน จึงไม่ match config block ไหนเลย แก้ด้วย cwd = tree ที่ lint + `overrideConfigFile` ชี้ config ของ repo |

ข้อ 4 กับ 5 เป็นรูที่ **ทำให้ harness รายงานผ่านทั้งที่ไม่ควร** — เจอจากการรันจริง ไม่ใช่จากการอ่านโค้ด

---

## 7. ตัวเลขและเวลา (วัดจริง)

| Check | เวลา |
| --- | --- |
| eslint (scoped, 1 ไฟล์) | ~2.4s |
| eslint (`--full`) | ~5.2s |
| design rules vs baseline | ~0.7s (scoped) / ~5.5s (full) |
| vite build | ~2.9–3.3s |
| **fast mode, scoped** | **~3s** |
| **final mode, scoped** | **~6s** |

Debt: 4,182 fingerprint (5,487 violation) จาก 4 ตระกูล token + ownership + JSX
Tests: **44 ผ่านทั้งหมด**

---

## 8. สิ่งที่ยังไม่ได้ทำในขั้นนี้

1. **Playwright ยังไม่ติดตั้ง** → ยังตรึง `devicePixelRatio` ไม่ได้ และยังไม่มี reference screenshot บนดิสก์
   วิธีวัด render ตอนนี้ยังเป็น `compareAgainstBefore()` ผ่าน browser pane ซึ่งทำงานได้และวัดได้จริง
   แต่ **ทำซ้ำโดยอัตโนมัติไม่ได้** และเทียบข้าม dpr ไม่ได้ — เป็นงานค้างที่ต้องปิดก่อนอ้างว่า visual regression ถูกคุม
2. **Declaration หลายบรรทัดยังใช้ fingerprint จากบรรทัดเดียว** (ค้างมาตั้งแต่ขั้น 2)
   reformat `box-shadow` หลายบรรทัดให้เป็นบรรทัดเดียวจะรายงานเป็น violation ใหม่ → **fail ดัง ไม่เงียบ** ซึ่งปลอดภัย
   แก้ให้ถูกต้องต้องอ่าน declaration จาก PostCSS AST
3. **Reuse / component extraction ไม่ได้ทำ** — ตั้งใจ แผนบอก "reuse ก่อน extract; ไม่บังคับสร้าง component ใหม่"
   `CaseMediaFrame` reuse อยู่ 24 จุดแล้ว จึงไม่มีอะไรต้อง extract
   DOM contract ที่ต้องรักษาเขียนไว้ใน `AGENTS.md` แต่ **ยังไม่มี test อัตโนมัติ** ที่จับการทำ `data-wave-follow` หาย
4. **needs-scope ยังกว้าง** — `RENDER_TARGETS` map แค่ 3 route ไฟล์ UI ส่วนใหญ่จึงยัง needs-scope
   เป็นพฤติกรรมที่ตั้งใจ (ดีกว่าเดา) แต่แปลว่า `--base` บน branch ใหญ่จะ fail จนกว่าจะเติม mapping

---

## 9. เกณฑ์จบขั้น 4

| เกณฑ์จากแผน | สถานะ | หลักฐาน |
| --- | --- | --- |
| reuse ก่อน extract, ไม่บังคับสร้าง component ใหม่ | ✅ | ไม่ extract อะไรเลย; `CaseMediaFrame` reuse 24 จุด |
| runner fast/final + route mapping + baseline comparison | ✅ | §1 |
| fast mode ไม่ build | ✅ | §1 + timing |
| final mode ไม่อ้าง visual acceptance จาก lint | ✅ | ข้อความปิดท้ายทุก run + route list |
| fixtures: raw color/spacing, local-var bypass, raw fallback, undefined/wrong-family token, static JSX bypass, valid exception, runtime geometry | ✅ | 44 tests |
| fixtures baseline: duplicate / moved / renamed / deleted | ✅ | 5 tests |
| fixture: unsupported dynamic syntax | ✅ | JSX `unsupported` messageId |
| fixture: ลบ/เปลี่ยน family ของ token แล้ว unchanged consumer ต้อง fail | ✅ | `wrongFamily` + `unknownToken` tests; registry change ขยาย scope เอง (§1) |
| fixture: baseline literal ใน strict scope ต้อง fail, legacy นอก scope ยังเป็น debt | ✅ | §5 ขั้น 4 + test |
| temporal fixture: debt → fixed → prune → reintroduce ต้อง fail | ✅ | §5 |
| partial scope ห้ามล้าง debt อื่น, stale evidence ห้าม prune | ✅ | §4 (re-lint ทุกครั้ง + rulesHash + refuse on failing tree) |
| ทดสอบ failure exit | ✅ | no-scope, needs-scope, strict scope, prune refuse — exit 1 ทุกกรณี |
| บันทึกเวลาแต่ละ check | ✅ | §7 + timing ใน output |
| final build/render ตรวจ consumer จริงพร้อม glass sentinel | ⚠️ บางส่วน | build อัตโนมัติ; render ยังต้องเรียกเอง (§8 ข้อ 1) — sentinel ยืนยันแล้ว 0 การเปลี่ยนแปลง |

---

## 10. คำสั่งทั้งหมด

```bash
npm run check:design -- --files <path...> --mode fast   # ระหว่างแก้
npm run check:design -- --base HEAD                     # ก่อนส่งงาน
npm run check:design -- --full                          # ตรวจทั้งชุด
npm run design:baseline:prune                           # หลัง final ผ่าน
npm run test:design                                     # fixtures ของ harness
```
