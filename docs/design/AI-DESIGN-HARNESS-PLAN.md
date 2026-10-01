# PortfolioX — Lightweight AI Design Harness

วันที่: 2026-09-22 · เวอร์ชัน: 0.4 · สถานะ: ปรับตาม scrutinize review สองรอบแล้ว ยังไม่ได้ implement หรือพิสูจน์ผล runtime

Revision 0.4: แก้ข้อกำหนดตาม [review รอบสองของ v0.3](AI-DESIGN-HARNESS-REVIEW-R2.md): ขยาย token-reference checks เมื่อ registry/config เปลี่ยน, strict migrated scope, retire baseline debt และแยก inconclusive pilot จาก technical failure การปิดข้อเสนอในสเปกยังไม่ใช่ผลทดสอบ implementation

Revision 0.3: แก้ plan gaps ทั้ง 8 ข้อจาก [review ของ v0.2](AI-DESIGN-HARNESS-REVIEW.md): baseline ก่อนแก้, รักษา cascade/DOM contract, จำกัด checker, แยก fast/final checks และควบคุม pilot/reference รายงาน review เดิมเป็นหลักฐานของ v0.2 ไม่ใช่ผลตรวจรับ implementation ของ v0.3

Revision 0.2: เพิ่ม central tokens, lint feedback loop และ reusable component contract ตามคำชี้แจงผู้ใช้ ส่วนนี้เป็น requirement ของ v1 ไม่ใช่เพียงข้อเสนอ optional

## 1. เป้าหมายและข้อกำหนดหลัก

ทำให้ output ของ AI ตรงคำสั่ง รักษา direction ที่เลือกแล้ว และเกิด regression น้อยลง โดยไม่เพิ่มขั้นตอนประจำให้เจ้าของโปรเจกต์

ข้อกำหนดจากผู้ใช้:

> “เราไม่อยากเพิ่ม process ในการทำงาน เราแค่ต้องการควบคุม result หรือสร้าง harness ขึ้นมาให้ quality ของมันน่ะ มันสเถียรมากที่สุดที่เป็นไปได้เท่านั้นเอง”

ดังนั้น AI เป็นผู้เลือก checks ที่เกี่ยวข้อง รัน แก้ และสรุปเอง ผู้ใช้ยังสั่งงานตามปกติ ไม่ต้องกรอกแบบฟอร์ม เปิด checklist หรืออนุมัติทุกขั้น

แผนนี้ใช้ `design-rules-file` โดยรวมงานที่เกี่ยวข้องให้อยู่ในไฟล์และคำสั่งจำนวนน้อย การประเมินกฎด้วย A/B เป็นงานตั้งระบบหรือปรับระบบครั้งสำคัญ ไม่ใช่ขั้นตอนทุกครั้งที่แก้ UI

แผนนี้แทนข้อเสนอด้านขนาดเอกสารและลำดับสร้าง harness ใน audit/foundation review ก่อนหน้า ไม่แทน art direction, project briefs หรือแผนปรับ UI ที่ผู้ใช้เลือกไว้

## 2. ขอบเขต v1

รวม:

- กฎปัจจุบันที่อ้างอิงสิ่งที่ผู้ใช้เลือกและโค้ดจริง พร้อม reference ที่ค้นพบได้ง่าย
- ข้อกำหนดการ reuse และ ownership ของ styling เฉพาะที่จำเป็นต่อการทำตาม direction
- Central tokens สำหรับสี ระยะห่าง typography และขนาด UI ที่ควบคุม พร้อม lint ห้ามค่าดิบใหม่ใน properties ที่กำหนด และ reusable primitives สำหรับ pilot
- คำสั่งตรวจเดียวสำหรับ AI พร้อม lint scope ที่ถูกต้องและ CSS checks จำนวนน้อย
- การตรวจหน้าที่ได้รับผลกระทบ และ pilot เพื่อพิสูจน์ว่ากฎช่วย output จริง

ไม่รวม:

- redesign ทั้งเว็บ, ย้าย framework, ย้ายทุก component ไป CSS Modules หรือทำ token migration ทั้งระบบ
- สร้าง Storybook หรือระบบคะแนน AI dashboard
- เขียนกฎทุก pixel, ห้าม literals ทุกชนิด, บังคับทุกโปรเจกต์ใช้ composition เดียว
- ตรวจทุก route ทุก browser หรือทำ A/B ทุกงาน
- เปลี่ยน deployment workflow, commit, push หรือ deploy ในงาน v1 นี้

## 3. Deliverables

