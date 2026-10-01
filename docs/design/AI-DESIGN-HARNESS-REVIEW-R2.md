# Scrutinize round 2 — AI Design Harness v0.3

วันที่: 2026-09-22 · Target: [plan v0.3](AI-DESIGN-HARNESS-PLAN.md) · UX Designer + Software Engineer

## Intent และ simpler alternative

เป้าหมายยังเป็น output ที่ตรงคำสั่งและใช้ design system อย่างสม่ำเสมอ โดย AI รับ feedback แล้วแก้เองก่อนส่งงาน

v0.3 แก้ลำดับ baseline, cascade/DOM contracts, fast/final modes และขอบเขต tooling จากรอบแรกแล้ว ไม่ควรเพิ่มเครื่องมือหรือขั้นตอนใหม่ในรอบนี้ ทางที่เล็กที่สุดคือเติม semantics ของ scope และ baseline ใน runner เดิม และแยกผล pilot ที่ inconclusive ออกจาก failure ให้ชัด

ตรวจด้วย source tracing และ counterexamples ต่อ contract; harness ยังไม่มี implementation (`scripts/design-check.mjs` ไม่พบ และ package.json ยังมีเพียง dev/build/lint/preview) ข้อค้นพบด้านล่างเป็น defects ของข้อกำหนด ไม่ใช่ผลทดสอบ harness ที่รันแล้ว

## R2-1 — P1: เปลี่ยน token registry ยังไม่รับประกันว่าจะตรวจ references ของ consumers ทั้งหมด

**Finding:** เพิ่ม mandatory scope expansion เมื่อ tokens หรือ check configuration เปลี่ยน โดยแยก mechanical coverage จาก representative visual coverage

**Evidence:** Plan `:131` ตรวจ target files และ consumers ตาม maintained mapping; `:145` ใช้ mapping สำหรับ shared tokens; `:161` ตรวจ unknown refs/cycles เฉพาะ declared registry แต่ยังไม่ได้บังคับ scan unchanged consumer references ทั้ง maintained scope เมื่อ registry เปลี่ยน ตัวอย่าง consumer จริงคือ `src/components/ProjectDetails.css:25` ใช้ `--case-ink` และ `src/index.css:45` ใช้ `--font-body`

**Counterexample:** ลบ/rename semantic token ใน `tokens.css` → token graph ที่เหลือไม่มี unknown ref → consumer ที่ไม่อยู่ใน representative mapping ยังอ้างชื่อเก่า → Vite สามารถ build CSS custom-property reference ที่ resolve ไม่ได้ → rendered property ใช้ fallback/inheritance/default แม้ source ของ consumer ไม่ได้เปลี่ยน

**Why:** การรวมค่ากลางขยายผลกระทบของการเปลี่ยนหนึ่งบรรทัด แต่ scoped lint อาจไม่เห็นตำแหน่งที่เสีย

**Change:** เปลี่ยน registry หรือ family/rule config ให้รัน token-reference checks ทั่ว maintained UI scope ทั้ง CSS/static JSX เสมอ ไม่ต้อง build dependency graph; render ยังเลือก representative consumers ได้ หาก checks/rule versions เปลี่ยนต้องเทียบ pre-edit source ด้วย rules เดียวกันและแสดง coverage change ไม่ตีความ diagnostic ใหม่ทั้งหมดเป็น regression ของ UI

**Acceptance case:** consumer ไม่อยู่ใน requested files ใช้ token ที่ถูกลบ ต้อง fail; เปลี่ยน role family ของ token ต้องทำให้ consumer ที่ใช้ผิด family fail แม้ consumer ไม่ถูกแก้

## R2-2 — P1: baseline exemption ทำให้ pilot ที่ยังมีค่าดิบถูกส่งมอบเป็น migrated ได้

**Finding:** ระบุ strict migrated scope ที่ห้ามใช้ debt baseline ยกเว้นกฎ tokens

