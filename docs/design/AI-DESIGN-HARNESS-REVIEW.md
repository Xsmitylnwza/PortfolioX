# Scrutinize review — AI Design Harness v0.2

วันที่: 2026-09-22 · หนึ่งรอบ review · มุม UX Designer + Software Engineer

Target: [AI-DESIGN-HARNESS-PLAN.md](AI-DESIGN-HARNESS-PLAN.md), version 0.2

## Intent และทางที่เล็กกว่า

เป้าหมายคือให้ AI ส่งผลลัพธ์ตรงคำสั่งและ direction เดิมอย่างสม่ำเสมอ โดยใช้ค่ากลางและแก้ข้อผิดพลาดเองก่อนส่งงาน โดยไม่เพิ่มงานประจำให้ผู้ใช้

ปัญหามีจริง: tokens อยู่หลาย scope, CSS มี literals และ components มีทั้ง static styles กับ runtime rendering แต่ v0.2 กำลังรวม token governance, semantic checker, dependency discovery, baseline engine และ design experiment ไว้ในงานเดียว

ทางที่เล็กกว่า: เริ่มหนึ่ง production slice ด้วย token contract ที่ระบุขอบเขตครบ ใช้ ESLint เดิม + Stylelint และ local rules เฉพาะส่วนที่เครื่องมือมาตรฐานทำไม่ได้ ตัว runner มีหน้าที่ orchestrate/report เท่านั้น เก็บ before-state ก่อนแก้ ใช้ fast lint loop แล้ว build/render ตอนพร้อมส่ง จากนั้นทดลองว่า AI ทำตามกฎได้จริง ไม่สร้าง generic CSS/JS semantic engine หรือ automatic dependency graph ใน v1

การลด scope ต้องไม่ตัด central color/spacing หรือ reusable components ที่ผู้ใช้ต้องการ ให้จำกัดขอบเขต implementation และเครื่องมือแทน

## Finding 1 — P1 / Engineering: baseline อยู่หลังการแก้ production

**Finding:** ย้ายการเก็บ baseline ไปก่อนขั้น migrate tokens/components

**Evidence:** แผนบรรทัด 177–183 แก้ production ในขั้น 3 แล้วขั้น 4 บรรทัด 185–190 จึงเก็บ lint baseline แม้เขียนให้แยกหนี้เดิม แต่ไม่มี snapshot ที่ runner ใช้เปรียบเทียบอย่างชัดเจน Checkout ปัจจุบันมี tracked modifications และ untracked sources อยู่ก่อนแล้ว; `--files` บรรทัด 124 บอกเพียงรายชื่อไฟล์ ไม่บอกความต่างก่อน/หลังงานในไฟล์เดียวกัน

**Why:** raw value หรือ bug ที่สร้างระหว่าง migration อาจถูกจัดเป็น existing debt ทำให้ feedback loop ให้ผลผ่านผิด ๆ หรือ agent ถูกบังคับแก้หนี้ที่ไม่ใช่งานตัวเอง

**Change:** ตั้ง lint scope → capture pre-edit source snapshot/hash และ diagnostics ใน maintained scope → จึง migrate แยกสองสิ่งให้ชัด: task-start snapshot สำหรับ ownership และ persisted debt baseline สำหรับ ratchet; baseline setup/update เป็นคำสั่งแยก ไม่เกิดใน check ปกติ ใช้ fingerprint + occurrence count ไม่จับด้วย line number อย่างเดียว ทดสอบ added occurrence, moved line, renamed file และ deleted violation

## Finding 2 — P1 / UX + Engineering: ย้าย tokens กลางยังไม่มี cascade-preservation contract

**Finding:** กำหนดว่าจะรักษา selector scope, alias resolution และ CSS precedence อย่างไรก่อน token extraction

**Evidence:** `src/main.jsx:4` โหลด global CSS; `src/components/ProjectDetails.jsx:13` เป็นต้นไปโหลด shared และ project-specific CSS ตามลำดับ; `src/components/ProjectDetails.css:5` นิยาม `--case-*` ที่ `.case-section` แต่ `:1364` และ `:2192` override ที่ mux/zuch แผน `:45` ระบุ import tokens ครั้งเดียวและ `:102` เสนอ aliases โดยยังไม่ระบุ scope

