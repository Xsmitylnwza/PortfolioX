# PortfolioX — แผนแยกโมดูลเพื่อให้แก้โค้ดได้ตรงจุด

วันที่ 2026-09-24 · สถานะ **Wave 0–4 ผ่านแล้วตาม scope ที่เปิดงาน; 1d/5 ยัง conditional** · inventory ด้านล่างเป็น snapshot ของ working tree บน `0221811`. ดู [ผล Wave 0–1](2026-09-24-modularization-wave0-1-report.md), [Wave 2](2026-09-24-modularization-wave2-report.md), [Wave 3](2026-09-24-modularization-wave3-report.md) และ [Wave 4](2026-09-24-modularization-wave4-report.md)

## เป้าหมายและขอบเขตการวัด

ทำให้คนและ AI agent รู้ว่าเมื่อต้องแก้โปรเจกต์หรือพฤติกรรมหนึ่ง จะเข้าไฟล์ใดและต้องอ่านบริบทน้อยลง โดยรักษา DOM, CSS cascade, motion, เนื้อหา และภาพ render เดิม การแยกไฟล์ **ไม่ใช่** คำกล่าวว่า bundle เล็กลงหรือเว็บเร็วขึ้น: source LOC/bytes รวมอาจเท่าเดิมหรือมากขึ้นเล็กน้อยจาก imports

สแกนไฟล์ที่ maintain อยู่ใน `src/` และ `scripts/` นามสกุล JS/JSX/MJS/CSS ทั้ง **100 ไฟล์, 38,869 บรรทัด, 1,244,068 ไบต์**; 37 ไฟล์เกิน 300 บรรทัด, 22 ไฟล์เกิน 500, 10 ไฟล์เกิน 1,000. นับ physical lines รวม blank/comment จาก working tree ณ วันข้างต้น ไม่ใช้ตัวเลขจาก `HEAD` แทนงานที่ยังไม่ commit. ตรวจ root configs แยกต่างหาก. ไม่เอา `dist/`, `output/`, `tmp*/`, `artifacts/`, `public/assets/`, `design/ab/`, dependencies หรือ prototype ที่ไม่ใช่ runtime เข้ามาตัดสินจากขนาดไฟล์

ตัวชี้วัดหลังทำแต่ละ slice:

1. **Locality:** งานแก้เนื้อหา/เลย์เอาต์ของโปรเจกต์หนึ่งแตะไฟล์ JSX ของโปรเจกต์นั้นและ CSS/data ของมัน ไม่ต้องแก้ JSX ของโปรเจกต์อื่น; shared behavior แก้ที่เจ้าของร่วมแห่งเดียว
2. **ขนาดต่อเจ้าของ:** ลด entrypoint ที่ต้องอ่านทั้งไฟล์ก่อนแก้ เช่น `ProjectDetails.jsx` 3,994 → ประมาณ 350–500 บรรทัดหลังแยก active layouts; เป้าหมายเป็นช่วง ไม่ใช่ lint เพดานบรรทัดที่จะบังคับให้สร้าง wrapper ตื้น ๆ
3. **Parity:** ลำดับ DOM/class/attribute ที่ consumer ใช้, ข้อความและ media, computed styles, ภาพ, keyboard/focus, reduced motion และ WebGL lifecycle ไม่เปลี่ยนจากก่อน slice
4. **Discoverability:** ชื่อไฟล์บอก route/ความรับผิดชอบ, import graph ไม่มีวงจร, ownership map และ design-check route mapping ชี้ไป consumer จริง

หลักตัดสิน: แยกเมื่อมี **เหตุผลแก้ต่างกัน + seam ที่อธิบายได้ + verification ที่ทำได้**; ไม่แยกเพราะ LOC อย่างเดียว Shared module ต้องมีผู้ใช้จริงอย่างน้อยสองแห่งหรือซ่อนความซับซ้อนหลัง interface เล็ก ห้ามย้ายทุกอย่างไป `utils.js`, สร้าง pass-through wrappers หรือสร้าง registry ซ้ำหลายชั้น

ผลลดขนาด **ไฟล์ที่ต้องเปิดเพื่อแก้** ที่แผนตั้งเป้า (ประมาณการ ยังไม่ได้ implement; ไม่ใช่ผลลด bundle หรือ LOC รวม):

| ไฟล์ปัจจุบัน | ขนาดตอนนี้ | เป้าหมายหลังแยก | ลดขนาด entrypoint โดยประมาณ |
| --- | ---: | ---: | ---: |
| `ProjectDetails.jsx` | 3,994 LOC | **350–500 LOC หลังแยก active layouts** | **87.5–91.2%**; 150–250 เป็นไปได้เฉพาะเมื่อตัดสินชะตา fallback layouts แล้ว |
| `src/data/projects.js` | 367 LOC | 20–50 LOC | 86.4–94.6% |
| `src/index.css` | 826 LOC | 150–200 LOC | 75.8–81.8% |
| `ProjectDetails.css` | 1,370 LOC | ไฟล์ใหญ่สุด ~516 LOC | 62.3% |
| `ProjectDetailsModeNote.css` | 2,337 LOC | ไฟล์ใหญ่สุด ~550 LOC | 76.5% |
| `ProjectDetailsFreeflow.css` | 2,129 LOC | ไฟล์ใหญ่สุด ~527 LOC | 75.2% |