**Evidence:** Plan `:104` อนุญาต baseline กับ legacy; `:150` ให้ mechanical exit 0 เมื่อผ่านตาม baseline ขณะที่ DoD `:246–247` ต้องการให้ pilot ใช้ค่ากลางและ governed literals เกิด error ยังไม่มีเครื่องหมายว่า selector/component/property ใดเลิกเป็น legacy แล้ว ตัวอย่าง literals จริงใน pilot candidate: `src/components/KeshiLiquidGlass.css:31` radius และ `:32` color; `src/components/ProjectDetails.css:22` padding

**Counterexample:** เก็บ literals ทั้ง section ใน baseline → migrate เฉพาะบาง properties → literals ที่เหลือยัง match baseline → check ผ่าน แต่ section ที่เรียกว่า migrated ยังไม่ตอบสนองต่อ central tokens ครบ

**Why:** “ไม่มี violation ใหม่” กับ “ส่วนที่ migrate ใช้ระบบกลางครบ” เป็นคนละเงื่อนไข หากไม่แยก AI สามารถจบงานก่อน requirement สำเร็จโดยไม่ต้องหลบ lint เลย

**Change:** เพิ่ม strict migrated entries ใน config เดิม โดยระบุ component/selector และ governed properties ที่รองรับ ไม่ใช้ whole-file flag ถ้าไฟล์รวมหลายโปรเจกต์; strict entries และ new UI code ห้ามรับ token-debt exemption ส่วน legacy ที่เหลือใช้ ratchet ต่อ อนุญาตเฉพาะ registered material/runtime exceptions ที่มีเหตุผลอยู่แล้ว

**Acceptance case:** literal ที่มี fingerprint ใน baseline แต่ย้าย scope นั้นเป็น migrated ต้อง fail จนแก้เป็น token; legacy นอก migrated scope ยังแสดง debt และไม่บังคับรื้อทั้งไฟล์

## R2-3 — P2: baseline ไม่มีการ retire หนี้ที่ถูกแก้แล้ว จึงอาจยอมให้ regression เดิมกลับมา

**Finding:** กำหนด lifecycle การลด baseline และทดสอบหลายลำดับงาน ไม่ใช่ snapshot เดียว

**Evidence:** Plan `:153–154` มี pre-edit baseline, context fingerprint, occurrence count และ maintenance แยก แต่ไม่ได้ระบุว่ารายการที่หายไปต้องถูก retire เมื่อไร DoD `:254` ระบุไม่ให้ baseline กลบ violation ใหม่โดยไม่มี temporal test

**Counterexample:** baseline อนุญาต `padding: 16px` ที่ selector A → งานหนึ่งแก้เป็น token และผ่าน → baseline entry เดิมยังอยู่ → งานถัดไปใส่ `padding: 16px` กลับตำแหน่งเดิม → fingerprint/count ตรง baseline อีกครั้ง จึงอาจผ่านเป็นหนี้เดิม

**Why:** จำนวนหนี้ไม่ได้เพิ่มเมื่อเทียบวันตั้งระบบ แต่คุณภาพถอยหลังเมื่อเทียบงานล่าสุดที่รับแล้ว

**Change:** หลัง final checks สำเร็จให้มี maintenance prune ที่ลดรายการ/จำนวนได้เท่านั้น โดยใช้ observed findings ใน scope ที่ตรวจครบ ไม่ลบ entry ของไฟล์ที่ไม่ได้ตรวจ ห้ามเพิ่ม allowance ใน prune; check ปกติยัง read-only ตามแผนเดิม การ prune เป็นหน้าที่ AI ตอนส่งมอบ ไม่เพิ่มขั้นตอนให้ผู้ใช้ ถ้าการรันถูกยกเลิก/ล้มเหลวห้าม retire จาก partial result

**Acceptance case:** initial debt → fixed + final success → prune → same literal reintroduced ต้อง fail; partial scope ต้องไม่ล้าง debt ของ scope อื่น; duplicate counts ต้องลดอย่างถูกต้อง

## R2-4 — P2: ผล A/B ที่ไม่แยกความต่างทำให้แผนไม่มีทางจบที่ตรงหลักฐาน

**Finding:** แยก technical acceptance กับ evidence of improvement และกำหนด neutral/inconclusive outcome