**Why:** การรวม definitions ไว้ `:root` หรือประกาศ alias ที่ ancestor อาจเปลี่ยนจุด resolve ของ custom properties และทำให้ project override ไม่ส่งผลตามคาด การใช้ token ครบไม่ได้แปลว่าภาพเดิมยังเหมือนเดิม

**Change:** primitives ที่ root, semantic/theme definitions ที่ selector scope เดิมหรือ scope ใหม่ที่พิสูจน์แล้ว; นิยาม alias ใน scope ที่ต้องรับ override ไม่ assume ว่า inherited alias จะคำนวณใหม่ที่ลูก เก็บ computed values ของ pilot และหนึ่ง non-pilot consumer ก่อน/หลัง รวม font/spacing/color แล้วตรวจ render; ไม่แทรก cascade layers ระหว่าง migration นี้

## Finding 3 — P1 / Engineering: central-token checker สัญญาครอบคลุมมากกว่างาน static lint ทั่วไป

**Finding:** ล็อก syntax ที่ตรวจได้และ dynamic escape contract ก่อนเขียน rules

**Evidence:** แผน `:97–100` ต้องตรวจ local variables, fallbacks, token family, JSX และ runtime producers; `src/components/KeshiLiquidGlass.jsx:135` เป็นต้นไปเขียน CSS properties ผ่าน `style.setProperty`, `:205` ใช้ runtime filter URL; `src/components/ScrollPerspectiveWave.jsx:47` อ่าน computed CSS และ `:54` เขียน `style.cssText` ให้ capture clone Static JSX lint ไม่ได้ครอบคลุมเส้นทางเหล่านี้

**Why:** หากพยายามพิสูจน์ทุก dynamic expression จะกลายเป็น dataflow engine; หากไม่ตรวจแต่รายงานว่าครบจะเกิดช่องหลบกฎ ทั้งสองอย่างขัดเป้าหมายเบาและเชื่อถือได้

**Change:** v1 ตรวจ declarations, token definitions/aliases และ static JSX object ที่ resolve ภายในไฟล์ได้ด้วย syntax จำกัด; governed dynamic style ที่ไม่รู้ที่มาให้ diagnostic ว่า unsupported แล้วใช้ registered runtime producer ที่ระบุ file/property/reason หากข้ามเพราะเป็น engine clone ต้องแสดง coverage exclusion ไม่ claim token-safe ทั้งระบบ ตรวจ token graph เฉพาะ declared registry เพื่อหา unknown refs/cycles ไม่จำลอง CSS cascade ทั้ง browser

เครื่องมือ: Stylelint สำหรับ standard CSS rules; local plugin ใช้ parsed declarations/value parser สำหรับกฎ tokens; ESLint local rule และ RuleTester สำหรับ JSX; อย่าใช้ regex ว่า string มี `var(` แล้วถือว่าผ่าน และอย่าอ้างว่า Stylelint built-in ตรวจ semantic token dependency ได้เอง

## Finding 4 — P1 / UX + Engineering: reusable wrapper อาจเปลี่ยน behavior แม้ภาพ static ดูถูก

**Finding:** เพิ่ม DOM/behavior contract ในข้อกำหนด reusable component

**Evidence:** แผน `:106–110` เน้น variants และ styling ownership แต่ `src/components/ScrollPerspectiveWave.jsx:35` เลือก `[data-wave-follow] > img`, `> video`, `> picture > img`; `:382` ใช้ `closest('[data-wave-host]')` และ `:395` เป็นต้นไปอ่าน marker ของ surfaces/followers การครอบ media ด้วย div เพิ่มหนึ่งชั้นทำให้ direct-child selector เดิมไม่ match ได้

**Why:** component ใหม่อาจทำ wave/media integration หายหรือเปลี่ยน backdrop/stacking โดย lint/build ยังผ่าน และ screenshot ขณะนิ่งไม่แสดงปัญหา