| ไฟล์ | หน้าที่ |
| --- | --- |
| `DESIGN.md` | กฎปัจจุบัน, ขอบเขตร่วม/เฉพาะโปรเจกต์, reusable sources, reference, capability sources และ known gaps |
| `AGENTS.md` | design block สั้น ชี้ให้อ่านส่วนที่เกี่ยวข้องและใช้ harness โดยรักษาคำสั่งอื่นที่มีอยู่ |
| `src/styles/tokens.css` | canonical palette/scales, semantic roles และ scoped project themes; import ครั้งเดียวจาก global stylesheet |
| reusable components เดิม หรือ `src/components/ui/` เมื่อจำเป็น | reuse ก่อน extract; ไม่บังคับสร้าง folder/component ใหม่เพื่อให้ครบ deliverable |
| `scripts/design-check.mjs` | entry point ตรวจ scope, lint, build และ CSS rules ตามชนิดการเปลี่ยน |
| `scripts/design-check.config.mjs` | ขอบเขตตรวจ, project/route mapping, rule definitions และ exceptions ที่มีเหตุผล |
| `scripts/design-check-baseline.json` | fingerprint ของ violations เดิม ไม่ใช่ blanket allowlist รายไฟล์ |
| `scripts/design-check.test.mjs` | known-bad/known-good fixtures สำหรับยืนยัน checks ที่เพิ่ม |
| `docs/design/AI-DESIGN-HARNESS-PILOT.md` | ผลทดสอบกฎครั้งตั้งระบบ, เวลา, ข้อผิดพลาด และข้อจำกัด |

ชื่อ scripts เป็น target interface; รวม implementation ย่อยได้หากทำให้ง่ายขึ้น ไม่ต้องสร้างเอกสาร STYLE-ARCHITECTURE/QUALITY-GATES/DECISIONS แยกใน v1 ใช้ section และลิงก์จาก `DESIGN.md` แทนการคัดลอกกฎหลายที่

## 4. สัญญาของ DESIGN.md

แต่ละกฎต้องตอบได้ว่า ใช้กับอะไร ต้องทำอะไร reuse จากไหน และตรวจอย่างไร มี provenance สั้น ๆ ชี้กลับ feedback/selected reference เดิม

เนื้อหาจำเป็น:

1. **Shared direction:** art-first, recruiter-readable, shared environment และขอบเขตที่ project identity เปลี่ยนได้
2. **Current decisions:** ระบุ accepted / experimental / superseded ให้ชัด เฉพาะค่าปัจจุบันอยู่ในกฎหลัก
3. **Implementation levers:** tokens/components/classes ที่ควรใช้; material ดูแล surface, wrapper ดูแลตำแหน่ง และ padding มีเจ้าของเดียว
4. **Content truth:** ลิงก์ capability/ownership/evidence รายโปรเจกต์; ให้รายละเอียดได้แต่ห้าม invent capability หรือทำข้อมูลจริงหายเพราะกลัวกล่าวเกินจริง
5. **Examples:** reference ที่ยอมรับและตัวอย่างที่เคยถูกปฏิเสธพร้อมเหตุผล โดยแยก prototype selection จาก production acceptance
6. **Verification:** กฎใดตรวจด้วย script และกฎใดต้องดู render; ห้ามใช้ build ผ่านแทน visual acceptance
7. **Known gaps:** สิ่งที่ยังไม่ตัดสินหรือยังไม่ได้วัด ไม่เติมคำตอบจากรสนิยมของ AI

ลำดับตัดสินข้อขัดแย้ง: คำสั่งผู้ใช้ปัจจุบัน → ข้อยกเว้นเฉพาะโปรเจกต์ที่ยอมรับและระบุ scope → กฎร่วมปัจจุบัน → ประวัติการทดลอง โค้ดบอกพฤติกรรมจริงแต่ไม่ได้ทำให้สิ่งที่ขัดเจตนากลายเป็น approved direction โดยอัตโนมัติ

ถามผู้ใช้เมื่อคำสั่ง/หลักฐานขัดกันจนต้องเปลี่ยน direction ที่ล็อกไว้ หรือมีตัวเลือกสำคัญที่ไม่มีคำตอบในหลักฐานเดิม รายละเอียด implementation ภายในกรอบให้ AI ตัดสินใจเองและทำต่อ

### Central tokens และ reusable components — requirement v1

ใช้โครงสร้าง `primitive values → semantic roles → components` เช่น palette สี → สีข้อความ/พื้นผิว/action → component ที่ใช้ role นั้น การเปลี่ยนสีร่วมทำที่ token definition แล้ว consumers ที่ migrate แล้วได้รับค่าจากที่เดียว

| กลุ่ม | ข้อกำหนด |
| --- | --- |
| Color | UI ใช้ semantic tokens; raw hex/rgb/hsl/named colors และสีใน gradient อยู่ได้เฉพาะ canonical definitions/recipes ที่ระบุ ไม่ให้ component เลือก arbitrary palette color แทน semantic role |
| Spacing | padding, margin และ gap ใช้ spacing tokens; semantic aliases เช่น section spacing หรือ control padding ต้องอ้าง scale กลาง |
| Typography | font family, font size, line height และ letter spacing ใช้ roles/scale ที่นิยามกลาง ไม่สร้างตัวเลขใหม่ตามใจในแต่ละ component |
| Shape and size | radius, border width, control height, icon size และ content max-width ใช้ tokens กลาง; รายการ governed properties ต้องชัดใน config |
| Responsive layout | อนุญาต structural values เช่น `0`, `auto`, `100%`, `1fr` ตาม property และ token-based expressions; ไม่บังคับทุก geometric coordinate หรือ breakpoint ให้เป็น CSS variable เพราะ native media queries ใช้ custom properties ไม่ได้ |
| Product variation | project theme override semantic roles ผ่าน central scoped definitions; สีแบรนด์ใน UI ก็ต้องประกาศกลาง แต่สี pixel ใน screenshot/video และ artwork/shader ที่ระบุ scope เป็นคนละเรื่อง |

