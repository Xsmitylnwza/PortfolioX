# เฟส 5 — เก็บ motion และ media

กลับ [Phase map](README.md) · ทุกหน่วย: planned

เป้าหมาย: ให้การเคลื่อนไหวและสื่อสนับสนุนหน้าที่ปรับแล้ว โดยคงจังหวะและ identity เดิม

## Dependencies

ทำกับ route/media ที่จบ redesign แล้วในเฟส 2–4; หากบางโปรเจกต์ถูกพัก ให้ระบุ excluded scope แทนการรอทุกงาน ไม่ใช้ timing จาก review เดิมเป็น benchmark ปัจจุบัน

## หน่วย execute

| หน่วย | งาน | Targets | เกณฑ์จบ |
|---|---|---|---|
| 5.1 Entrance/transition | แยก full Gallery introduction จาก deep-link entrance; skip/control ที่เหมาะ; motion ไม่บดบัง text/diagram | `Loader`, `App`, `ScrollPerspectiveWave`, reveal hook, `PosterSelectTransition` ตามเส้นทางที่ trace แล้ว | เปิด direct case เห็นเนื้อหาเร็วขึ้นตามการวัดก่อน/หลัง; Gallery identity อยู่; ไม่มี flash/blank/double transition; reduced-motion มีเนื้อหาครบ |
| 5.2 Media | แปลง Veluma GIF ขนาดใหญ่เป็น MP4/WebM + still, ประเมิน source images/exports ที่หนักจริง, controls/pause/reduced-motion | `ProjectMedia`, lightbox/media frame, metadata, source/export files | demo ครบจังหวะและชัด, lightbox เลือกชนิดถูก, offscreen/reduced-motion ไม่เล่นเกินจำเป็น, network bytes ดีขึ้นจากที่วัด |

## ขอบเขต

ไม่เปลี่ยน story/art direction เพื่อให้การวัดเร็วขึ้น, ไม่ลบสื่อต้นฉบับหรือ flatten UI เป็น screenshot เพื่อแก้ wave, ไม่ tune ทุก animation โดยไม่มีอาการหรือเหตุผลเฉพาะ

## การตรวจและส่งมอบ

- Baseline ของ route ที่วัด ใช้ viewport/network/runtime เดียวกันก่อนและหลัง
- ตรวจ gallery → case, direct case, back, room switch, refresh และ reduced motion
- ตรวจ video poster/play/pause/expand, media fallback, font/icon readability และ text ที่ต้องอ่านขณะ motion
- ถ้าแก้ shared wave/media ต้อง smoke ทุก active detail route; รายงาน limitations ของ headless ไม่เรียกว่า production performance guarantee
- Build/targeted lint พร้อม capture หรือ trace ที่อธิบายผล; จบแต่ละหน่วยแล้วหยุด

## สถานะ

- [ ] 5.1 Entrance/transition
- [ ] 5.2 Media