แถวอื่นเป็น **scenario หากมีเหตุให้ทำในอนาคต** ไม่ใช่งานที่ได้รับอนุมัติให้ลงมือทั้งหมด ตัวเลขเป็น budget สำหรับ review เท่านั้น ถ้าการแตกชิ้นใดทำให้ interface ขยาย, import cycle เกิด หรือย้ายการแก้หนึ่งเรื่องไปหลายไฟล์กว่าเดิม ให้คง module เดิมและบันทึกเหตุผล การถึง LOC เป้าโดยไม่ลดบริบทที่ต้องอ่านไม่นับว่าคุ้มค่า

### ผล scrutinize + agent panel

คำถามหลัก: ต้องแยกทุกไฟล์ยาวหรือไม่? **ไม่ต้อง** เพราะ goal คือ locality ต่อการแก้จริง ไม่ใช่ LOC รวม. ไล่ code path แล้ว `ProjectDetails.jsx:57–65,3903–3989` ยืนยันว่า 7 โปรเจกต์ปัจจุบันเลือก layout ของตัวเองทั้งหมด ขณะที่ generic layouts ที่ `:619,1012,1092` ยังไม่มี current visual route; `ProjectDetails.css:1155` พิสูจน์ว่าช่วงท้ายไม่ใช่ lightbox ทั้งก้อน

| ทางเลือก | หลักฐานสนับสนุน | ข้อเสีย/ผลตัดสิน |
| --- | --- | --- |
| แยกทุกไฟล์ที่เกินเป้า LOC ตามแผนเดิม | ลดขนาดไฟล์เดี่ยวเร็ว | **ปฏิเสธ:** 367-line project data กับ 57-line cover CSS ยังไม่มี edit-friction evidence; เพิ่ม imports/cascade risk และ fallback ที่ไม่มี route ตรวจภาพ |
| **เลือก:** baseline + media leaf + Mux pilot แล้ววัด locality/parity | 3,043/3,994 LOC เป็น project-owned; Mux มี CSS แยกแล้ว; media มีผู้ใช้ร่วมจริง | ต้องเก็บ before/after browser evidence ก่อน pilot แต่ทำให้การย้ายมีหลักฐานว่าคุ้มและไม่พัง |
| คง JSX monolith ทั้งหมด | ไม่มี regression risk จากการย้าย | **ปฏิเสธ:** ทุก project edit ยังต้องเปิด route file 3,994 LOC และ shared/project ownership ยังปนกัน |

ความเห็นที่ต่างกันเรื่อง `projects.js`: การมี 7 records เป็น seam ที่ทำได้ แต่ยังไม่มีหลักฐานแก้ผิด record/ชนกันจากการแก้พร้อมกัน จึง **คงไว้ก่อน** และตั้ง trigger วัดจริงใน D4. Shared cover rules ก็เลื่อนด้วยเหตุเดียวกัน. ไม่มีการโหวตแทนหลักฐาน; minority finding เรื่อง fallback และ CSS boundary ถูกยืนยันจาก source แล้วจึงแก้แผน

## Decision register

