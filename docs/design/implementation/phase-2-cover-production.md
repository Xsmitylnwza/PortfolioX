# เฟส 2 — ผลิตและเชื่อมภาพปก

กลับ [Phase map](README.md) · [Cover spec](../2026-09-05-project-cover-spec.md) · [Production record](runs/2026-09-05-phase-2-production.md)

**ขอบเขตล่าสุด:** ผลิตเฉพาะ 5 featured projects. ผู้ใช้อนุญาตทำเฟส 2 ต่อเนื่อง แล้วตัด Zucchini/Decrypt ออกจากรอบนี้ เพราะไม่ได้โชว์ใน gallery. ไม่มีการรออนุมัติรายหน่วยและไม่มีการข้ามไปเฟส 3

| หน่วย | งาน | สิ่งที่ส่งมอบ |
|---|---|---|
| 2.0 | Shared metadata | แยก coverImage / heroMedia / evidence; เสร็จแล้ว |
| 2.1 | FreeFlow B | แฟ้มงานน้ำเงินสด, F, LINE intake, quotation/invoice, real template crop |
| 2.2 | ModeNote B | Buddy, copper voice ribbon, exact quote, 1:04, source workspace |
| 2.3 | Veluma A | โลโก้ V, Canvas จริงที่มี mood, Codex/Claude icons + server/shell; ไม่สื่อว่าเริ่ม process แล้ว |
| 2.4 | Keshi | คง Focus screenshot ที่ทำด้วยมือ, scrapbook/cream/red; hero video เดิม |
| 2.5–2.6 | Zucchini / Decrypt | **ไม่อยู่ใน scope**; ปกและ hero เดิมไม่เปลี่ยน |
| 2.7 | Hermes | Hermes Agent gold emblem, Discord/Notion/Calendar marks, conceptual request-return diagram |

ปกสี version 3 เชื่อมใน local app แล้ว สถานะการตรวจล่าสุดอยู่ใน run record. Draft ขาวดำและแบบการ์ดซ้ำกันถูกแทนที่ ไม่ใช่ผลที่ผู้ใช้ยอมรับ

## เกณฑ์จบ

- SVG/PNG master/WebP พร้อม source hashes, frame/crop และ brand provenance
- ดูภาพเต็มและ thumbnail 240/120px; ไม่มี distortion หรือ logo ที่กลืนกับพื้นหลัง
- Gallery/loader ใช้ coverImage; detail/transition ใช้ heroMedia โดยเจตนา; cover แสดง 8:5 แบบไม่ crop และไม่มีป้ายทับภาพ
- Desktop, mobile, reduced motion, actual pointer/tap, lightbox และ return to gallery ผ่าน
- ตัวข้อมูล, evidence, access และ featured membership คงเดิม รวมปก/hero ของสองโปรเจกต์ที่ตัดออก
- Build และ targeted lint ผ่าน; diff แยกจาก dirty-worktree baseline

ไม่รวม body/diagram rewrite, เพิ่ม featured projects, เปลี่ยน CTA access, commit/push/deploy. หน่วยถัดไปหลังจบรอบนี้คือเฟส 3 ตามคำสั่งใหม่ของผู้ใช้