**Evidence:** Plan `:221` ใช้เพียงสอง runs ต่อ condition, `:223` ห้ามรันเพิ่มอัตโนมัติเพื่อไล่คะแนน แต่ `:260` สั่งว่าถ้า pilot ไม่แสดงผลดีขึ้นให้ปรับกฎ/ทดสอบและไม่ประกาศ harness ผ่าน ส่วน `design-ab-loop/SKILL.md` ใน Rules ระบุว่า metrics อาจเป็นศูนย์ทั้งสองกลุ่มและห้าม invent a win

**Counterexample:** ทุก run ตรงคำสั่ง ไม่มี regression และเจ้าของมองว่าพอ ๆ กัน → checks จับ known-bad fixtures ได้ แต่ไม่มีหลักฐานว่ากฎเพิ่ม quality ในโจทย์นี้ → ประโยคท้ายแผนอาจบังคับให้แก้กฎที่ไม่มี defect หรือค้างงานไม่มีกำหนด

**Why:** UX ของเจ้าของกลับกลายเป็นต้องเปรียบเทียบซ้ำเพื่อให้โครงการจบ ทั้งที่เป้าหมายคือไม่เพิ่ม process และผลเท่ากันไม่ใช่หลักฐานว่ากฎเสีย

**Change:** ระบุสามผลลัพธ์: improved / regression / inconclusive โดยไม่สร้างคะแนนรวมเพิ่ม Regression ที่มีหลักฐานต้องแก้; inconclusive ให้ส่งมอบเครื่องมือที่ผ่าน technical checks พร้อมสถานะ “ประโยชน์ต่อ output ยังไม่ยืนยัน” และใช้กับงานจริงถัดไปเพื่อเก็บหลักฐานตามปกติ ไม่ประกาศคุณภาพดีขึ้นและไม่เปิด A/B รอบใหม่เอง Owner acceptance ที่ยัง pending ยังคง pending ไม่ตีความความเงียบเป็นการยอมรับ

**Acceptance case:** zero violations ทั้งสอง condition ต้องรายงาน inconclusive และหยุดรอบได้; fixture failure หรือ content loss จริงยังเป็น blocker ที่ต้องแก้

## สิ่งที่ตรวจแล้วไม่ยกเป็น defect ใหม่

- การเก็บ before-state ก่อน migration, cascade/DOM preservation และ fast/final separation ถูกเพิ่มในแผนจริงแล้ว; ยังต้องพิสูจน์ตอน implement แต่ไม่รายงานซ้ำว่าไม่มี
- สงสัยว่า control A/B อาจเห็น DESIGN.md ผ่าน AGENTS.md แต่ skill ที่แผนอ้างถึงระบุ isolated folders, stripping leaks และ diff conditions อยู่แล้ว จึงไม่ยกเป็น finding ซ้ำ เพียงต้องทำตาม skill ตอน execute
- การอ่านภาพจริงและแยก mechanical pass จาก visual acceptance มีอยู่แล้ว ไม่จำเป็นต้องสร้าง AI scoring service หรือเพิ่ม browser matrix
- ยังไม่มีหลักฐานว่าต้องเพิ่ม framework/dependency นอกชุดที่แผนเลือกไว้

## Minimal patch ที่แนะนำ

1. ขยาย token-reference checks ทั้ง maintained UI เมื่อ registry/config เปลี่ยน (ไม่ขยายทุก visual review)
2. เพิ่ม strict migrated scope ใน config เดิม
3. กำหนด prune แบบลด baseline เท่านั้นและเพิ่ม temporal fixture
4. แก้ acceptance ของ pilot ให้ inconclusive จบได้อย่างซื่อสัตย์

ทั้งสี่ข้อเป็นการปิดช่องในสิ่งที่มีแล้ว ไม่ต้องเพิ่มเอกสารประจำหรือ approval gate ให้เจ้าของ

**Verdict: fix-then-ship — ปิดความต่างระหว่าง “ผ่าน baseline” กับ “ใช้ design system ครบและไม่ถอยหลัง” ก่อนเริ่ม implementation.**