| ID / ลำดับ | หลักฐานปัจจุบัน | Decision และรูปแบบเป้าหมาย | เหตุผล / ความเสี่ยง |
| --- | --- | --- | --- |
| **D1 / pilot ก่อน** | `ProjectDetails.jsx` **3,994 บรรทัด / 151,745 B**; ช่วงเฉพาะโปรเจกต์ 3,043 บรรทัด (**76.2%**) | **SPLIT active layouts แบบมี gate.** Extract media/lightbox เป็น leaf เดียวแล้วตรวจทันที, ต่อด้วย shared primitives และ **Mux เป็น pilot หนึ่งโปรเจกต์**. หาก locality/parity ดีขึ้นจึงย้าย Keshi, Decrypt, Zucchini, FreeFlow, ModeNote ทีละ slice. Shell หลัง active layouts เป้า ~350–500; ยังไม่สร้าง fallback module เพื่อไล่ตัวเลข | เป็นปัญหาเดียวกับ CSS เดิม แต่ media portal/ref/focus/wave เสี่ยงจริง ต้องพิสูจน์ทุก slice; ทั้ง 7 project IDs มี named layout อยู่แล้ว, generic fallback ยังไม่มี route ที่ทดสอบภาพได้ |
| **D2 / Wave 3 PASS** | `ProjectDetails.css` เดิม **1,370 / 29,996 B** เป็น shared shell, layouts, lightbox และ process | แยกเป็น base 514, layouts 464, lightbox 174, process 218 บรรทัด โดยคง byte/rule order เดิม | ผู้ใช้เปิด Wave 3; owner ของ lightbox ชัดขึ้น, built CSS byte-identical และ 24 route/state browser parity ผ่าน. ดู [Wave 3 report](2026-09-24-modularization-wave3-report.md) |
| **D3 / contingent** | ModeNote CSS **2,337 / 53,853 B**, FreeFlow CSS **2,129 / 50,869 B**; มี later passes ที่ 1834 และ 1616 | **KEEP จนมีงานแก้ซ้ำในหน้าเหล่านี้.** ถ้าพิสูจน์ว่าต้องไล่ override หลายจุด ค่อย split source-order blocks ตาม chapter/base/responsive/material; ตัวเลข ~250–550 เป็นเพียง scenario | เป็น CSS เจ้าของโปรเจกต์เดียวแล้ว ความยาวอย่างเดียวไม่พอเป็นเหตุ; ย้ายตามชื่อ selector แบบสุ่มเปลี่ยน cascade ได้ |
| **D4 / Wave 2 PASS** | `src/data/projects.js` เดิม **367 / 18,873 B** มี 7 records อิสระและ featured order/revision | เจ้าของเปิด Wave 2; Veluma pilot ลด owner file จาก 367 → 85 lines โดยข้อมูล/ภาพ/interaction เท่าเดิม จึงขยายครบ 7 records; entrypoint เหลือ 34 lines และคง ordered exports/HMR key | Panel เดิมเลือก KEEP เพราะยังไม่มี evidence; pilot ให้ locality gain พร้อม 24 route/state parity และ HMR เหมือนก่อนแยก. ดู [Wave 2 report](2026-09-24-modularization-wave2-report.md) |
| **D5 / แยกจาก D4** | ข้อเท็จจริงงาน/การศึกษาซ้ำใน `Experience.jsx:9–77`, `PersonaReloadView.jsx:8–30`, `src/data/site.js:47–96` | **CONTENT AUDIT ก่อน:** รวมเฉพาะ verified org/role/dates/assets เมื่อมี mismatch หรือการแก้พร้อมกัน; narrative และการจัดวางเฉพาะหน้ายังอยู่ที่หน้า | ลดความเสี่ยงข้อมูลไม่ตรงกัน แต่ห้ามรวม copy ต่างบริบทหรือเดาค่าที่ขัดกัน; `/persona` ยังเป็น active route |
| **D6 / Wave 3 PASS** | `src/index.css` เดิม **826 / 18,977 B** ปน foundation, stage, utility, late override | แยกเป็น foundation 77, room stage 266, utilities 434, late stage 49 บรรทัด โดยคง `src/main.jsx` import order | Built CSS byte-identical และ 15 global route/state browser parity ผ่าน; class ที่ static search ไม่พบยังไม่ลบเพราะ dynamic/legacy use ไม่ถูกพิสูจน์ |
| **D7 / Wave 4 PASS** | `GalleryScene.jsx` เดิม **1,169 / 58,279 B** | แยก shader, geometry และ poster rasterizer; entry เหลือ 875 บรรทัด; render/input/cleanup คงเจ้าของเดียว และเพิ่ม renderer restart เมื่อ WebGL context กลับมา | 10 route cycles ต่อ environment + context recovery ผ่าน; เป้า 450–600 เป็น exploratory ไม่บังคับแยก closure จน interface แย่กว่าเดิม. ดู [Wave 4 report](2026-09-24-modularization-wave4-report.md) |
| **D8 / Wave 4 PASS** | `ScrollPerspectiveWave.jsx` เดิม **1,203 / 53,046 B** | แยก DOM capture, shaders และ animated-raster adapter; entry เหลือ 708 บรรทัด; RAF/visibility/teardown คงเจ้าของเดียว | ทุก project route/state และ media-kind smoke ผ่าน; context restoration สร้าง wave session ใหม่โดยไม่เปลี่ยน DOM contract |
| **D9 / Wave 4 PASS** | `App.jsx` เดิม **615 / 25,498 B** | ย้าย lazy page route table ไป `AppPageRoutes.jsx`; App เหลือ 573 บรรทัด, คง room transition controller และ persistent stage เป็นเจ้าของเดียว | การแยก controller ให้มี props/refs จำนวนมากยังไม่คุ้ม; browser navigation/lifecycle parity ผ่าน, ไม่มีการบังคับตัวเลข 250–350 |
| **D10 / review ก่อน split** | `Projects.jsx` 333, `ProjectConstellation.jsx` 596, CSS 496/428; static search ไม่พบ active importer ของ `Hero.jsx`, `About.jsx`, `ResumePage.jsx` และกลุ่ม TV/VCR/legacy effects | **HOLD / reachability audit.** พิสูจน์ route/dynamic use แล้วเลือก retain เป็น future feature หรือ archive/deletion; ถ้ายังใช้ ให้แยก Projects flow/GSAP กับ archive view ภายหลัง | แยกไฟล์ของ feature ที่ไม่ถูกใช้อาจเพิ่ม debt แทนลด; static search ไม่พิสูจน์ dynamic use จึงยังไม่ลบ `Hero.css` ยังถูก import โดย App และไม่ถือว่า unused ตาม `Hero.jsx` |
| **D11 / เมื่อแก้ Experience** | `Experience.css` **1,057 / 25,948 B** มี path/education 1–335, current/earlier roles 336–814, reveal/responsive 815–1057 | **DEFER SPLIT** ตาม chapter พร้อม responsive last; `Experience.jsx` 422 อาจย้าย verified facts ตาม D5 | เป็นหน้าเดียว เจ้าของชัด; extraction ให้ประโยชน์เมื่อมีงานแก้หลาย section จริง และต้องคง cascade |
| **D12 / คงไว้** | `TechStack.css` 511 ถูก import โดย Stack และ Contact; `PersonaReloadView.css` 831, Keshi/Zuch/Hermes CSS หลายไฟล์ >1,000 แต่เจ้าของชัด | **KEEP** ตอนนี้; ถ้ามีการเปลี่ยนร่วมบ่อย ค่อยแยก `engine-*` shared จาก Stack-only โดยเทียบสอง route | การบังคับทุกไฟล์ให้สั้นจะทำให้ shared style มีหลายเจ้าของและ import order ซับซ้อน |
| **D13 / harness หลัง route mapping** | `scripts/design-check.config.mjs` 424 แบ่ง token policy กับ `RENDER_TARGETS`; `design-baseline.mjs` 407 | **KEEP ก่อน**, อาจแยก policy/route-map ภายหลังเมื่อมีการแก้บ่อยและ test ยืนยัน | ตอนนี้ config เป็นจุดค้นเดียวที่ชัด; ย้ายก่อนเพิ่ม route coverage จะเพิ่มงานโดยยังไม่ลดความเสี่ยง |
| **D14 / contingent** | `ProjectCoverMedia.css` 57 บรรทัดมี shared cover frame และ late adaptations ของ FreeFlow/ModeNote/Hermes | **KEEP** เป็น authored-cover contract ตอนนี้; หากแก้ cover ของโปรเจกต์หนึ่งแล้วเกิด override collision ค่อยย้าย rule เฉพาะโปรเจกต์พร้อมเทียบ cascade | การย้ายประมาณ 35 บรรทัดไป 3 ไฟล์ตอนนี้แทบไม่ลดบริบท แต่เพิ่ม import-order risk |

