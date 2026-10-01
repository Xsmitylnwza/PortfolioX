# เฟส 1 — ออกแบบแนวปกให้สื่อความหมาย

กลับ [Phase map](README.md) · อ้างอิง [Cover spec](../2026-09-05-project-cover-spec.md) · สถานะ: complete — FreeFlow B / ModeNote B / Veluma A selected

เพิ่มขอบเขตเมื่อ 5 กันยายน 2026 ตามคำสั่งผู้ใช้: โฟกัสปก **FreeFlow, ModeNote และ Veluma** ก่อนเฟส 2; FreeFlow B และ ModeNote B ยังคงเป็น direction ที่เลือกแล้ว

เป้าหมาย: เห็นภาพจริงที่เปรียบเทียบได้ก่อนเลือก direction ใช้ SVG/typography/composition ร่วมกับ UI เฉพาะส่วนที่มีหน้าที่ช่วยเล่าเรื่อง

## เงื่อนไขเริ่ม

ไม่ต้องรอเฟส 0 เพราะทำใน preview แยกจากเว็บ ตรวจ behavior/provenance ของวัตถุที่จะวาดจากข้อมูลปัจจุบันก่อน ใส่ภาพ simulation เป็น illustration ให้ตรงชนิด

## หน่วย execute

| หน่วย | ภาพที่ต้องสื่อ | ตัวเลือกที่จะเห็น | เกณฑ์จบ |
|---|---|---|---|
| 1.1 FreeFlow | ข้อมูลลูกค้า งาน และเอกสารอยู่ในบริบทเดียว | Job thread: request → quote → project → invoice; Project dossier: แฟ้มงานกลางเชื่อมเอกสาร | 2 concept compositions และ thumbnail comparison; เห็นความเป็น freelance operations ชัด |
| 1.2 ModeNote | บทสนทนากลายเป็นข้อมูลที่ใช้ต่อและย้อนที่มาได้ | Conversation to evidence; Source thread; เพิ่ม Session memory เฉพาะเมื่อเป็นแนวต่างจริง | 2–3 concepts มีภาพหลักต่างกัน; UI/source fragments ตรง provenance |
| 1.3 Veluma | Project Canvas ที่จำ arrangement ของ terminals และจัดหน้าต่างให้กลับมาอ่านง่าย | Saved Canvas: pane map + ภาพจริงก่อน Start; Auto Tile: หน้าต่างซ้อน → จัดเป็นระเบียบ | 2 concepts และ thumbnail comparison; เห็น terminals/Canvas ชัด ไม่สื่อว่า restore หรือ Auto Tile สั่งรัน process |

## งานในหน่วย

1. กำหนด one-image message และเลือกวัตถุหลักที่สื่อเรื่องนั้น
2. เลือก source image/เฟรมสำหรับ detail ที่จำเป็น; ถ้ายังขาดให้ใช้ illustrative object ใน concept อย่างตรงไปตรงมา
3. ออกแบบ composition ผ่าน HTML/CSS/SVG ให้เห็น hierarchy, scale, overlaps และพื้นที่ว่าง ไม่มี minimum screenshot ratio
4. Render ภาพจริงหลัง font/image โหลด ตรวจที่ 1600, 240 และ 120px; caption ที่ต้องอ่านใช้ DOM แยก
5. ส่ง preview พร้อมข้อแตกต่างระหว่างตัวเลือกสั้น ๆ และบันทึกข้อเลือกของผู้ใช้เมื่อได้รับ

## ไม่รวมในเฟสนี้

ไม่เปลี่ยน `src/`, `public/`, gallery textures หรือ page layout; ไม่ผลิตปก final ครบ 7 งาน; ไม่เริ่มบันทึก private Discord/เขียนระบบภายนอกเพื่อทำ demo จากคำสั่ง concept

## ผลส่งมอบและจุดหยุด

`output/project-covers/previews/` พร้อม source composition และ contact sheet ตาม Cover spec ผลตรวจคือ render/asset/visual checks ไม่ต้อง build เว็บเมื่อโค้ดเว็บไม่เปลี่ยน

จบ preview ของหน่วยแล้วหยุดที่ `awaiting selection`; phase 2 ของงานนั้นใช้ direction ที่ผู้ใช้เลือก ไม่ถือว่าทุก variant ได้รับอนุมัติพร้อมกัน

- [x] 1.1 FreeFlow preview; selected direction: **B — Project dossier** · [run](runs/2026-09-05-1.1.md)
- [x] 1.2 ModeNote preview; selected direction: **B — Source thread** · [run](runs/2026-09-05-1.2.md)
- [x] 1.3 Veluma preview; selected direction: **A — Saved Canvas** · [run](runs/2026-09-05-1.3.md)

ผู้ใช้ยืนยัน FreeFlow B / ModeNote B / Veluma A แล้ว สำหรับ Veluma final ต้องเพิ่ม agent/tool icons ร่วมกับชื่อและเพิ่ม mood/ชีวิตของ personal Canvas ตาม [vision จากผู้สร้าง](../../projects/veluma-product-vision.md). เฟส 1 จบที่การเลือก direction; การปรับ final และเชื่อมเข้าเว็บอยู่เฟส 2 ซึ่งยังไม่เริ่ม

[เปิด comparison board](http://127.0.0.1:5173/output/project-covers/) · PNG masters, thumbnails และ contact sheet อยู่ `output/project-covers/previews/`