ตัวอย่าง API ด้านล่างเป็นชื่อเสนอ ไม่ใช่ค่า design ที่วัดหรือยอมรับแล้ว:

```css
.evidence-caption {
  color: var(--color-text-secondary);
  padding: var(--space-caption-block) var(--space-caption-inline);
  border-radius: var(--radius-media);
}
```

ข้อกำหนดบังคับใช้:

- ห้ามหลบ check ด้วย local custom property เช่น `--local-red: #f00`, raw fallback เช่น `var(--color-text, #f00)` หรือ arbitrary literal ภายใน `calc()`; token ต้องมี definition จริงและอยู่ในกลุ่มที่อนุญาตสำหรับ property นั้น
- ครอบคลุม external CSS และ static JSX `style` สำหรับ governed properties; inline static values ตรวจผ่าน AST ไม่ใช่แค่ค้นข้อความ CSS
- Runtime geometry เช่นตำแหน่ง pointer, canvas dimensions และ animation progress ใช้ measured values ได้ใน producer/property ที่ระบุ ไม่ใช้ข้อยกเว้นนี้เป็นทางผ่านของสี/spacing ทั่วไป
- ห้ามสร้าง token ใหม่สำหรับทุกค่าดิบเพื่อให้ lint ผ่าน: reuse semantic role เดิมก่อน; token ใหม่ต้องมีความหมายที่ใช้จริงและระบุเหตุผลใน diff ตามปกติ ไม่เพิ่ม approval form
- migrate tokens ที่ pilot ใช้ก่อน พร้อม compatibility aliases ของชื่อเดิมเมื่อจำเป็น; โค้ดเก่าที่ยังไม่ migrate อยู่ใน baseline และต้องรายงานขอบเขตตามจริง การเปลี่ยน palette กลางยังไม่รับประกันว่าจะเปลี่ยน legacy literals ทั้งเว็บ
- ระบุ strict migrated scope ใน config เดิมเป็น component/selector + governed properties; scope นี้และ UI code ใหม่ห้ามใช้ token-debt baseline ยกเว้น registered material/runtime exceptions ที่มีเหตุผล ไม่ใช้ whole-file flag เมื่อไฟล์รวมหลายโปรเจกต์ ส่วน legacy นอก scope ใช้ ratchet ต่อ
- ระหว่าง token extraction รักษาหน้าตาที่เลือกแล้ว ไม่ปัดทุก spacing เข้าสเกลใหม่จนกลายเป็น redesign; ค่าที่ต้องตัดสินใหม่แยกไว้ชัด
- วาง primitive definitions ที่ root แต่รักษา semantic/theme selector scopes และ import precedence; aliases ต้อง resolve ใน scope ที่รับ override จริง ไม่ assume ว่า inherited alias จะคำนวณใหม่ที่ลูก ห้ามเพิ่ม cascade layers พร้อม migration นี้
- เก็บ computed color/type/spacing ของ pilot และหนึ่ง non-pilot consumer ก่อน/หลัง พร้อม render เพื่อยืนยันว่าการรวม tokens ไม่เปลี่ยน project overrides
- มี accepted usage examples และ foreground/background pairings สำหรับ body/caption/action ใน pilot; token ถูก family ไม่เท่ากับอ่านง่าย ตรวจ solid contrast เมื่อวัดได้ และ composite จริงของ glass ใน state ที่เกี่ยวข้อง ไม่ auto-map ไปค่าที่ใกล้สุด

Reusable component contract:

- สำรวจ repeated structure/state ที่มีจริงก่อนเลือก primitives เช่น media frame/caption, action link หรือ layout stack; ไม่สร้าง generic Card ครอบทุก story
- component ใช้ tokens ภายใน และเปิด props/variants ที่สื่อหน้าที่ เช่น tone/size; caller ไม่ส่ง raw color/padding หรือ override private selectors เพื่อเปลี่ยน recipe
- ใช้ composition/children เพื่อรักษา individuality ของแต่ละ project; composition กับ material แยก ownership
- ทำ inventory สั้นใน DESIGN.md ว่าเมื่อไรควร reuse ตัวไหน; lint บังคับ token/known private boundaries ได้ ส่วนความเหมาะสมในการ extract component ตรวจจาก source/review ไม่อ้างว่าจับ duplication เชิงความหมายได้ทั้งหมด
- รักษา element semantics, DOM markers, refs/events, direct-child relationships และ ancestor constraints ที่ consumer ใช้ โดยเฉพาะ `data-wave-*` และ media discovery; ตรวจ behavior ของ consumer จริงหลัง extract ไม่ใช่เพียง component render