## ลำดับลงมือและ acceptance ของแต่ละ slice

**Wave 0 — baseline ที่ไม่ทับงานค้าง.** บันทึก `git status`, hash ของ source ที่จะย้าย, LOC/bytes และ before capture จาก **working tree ปัจจุบัน** ก่อนแก้; ห้าม `stash`, reset, recapture debt baseline หรือเอา `HEAD` มาแทน state นี้. ทำ manifest ของไฟล์ใน slice รวม **ไฟล์ใหม่ที่ยัง untracked** และระบุ routes/states/viewport/DOM targets ที่ต้องวัด. เพิ่ม path ของ JSX module ใหม่ใน `RENDER_TARGETS` ทันทีที่สร้าง รวม Keshi `?layout=next` เป็น render state แยกจาก plain URL แล้วรัน `--files` กับ manifest ให้ไม่มี `needs-scope`; `--base HEAD` เพียงอย่างเดียวไม่รวม untracked files ใน declared scope. สำหรับงานนอก project detail ค่อยขยาย route map เป็น `/experience`, `/stack`, `/contact`, `/persona` และ consumers ของ `src/data/projects.js` ก่อน slice นั้น. ถ้าจะย้าย CSS ให้ map original debt fingerprint โดยไม่เพิ่ม allowance และคง strict migrated scope ในไฟล์ใหม่

แผนนี้พึ่ง `DESIGN.md`, tokens และ design harness ที่บางส่วนยังเป็น **untracked working-tree files**; checkout ที่มีเพียง `HEAD 0221811` อาจไม่มีเครื่องมือเหล่านี้. ก่อน execution ต้องยืนยันไฟล์และ hash ใน manifest จริง ห้ามถือว่า clean checkout เทียบเท่า baseline ปัจจุบัน

**Wave 1 — milestone ที่พร้อมทำคือ Project Details pilot เท่านั้น.** (1) ย้าย `CaseMediaLightbox` + `CaseMediaFrame` เป็น leaf module เดียว โดยคง props และ DOM เหมือนเดิม; **หยุดตรวจทันที** ก่อนย้าย layout: hero/gallery media ทุก project route, image/GIF/video ที่มีจริง, เฉพาะ frame ที่ขยายได้ตรวจ button/Escape/backdrop close, focus trap/return, scroll lock, poster-transition target, wave-follow/direct-child media; desktop motion, mobile fallback และ reduced motion เป็นคนละ state. (2) ย้าย shared primitives ที่ pilot ต้องใช้โดยไม่ import กลับจาก route shell; (3) ย้าย **Mux หนึ่งโปรเจกต์** แล้วเทียบภาพ/DOM/interaction เฉพาะ Mux และ non-pilot sentinel; (4) วัด edit locality ด้วยงานตัวอย่างสองชนิด (แก้เรื่อง Mux และแก้ shared media label): จำนวนไฟล์ที่ต้องเปิด, บรรทัดบริบทที่อ่าน และ import hops ก่อน–หลัง. หาก parity หรือ locality แย่ลง ให้หยุดและแก้/ย้อน slice นี้; **งานย้ายโปรเจกต์ที่เหลือยังไม่ใช่ committed scope**

ชื่อไฟล์ pilot ให้ตรงกับ CSS: `ProjectDetailsMedia.jsx`, shared leaf เท่าที่ใช้จริง, `ProjectDetailsMux.jsx`; ทุก module import shared leaf โดยตรง ห้าม import กลับจาก `ProjectDetails.jsx`. คง CSS imports รวมไว้ที่ route shell และคง props เดิมก่อน; ยังไม่ทำ dynamic import/code splitting. ถ้า pilot ผ่าน จึงพิจารณา Keshi, Decrypt, Zucchini, FreeFlow และ ModeNote ทีละโปรเจกต์. `KeshiSessionClock` ต้องคง body portal. `PROJECT_LAYOUTS` กับ `LAYOUT_RENDERERS` และ wave intensity/Keshi preview policy อยู่เดิมจน active layouts ผ่าน parity; การรวม registry เป็นอีก slice ไม่ทำพร้อม file move

**Wave 2–5 — owner-activated work ไม่ใช่คำสั่งให้ทำรวดเดียว:** Wave 2 data/content, Wave 3 CSS และ Wave 4 runtime ผ่านแล้ว; Wave 5 parked code ยัง conditional. Wave 2 คง IDs, order, gallery labels/descriptions, featured selections 5/4 ที่ต่างกัน, media URLs, `galleryMediaRevision` และ HMR behavior. `PROJECT_DECISIONS` ยังอยู่ใน lazy detail route ไม่ย้ายเข้า `projects.js` ที่ App/Gallery โหลดตั้งแต่ต้น. D5 employment facts ตรวจแล้วแต่ไม่รวม copy ที่ต่างกันโดยไม่มี canonical evidence; source-of-truth link ใน `DESIGN.md` อัปเดตแล้ว

CSS Wave 3 แยก D2/D6 แล้วโดยคง source order, `STRICT_SCOPES`, `MOVED_CSS_DEBT_PATHS`, `RENDER_TARGETS` และอัปเดต ownership docs. D3 ModeNote/FreeFlow และ D14 cover CSS ยัง KEEP: เป็นของโปรเจกต์ชัดแล้วหรือมี late cascade contract; ขนาดอย่างเดียวไม่พอให้เสี่ยงย้าย ห้าม rename selectors/เปลี่ยน token พร้อม mechanical move

