# เฟส 6 — ตรวจรับรวม

กลับ [Phase map](README.md) · หน่วย 6.1: planned

เป้าหมาย: ตรวจชุดที่ผู้ใช้เลือก implement ว่าทำงานและมี visual language ร่วมกันจริง ระบุสิ่งที่พัก/ยังไม่เสร็จให้ชัด

## เงื่อนไขเริ่ม

มี run notes และหลักฐานของหน่วยที่จบแล้ว ถ้าบางงานยัง planned/awaiting selection ให้แยกออกจากรายการรับงาน ไม่ทำแทนงานค้างในเฟส QA โดยอัตโนมัติ

## Matrix

| พื้นผิว | ตรวจ |
|---|---|
| Gallery + cover set | thumbnail, featured/index discovery, active labels, selected-poster transition, image versions |
| 7 project routes | palette, story order, diagram labels/connectors, ownership/provenance, mobile hero, end navigation |
| Experience/Stack/Contact | hierarchy, actual links/files, route aliases, shared typography |
| Shared interaction | menu, keyboard/focus, lightbox, back/forward, direct link/refresh, reduced motion |
| Media/runtime | broken images/video, console errors, inappropriate autoplay, transition regressions |

Viewports: desktop 1440, notebook 1280/1366, tablet 768, mobile 390/320 และ short landscape ที่เกี่ยวข้อง; ตรวจ reduced motion และ 200% zoom ของ text/controls สำคัญ บันทึก browser ที่ใช้และ coverage ที่ไม่ได้ตรวจ

## เกณฑ์จบ

- Build และ required checks ผ่าน หรือระบุ unrelated baseline failures พร้อมหลักฐาน; ไม่แก้ unrelated code เพื่อทำรายงานให้เขียว
- ตรวจ composition ของปกที่ขนาดใช้งานจริงร่วมกัน และเรื่องของ case จาก headings/visuals
- ไม่มี defect ที่ทำให้ route, menu, media หรือ diagram หลักใช้ไม่ได้ในชุดที่รับงาน
- Contrast อ่านจาก composite จริง ไม่ใช้ผล detector บน transparent background โดยไม่ตรวจ
- Findings ใหม่ถูกบันทึกและผูกกลับหน่วยเจ้าของ; แก้เล็กในขอบเขตที่ผู้ใช้สั่งได้ ส่วน redesign ใหม่แยก follow-up ไม่ขยาย QA เป็นอีกโครงการ
- ส่ง report, preview paths, completed/deferred scope และ risks; ไม่มี commit/push/deploy โดยอัตโนมัติ

## ผลส่งมอบ

`docs/design/implementation/runs/<date>-6.1.md` และ evidence matrix ใน `output/design-implementation/6.1/` พร้อมรายการหน่วยที่พร้อมใช้งานกับหน่วยที่ยังค้าง

- [ ] 6.1 Integrated QA
