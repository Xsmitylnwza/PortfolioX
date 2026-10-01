# Spec: Veluma surface recipe — root cause, fix และแผน clean code

- สถานะ: **พร้อมส่งให้ agent ทำต่อ** · วันที่: 2026-09-30
- เอกสารนี้เขียนให้อ่านเดี่ยวๆ ได้ ไม่ต้องมีบริบทจากบทสนทนาเดิม
- อ่าน [AGENTS.md](../../AGENTS.md) ก่อน (กฎ design harness, ห้าม commit/push/deploy, DOM contract)

---

## 0. TL;DR

เจ้าของต้องการให้ทุกหน้า `/project/:id` มี material (การ์ด/กระจก) แบบเดียวกับ `/project/veluma` แต่ทุกครั้งที่ลอกสูตรไป หน้าอื่นออกมาเข้มเกือบดำ ต่างจากต้นแบบที่เป็นกระจกใสสว่าง

**Root cause:** ลุคของ Veluma เกิดจาก `backdrop-filter` ที่ *ไม่ทำงาน* (ติด backdrop root จาก `.case-reveal`) ไม่ได้เกิดจากค่าใน CSS. หน้าอื่นที่ลอก `blur(52px) brightness(68%)` ไปมี filter ที่ทำงานจริง จึงเข้มกว่า

**ทางที่เลือก:** เขียน recipe ให้ตรงกับสิ่งที่ Veluma render จริง = fill โปร่ง + rim + sheen + shadow **ไม่ใช้ backdrop-filter** แล้วรวมเป็น token/material เดียว

---

## 1. บริบท

| เรื่อง | รายละเอียด |
| --- | --- |
| โปรเจกต์ | PortfolioX — React + Vite (TSX). portfolio ของ new-grad SWE แต่ละโปรเจกต์มีหน้า `/project/:id` |
| Stage | พื้นหลังแดง `rgb(220,38,38)` บน `body` + กริด WebGL/3D fixed อยู่นอก section (ดู DESIGN.md A23) |
| Palette ของ UI chrome | ดำ/ขาว/เทาเท่านั้น (A25) แดงเป็นของ stage เท่านั้น |
| ต้นแบบ | `/project/veluma` — CSS ใน [ProjectDetailsMux.css](../../src/components/ProjectDetailsMux.css), DOM ใน [ProjectDetailsMux.tsx](../../src/components/ProjectDetailsMux.tsx) (class `case-mux-*`, section `.case-section--mux`) |
| หน้าที่ลอกไปแล้ว | Keshi: [ProjectDetailsKeshiVelumaSurface.css](../../src/components/ProjectDetailsKeshiVelumaSurface.css) + token `--color-keshi-surface-*` ใน [tokens.css](../../src/styles/tokens.css) (บล็อก `.case-section--keshi`) |
| Thai UI | เจ้าของสื่อสารเป็นภาษาไทย ตอบ/รายงานเป็นไทย ศัพท์เทคนิคเป็นอังกฤษได้ |
| ภาพอ้างอิง | ต้นแบบ = การ์ด Project Canvas / Reveal the Dock (การ์ดขาว) / Terminal scene บน Veluma; ผลที่ผิด = การ์ด Session N / Pattern mirror บน Keshi เป็นแดงเข้มเกือบดำไล่เฉด |

## 2. Root cause และหลักฐาน

### กลไก
1. [ProjectDetails.css:452](../../src/components/ProjectDetails.css) `.case-reveal { will-change: opacity, transform; }` ค้างถาวรหลัง reveal → เป็น **backdrop root** (ตามสเปก CSS Filter Effects: `will-change` ของ opacity/transform/filter สร้าง backdrop root)
2. `backdrop-filter` ของ element ข้างใน sample ได้แค่ pixel ภายใน root ไม่เห็น stage แดงข้างนอก → blur/brightness ไม่มีผล
3. Veluma ไม่รีเซ็ต `will-change` จึงเหลือแค่ fill `rgba(12,12,14,.18)` + border + sheen → ใส เห็นกริดคมทะลุ
4. หน้าอื่นรีเซ็ตแล้ว: Hermes/FreeFlow/ModeNote ตั้ง `will-change: auto`; Zuch ตั้ง `transform:none` พร้อมคอมเมนต์อธิบายเรื่อง backdrop root ([ProjectDetailsZuch.css:751](../../src/components/ProjectDetailsZuch.css)) → filter ทำงานจริง → เข้ม

