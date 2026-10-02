# Keshi Pomodoro cover v4 — brief

สถานะ: **LOCKED จาก grilling กับเจ้าของ 2 Oct 2026** · แทนที่ `public/assets/project-covers/keshi-pomodoro-cover-v3.webp`
ข้อกำหนดร่วม: [project banner playbook](project-banner-playbook.md) · DESIGN.md A13, A17, A18, A20 · [cover spec](2026-09-05-project-cover-spec.md)
ต้นแบบ pipeline: `design/project-covers/veluma-v4/`

## 1. ทำไม v3 ดู slop

| อาการใน v3 | กฎสำหรับ v4 |
| --- | --- |
| 4 ข้อความแย่งกัน ("A little time, just for focus." / "FOCUS / RELAX Find your rhythm." / "FOCUS · CREATE · BREATHE" / "THE ORIGINAL HANDMADE TIMER") | หนึ่งปก หนึ่งประโยค |
| เทป 2 ชิ้น, ป้ายดำเอียง, กรอบครีมหนา | ไม่เอียง ไม่ติดเทป ไม่มีกรอบหนา — scrapbook อยู่ในแอปเท่านั้น |
| Screenshot 1536px ความละเอียดต่ำ | Capture จาก renderer จริงที่ deviceScaleFactor 2 |
| Focus หน้าเดียว ดูเป็นแค่ธีม | เห็นจังหวะ Focus ↔ Relax ซึ่งเป็นแก่นของแอป |
| พื้นครีมเรียบ ไม่ต่อกับในหน้าต่าง | Gradient ดึงสีจากในแอป + grain |

## 2. การตัดสินใจของเจ้าของ

| # | เรื่อง | คำตอบ |
| --- | --- | --- |
| 1 | 3 วินาทีแรก | Pomodoro แบบโฟกัส/พัก ที่มีความเป็น artist — **ไม่แสดง Discipline** บนปก (อยู่ในวิดีโอ gallery แล้ว) |
| 2 | แนวคิดภาพ | หน้า **Focus (แดง)** กับ **Relax (เขียว)** layout เดียวกัน วางทับกันพอดี แล้ว **ผ่าแนวตั้งกลางหน้าต่าง** ซ้าย = Focus, ขวา = Relax → เกิด "FOLAX", timer "25:00" ผ่ากลาง, ปุ่ม START ครึ่งแดงครึ่งเขียว, quote สองประโยคชนกัน, ticker แดงต่อเขียว (อ้างอิงม็อกของเจ้าของ: `design/project-covers/keshi-v4/reference-owner-split.png`) |
| 3 | รอยต่อ | **ขอบกระดาษฉีกแบบเบา** — ฝั่งเขียววางทับฝั่งแดง ฟันเลื่อยตื้นไม่สม่ำเสมอ ~6–10px @1600 ยืมรูปทรงจากขอบล่าง polaroid "FOR YOU" ในแอป เงาบาง (opacity ~0.25, blur 6–8px) **ห้าม contrast แรง**: ไม่มีขอบกระดาษขาว ไม่มีเส้นเรือง ไม่ใช่ crossfade |
| 4 | สถานะ UI | **ก่อนกด START**: Focus 25:00 / Relax 05:00 (ผ่าแล้วอ่าน "25:00") progress ว่าง · radio อยู่สถานะ playing **ถ้า**แอปมีสถานะที่เห็นได้จริง ไม่งั้นใช้ idle |
| 5 | Wordmark | ไอคอนจริง `pomodoro-keshi/desktop/assets/keshi-icon.svg` ~64px + "Keshi Pomodoro" Space Grotesk bold ซ้ายบน |
| 6 | ประโยคเดียว | *A lo-fi focus timer for the rhythm of work and rest.* — Space Grotesk regular, `#f2efe9`, ชิดขวาบน · ไม่มีแถบ works-with |
| 7 | พื้น + ออร่า | Gradient มืดซ้าย→ขวา: ดำอมแดง (~`#1a0f10`) → เขียวป่าเข้ม (~`#0f2a20`) + grain · ออร่ารอบหน้าต่าง ซ้ายแดง `#b91c1c` ขวาเขียว `#34d399` **opacity ~0.35** (อ่อนกว่า Veluma 0.55) |
| 8 | กรอบหน้าต่าง | หน้าต่างเดียว ~90% กว้าง ไม่เอียง ล้นขอบล่างได้ ใช้ window chrome จริงของ Keshi desktop (Electron, controls blended มุมขวาบน) |
| 9 | ข้อมูลในแอป | **ข้อยกเว้นที่เจ้าของอนุมัติ:** account แสดงชื่อจริงของเจ้าของ (มีใน CV สาธารณะอยู่แล้ว) · chip NEXT ใช้ task ที่ไม่เปิดเผยงานส่วนตัว · "DEV GABRIEL" brand mark คงไว้ตามแอป |