Runtime backlog: D7–D9 เริ่มหลังมี browser lifecycle guard เท่านั้น แยก pure shaders/capture/geometry ก่อน, คง render loop+cleanup เจ้าของเดียว และตรวจ canvas count, active frames/listeners หลังนำทางซ้ำ ไม่ใช้ screenshots อย่างเดียว. ไม่สร้าง hooks ที่ส่ง state/ref/callback จำนวนมากข้ามกัน

Parked code: D10 ตรวจ importer/route/runtime references รวม static/dynamic usage แล้วตัดสิน retain หรือ archive จาก product intent ก่อนลบ. Generic `CinemaLayout`, `FeatureLayout`, `DossierLayout` ไม่ถูกเลือกโดย 7 project IDs ปัจจุบัน แต่ `CinemaLayout` เป็น fallback ของ project record ใหม่ที่ไม่มี mapping; **คงไว้ใน route file ก่อน** ไม่สร้าง `ProjectDetailsFallbackLayouts.jsx` เพื่อให้ shell ถึง LOC เป้า. ถ้าจะ retain เป็น extension point ต้องมี fixture ที่ render ทั้งสาม layout; ถ้าจะเลิกใช้ ต้องตัดสิน contract โปรเจกต์ใหม่ก่อน. ห้ามอ้างว่า dead ด้วย `rg` เพียงอย่างเดียว

**Verification contract ต่อ slice.** มี diff ที่เป็นการย้ายก่อน redesign, manifest ของไฟล์เดิม+ใหม่พร้อม route consumers, LOC/bytes และ edit-locality ก่อน–หลัง. รัน `npm run check:design -- --files <manifest> --mode fast` โดยต้องไม่มี `needs-scope`, `npm run test:design`, แล้ว `npm run check:design -- --full`/build; `--base HEAD` เป็นข้อมูลเสริมและอาจรวม unrelated WIP ที่รายงานแยก. ปัจจุบัน `--full` ผ่าน mechanical checks แต่แสดง **4,029 debt fingerprints และ 52 ESLint diagnostics ที่ ratchet ไม่ถือเป็น failure**. ห้ามใช้ผลนี้หรือ design tests 46 ตัวแทน browser behavior

Browser parity ใช้ before/after จาก **working tree เดียวกัน** ต่อ affected route/state/viewport, ตรวจ set ของ routes และ DOM targets ว่าครบเท่ากัน และถือ missing capture/target เป็น failure. ตรึง DPR, font readiness, viewport และ reduced-motion setting. `scripts/design-compare-render.mjs` ปัจจุบันผูกกับ phase-1 baseline เก่าและ skip target/route ที่ไม่พบ จึงใช้เป็น acceptance gate ของแผนนี้เพียงลำพังไม่ได้. Desktop 1440×900 non-reduced-motion ต้องตรวจ WebGL wave ระหว่าง scroll/navigation; mobile 390×844 และ reduced motion ตรวจ fallback แยก. หลัง shared media extraction ตรวจทั้ง 7 project routes + Keshi `?layout=next` พร้อม image/GIF/video ที่มีจริง, lightbox, keyboard/focus, scroll lock และ poster handoff; หลัง Mux pilot ตรวจ Mux + non-pilot sentinel และ shared behaviors ที่แตะ. สำหรับ D7–D9 ในอนาคตตรวจ canvas count, active frames/listeners หลังนำทางซ้ำด้วย. ภาพ render ต้องมีคน/agent ตรวจจริง; pixel หรือ computed-style parity เพียงอย่างเดียวไม่ตัดสิน visual hierarchy

ก่อน pilot ให้ทำตัวจับภาพ/ตัวเปรียบเทียบขนาดเล็กเฉพาะ affected routes ซึ่งยืนยัน route/target set แบบ strict แล้วรันกับ before-state ให้ผ่านเองหนึ่งรอบ; จะต่อยอด script เดิมหรือเขียน wrapper ใหม่ก็ได้ แต่ห้ามเปลี่ยน phase-1 historical baseline เพื่อให้ผลนี้ผ่าน

ถ้าผลต่างเกิดจาก extraction ให้แก้เฉพาะ slice หรือย้อน patch ของ slice นั้น โดยไม่ restore งานค้างทั้ง tree. ก่อนลงมือ capture ถาวรให้เลือก output path ที่ตรวจแล้วว่าอยู่ใน workspace และไม่ทับของเดิม: `scripts/design-snapshot.mjs` ลบ output directory ของมันก่อนเขียน (`:53`), จึงห้ามใช้ path เก่าหรือ path ที่คำนวณโดยไม่ตรวจ

### Test/evaluation gate ราย Wave

**สถานะปัจจุบัน:** Wave 0–4 มี before/after captures, contract tests, visual review และ mechanical checks ผ่านตาม [รายงาน Wave 0–1](2026-09-24-modularization-wave0-1-report.md), [Wave 2](2026-09-24-modularization-wave2-report.md), [Wave 3](2026-09-24-modularization-wave3-report.md) และ [Wave 4](2026-09-24-modularization-wave4-report.md). Wave 1d/5 ยังเป็น test specification ที่ต้องทำให้รันได้เมื่อเปิดงานนั้น ห้ามเริ่ม Wave ถัดไปด้วยผล `INCONCLUSIVE` หรือใช้ผล build ผ่านแทน behavior parity