### สิ่งที่วัดได้ (Chrome, viewport 1440×900, 2026-09-30)
- Veluma pipeline node: computed `backdrop-filter = blur(52px) brightness(0.68) saturate(1.04)`, bg `rgba(12,12,14,0.18)` แต่ render ใส เห็นกริดคม
- ปิด `will-change`/`transform` บน `.case-mux-system` → การ์ด Veluma กลายเป็นแดงเข้มเหมือน Keshi ทันที (พิสูจน์สาเหตุ)
- ฉีด `.case-section--mux *{backdrop-filter:none !important}` → snapshot 265 node (geometry, bg, border, shadow, color) **diff = 0** และภาพเหมือนเดิม (34 node มี filter ก่อน → 0 หลัง) ⇒ ลบ filter ออกจาก Veluma ปลอดภัยบน Chrome

### ทำไมลอกพลาดซ้ำ
1. ลอกจาก computed CSS แต่ลุคมาจาก DOM context (`will-change` ของ ancestor)
2. Veluma มี CSS 2 ชั้น: สูตรสว่างอบอุ่น (`blur(20px) saturate(145%)`) ถูกทับด้วยชั้น "K95-inspired" ([Mux.css:679](../../src/components/ProjectDetailsMux.css)) ที่เป็นสูตรเข้ม
3. ไม่มีเครื่องมือไหนเทียบ render กับต้นแบบ; `check:design` เขียวไม่ได้แปลว่าหน้าตาถูก

## 3. Decision

**Veluma material = fill โปร่ง + rim + sheen + shadow ไม่มี backdrop-filter**

- ไม่พึ่ง `will-change`/wrapper → ผลเท่ากันทุกหน้า ทุก engine
- ปฏิเสธ "ทาง B" (ทำให้ filter ทำงานจริงด้วยการรีเซ็ต `will-change`) เพราะจะเปลี่ยนหน้า Veluma เป็นลุคเข้มที่เจ้าของไม่ต้องการ
- ปฏิเสธการขยาย `CaseMatteSurface`: เป็น React component ที่บังคับ wrapper `div` (กระทบ direct-child contract ของ media discovery), มี tier เดียว, ใช้ `backdrop-filter: blur()`, และไม่มี consumer ใน `src/` นอกไฟล์ตัวเอง → สร้าง CSS-only material ใหม่แทน
- Related: DESIGN.md A25, A27; A26 (matte caption) ถูก supersede โดยการทดลอง 2026-09-24 และโดย spec นี้

## 4. Recipe เป้าหมาย

ค่าจาก [Mux.css:688-797](../../src/components/ProjectDetailsMux.css) (ชั้นที่ชนะ cascade)

| Tier | ใช้กับ | fill | edge | shadow |
| --- | --- | --- | --- | --- |
| base | container/การ์ดหลัก | `rgba(12,12,14,.18)` | `rgba(255,255,255,.18)` | `0 10px 30px rgba(0,0,2,.3)` |
| dark | chip / icon / control ย่อย | `rgba(12,12,14,.16)` | `rgba(255,255,255,.18)` | `0 6px 18px rgba(0,0,2,.24)` |
| paper | การ์ด focus (เน้นได้ 1 ใบต่อกลุ่ม) | `rgba(255,255,255,.76)` | `rgba(255,255,255,.72)` | `0 10px 30px rgba(0,0,2,.3)` |

- sheen = `::before` inset 0, opacity `.72` (paper `.58`) ใช้ gradient/inset จาก token `-sheen` / `-inset` เดิม
- filter ทั้ง 3 tier = `none`
- radius การ์ด Veluma = `1rem`, Keshi ใช้ `var(--radius-media)` (`.78rem`) — ยังไม่ตัดสินว่าจะรวม (ถ้ารวม = redesign เล็กน้อย ต้องถามเจ้าของ ห้ามรวมเอง)

## 5. สถานะปัจจุบันของ working tree (สำคัญ)

Branch `develop`. มี **การแก้ที่ยังไม่ commit 1 ไฟล์** — [src/styles/tokens.css](../../src/styles/tokens.css) (pilot):
- `--color-keshi-surface-{base,dark,paper}-filter` → `none`
- `--color-keshi-surface-dark` `rgba(12,12,14,.36)` → `.16`
- คอมเมนต์เหนือบล็อกอธิบายเรื่อง backdrop root