**Change:** ก่อน extract ระบุ element semantics, DOM markers, refs/events, direct-child relationships และ ancestor constraints ที่ต้องรักษา เริ่มด้วย reuse `KeshiLiquidGlass` เดิมถ้าตรงหน้าที่; การได้ folder/component ใหม่ไม่ใช่เกณฑ์สำเร็จ ทดสอบ media discovery และ state transition ของ consumer จริงหลัง extraction ไม่ตรวจแค่ props/render ของ component เดี่ยว

## Finding 5 — P2 / UX: semantic token ถูกกลุ่มยังไม่รับประกัน readable hierarchy

**Finding:** เพิ่ม accepted usage examples และ foreground/background pairings เฉพาะ pilot

**Evidence:** แผน `:79–83` ควบคุม color/spacing/type families แต่ role กลุ่มเดียวกันอาจใช้ผิดหน้าที่ได้ เช่นใช้ muted text กับหลักฐานสำคัญ; `src/components/ProjectDetails.css:8` มี alpha text และ `src/components/KeshiLiquidGlass.css:37` ใช้ live backdrop ทำให้ contrast ขึ้นกับภาพด้านหลัง ไม่ใช่ค่า token เดี่ยว

**Why:** AI อาจแก้ lint ให้เขียวด้วย token ที่อ่านยากหรือ hierarchy ไม่ตรง intent โดยไม่มี raw value เหลือเลย

**Change:** เก็บตัวอย่างที่ยอมรับสำหรับ body/caption/action และ surface ที่ใช้คู่กัน ระบุ critical information ที่ห้ามลด prominence ไม่ auto-substitute token ที่เลขใกล้สุด ใช้ contrast checks บน solid pairs ที่วัดได้; glass ตรวจ composite จริงใน state ที่เกี่ยวข้องและบันทึก coverage ไม่ต้องสร้าง full-site accessibility matrix รอบนี้

## Finding 6 — P2 / Engineering: feedback loop ไม่มี fast path และขอบเขตผลกระทบยังคลุมเครือ

**Finding:** แยก fast lint iteration จาก final build/render ภายใน entry point เดียว

**Evidence:** แผน `:112` ให้ rerun checks หลังแก้ แต่ `:135` ผูก UI edit กับ build และ `:124` สัญญาว่าหา dependency/route ที่กระทบ โดยไม่กำหนด implementation; shared CSS และ variables ถูกอ้างด้วย selectors/strings ไม่ใช่ JS import graph อย่างเดียว

**Why:** AI อาจ build ทุกครั้งที่แก้หนึ่ง literal หรือดูเพียง route เจ้าของไฟล์แล้วพลาด shared consumers

**Change:** ใช้ fast mode สำหรับ scoped lint/token checks; final mode รัน build ครั้งหนึ่งและให้ route evidence list (ไม่ rerun build เมื่อมีเพียงการอ่านข้อความผลตรวจ) ใช้ maintained mapping ขนาดเล็กสำหรับ pilot, shared tokens และ shared material; unknown UI scope ต้องแสดง needs-scope หรือเลือก representative full smoke ที่กำหนดไว้ ห้ามเงียบแล้วผ่าน ไม่สร้าง dependency inference engine ใน v1

บันทึก elapsed time แยก lint/build/render; ใช้ cache เฉพาะเมื่อ invalidate จาก config/token registry/baseline และ source ที่เกี่ยวข้องได้จริง ไม่เพิ่ม caching แบบเสี่ยง stale ตั้งแต่เริ่ม

## Finding 7 — P2 / UX + Evaluation: glass pilot หนักเกินไปสำหรับพิสูจน์ทุกอย่างพร้อมกัน

**Finding:** แยก token/reuse proof จาก optical integration และล็อกตัวแปร A/B ให้ชัด

**Evidence:** แผน `:179` เลือก Keshi section และ `:195–199` เปรียบเทียบ with/without rules; selected recipe ระบุ horizontal-only limitations ที่ `design/ab/keshi-liquid-glass-material-r1/SELECTED.md:23` ส่วน actual component มีทั้ง SVG optics และ pointer smoothing หากสร้าง tokens/components ใหม่พร้อมทดลอง ผลดีขึ้นอาจเกิดจาก API ใหม่ ไม่ใช่กฎ

