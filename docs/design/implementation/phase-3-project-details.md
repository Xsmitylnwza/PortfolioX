# เฟส 3 — อัปเกรด Project Details ทีละงาน

กลับ [Phase map](README.md) · รายละเอียด section ใช้ [Review บท 3–4](../2026-09-05-design-review-plan.md) · ทุกหน่วย: planned

เป้าหมาย: white/gray editorial typography, ภาพและ diagram ที่ทำให้เข้าใจงาน, contribution และผลลัพธ์ชัด โดยแต่ละโปรเจกต์มี composition ของตัวเอง

## Dependencies

- 3.0 ต้องแก้ shared fallback/menu (0.1, 0.3) และใช้ reference Keshi/neutral palette ที่ตกลงแล้ว; เริ่มได้โดยไม่ต้องรอเฟสปก หากยังไม่เปลี่ยน cover
- 3.1–3.7 ใช้ primitives จาก 3.0; ปกเดิมยังใช้ชั่วคราวได้ หาก 2.x งานนั้นยังไม่เสร็จ และระบุให้ชัดใน preview
- 3.3 Hermes ต้องมี 0.4; 3.7 Decrypt ต้องมี 0.2
- ถ้า source ยังตอบ ownership/claims ไม่ได้ ให้คงถ้อยคำที่มีหลักฐานและระบุข้อมูลที่ต้องยืนยันก่อนเพิ่ม claim; ไม่หยุดปรับ layout ทั้งหน้าเพราะข้อมูลเสริมหนึ่งจุด

## หน่วย execute และ storyboard

| หน่วย | งาน | ลำดับเรื่องที่ใช้ | สิ่งที่ต้องตรวจเพิ่ม |
|---|---|---|---|
| 3.0 | Shared primitives | Case heading, media/caption, ownership note, end navigation, neutral tokens | Opt-in scope ไม่เปลี่ยนหน้าที่ยังไม่ย้าย; reuse media/lightbox/reveal เดิม |
| 3.1 | ModeNote pilot | ผลจากบทสนทนา → context → capture → evidence → durable path → return to session | ตัด copy/chips ซ้ำ; neutralize active colored labels; simulation label ตรง |
| 3.2 | FreeFlow | Job context → quote/project/invoice → workspace/board proof → intake → owned backend | LINE เป็น branch; ไม่อ้างคลิปว่ามี record ต่อเนื่องถ้าไม่ปรากฏจริง |
| 3.3 | Hermes | Request ตัวอย่าง → route default → verified result → explore → incident/lesson | ไม่ต้องเลือก 8 contexts ก่อนเข้าใจ; แยก conceptual และ operational proof |
| 3.4 | Veluma | Creator intent → personal Canvas/material → agents with icons → leave/return → explicit Start / Auto Tile → lifecycle | ใช้ [creator vision](../../projects/veluma-product-vision.md): ความเป็นมนุษย์/mood/ชีวิตเป็นเหตุผลที่สร้างแอป; ความเป็นระเบียบช่วยใช้งาน แต่ไม่ใช่ identity ทั้งหมด; restore layout และ start process คนละ state; ยังไม่รวมแปลง GIF |
| 3.5 | Keshi | Timer → Focus/Relax → Discipline → atmosphere → optional feedback/system | ดึง evidence ขึ้นก่อน Hermes; selected-day capture ต้องตรงเรื่อง; คง identity ที่ใช้เป็น reference |
| 3.6 | Zucchini | Discover → five ratings/review → result → edit → calculation/boundary | ลดคำอธิบายสูตรซ้ำ; ตรวจ contribution ทีมจาก repo ก่อนถามข้อมูลเพิ่ม |
| 3.7 | Decrypt | Stakes → edit/revalidate → mutations → verdict → short architecture | Manual มาก่อน payoff; outcome ที่แสดงเป็น actual/illustration ระบุชัด |

## วิธีแยกโค้ด

3.0 สร้าง shared primitives ขนาดเล็ก; แต่ละหน่วยย้ายเฉพาะ renderer/style ของงานนั้นไป `src/components/project-details/<project>/` เมื่อช่วยเรื่อง isolation ไม่ต้องแยกทุกไฟล์ก่อนเห็นดีไซน์

`ProjectDetails.jsx` คง router/registry; shared styles ใช้ scope ของงานที่ migrate แล้ว อย่าใช้ global override เปลี่ยนเจ็ดหน้าพร้อมกัน ไม่มี generic page-builder บังคับทุกงานเป็น card grid

## ขอบเขตต่อหน่วย

รวม hero/body hierarchy, section order, necessary diagrams, copy editing ที่คง factual meaning, media presentation, ownership, mobile, related-case ending และ scoped extraction

ไม่รวมเปลี่ยนปกงานอื่น, Gallery/Experience/Stack/Contact, shared motion rewrite, enabling private links หรือ claims ใหม่จากการคาดเดา

## เกณฑ์จบ

- หนึ่ง section เพิ่มความเข้าใจหรือหลักฐานใหม่; heading/ภาพอ่านร่วมกันได้โดยไม่ต้องอ่าน paragraph ทุกอัน
- มี one-image/one-diagram focus ที่เหมาะกับงาน; connectors มีความหมายและ label ไม่ถูกบัง
- Text/annotations ขาว–เทา; screenshot คงสีจริงและ provenance
- Hero บน 390px เห็น product visual เร็วและ title ไม่ทับ; diagram แปลงเป็น mobile order ไม่ย่อทั้งผืน
- ตรวจ 1440, 390, 320 และ reduced motion; media expand/keyboard/focus, back/next, asset load ทำงาน
- ตรวจ neighboring page ที่ยังไม่ได้ migrate; shared change ใน 3.0 ตรวจครบ 7 routes
- Build/targeted lint และภาพก่อน–หลัง + diff; สรุปแล้วหยุดที่งานนั้น

## สถานะ

- [ ] 3.0 Shared primitives
- [ ] 3.1 ModeNote
- [ ] 3.2 FreeFlow
- [ ] 3.3 Hermes
- [ ] 3.4 Veluma
- [ ] 3.5 Keshi
- [ ] 3.6 Zucchini
- [ ] 3.7 Decrypt