ผลที่ตรวจแล้ว (computed): การ์ด Keshi rhythm = `rgba(12,12,14,.16)` + filter `none`; ภาพ: การ์ด Session N/Pattern mirror ใสเห็นกริด ใกล้ต้นแบบ

**ยังไม่ได้ทำ:** รัน `npm run check:design`/`check:quality`, ตรวจ Keshi ครบทุก section (states, atmosphere, proof, pattern, architecture), mobile, Veluma cleanup, rename token, material ใหม่

## 6. งานที่ต้องทำ (ตามลำดับ)

### T1 — ตรวจ pilot Keshi ให้ครบ
- เปิดทุก section ของ `/project/keshi-pomodoro` ที่ใช้ surface (selector list ใน VelumaSurface.css) เทียบกับ Veluma
- เช็ก contrast ข้อความบนการ์ดที่ไม่มี blur (A20: evidence ต้องอ่านออก) โดยเฉพาะที่ทับ media/กริด
- ค่าที่ตั้งใจให้ต่างจาก Veluma: ไม่มี ถ้าเจอที่ต่างให้บันทึกเป็นข้อสังเกต
- ผ่านเมื่อ: ไม่มีการ์ดใดเข้มกว่าต้นแบบ, paper card มีตำแหน่งเดียวต่อกลุ่ม, `npm run check:design -- --files src/styles/tokens.css src/components/ProjectDetailsKeshiVelumaSurface.css --mode fast` ผ่าน

### T2 — Veluma: ทำให้ deterministic และลบโค้ดเกิน
ไฟล์: [ProjectDetailsMux.css](../../src/components/ProjectDetailsMux.css) (826 บรรทัด), [ProjectDetailsMux.tsx](../../src/components/ProjectDetailsMux.tsx)

พบแล้ว:
- ชั้นแรก (~678 บรรทัดก่อน "K95") ถูกชั้น K95 ทับ fill/border/shadow ของ container หลัก (`.case-mux-shift`, `.case-mux-agents`, `.case-mux-pipeline__node`, ตัว `--focus`, ชิ้นย่อย)
- `backdrop-filter` 12 จุดในชั้นแรก = no-op
- SVG `#mux-liquid-glass-refract` (`<svg class="case-mux-glass-defs">` ใน TSX + `filter:url(...)` ที่ [Mux.css:814](../../src/components/ProjectDetailsMux.css) บน `::before`) — **ยังไม่รู้ว่ามีผลต่อภาพไหม** ต้องวัด

ยังไม่ทราบ: จำนวนบรรทัดที่ลบได้จริง (บาง property เช่น layout/ตัวอักษรในชั้นแรกไม่ถูกทับ → ห้ามลบทั้งชั้น)

ขั้นตอน (ห้ามข้าม):
1. เขียน/ใช้สคริปต์ snapshot computed style ของทุก node ใน `.case-section--mux` (className, rect, backgroundColor, borderTopColor, boxShadow, color, backdropFilter, filter, opacity) บันทึกเป็น JSON baseline — ที่ viewport 1440×900 และ 390×844
2. ตั้ง filter ของ Veluma เป็น `none` ที่ต้นทาง (ไม่ใช่ฉีดด้วย `!important`)
3. ลบ declaration ที่ถูกทับ/no-op ทีละกลุ่ม; snapshot ซ้ำหลังแต่ละกลุ่ม ต้อง diff = 0 (ยกเว้น backdropFilter ที่เปลี่ยนเป็น none)
4. ทดลองตัด SVG refraction: ถ้า diff = 0 และภาพเหมือนเดิม → ลบทั้ง `<svg>` และ `filter:url()`; ถ้า `::before` เปลี่ยน → เก็บไว้และบันทึกเหตุผล
5. ดูภาพด้วยตาก่อน/หลัง (screenshot pipeline, agents, shift)