Feedback loop: AI เขียน → harness แจ้ง `file:line + rule + offending value + allowed token family/source` → AI เลือก token/variant ที่ถูกความหมายและแก้ → rerun relevant checks → ตรวจ render เมื่อกระทบภาพ ไม่ auto-map ตัวเลขเป็น token โดยไม่ดูหน้าที่ และห้ามปิด rule หรือเพิ่ม baseline เพื่อหนี error หากวนแก้แล้วติด constraint conflict ให้รายงานสาเหตุแทนวนไม่จบ

## 5. สัญญาของ harness

Target commands:

```text
npm run check:design -- --files <file1> <file2> ... --mode fast
npm run check:design -- --files <file1> <file2> ... --mode final
npm run check:design -- --base <git-ref>
npm run check:design -- --full
```

- `--files`: ตรวจ target files และ consumers/routes จาก maintained mapping ขนาดเล็ก ใช้เป็นค่าเริ่มต้นสำหรับงานที่มี dirty checkout; ไม่สร้าง automatic dependency graph ใน v1
- `--base`: derive scope จาก diff กับ ref ที่ระบุ รวมสถานะ staged/unstaged และรายงาน untracked source ที่เกี่ยวข้อง ต้องไม่ใช้ค่า default branch ที่เดาเอง
- `--full`: ตรวจ maintained production/tooling sources ทั้งชุด ใช้ตั้ง baseline หรือเมื่อ shared change กว้าง
- หากไม่ระบุ scope ให้แสดง usage และออกด้วย error; ห้ามรายงานผ่านจากการตรวจ scope ว่างโดยไม่อธิบาย
- ไม่มี `--fix` อัตโนมัติ ไม่มีการเขียนทับ code หรือเพิ่ม baseline อัตโนมัติเพื่อทำผลให้เขียว
- `--mode fast`: scoped lint/token checks สำหรับรอบแก้ไข; `--mode final` เป็น default เมื่อไม่ระบุ mode และเพิ่ม build เมื่อเปลี่ยน UI source พร้อม render evidence targets ไม่ build ซ้ำถ้ายังไม่มี source/config/dependency เปลี่ยนจากผลสำเร็จล่าสุดที่ยืนยันได้
- scope ที่ไม่รู้ consumers ต้องรายงาน needs-scope และ exit 1 หรือใช้ representative smoke ที่ระบุใน config ห้ามเงียบแล้วผ่าน
- เมื่อ token registry/definitions หรือ family/rule config เปลี่ยน ต้องตรวจ token references และ family usage ทั่ว maintained UI scope ทั้ง CSS/static JSX แม้เป็น fast mode หรือระบุเพียงไฟล์ tokens; visual review ยังใช้ representative consumers ไม่ต้องสร้าง dependency graph หาก rules เปลี่ยนให้ตรวจ pre-edit source ด้วย rules เดียวกับ current source และรายงาน coverage changes แยกจาก UI regressions ห้ามนำ baseline เก่ามาใช้โดยไม่ตรวจ compatibility

การเลือกงานตรวจ:

| การเปลี่ยน | ตรวจอัตโนมัติ | หลักฐานที่ AI ต้องดู |
| --- | --- | --- |
| เอกสารกฎอย่างเดียว | ตรวจลิงก์/paths ที่กฎอ้างถึง ไม่ build แอป | ตรวจว่ากฎไม่ขัด current decisions |
| JS/JSX/CSS/data/assets ของ UI | fast: scoped lint/token checks; final: เพิ่ม build | render ของ route/state ที่ได้รับผลกระทบตอน final |
| shared tokens/component/motion | checks ข้างต้น + consumers ที่ config map ไว้ | representative consumers; ขยายเมื่อพบความเสี่ยงหรือ regression |
| task ที่ไม่เปลี่ยนหน้าตาหรือ behavior | เฉพาะ applicable checks | ไม่บังคับสร้าง screenshots ที่ไม่ให้ข้อมูลเพิ่ม |

ผลลัพธ์หนึ่งชุดต้องมี scope, checked, skipped พร้อมเหตุผล, existing debt, new failures และ route ที่ต้องดู ไม่พิมพ์แค่ `PASS` รวมทุกอย่าง