| Wave / จุดหยุด | สิ่งที่ต้องรัน | PASS เมื่อ | หลักฐานที่ต้องเก็บ |
| --- | --- | --- | --- |
| **0 — test readiness** | Capture working tree ก่อนแก้ด้วย manifest ของ routes, state, viewport, DPR, fonts, DOM targets และ source hashes; รัน comparator กับ before-state เดียวกัน แล้วทดสอบ known-bad บน **สำเนา capture** โดยลบหนึ่ง route, ลบหนึ่ง target และเปลี่ยนหนึ่ง computed value | Self-compare ให้ diff = 0; known-bad ทั้งสามกรณี fail; ไม่มี missing route/target; `--files` ของ manifest ไม่ขึ้น `needs-scope`; baseline lint/build status ถูกบันทึกแยกจากผล browser | before capture + manifest/hash + ผล self/known-bad + รายการ existing debt/diagnostics |
| **1a — shared media/lightbox** | Browser smoke ทุก 7 project routes และ Keshi preview บน desktop motion, mobile fallback, reduced motion; ทดสอบ media image/GIF/video ที่มีจริง, frame ที่ขยายได้ด้วย pointer/keyboard, close button/Escape/backdrop, Tab/Shift+Tab trap, focus return, root scroll-lock restore, portal cleanup, poster target และ `data-wave-follow` direct-child media | Before/after DOM target set, media URLs, attributes, computed styles และภาพที่ตรวจด้วยตาเท่าเดิม; ทุก interaction ให้ผลเดิม; ไม่มี console error ใหม่, focus ค้าง, scroll lock ค้าง หรือ portal เกิน; media kind ที่ route ไม่มีระบุ N/A ชัดเจน | captures ตาม route/state, interaction log, DOM/attribute diff, visual review note |
| **1b — shared primitives** | ตรวจ headings/ARIA/text/order, `data-wave-*`, `data-media-kind`, `data-cursor*`, `data-poster-transition-target` และ direct-child relations บน routes ที่ใช้ primitive; รัน mechanical checks กับไฟล์ใหม่ทั้งหมด | DOM/accessible name และ attributes ที่เป็น contract ไม่เปลี่ยน; route mapping ครบ; non-pilot routes ยัง render เหมือน baseline | DOM snapshot + changed-file manifest + checker output |
| **1c — Mux pilot** | เปรียบเทียบ `/project/veluma` และ non-pilot sentinel ที่ desktop/mobile/reduced motion; เปิด/ปิด media และกลับจาก gallery; รัน task-probe สองงานเดิมก่อน–หลัง (แก้ Mux story, แก้ shared media label) โดยวัดไฟล์ที่เปิด, LOC ที่อ่าน, import hops | Visual/DOM/interaction parity ผ่าน; ไม่มี import cycle; task-probe อย่างน้อยหนึ่งงานใช้บริบทน้อยลงและไม่มีงานใดต้องเปิดไฟล์มากขึ้นโดยไร้เหตุผล; ถ้าไม่ผ่าน หยุดก่อนย้ายโปรเจกต์ถัดไป | route captures, interaction log, ตาราง locality before/after และเหตุผลถ้าผลเท่ากัน |
| **1d — โปรเจกต์ถัดไป (เฉพาะเมื่อ 1c ผ่าน)** | ทีละโปรเจกต์: affected route + non-pilot sentinel, shared media/clock/preview ที่เกี่ยว, route-specific text/media paths และ desktop/mobile/reduced motion; หลังครบทุก project รัน 7 routes + Keshi preview อีกครั้ง | แต่ละ slice parity ผ่านก่อนต่อ; final sweep ไม่มี route หาย, copy/media เปลี่ยนโดยไม่ตั้งใจ หรือ behavior regression | รายงาน PASS แยก slice และ final route matrix |
| **2 — data/content (conditional)** | Unit invariants ของ unique IDs, exact project order, featured Gallery 5 vs Projects 4, gallery label/description alignment, media URLs, `galleryMediaRevision`; smoke App/Gallery/Loader/Persona/Project Details; ถ้าแยก record ให้ตรวจ HMR ด้วย fixture/copy ที่ไม่แก้ข้อมูลจริงใน working tree; factual changes ต้องเทียบ source truth | Data/output และ HMR behavior เหมือนก่อน move; ไม่มี unverified copy; test เปิดเผย diff ของ record ที่ตั้งใจแก้เท่านั้น | data snapshot + invariant results + route/HMR log + content evidence |
| **3 — CSS (conditional)** | หากเป็น mechanical move ให้เทียบ ordered selector/declaration list ก่อน–หลัง, import order, token/strict-scope/debt fingerprints; computed styles + visual review บน affected routes ที่ desktop/mobile/reduced motion. หากลบ candidate utility ให้ตรวจ dynamic class use และทุก active route | ไม่มี declaration หาย/สลับ cascade โดยไม่ตั้งใจ, no new design violations, rendered values และ visual grouping เท่าเดิม; utility ที่ลบมีหลักฐานว่าไม่ถูกใช้ | CSS diff/order report, checker result, computed/visual captures |
| **4 — WebGL/App runtime (conditional)** | ทำ home→project→back และสลับ routes ซ้ำอย่างน้อย 10 รอบ, scroll/resize/visibility/context-loss recovery, GIF/video/capture, desktop motion กับ mobile/reduced fallback; วัด canvas count, active RAF/listeners หลัง settle | Canvas/RAF/listener count กลับสู่ baseline หลังทุก cycle, ไม่มี blank stage, memory/resource leak ที่สังเกตได้, input/navigation/motion เท่าเดิม และไม่มี console error ใหม่ | lifecycle counters, interaction trace, before/after render captures |
| **5 — parked code (conditional)** | ตรวจ static import graph, dynamic imports, route reachability และ asset/CSS references; ถ้า retain ให้มี consumer fixture, ถ้า archive/delete ให้ build และ smoke ทุก active route | มีหลักฐานว่าไม่มี active consumer ถูกตัด; fallback contract ของโปรเจกต์ใหม่ตัดสินชัดก่อนลบ; ถ้าพิสูจน์ไม่ได้ให้ KEEP | reachability report, retain/delete decision และ route smoke/build result |