**Why:** pilot อาจกลายเป็นการแก้ glass rendering อีกครั้งและไม่ตอบว่า harness ช่วยทำตามคำสั่งหรือไม่

**Change:** ใช้ simple existing caption/media slice เป็นโจทย์หลัก และใช้ glass integration เป็น regression sentinel ไม่ redesign optics; ทั้งสอง condition ใช้ code/components/tokens/model/settings/assets/time budget เดียวกัน ต่างเฉพาะ intervention ที่ประกาศ หากทดสอบ rules ให้ทั้งคู่มีเครื่องมือเหมือนกัน; หากทดสอบ harness ทั้งชุด ต้องระบุว่าผลมาจากชุด intervention ไม่ใช่ rules file อย่างเดียว

ใช้สอง independent runs ต่อเงื่อนไขตามแผนเป็น directional evidence เท่านั้น; fresh reviewer ประเมิน instruction violations, actual regressions, content loss และ corrective edits ก่อน owner preference ไม่รันรอบเพิ่มอัตโนมัติเพื่อไล่คะแนน และไม่เปิด art-direction decision ที่ล็อกแล้วใหม่

## Finding 8 — P2 / UX + Engineering: reference และ rendering environment ยังไม่ถูกตรึง

**Finding:** กำหนด reference metadata และ ready conditions สำหรับการเปรียบเทียบ

**Evidence:** แผน `:153–159` กำหนดให้ดู render แต่ยังไม่ระบุ font/media readiness, pointer/scroll state หรือ browser version; `src/index.css:1` โหลด Google Fonts; `src/components/KeshiLiquidGlass.jsx:135` เปลี่ยน reflection ตาม pointer และ `src/components/ScrollPerspectiveWave.jsx:1` เป็นต้นไปมี animated media handling เอกสาร Playwright snapshots ระบุว่าภาพขึ้นกับ environment และควรใช้ environment เดียวกับ baseline

**Why:** diff อาจมาจากฟอนต์ยังไม่โหลด เฟรม video หรือ pointer ตำแหน่งต่างกัน แล้ว AI แก้ design ที่เดิมถูกอยู่ให้ตรงภาพที่ไม่นิ่ง

**Change:** reference หนึ่งรายการเก็บ source revision/content hash, acceptance status, route/state, viewport, browser และข้อจำกัด; ใช้ ready signals ของ font/media/loader และ fixed pointer/scroll/media state เมื่อตรวจภาพนิ่ง แยก motion behavior checks; ห้าม freeze production code เพื่อทำ snapshot ผ่าน และห้าม update golden จาก output ใหม่โดยอัตโนมัติ หากยังไม่มี golden ที่ owner accepted ให้เรียก before-state ว่า regression reference ไม่ใช่ approved design

## เครื่องมือที่แนะนำและข้อจำกัด

| เครื่องมือ/เทคนิค | ใช้กับ | ข้อจำกัดและลำดับ |
| --- | --- | --- |
| ESLint เดิม + local rule + RuleTester | static JSX, diagnostics และ negative fixtures | ทำก่อน ไม่เขียน JS parser ใหม่; dynamic paths ต้องมี explicit contract |
| Stylelint + local token plugin | CSS AST checks, `!important`, token rules | เพิ่มเป็น dev dependency ที่ระบุ version; built-in allowed-list ไม่ใช่ semantic resolver |
| PostCSS/value parser | parse declarations/expressions ใน plugin เมื่อจำเป็น | repo lockfile มี PostCSS transitive อยู่ แต่ถ้า import โดยตรงต้องประกาศ direct dependency; ไม่พึ่ง dependency ของ Vite โดยบังเอิญ |
| Node test runner | runner/baseline/fixture tests | เพียงพอสำหรับ bounded checks ไม่ต้องเพิ่ม testing framework ทั้งชุด |
| Playwright แบบ project-local | production route smoke, computed-value probes และ screenshots | package.json ยังไม่ประกาศ Playwright; ต้องจัด dependency/browser setup ให้ reproducible ก่อนอ้าง runnable harness ไม่ใช้ installation path ส่วนตัว |
| State-matched before/after + fresh reviewer | hierarchy/material/behavior fidelity | ช่วยตรวจสิ่งที่ lint ไม่รู้ ไม่ใช้ pixel delta หรือ AI score เป็นผู้ตัดสิน art direction |