- Exit 0: applicable mechanical checks ผ่านตาม baseline เท่านั้น ไม่ได้หมายความว่า visual acceptance ผ่าน
- Exit 1: new violation, build failure, configuration error หรือ required check รันไม่ได้
- Existing debt แสดงแยก; violations ใหม่ห้ามหักล้างด้วยการลบ violation อื่นในไฟล์เดียวกัน ใช้ rule/path/location context fingerprint และทดสอบกรณีย้ายบรรทัด
- จับ task-start source snapshot/hash ก่อนแก้ application code รวม dirty/untracked sources เพื่อแยก ownership; persisted debt baseline เก็บ diagnostics จาก pre-edit snapshot หลังตั้ง rules แล้วแต่ก่อน migrate ห้ามใช้ diagnostics หลัง migrate เป็นหนี้เดิม
- baseline fingerprint ใช้ normalized declaration/selector context พร้อม occurrence count ไม่ใช้ line number อย่างเดียว; rename ต้อง map อย่าง explicit มิฉะนั้นถือเป็น path ใหม่ ทดสอบ added duplicate, moved line, rename และ deletion การตั้ง/ปรับ baseline เป็นคำสั่ง maintenance แยกจาก check ปกติ
- หลัง final checks สำเร็จ AI ต้องเรียก maintenance prune เพื่อลดรายการ/จำนวนหนี้ที่แก้แล้วก่อนส่งงาน โดยใช้ diagnostics ครบเฉพาะ scope ที่ตรวจสำเร็จ; ห้ามเพิ่ม allowance ห้ามล้าง debt ของ scope ที่ไม่ได้ตรวจ และห้าม prune จาก partial/failed/cancelled run ต้องยืนยัน source/config/baseline hashes ยังตรงกับผล final ก่อนเขียน Check ปกติคง read-only ไม่เพิ่มขั้นตอนให้ผู้ใช้

### Tooling และขอบเขต checker

- ใช้ ESLint เดิม + local rules/RuleTester สำหรับ JSX; Stylelint + local token plugin สำหรับ CSS; parsed values สำหรับ shorthand/expressions; Node test runner สำหรับ runner/baseline fixtures
- รองรับ CSS declarations/declared aliases และ static JSX object literals หรือ immutable bindings ภายในไฟล์ที่ resolve ได้โดย syntax จำกัด ระบุ syntax ที่รองรับใน config/docs ก่อน implement ไม่สร้าง general JS dataflow หรือ CSS cascade simulator
- governed dynamic style ที่ resolve ไม่ได้ต้อง diagnostic ว่า unsupported; runtime producer exceptions ระบุ file/property/reason และแสดง coverage exclusions เช่น computed-style capture clone ไม่ blanket ยกเว้นทั้ง UI file
- ตรวจ unknown token refs/cycles เฉพาะ declared registry; family mapping อยู่ใน config ชุดเดียว CSS/JSX ใช้ร่วมกัน เครื่องมือมาตรฐานไม่ถูกอ้างว่าตรวจ semantic correctness เองได้ทั้งหมด
- ประกาศ direct devDependencies ของ tools/parsers ที่ import โดยตรงและ lock version; browser checks ใช้ Playwright ในโปรเจกต์พร้อม setup instructions ไม่พึ่ง installation path ส่วนตัว
- runner มีหน้าที่รวมผลและเลือก scope; ยังไม่เพิ่ม token codegen, dependency graph engine หรือ caching ซับซ้อน วัดเวลา lint/build/render ก่อนเลือก optimization

### Initial mechanical rules

1. แยก lint ของ production JS/JSX และ maintained Node tooling; exclude generated output, browser profiles, recordings และทดลองที่ไม่อยู่ใน maintained scope
2. บังคับสามตระกูล rules สำหรับ v1: central-token usage ตาม contract ข้างต้น (รวม static JSX style), unapproved `!important`, และ scoped overrides ของ material internals ที่ล็อกแล้ว
3. Raw palette/material recipes อยู่ได้ใน canonical source ที่ระบุ; illustrations, shader code และ product-identity assets ไม่ถูกครอบด้วย blanket prohibition
4. ใช้ CSS parser หรือเครื่องมือที่เข้าใจ syntax สำหรับ checks ที่เกี่ยวกับ declarations/selectors; ไม่ใช้ regex แบบนับคำเป็นหลักฐานว่าบังคับ ownership ครบแล้ว
5. ทุก blocking rule ต้องมี known-bad fixture ที่ทำให้ fail และ valid exception ที่ผ่าน ถ้ายังตรวจอย่างน่าเชื่อถือไม่ได้ ให้ระบุเป็น render/review rule

### Render review

ใช้ local rendering tooling ที่ได้รับอนุญาตตามข้อกำหนดของ session ไม่ควบคุม Chrome โดยพลการ ตรวจหน้าจริงกับ environment จริงที่เกี่ยวข้อง ไม่ใช้ prototype แทน integration

เริ่ม desktop และ mobile สำหรับ layout ที่เปลี่ยน เพิ่ม keyboard/reduced motion/fallback เมื่อ behavior นั้นได้รับผลกระทบ ใช้ viewport ที่มีใน QA plan เดิมตามความเหมาะสม ไม่สร้าง matrix ใหม่ที่ต้องรันทุกงาน

AI ต้องเปิดดูภาพที่อ้างว่าตรวจแล้ว เทียบ reference และตรวจ content/interaction ตามโจทย์ ภาพต่างกันไม่เท่ากับผิด และภาพเหมือนกันไม่พิสูจน์ว่า interaction ถูก ห้ามใช้ AI aesthetic score หรือ pixel delta เป็นคะแนนผ่านรวม