### T3 — สร้าง material กลาง (CSS-only)
- ไฟล์ใหม่ `src/styles/detail-surface.css`; **import ใน `src/main.tsx` โดยรักษาลำดับเดิม** ดู [GLOBAL-CSS-OWNERSHIP.md](GLOBAL-CSS-OWNERSHIP.md) ก่อน
- token: rename `--color-keshi-surface-*` → `--color-detail-surface-*` ย้ายจากบล็อก `.case-section--keshi` ไป `:root` ใน tokens.css (DESIGN.md §3: theme override semantic role ห้าม override primitive). อัปเดตทุก consumer (`grep -rn "keshi-surface" src`)
- เลือก tier ด้วย `data-surface="base|dark|paper"` (หรือ class `.detail-surface--*`) แทน selector list ยาว; หนึ่งกฎต่อ tier; sheen ใช้ `::before` เดียวที่ material เป็นเจ้าของ
- material เป็นเจ้าของ fill/edge/shadow/sheen, wrapper เป็นเจ้าของตำแหน่ง, content เป็นเจ้าของ layout ภายใน (A9)
- ห้ามแตะ layout/spacing/typography/media (rounding spacing = redesign)
- **DOM contract ที่ห้ามทำหาย:** `data-wave-follow`, `data-wave-*`, `data-media-kind`, `data-poster-transition-target`, `data-cursor` / `data-cursor-text`, ความสัมพันธ์ direct-child ที่ media discovery ใช้ → เมื่อเพิ่ม attribute ต้องเช็กตัวใช้จริง ไม่ใช่แค่ render ของ component

### T4 — ย้าย Keshi และ Veluma ไปใช้ material กลาง
- Keshi: ตัด selector list ยาวใน VelumaSurface.css (183 บรรทัด, list เดิมซ้ำ 3 รอบ) เหลือ tier ละกฎ; ลบ `@supports not (backdrop-filter)` fallback
- Veluma: ลบค่าดิบที่ซ้ำ ใช้ token
- ผ่านเมื่อ: ค่าดิบของ recipe นอก tokens.css = 0; ภาพ Veluma และ Keshi เหมือนหลัง T1/T2

### T5 — Guard กันย้อนกลับ
- `scripts/design-check.mjs` / `scripts/design-check.config.mjs`: กฎใหม่ ห้าม `backdrop-filter` บน selector ที่ใช้ token กลุ่ม `detail-surface`; ห้าม stylesheet โปรเจกต์ style ภายใน material (`.detail-surface__*`) — เลียนแบบกฎ `.keshi-liquid-glass__*` ที่มีอยู่
- ลงทะเบียนไฟล์ใหม่ใน `RENDER_TARGETS` (ไม่งั้นได้ `needs-scope` exit 1) โดยระบุ route Veluma + Keshi
- สคริปต์ audit ใน `design/audit/` (มีแบบอย่าง `project-detail-colors.cjs`): อ่าน computed `backdrop-filter` ของ node ที่ใช้ material ทุก route ต้องเป็น `none` และรายงาน ancestor ที่เป็น backdrop root
- คอมเมนต์เหนือ `.case-reveal` ใน ProjectDetails.css ว่าเป็น backdrop root เพื่อคนต่อไป

### T6 — ขยายไปหน้าอื่น (หลังเจ้าของ review T1–T5)
ทีละหน้า: FreeFlow, ModeNote, Zucchini, Decrypt, Hermes. Hermes ใช้ระบบ `--hm-glass` (`rgba(0,0,0,.24/.42)`) ของตัวเอง งานใหญ่กว่า ให้ทำสุดท้ายและถามเจ้าของก่อน

### T7 — เอกสาร
- DESIGN.md: เพิ่ม decision ใหม่ (A28) ว่า detail surface ไม่ใช้ backdrop-filter, ทำเครื่องหมาย A26 superseded, แก้ย่อหน้า "การทดลองปัจจุบัน 2026-09-24"
- เช็ก [Wave 5 reachability](../architecture/2026-09-24-modularization-wave5-report.md) แล้วค่อยลบ `CaseMatteSurface.{tsx,css}` ถ้าไม่มี route ใช้

## 7. เกณฑ์ตรวจรับ

- [ ] Keshi เทียบ Veluma: เห็นกริดทะลุการ์ด, ไม่เข้มกว่าต้นแบบ
- [ ] computed `backdrop-filter: none` ทั้ง Veluma และ Keshi
- [ ] Veluma snapshot ก่อน/หลัง diff = 0 (desktop + mobile)
- [ ] สี chrome เป็น grayscale (`design/audit/project-detail-colors.cjs`)
- [ ] `npm run check:design -- --base HEAD` และ `npm run check:quality` ผ่าน
- [ ] ดู render ด้วยตา (AGENTS.md: linter เขียว ≠ ผ่าน) และรายงาน route ที่กระทบ
- [ ] ทดสอบอย่างน้อย Chrome + Firefox หรือ Safari
- [ ] ตัวชี้วัด clean code: ค่าดิบ recipe นอก tokens.css = 0; selector list ซ้ำเหลือ 1 กฎ/tier; เพิ่มหน้าใหม่ = ไม่แก้ CSS กลาง