ยังไม่ควรเพิ่ม Style Dictionary/token code generation, Storybook, full dependency graph, full browser matrix หรือ AI-judge service เพราะแอปนี้ยังมี consumer หลักเป็น CSS/React และเครื่องมือเหล่านี้ยังไม่แก้ช่องโหว่ที่จำเป็นก่อน

ตรวจเอกสาร official ผ่าน curl วันที่ 2026-09-22:

- [Stylelint declaration-property-value-allowed-list](https://stylelint.io/user-guide/rules/declaration-property-value-allowed-list/): regular expression จับทั้ง declaration value จึงต้องระวัง shorthand/expressions; ไม่ใช่ตัวตรวจ token graph
- [ESLint Custom Rules](https://eslint.org/docs/latest/extend/custom-rules): AST visitors และ RuleTester รองรับ local rules/fixtures
- [Playwright Visual comparisons](https://playwright.dev/docs/test-snapshots): screenshot consistency ต้องควบคุม environment

ไม่ได้ทดลองติดตั้งหรือ benchmark เครื่องมือในรอบ review นี้ คำแนะนำ tooling ไม่ใช่ผล compatibility test กับ repo

## ลำดับที่ควรแก้ในแผน

1. **ก่อนแตะ UI:** ล็อก pilot scope, accepted/current references, supported syntax และ dynamic exceptions; จับ task-start baseline
2. **สร้าง feedback loop ที่เล็กที่สุด:** แก้ lint scope แล้วพิสูจน์หนึ่ง raw-color และหนึ่ง raw-spacing failure ด้วย tools มาตรฐาน ก่อนลงทุน classifier/baseline เพิ่ม
3. **เขียนกฎและ central tokens:** คง semantic roles และ cascade scopes; migrate pilot โดยมี before/after values และ render
4. **reuse โดยรักษา behavior:** ใช้ component เดิมก่อน extract เพิ่ม ตรวจ DOM markers/media/wave contracts
5. **ทำ runner final path:** เติม baseline comparison และ route mapping แบบ explicit, build/render ตามผลกระทบ, reliable diagnostics
6. **ทดสอบผลต่อ AI:** controlled paired tasks ตาม finding 7 และบันทึกเวลา/จำนวน correction; แก้เฉพาะกฎที่หลักฐานบอกว่าจำเป็น

Priority ใช้ consequence + likelihood จาก code path + confidence ว่าตรวจได้จริง + cost of execution ไม่ใช้คะแนนรวมที่ทำให้ false pass ถูกชดเชยด้วยความสวย:

- **ต้องแก้ก่อน implement:** Findings 1–4 เพราะอาจให้ผลผ่านผิด หรือเปลี่ยน behavior ระหว่างตั้งระบบ
- **ทำใน pilot เดียวกัน:** Findings 5–8 เพราะเกี่ยวกับ readability, ความเร็วและความน่าเชื่อถือของผลเปรียบเทียบ
- **ไว้ภายหลัง:** CI integration, wider migration, multi-browser expansion และ optimization ที่ยังไม่มี timing evidence

## Coverage และ verdict

อ่านแผน v0.2, package/lint config, entry point/import order, case tokens/project overrides, glass producer/consumer, wave DOM selectors/runtime cloning และ selected recipe ตรวจ official tooling docs ไม่มี production code changes, ไม่มี browser render และไม่ได้รัน tests ของ harness เพราะ implementation ยังไม่มี ข้อค้นพบเป็น plan gaps ที่มี source evidence ไม่ใช่คำยืนยันว่า UI ปัจจุบันเสียจากแผนนี้

**Verdict: fix-then-ship — ปรับแผนก่อน implement เพราะตอนนี้ยังมีช่องให้ harness รายงานผ่านทั้งที่เปลี่ยน cascade/behavior และมีขอบเขต checker ใหญ่เกินเป้าหมาย lightweight.**