Reference metadata เก็บใน pilot report เดียว: source revision/content hash (รวม dirty state), acceptance status, route/state, viewport และ browser/environment ใช้ font/media/loader ready signals และ pointer/scroll/media state คงที่เมื่อเทียบภาพนิ่ง แยก motion behavior checks ไม่แก้ production ให้หยุดเคลื่อนไหวเพื่อทำภาพผ่าน และไม่ update golden อัตโนมัติ ก่อนมี owner acceptance ให้เรียกภาพเดิมว่า regression reference ไม่ใช่ approved design

## 6. แผนดำเนินงานตามลำดับ

### ขั้น 1 — ล็อก pilot/current decisions และเก็บ before-state

- อ่าน PRODUCT, DESIGN-DISCOVERY, selected material, cover spec, project briefs และโค้ดที่เกี่ยวข้อง
- สร้างตาราง current/superseded/open ภายใน draft DESIGN.md พร้อม source; เก็บคำผู้ใช้เดิมเมื่อมี verbatim จริง ไม่แต่งคำอ้าง
- ระบุว่าค่าใดตรวจจาก source แล้ว ค่าใดยังต้องวัดใน render ไม่สร้างตัวเลข design ใหม่
- เลือก simple existing caption/media slice เป็นโจทย์หลัก; glass integration เป็น regression sentinel ไม่เปิด redesign optics หรือ direction ที่ล็อกแล้ว
- ล็อก supported syntax, runtime exceptions, consumers และ reference states; จับ task-start source snapshot/hash และ before-render/computed values ก่อนแก้ application code
- **จบเมื่อ:** มี pre-edit evidence และ pilot scope ที่ทำซ้ำได้ ทุกกฎมี source; unresolved direction แยกเป็น gap ไม่เดาเป็นกฎ

### ขั้น 2 — ทำ feedback loop ขั้นต่ำและเก็บ debt baseline

- แก้ lint scope และตั้ง ESLint/Stylelint กับ local rules เฉพาะที่จำเป็น พิสูจน์ raw-color/raw-spacing error → semantic token correction → pass ด้วย fixtures ก่อนเพิ่ม runner logic
- ใช้ rules ที่ตั้งแล้วตรวจ pre-edit source snapshot เพื่อเก็บ persisted debt baseline; ถ้ายังไม่มี production migration ให้ cross-check กับ checkout ปัจจุบัน ห้ามรับหนี้จากการแก้ในขั้นถัดไป
- **จบเมื่อ:** minimal feedback loop ส่ง diagnostic ที่แก้ตามได้จริง และมี baseline จาก source ก่อน migration

### ขั้น 3 — เขียนกฎและ migrate central tokens โดยรักษา cascade

- เขียน DESIGN.md ตามข้อ 4 และ design block ใน AGENTS.md; ชี้เฉพาะ section/reference/reuse paths ที่เกี่ยวข้อง ไม่ให้ agent อ่านทุกประวัติทุกงาน
- สกัด palette/semantic roles และ spacing/typography/shape ที่ pilot ใช้สู่ tokens.css; เชื่อม global import และ migrate consumers ใน scope โดยรักษาหน้าตาเดิม
- รักษา semantic scopes, alias resolution และ import precedence ตรวจ before/after computed values/render ทั้ง pilot และ non-pilot consumer พร้อม usage examples ของ text/surface pairs
- ประกาศ pilot ที่ migrate เสร็จเป็น strict scope; ตรวจว่า governed literals ที่ยังอยู่ใน baseline ถูกจับเป็น error ใน scope นี้จริง
- **จบเมื่อ:** pilot ใช้ค่ากลางจริง เปลี่ยน token ใน fixture แล้ว consumers เปลี่ยนตาม; ไม่ทิ้งค่าสีทดลองไว้ใน production และไม่เกิด project override drift

### ขั้น 4 — reuse โดยรักษา behavior และทำ runner final path

- reuse components เดิมก่อน extract เมื่อมี repeated use จริง ตรวจ DOM markers, direct-child media discovery, refs/events และ state transition หลังเปลี่ยน; ไม่บังคับสร้าง component ใหม่
- เติม runner fast/final modes, explicit route mapping และ baseline comparison โดยใช้ baseline จากขั้น 2; ไม่ blanket ignore React rules หรือรับ regression เป็นหนี้เดิม
- เพิ่ม fixtures และทดสอบ failure exit; บันทึกเวลาแต่ละ check เพื่อรู้ว่าตัวใดไม่คุ้ม
- Fixtures ต้องมี raw color, raw spacing, local-variable bypass, raw fallback, undefined/wrong-family token, static JSX bypass, valid recipe exception และ allowed runtime geometry; ทดสอบ error → แก้ด้วย semantic token → ผ่าน ให้ครบหนึ่ง feedback loop
- เพิ่ม baseline fixtures สำหรับ duplicate/moved/renamed/deleted violations และ unsupported dynamic syntax; final build/render ตรวจ consumer จริงพร้อม glass sentinel
- เพิ่ม fixtures: ลบ/เปลี่ยน family ของ token แล้ว unchanged consumer นอก requested files ต้อง fail; baseline literal ใน strict migrated scope ต้อง fail แต่ legacy นอก scope ยังรายงานเป็น debt
- เพิ่ม temporal fixture: initial debt → fixed + final success → prune → reintroduce ต้อง fail; partial scope ห้ามล้าง debt อื่นและ stale final evidence ห้ามใช้ prune
- **จบเมื่อ:** reuse ไม่เปลี่ยน behavior, คำสั่งเดียวตรวจ scope ได้, fast mode ไม่ build และ final mode ไม่อ้าง visual acceptance จาก lint ผ่านเพียงอย่างเดียว