ความเสี่ยงที่เจ้าของรับทราบ: ภาพใน polaroid เป็นภาพศิลปินจริง (แนวทางเดียวกับ Veluma) ใบหน้าไม่ใช่จุดเด่น
Provenance: ปกเป็น composite ของสองหน้าจริง (Focus + Relax) จาก renderer เดียวกัน ไม่มี UI ที่วาดขึ้นเอง

## 3. Pipeline (`design/project-covers/keshi-v4/`)

1. `capture.cjs` — รัน pomodoro-keshi local (`seed:local`) จับ Focus และ Relax ที่ viewport เดียวกัน, 2x, สถานะตามข้อ 4 → `focus.png`, `relax.png`
2. `index.html` — พื้น, wordmark, ประโยค, ออร่า, หน้าต่างที่ประกอบ focus/relax ด้วย mask ขอบฉีก
3. `render.cjs` — 1600×1000 PNG, WebP q88, thumbnail 240/120, `TAG=`
4. ส่งเจ้าของดูทุกรอบเป็นชื่อใหม่ (`v4`, `v4b`…) ห้ามเขียนทับ

## 4. เกณฑ์ผ่าน

- ปกที่ 1600 / 240 / 120px ในห้อง gallery จริง และ case hero `/project/keshi-pomodoro` (1440, 390)
- ทดสอบ 5 วินาที: "แอปนี้คืออะไร?" → "ตัวจับเวลา Pomodoro โฟกัส/พัก"
- รอยฉีกมองเห็นได้แต่ไม่แย่งความสนใจจาก "FOLAX" / timer
- Anti-slop ตาม playbook §4: ไม่เอียง ไม่เทป ประโยคเดียว ทุกข้อความอ่านได้ที่ 100%
- ไม่ upscale ด้วย AI

## 6. รอบแก้ไข

| รอบ | คำของเจ้าของ / การตัดสินใจ |
| --- | --- |
| v4 → v4b | ภาพรวม "ok" แต่ไอคอนนาฬิกา "ดูการ์ตูน เฉิ่มไป" → **ข้อยกเว้นที่เจ้าของอนุมัติ:** เลิกใช้ `keshi-icon.svg` บนปก เปลี่ยนเป็น mark abstract **split square** — สี่เหลี่ยมมุมโค้งเล็กน้อย ซ้ายแดง `#b91c1c` ขวาเขียว `#34d399` รอยต่อเป็นขอบฉีกแบบเดียวกับในหน้าต่าง (คือ concept ของปกย่อเหลือ mark เดียว) · ไอคอนของแอปจริงยังไม่เปลี่ยน · รอยฉีกในหน้าต่าง ±4 → ~±8px · ออร่าแดง/เขียวให้น้ำหนักเท่ากัน · "SESSIBREAK TIME" คงไว้ |
| v4b → v4c | เจ้าของอยากได้ logo "หรู แพง เหมือน Veluma" โทนแดงดำ → Codex gen 8 แบบด้วย gpt-image-2 (`design/project-covers/keshi-v4/logo-options/`, prompts ใน PROMPTS.md) → เจ้าของเลือก **01 Folded half-cycle** (ริบบิ้นแดงแล็กเกอร์พับครึ่งวง) แทน split square · ภาพ gen มีพื้นดำทึบ ต้องตัดพื้นเป็น alpha ก่อนใช้ · mark ~64px ข้าง wordmark เท่านั้น (ไม่ใช่พระเอก ตาม playbook §4) · **ข้อยกเว้นที่เจ้าของอนุมัติ:** mark เป็นภาพ AI-generated (ไม่ใช่ไอคอนของแอปจริง) |