ทุก gate ให้ผลได้เพียง `PASS`, `FAIL`, `INCONCLUSIVE`: ขาด route/target, browser ใช้ไม่ได้, capture เทียบกันไม่ได้ หรือไม่ได้ตรวจ interaction ที่เกี่ยว = `INCONCLUSIVE` ไม่ใช่ PASS. ผู้ลงมือแก้และตรวจเอง พร้อมรายงาน actual file size, route coverage, failures และข้อจำกัด; ไม่เพิ่มขั้นตอน checklist ให้เจ้าของโปรเจกต์

**Commit boundary (คำสั่งเจ้าของ 2026-09-24):** หลังแต่ละ Wave ผ่าน gate ของตัวเอง ให้ commit เฉพาะงานของ Wave นั้นก่อนเริ่ม Wave ถัดไป; Wave ที่ `FAIL`/`INCONCLUSIVE` ห้าม commit ว่าเสร็จ. แยก pre-existing dirty work เป็น prerequisite commit ที่ตรวจแล้ว และไม่ push/deploy เว้นแต่สั่งเพิ่ม

**Definition of done:** ผู้แก้ตอบได้ทันทีว่า “โปรเจกต์/behavior นี้อยู่ไฟล์ใด”; project-only change ไม่ต้องแตะ unrelated layout; ไม่มี import cycle หรือ parallel registry ที่ไม่จำเป็น; parity ทั้ง mechanical และภาพ/interaction ผ่าน; รายงาน actual LOC/bytes และข้อจำกัดอย่างตรงไปตรงมา. ไม่มี commit/push/deploy ในขั้นเขียนแผนนี้

## Appendix — decision สำหรับทุก maintained source file

Decision code ใช้ใน inventory ด้านล่าง: `D1`–`D14` ชี้ตาราง decision ด้านบน; `K` = คง module ที่มีเจ้าของเดียว/ขนาดเล็กหรือเป็น fixture; `M` = material ที่ถูกเลือกหรือ historical ต้องคง contract ก่อน migration. ขนาดเป็น **physical LOC/bytes ก่อน Waves 1–3** เพื่อให้เทียบผลหลังงานได้ ไม่ใช่ขนาดปัจจุบัน