### ขั้น 5 — พิสูจน์ผลด้วย pilot

- ใช้ `design-ab-loop` เมื่อ execute ขั้นนี้ โดยเตรียมโจทย์ bounded เดียวกัน, assets/reference/environment เดียวกัน
- ชุดหนึ่งได้รับกฎใหม่ อีกชุดได้รับ context ปกติที่จำเป็นแต่ไม่มีกฎใหม่ ไม่ทำให้ control เสียเปรียบด้วยการตัด capability facts หรือ media
- ตรึง code/components/tokens/model/settings/assets/tools และ time budget เหมือนกัน เปลี่ยนเฉพาะการให้กฎใหม่ หากเปลี่ยนทั้ง harness ต้องตั้งคำถามและรายงานว่าทดสอบชุด intervention ไม่ใช่ผลของ rules file เดี่ยว ๆ
- เป้าหมายเริ่มต้นสอง independent runs ต่อเงื่อนไขในพื้นที่แยกจาก production; ใช้ fresh reviewer ตาม skill ไม่ให้ผู้สร้างรับรองตัวเอง
- Blind review เปรียบเทียบ adherence, regressions, missing/invented content, corrective edits และเวลารวม ไม่อ้าง statistical reliability จากตัวอย่างเล็ก
- ใช้ reference state/readiness เดียวกันและประเมิน correctness ก่อน preference; ไม่รันรอบเพิ่มอัตโนมัติเพื่อไล่คะแนน
- ขอ judgment จากเจ้าของเป็นรอบเปรียบเทียบเดียว หากยังไม่มีคำตอบให้บันทึก pending ไม่เลือกแทนหรืออ้างว่า accepted
- จำแนกผลเป็น improved / regression / inconclusive: regression ที่ยืนยันต้องแก้; inconclusive รวมกรณีทุก run ผ่านพอ ๆ กัน ไม่ถือเป็น defect และไม่เปิด A/B รอบใหม่เอง ผล preference ที่ยังไม่มีคำตอบคงเป็น pending
- **จบเมื่อ:** บันทึกผลตามหลักฐานและ feedback ที่ได้รับทุกข้อถูกแก้หรือมีเหตุผลไม่เปลี่ยน; inconclusive จบรอบได้โดยไม่อ้างว่าคุณภาพดีขึ้น ส่วน owner acceptance ที่ pending ไม่ถูกนับว่าผ่าน

### ขั้น 6 — ตัดส่วนที่ไม่คุ้มและส่งมอบ v1

- ตัดกฎที่คลุมเครือ ซ้ำ เกิด false positives หรือทำให้ output บางลง; แก้ capability context ก่อนผ่อนข้อห้ามเรื่อง invent claims
- ถ้า checks ช้า ให้ลด scope/ซ้ำซ้อนจาก timing ที่วัดจริง ไม่ข้าม essential check เพื่อให้เร็ว
- รัน final scoped checks หลังแก้และให้ cold reader ทดลองใช้ entry point โดยไม่พึ่งบทสนทนานี้
- บันทึก pilot result, actual timing, known gaps และวิธีเรียกคำสั่งใน pilot report เดียว
- **จบเมื่อ:** ผ่านเกณฑ์รับงานข้อ 7 และ AI งานถัดไปเริ่มจาก entry point ได้เอง

ขั้นเหล่านี้เป็น dependency ไม่ใช่ approval gates รายขั้น เมื่อได้รับคำสั่ง implement ทั้งแผนให้ดำเนินต่อได้ภายใน scope โดยถามเฉพาะข้อมูล/คำตัดสินที่จำเป็นจริง

## 7. Definition of done

