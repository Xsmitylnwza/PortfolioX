# เฟส 4 — ปรับส่วนอื่นของเว็บทีละหน้า

กลับ [Phase map](README.md) · ทุกหน่วย: planned

เป้าหมาย: คงโลก gallery ที่มีเอกลักษณ์ พร้อมเส้นทางเข้าใจงานและติดต่อที่ชัด

## Dependencies

ใช้ shared fallback/menu ที่แก้ใน 0.1/0.3; ไม่ต้องรอรายละเอียดครบเจ็ดเคส 4.1 ต้องรู้ current project metadata หาก 2.0 ทำแล้วให้ใช้แหล่งเดียวกัน หากยังไม่ทำให้ระบุ integration ที่ต้องตามต่อ

## หน่วย execute

| หน่วย | ขอบเขต | Targets | เกณฑ์จบ |
|---|---|---|---|
| 4.1 Gallery | คง orbit เพิ่ม DOM project index, active title/type, identity สั้น, แก้ label 24 ให้มีความหมายตามข้อมูล | `App.jsx`, `GalleryScene.jsx`, `Hero.css`, metadata ที่จำเป็น | เข้าถึง 7 cases ได้; featured ไม่เปลี่ยนโดยเงียบ; keyboard/touch/reduced-motion ใช้ได้; ไม่ทำ conventional hero มาแทน orbit |
| 4.2 Experience | Contribution/งานเด่นก่อน, ย่อ Education/graduate framing, role/outcome hierarchy | `Experience.jsx/.css`, education media เดิม | scope/ผลที่มีหลักฐานอ่านได้เร็ว; ไม่สร้างภาพระบบธนาคารหรือ claim ที่ไม่มีหลักฐาน |
| 4.3 Stack | รวมส่วนที่ซ้ำ เหลือ layers ผูกกับตัวอย่างงานจริง | `TechStack.jsx/.css`, `TechStackList` เท่าที่จำเป็น | เครื่องมือมีหน้าที่และตัวอย่าง; ไม่มี skill meters; ถ้า shared list เปลี่ยนตรวจ case consumers |
| 4.4 Contact/Resume | Email/actionable materials มาก่อน ลด meta copy, อธิบาย Resume/CV จากเนื้อหาไฟล์จริง | `Contact.jsx/.css`, `site.js`, navigation label เฉพาะที่เกี่ยว | Email/PDF/GitHub หาเจอใน opening; route aliases ไปจุดที่เข้าใจ; logistics ไม่ถูกเดาใหม่ |

## ขอบเขตที่กันไว้

ไม่ redesign Persona/VCR/legacy components ที่ไม่ได้อยู่ในเส้นทางนี้, ไม่เขียนประวัติใหม่โดยไม่มีหลักฐาน, ไม่ส่ง email/สมัครงาน/เปลี่ยนข้อมูลภายนอกจากการทดสอบ

## การตรวจและจุดหยุด

- หน่วยละ before/after desktop + mobile, title hierarchy, keyboard navigation และ reduced motion ที่กระทบ
- 4.1 ตรวจ orbit selection และ project index ครบ; 4.4 ตรวจไฟล์ PDF ที่ลิงก์จริงด้วย read-only request ไม่ทดสอบ mailto ด้วยการส่งข้อความ
- 4.3 ตรวจ project-detail stack อย่างน้อยหนึ่งหน้าเมื่อใช้ CSS/component ร่วม
- Build/targeted lint ตามโค้ดที่เปลี่ยน เก็บหลักฐานใน `output/design-implementation/4.x/`
- จบหนึ่งหน้าแล้วหยุด ไม่ต่อหน้าถัดไปอัตโนมัติ

## สถานะ

- [ ] 4.1 Gallery
- [ ] 4.2 Experience
- [ ] 4.3 Stack
- [ ] 4.4 Contact/Resume
