# เฟส 0 — แก้พื้นฐานที่แสดงผลผิด

กลับ [Phase map](README.md) · ทุกหน่วย: complete · [ผลตรวจ](runs/2026-09-05-phase-0-1.md)

เป้าหมาย: แก้ปัญหาที่ตรวจยืนยันแล้วให้เป็นฐานสำหรับ redesign โดยรักษา style/เนื้อหาที่ไม่เกี่ยวข้อง

## หน่วย execute

| หน่วย | งาน/target | เงื่อนไขเริ่ม | เกณฑ์จบ |
|---|---|---|---|
| 0.1 | แยก reduced-motion backdrop ของ gallery/document; `Hero.css:207`, `GalleryScene.jsx` | ตรวจซ้ำว่าอาการยังอยู่ใน checkout ปัจจุบัน | ทุก case ไม่มีปก ModeNote แทรกหลังเนื้อหา; gallery fallback ยังมีทางเลือกงาน |
| 0.2 | แก้ Decrypt outcome placement; `ProjectDetailsStories.css`, diagram ใน `ProjectDetails.jsx` | Reproduce desktop/mobile ก่อนเปลี่ยน | trigger → burn → outcome อ่านได้ ไม่มี implicit grid ทับกัน |
| 0.3 | ให้ MENU rendered state ตรง React/ARIA; `Navigation.jsx`, `Navigation.css` | Reproduce Escape/tap-close | close จริงทั้ง keyboard/touch; focus และ aria-expanded สอดคล้อง |
| 0.4 | ย้าย Hermes connector labels ที่ถูกบัง; `ProjectDetailsHermes.css/.jsx` | Reproduce route default | label/เส้นไม่อยู่ใต้ node; operation text อ่านได้; selectors ยังทำงาน |

## ขอบเขต

เปลี่ยนเฉพาะสาเหตุ/selector ของหน่วย ไม่รวมเปลี่ยน cover, rewrite copy, ลดจำนวน Hermes contexts หรือย้ายองค์ประกอบทุกหน้า งานเหล่านั้นมีเฟสเฉพาะ

ก่อนแก้บันทึก git status/diff ที่เกี่ยวข้องและภาพ before; source line เป็นตำแหน่งจาก review ให้ค้น selector ปัจจุบันก่อนแก้

ถ้า 0.1 พบ gallery fallback ไม่มีทางเลือกงาน ให้เพิ่มเฉพาะ static links ที่จำเป็นต่อการใช้งาน; full project index และ art direction ของ index อยู่ 4.1

## ผลส่งมอบและตรวจ

- Before/after ที่ 1440×1000 และ 390×844 ของหน่วย; 0.1 ตรวจ reduced motion และไม่มี WebGL ที่เกี่ยวข้อง
- 0.2 ตรวจ source/computed layout ร่วมกับ screenshot; ไม่มี horizontal overflow อย่างเดียวไม่เพียงพอ
- 0.3 ทดสอบเปิด/ปิด Escape/tap และ route navigation
- 0.4 ทดสอบ default route และอย่างน้อยหนึ่ง context/trigger ที่มี topology ต่างกัน
- Build และ lint เฉพาะโค้ดที่แก้เมื่อเหมาะสม; preview artifacts อยู่ `output/design-implementation/0.x/`

จบแล้วหยุดที่หน่วยนั้น ไม่เริ่ม redesign ต่อ

## สถานะ

- [x] 0.1 Reduced-motion backdrop — [run](runs/2026-09-05-0.1.md)
- [x] 0.2 Decrypt outcome — [run](runs/2026-09-05-0.2.md)
- [x] 0.3 Menu state — [run](runs/2026-09-05-0.3.md)
- [x] 0.4 Hermes connectors — [run](runs/2026-09-05-0.4.md)