## 8. ความเสี่ยง / สิ่งที่ยังไม่รู้

- ยืนยันเฉพาะ Chrome ว่า filter บน Veluma เป็น no-op; engine อื่นอาจต่าง (เหตุผลที่ต้องตั้ง `none` ตรงๆ)
- ไม่มี blur → ข้อความบนการ์ดที่ทับ media/กริดอ่านยากขึ้นได้
- ลุค "ใสสว่าง" ยืนยันจากภาพอ้างอิงของเจ้าของ ถ้า T1 แล้วยังไม่ได้ "เสน่ห์" ให้หยุดและทำ blind A/B (skill `design-ab-loop`) ก่อนขยาย
- radius/ความหนาต่างกันระหว่าง Veluma (`1rem`) กับ Keshi (`.78rem`): ต้องถามเจ้าของ
- ไฟล์ untracked จำนวนมากใน repo (docs/, design/, artifacts/) เป็นของเจ้าของ ห้ามลบ/จัดระเบียบ

## 9. ข้อห้ามและกฎของ repo

- ห้าม commit/push/deploy ถ้าไม่ได้ขอ (A15)
- ห้ามเพิ่มค่าดิบสี/ความยาวในโค้ด migrated; ห้ามขยาย baseline หรือ prune เพื่อให้ผ่าน; ห้ามสร้าง token ใหม่ทุกค่าเพื่อเอาใจ linter — ใช้ semantic role ที่มีความหมายก่อน
- ห้ามใช้ hue นอกดำ/ขาว/เทาใน chrome (A25); ภาพ/วิดีโอเดโมคงสีต้นฉบับ
- ก่อนแก้ component legacy ที่ไม่มี route ให้อ่าน Wave 5 report (`Hero.css`, `KeshiLiquidGlass.css` ยัง active)

## 9a. Runbook สำหรับ agent (กับดักที่เจอจริง)

- **พอร์ต 5173 บนเครื่องเจ้าของเป็นแอปอื่น (TEKKEN 8)** ห้ามใช้; รัน `npx vite --port 5391 --strictPort` แทน (`preview_start` ใช้ไม่ได้เพราะ launch.json ผูกพอร์ต 5173)
- Vite ครั้งแรก transform `src/main.tsx` ช้า ~17 วินาที รอจน `curl http://localhost:5391/src/main.tsx` ตอบ 200 ก่อน navigate ไม่งั้น `#root` ว่าง
- หน้า project มี page transition และ smooth-scroll แบบ custom: `scrollIntoView` ไม่ trigger `.case-reveal` (opacity ค้าง 0 → เห็นจอแดงล้วน) ต้องเลื่อนด้วย wheel event (~72px/tick) แล้วรอ ~3 วินาที; ตรวจ `getComputedStyle(node.closest('.case-reveal')).opacity === '1'` ก่อนถ่ายภาพ
- พื้นหลังมี wave animation → เทียบ pixel-by-pixel ระหว่างภาพไม่ได้ ใช้ snapshot computed style เป็นหลักฐานหลัก ภาพไว้ดูด้วยตา
- viewport ตรวจ: 1440×900 และ 390×844; รีเซ็ต viewport เป็น desktop หลังทดสอบ
- ปิด dev server ที่เปิดเองเมื่อเสร็จ (ตอนนี้ยังมี Vite ค้างที่พอร์ต 5391 จาก session นี้ ถ้ายังอยู่ให้ใช้ต่อหรือปิด)
- คำสั่งตรวจ: `npm run check:design -- --files <path...> --mode fast` ระหว่างทำ, `npm run check:design -- --base HEAD` ก่อนส่งมอบ, `npm run check:quality` เป็น gate รวม

## 10. รูปแบบรายงานส่งมอบ (ตาม AI change contract)

รายงาน: ไฟล์ที่เปลี่ยนและเจ้าของ, route ที่กระทบ, ผล quality gate, หลักฐาน render/snapshot ก่อน-หลัง, และความไม่แน่นอนที่เหลือ