- [ ] Source snapshot และ persisted debt baseline อ้างถึง before-state จริง; migration ไม่เพิ่มหนี้เข้า baseline
- [ ] Registry/config changes ทำให้ตรวจ token references ทั่ว maintained UI รวม unchanged consumers
- [ ] Strict migrated scope และ new UI code ไม่ได้รับ token-debt exemption; legacy scope ยังแสดง debt ตามจริง
- [ ] หลัง final success retire หนี้ที่แก้แล้วด้วย prune แบบลดเท่านั้น; temporal fixture จับการนำข้อผิดพลาดเดิมกลับมาได้
- [ ] Pilot และ non-pilot consumer รักษา computed values/cascade และ behavior ที่เกี่ยวข้อง
- [ ] Unsupported dynamic styles ให้ diagnostic หรือ registered exception ที่ตรวจสอบได้ ไม่รายงานว่าครอบคลุมทั้ง runtime
- [ ] Reuse รักษา DOM/media/wave contracts; ไม่ถือว่าต้องสร้าง component/folder ใหม่จึงผ่าน
- [ ] Fast checks ไม่ build; final checks ระบุ consumer coverage และ render evidence แยกจาก mechanical pass
- [ ] Pilot references ตรึง readiness/state/environment และ A/B เปลี่ยนเฉพาะ intervention ที่ระบุ

- [ ] Central tokens ถูก import และ pilot consumers ใช้ร่วมกันจริง; ระบุ legacy scope ที่ยังไม่ migrate
- [ ] Governed CSS/static JSX values นอกส่วนกลางทำให้ error; local variables/fallback ไม่เป็นช่องเลี่ยง และ structural/runtime exceptions ไม่เกิด false positives ตาม fixtures
- [ ] มี reusable primitives/variants จาก use cases จริง และ AI หา reuse path ได้จาก DESIGN.md
- [ ] ผ่าน feedback loop ที่ใส่ค่าผิดแล้วแก้ด้วย token ถูกความหมาย โดยไม่ disable rule หรือขยาย baseline

- [ ] DESIGN.md มี current rules ที่มี provenance, scope, implementation lever และวิธีตรวจ ไม่มีตัวเลขที่อ้างว่า verified โดยยังไม่วัด
- [ ] Root AGENTS.md ชี้กฎและคำสั่งตรวจ โดยไม่มี daily checklist ใหม่ให้ผู้ใช้ทำ
- [ ] หนึ่งคำสั่งตรวจ maintained scope ได้และไม่เข้า generated/browser-profile files
- [ ] Blocking rules จับ known-bad fixtures และยอมรับ valid exceptions; baseline ไม่กลบ violation ใหม่
- [ ] Pilot เทียบงานจาก context เดียวกัน มี fresh review และแยก owner preference ที่ยัง pending
- [ ] กฎไม่ทำให้ real capability หายหรือทุกโปรเจกต์กลายเป็นหน้าตาเดียวกัน
- [ ] รายงานเวลาและข้อจำกัดตามจริง ไม่สัญญาว่าคุณภาพเสถียรทุกโจทย์จาก pilot เล็ก
- [ ] ไม่มี production redesign นอก pilot, framework migration หรือ deploy ที่ไม่ได้อยู่ใน scope

แยก technical acceptance, ผลต่อ output และ owner acceptance: ถ้าพบ regression จริงให้แก้และตรวจเฉพาะส่วนที่ได้รับผลกระทบ; ถ้า inconclusive แต่ technical checks ผ่าน ให้ส่งมอบเครื่องมือได้พร้อมสถานะ “ประโยชน์ต่อ output ยังไม่ยืนยัน” แล้วเก็บหลักฐานจากงานปกติถัดไป ไม่อ้าง improvement ไม่เปิด A/B เพิ่มอัตโนมัติ และไม่เปลี่ยน pending owner acceptance ให้เป็น accepted

## 8. การใช้งานหลังส่งมอบ

ผู้ใช้สั่งงาน → AI อ่านกฎส่วนที่เกี่ยวข้อง → reuse/แก้ใน scope → เรียก harness → ดูผล render เมื่อเกี่ยวข้อง → แก้ปัญหา → ส่งผลและข้อจำกัดสั้น ๆ

เพิ่มกฎภายหลังเมื่อพบความผิดพลาดซ้ำที่ควรป้องกัน กฎใหม่ต้องมีตัวอย่าง failure และวิธีตรวจชัดเจน ไม่เพิ่มกฎจากทุก preference ชั่วคราว ไม่ต้องจัด A/B ใหม่สำหรับการแก้ UI ตามปกติ

การเชื่อม CI เป็น follow-up หลัง v1 พิสูจน์ว่า checks ใช้ได้และไม่ช้า หากทำภายหลังให้ reuse คำสั่งเดิม ไม่สร้างเกณฑ์ชุดที่สอง

## Sources

- [Scrutinize review round 2 — v0.3 findings addressed in v0.4](AI-DESIGN-HARNESS-REVIEW-R2.md)
- [Scrutinize review v0.2 — findings addressed in v0.3](AI-DESIGN-HARNESS-REVIEW.md)
- [Current audit](2026-09-22-design-system-audit.md)
- [Foundation proposal](DESIGN-FOUNDATION-REVIEW.md)
- [Design discovery](DESIGN-DISCOVERY.md)
- [Product](../../PRODUCT.md)
- [Selected Keshi material](../../design/ab/keshi-liquid-glass-material-r1/SELECTED.md)
- [Existing QA matrix](implementation/phase-6-final-qa.md)
- Skill: `C:/Users/golfp/.codex/skills/design-rules-file/SKILL.md`
