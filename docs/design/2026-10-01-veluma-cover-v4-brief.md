# Veluma cover v4 + demo video — brief

สถานะ: **LOCKED จาก grilling กับเจ้าของ 1 Oct 2026** · แทนที่ `public/assets/project-covers/veluma-cover-v3.webp` และ GIF ชุดเดิมใน Project Details
ข้อกำหนดร่วม: DESIGN.md A13, A17, A18, A20 · [cover spec](2026-09-05-project-cover-spec.md) · บทเรียนจาก [ModeNote cover draft](2026-10-01-modenote-cover-v4-draft.md)

## 1. ทำไม v3 ดู slop

| อาการใน v3 | กฎสำหรับ v4 |
| --- | --- |
| 4 ประโยคแย่งกันพูด (`YOUR TOOLS. YOUR ATMOSPHERE.`, `A space that feels like you.`, `Come back to your Canvas.`, `Start when you choose.`) | หนึ่งปก หนึ่งประโยค |
| โลโก้ V 3D ขนาดใหญ่ + glow | ไอคอนจริงขนาดเล็กเป็นลายเซ็นเท่านั้น |
| วงกลมไอคอน + เส้นโค้งที่ไม่ได้เชื่อมอะไร | ไม่มีรูปทรงตกแต่ง ทุกอย่างเป็น UI จริง |
| Terminal ว่าง (`${workspaceRoot}`) | Pane มีงานจริงที่อ่านได้และเล่าเรื่องเดียวกัน |
| หน้าต่างเอียง + กรอบหนา | ไม่เอียง ไม่มีกรอบ — Canvas คือโปสเตอร์ |
| Serif condensed + grotesk + spaced caps | Geist (ฟอนต์ landing ของ Veluma) อย่างเดียว |

## 2. การตัดสินใจของเจ้าของ

| # | เรื่อง | คำตอบ |
| --- | --- | --- |
| 1 | 3 วินาทีแรกต้องรู้อะไร | **ประเภทโปรดักต์นำ** (terminal + agent ต่อโปรเจกต์บน Canvas เดียว) **บรรยากาศเป็นโทนภาพ** ไม่ใช่สโลแกน |
| 2 | ที่มาของภาพ | **Renderer จริง** — `landing-page/app-preview.html` + `scripts/record-demos.mjs` scene `hero` จับที่ 2x |
| 3 | ช่วงเวลา | **เฟรมท้ายของ `hero`**: 4 pane — browser pane (atlas dashboard) ใหญ่สุด + Claude + Codex + API server |
| 4 | Backdrop | **รูป keshi** `design/project-covers/sources/veluma/keshi-backdrop.jpg` (736×411) ใช้ตามที่มี ไม่ upscale ด้วย AI, ลด banding ด้วย `grain.png` ของ landing |
| 5 | ประโยคเดียว | *Every project's terminals and agents, on one calm Canvas.* |
| 6 | Wordmark | ไอคอน V จริง ~64px + "Veluma" · Geist ทั้งปก |
| 7 | องค์ประกอบ | ~~Full-bleed~~ — เจ้าของดู v4 แล้วว่า "โล่งเกินไป ไม่แน่ใจว่าเป็นแอปหรือโปสเตอร์" → **v4b: โครงของ v3** — พื้น navy + wordmark ใหญ่ + **หน้าต่างแอปจริง** (title bar `atlas-api`, ไม่เอียง, ล้นขอบล่าง) ข้างในมี backdrop keshi; ตัดวงกลมไอคอน/เส้นโยง/tagline เกิน. Capture: Auto Tile พลิกซ้าย-ขวา + แคบคอลัมน์ browser ให้เกิด**ช่องว่างกลางหน้าต่าง**ที่เงา keshi ยืนอยู่โดยไม่มี glass บัง (คอลัมน์ terminal คงความกว้างเดิม เพราะ xterm บน Windows ไม่ reflow บรรทัดที่พิมพ์แล้ว) · **v4c:** เจ้าของขอพื้น gradient (ข้อยกเว้นที่อนุมัติ: navy → ชมพูม่วงพลบค่ำ ไปทางขวา) และ terminal ทึบขึ้น → readability **0.65** (worst 6.66:1) · **v4d:** เจ้าของขอ**ออร่าแสงรอบกรอบหน้าต่าง** (ข้อยกเว้นที่อนุมัติจากกฎห้าม glow: ฟ้าอมม่วง → ชมพู → พีช จากโทนรูป keshi + ขอบเรืองบาง) |
| 8 | วิดีโอ | อัดชุด v2 ใหม่ทั้งหมดเป็น mp4 + poster แทน GIF ทั้งชุด |
| 9 | ความใส | ปรับ Readability (`surfaceStrength`) **ทีละ backdrop** ให้ใสที่สุดที่ข้อความ terminal ยัง ≥ 4.5:1 ณ จุดแย่สุด — ปกใช้เกณฑ์เดียวกับวิดีโอ |
| 10 | Backdrop 3 รูป | `hero`/`terminal`/`canvas` + ปก ใช้ keshi 1 · คลิปใหม่ **`canvas`** สลับ keshi 1 → 2 → 3 และลาก Readability (แทน `configure`) |
| 11 | ป้ายคลิป | ตามตารางข้อ 3 |

ความเสี่ยงที่เจ้าของรับทราบ: รูป keshi เป็นภาพของศิลปินจริง (สิทธิ์ภาพถ่าย/ภาพลักษณ์) — แนวทางเดียวกับ Keshi Pomodoro; ใบหน้าไม่ใช่จุดเด่น (ทุกรูปเป็นเงาหันหลัง)

## 3. Project Details gallery

| # | Clip | Label | Description |
| --- | --- | --- | --- |
| 1 | hero | One Canvas, every agent | Switch to another Project, start every terminal with one command, then follow a server link into a browser pane on the same Canvas. |
| 2 | terminal | Add a terminal | Add a terminal from the Dock, name it and pick its command and icon in the session editor, then start it on the Canvas. |
| 3 | canvas | Shape the Canvas | Swap the Project backdrop and tune pane readability without losing the working context. |

## 4. การผลิต

1. ปกก่อน → เจ้าของดู → ล็อกค่า backdrop / focal / readability → อัดวิดีโอ
2. ไฟล์ใหม่ทั้งหมด (`veluma-cover-v4.webp`, `public/assets/veluma/v5/*`) ไม่เขียนทับของเดิม; GIF เก่าลบหลังเจ้าของอนุมัติเท่านั้น
3. Demo video ใหม่: ใช้ 3 วิดีโอ (hero, terminal, canvas) ในหน้า Veluma จริง

## 5. เกณฑ์ผ่าน

- ปกที่ 1600 / 240 / 120px · ในห้อง gallery จริง และ case hero
- ทดสอบ 5 วินาที: "แอปนี้คืออะไร?" → "รวม terminal/agent ของโปรเจกต์ไว้ที่เดียว"
- Blind A/B เทียบ v3
- Contrast ข้อความ terminal ≥ 4.5:1 ทุก backdrop
- Anti-slop: ไม่มี glow/tilt/รูปทรงตกแต่ง, tagline 1 ประโยค, ทุกข้อความอ่านได้ที่ 100%