| File | LOC | Bytes | Decision |
| --- | ---: | ---: | --- |
| `scripts/design-baseline.mjs` | 407 | 16871 | D13 |
| `scripts/design-check.config.mjs` | 424 | 17227 | D13 |
| `scripts/design-check.mjs` | 343 | 13786 | K |
| `scripts/design-check.test.mjs` | 436 | 19539 | K |
| `scripts/design-compare-render.mjs` | 90 | 3493 | K |
| `scripts/design-probe.mjs` | 275 | 10928 | K |
| `scripts/design-scope.mjs` | 40 | 1007 | K |
| `scripts/design-snapshot.mjs` | 103 | 3508 | K |
| `scripts/eslint-design-tokens.mjs` | 149 | 6122 | K |
| `scripts/fixtures/known-bad.css` | 76 | 1646 | K |
| `scripts/fixtures/known-good.css` | 52 | 1327 | K |
| `scripts/stylelint-design-boundaries.mjs` | 76 | 3128 | K |
| `scripts/stylelint-design-tokens.mjs` | 176 | 7184 | K |
| `src/App.css` | 42 | 648 | D10 |
| `src/App.jsx` | 615 | 25498 | D9 |
| `src/components/About.jsx` | 397 | 16112 | D10 |
| `src/components/BrushReveal.jsx` | 138 | 6010 | D10 |
| `src/components/CaseMatteSurface.css` | 25 | 794 | M |
| `src/components/CaseMatteSurface.jsx` | 22 | 444 | M |
| `src/components/Contact.css` | 57 | 1206 | K |
| `src/components/Contact.jsx` | 239 | 8157 | K |
| `src/components/ContactPage.jsx` | 10 | 218 | K |
| `src/components/Cursor.css` | 201 | 5130 | K |
| `src/components/Cursor.jsx` | 225 | 8453 | K |
| `src/components/DocumentRoom.css` | 30 | 1096 | K |
| `src/components/Experience.css` | 1057 | 25948 | D11 |
| `src/components/Experience.jsx` | 422 | 17402 | D5 |
| `src/components/Footer.css` | 142 | 3346 | K |
| `src/components/Footer.jsx` | 47 | 1663 | K |
| `src/components/GalleryScene.jsx` | 1169 | 58279 | D7 |
| `src/components/Hero.css` | 259 | 9397 | K |
| `src/components/Hero.jsx` | 19 | 643 | D10 |
| `src/components/KeshiLiquidGlass.css` | 488 | 15546 | M |
| `src/components/KeshiLiquidGlass.jsx` | 232 | 8537 | M |
| `src/components/liquid-glass/maps.js` | 9 | 41101 | M |
| `src/components/Loader.css` | 37 | 1923 | K |
| `src/components/Loader.jsx` | 163 | 6663 | K |
| `src/components/MusicalText.jsx` | 91 | 4153 | D10 |
| `src/components/MusicPlayer.css` | 61 | 1583 | D10 |
| `src/components/MusicPlayer.jsx` | 60 | 1990 | D10 |
| `src/components/Navigation.css` | 450 | 11951 | K |
| `src/components/Navigation.jsx` | 178 | 6615 | K |
| `src/components/PersonaReloadView.css` | 831 | 17055 | D12 |
| `src/components/PersonaReloadView.jsx` | 228 | 10173 | D5 |
| `src/components/PosterSelectTransition.css` | 44 | 1104 | K |
| `src/components/PosterSelectTransition.jsx` | 275 | 8516 | K |
| `src/components/ProjectConstellation.css` | 428 | 11412 | D10 |
| `src/components/ProjectConstellation.jsx` | 596 | 25513 | D10 |
| `src/components/ProjectCoverMedia.css` | 57 | 1779 | D14 |
| `src/components/ProjectDetails.css` | 1370 | 29996 | D2 |
| `src/components/ProjectDetailsDecryptStory.css` | 795 | 17688 | D12 |
| `src/components/ProjectDetailsDecryptStoryOverrides.css` | 735 | 17268 | D12 |
| `src/components/ProjectDetailsFreeflow.css` | 2129 | 50869 | D3 |
| `src/components/ProjectDetailsHermes.css` | 1312 | 27237 | D12 |
| `src/components/ProjectDetailsHermes.jsx` | 464 | 19988 | K |
| `src/components/ProjectDetails.jsx` | 3994 | 151745 | D1 |
| `src/components/ProjectDetailsKeshiNext.css` | 508 | 15967 | D12 |
| `src/components/ProjectDetailsKeshiStory.css` | 1350 | 31521 | D12 |
| `src/components/ProjectDetailsKeshiStoryOverrides.css` | 620 | 16312 | D12 |
| `src/components/ProjectDetailsModeNote.css` | 2337 | 53853 | D3 |
| `src/components/ProjectDetailsModeNoteStory.css` | 517 | 13769 | D12 |
| `src/components/ProjectDetailsMux.css` | 828 | 20870 | D12 |
| `src/components/ProjectDetailsStories.css` | 94 | 3371 | K |
| `src/components/ProjectDetailsStorySharedOverrides.css` | 142 | 4806 | K |
| `src/components/ProjectDetailsZuch.css` | 1365 | 32860 | D12 |
| `src/components/ProjectDetailsZuchStory.css` | 740 | 16789 | D12 |
| `src/components/ProjectMedia.jsx` | 233 | 7235 | K |
| `src/components/Projects.css` | 496 | 13217 | D10 |
| `src/components/Projects.jsx` | 333 | 15662 | D10 |
| `src/components/Resume.css` | 462 | 10115 | D10 |
| `src/components/Resume.jsx` | 175 | 5977 | D10 |
| `src/components/ResumePage.jsx` | 10 | 212 | D10 |
| `src/components/RoomTransition.css` | 95 | 2292 | D10 |
| `src/components/RoomTransition.jsx` | 24 | 829 | D10 |
| `src/components/Scribbles.jsx` | 241 | 8918 | D10 |
| `src/components/ScrollManager.jsx` | 107 | 3513 | K |
| `src/components/ScrollPerspectiveWave.css` | 49 | 1350 | K |
| `src/components/ScrollPerspectiveWave.jsx` | 1203 | 53046 | D8 |
| `src/components/Squares.jsx` | 162 | 6659 | D10 |
| `src/components/StackPage.jsx` | 10 | 218 | K |
| `src/components/StaticTV.jsx` | 75 | 2219 | D10 |
| `src/components/StoryProgress.css` | 51 | 1362 | D10 |
| `src/components/StoryProgress.jsx` | 52 | 1966 | D10 |
| `src/components/TechStack.css` | 511 | 12346 | D12 |
| `src/components/TechStack.jsx` | 263 | 10509 | K |
| `src/components/TechStackList.css` | 191 | 4168 | K |
| `src/components/TechStackList.jsx` | 111 | 3432 | K |
| `src/components/TVModal.css` | 282 | 6398 | D10 |
| `src/components/TVModal.jsx` | 65 | 2091 | D10 |
| `src/components/VCRPlayer.css` | 324 | 7169 | D10 |
| `src/components/VCRPlayer.jsx` | 106 | 4339 | D10 |
| `src/components/VHSTape.css` | 194 | 4116 | D10 |
| `src/components/VHSTape.jsx` | 63 | 2436 | D10 |
| `src/data/projects.js` | 367 | 18873 | D4 |
| `src/data/site.js` | 96 | 2433 | D5 |
| `src/data/techIcons.js` | 77 | 2388 | K |
| `src/hooks/useDocumentRoomReveal.js` | 107 | 3330 | K |
| `src/index.css` | 826 | 18977 | D6 |
| `src/main.jsx` | 13 | 334 | K |
| `src/styles/tokens.css` | 204 | 9206 | K |

Root config ที่ตรวจเพิ่ม: `eslint.config.js` 95 LOC / 3,506 B, `vite.config.js` 31 / 935 B, `stylelint.config.mjs` 29 / 878 B, `index.html` 20 / 722 B — **K**: configuration/entrypoint สั้นและมีเจ้าของชัด ไม่ต้องแยก

`src/components/liquid-glass/maps.js` มีเพียง 9 physical lines แต่ 41,101 B เป็น encoded lookup data; ขนาด byte สูงไม่ใช่เหตุให้แยกโดยไม่มีการเปลี่ยน material contract. `scripts/design-check-baseline.json` เป็น generated debt record ไม่ใช่ source module ใน inventory นี้
