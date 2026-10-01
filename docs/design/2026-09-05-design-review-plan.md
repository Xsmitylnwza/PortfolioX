# PortfolioX — Design review และแผนปรับปรุง

Method: dual-agent (A: `/root/design_assessment_complete` · B: `/root/evidence_assessment`) พร้อมการตรวจซอร์ส ภาพปกต้นฉบับ และภาพเรนเดอร์โดยผู้สังเคราะห์

วันที่ 5 กันยายน 2026 · สถานะ: แผนเท่านั้น · Reference: Keshi Pomodoro

**แผน execute ล่าสุด:** [แบ่งเฟสและหน่วยงานที่สั่งทำแยกกันได้](implementation/README.md) ผู้ใช้กำหนดให้ทำทีละหน่วยและหยุดตรวจผล ไม่ execute ทุกเฟสต่อกันอัตโนมัติ

อัปเดตจากการคุยล่าสุด: ผู้ใช้ต้องการภาพปกที่ออกแบบเพื่อให้เข้าใจและสนใจโปรดักต์ โดยผสม SVG/องค์ประกอบที่สื่อความหมายกับส่วนของ UI จริงตามความเหมาะสม ไม่กำหนดว่า screenshot ต้องเป็นภาพหลักทุกงาน ดู [สเปกผลิตภาพปกทั้ง 7 งาน](2026-09-05-project-cover-spec.md) ซึ่งเป็นข้อกำหนดล่าสุดแทนแนว screenshot-first ในรีวิวตั้งต้น มี FreeFlow concept pilot, ตัวเลือก ModeNote, export, integration และเกณฑ์รับงาน ยังไม่ได้เลือก mockup หรือเปลี่ยน UI

## ข้อสรุปและทิศทางที่แนะนำ

จุดแข็งของ PortfolioX คือโลกของแกลเลอรีที่มีบุคลิก และโปรเจกต์ที่มีพฤติกรรมต่างกันจริง แต่หลายหน้าพยายามแสดงความซับซ้อนผ่านคำอธิบาย ป้ายกำกับ กล่อง และงานภาพพร้อมกัน จนสิ่งที่คนดูควรเข้าใจกลับถูกลดความสำคัญลง ความรู้สึกว่า “slop” จึงมาจากทั้งภาพที่แต่งเกินเนื้อหา วิธีเล่าที่ซ้ำ และลำดับความสำคัญที่ยังไม่ชัด

แนะนำให้ใช้ **ภาพโปรดักต์จริง + ตัวอักษรขาวที่นิ่ง + ไดอะแกรมที่อธิบายความสัมพันธ์เดียว** เป็นหลักร่วมของหน้าเคสทั้งหมด แต่ให้แต่ละโปรเจกต์มีเรื่องและภาพจำของตัวเอง

Keshi เป็น reference ที่ดีเพราะหน้าตาแอปจริงมีเอกลักษณ์อยู่แล้ว ภาพ timer ไม่ต้องอาศัยวัตถุ 3D หรือสโลแกนหลายบรรทัดช่วยสร้างความรู้สึกว่ามีโปรดักต์อยู่ อย่างไรก็ตาม หน้า Keshi ปัจจุบันยังปรับจังหวะเนื้อหาได้ โดยเฉพาะการนำ Discipline มาให้เห็นก่อนคำอธิบาย Hermes

**สิ่งที่คำขอครั้งนี้กำหนด:** ขาว–เทาสำหรับข้อความ/เส้น/องค์ประกอบอธิบายใน project details; ไม่ใช้สีเน้นคำ; ให้ภาพและไดอะแกรมนำ; เรียบหรูแต่ยังมีตัวตน; ตรวจครบทุกส่วนและวางแผนก่อนลงมือ

**การตีความที่ใช้:** “ใช้สีขาว” หมายถึงภาษาของเนื้อหาแบบ Keshi ไม่ได้ถือเป็นคำสั่งให้เปลี่ยนทุกพื้นหลังเป็นสีขาว ภาพแอปยังใช้สีจริงของโปรดักต์ได้ ส่วนฉากแดงและ motion ของพอร์ตจะปรับระดับความเด่นตามหน้าที่ ไม่เปลี่ยนธีมทั้งเว็บโดยอัตโนมัติ

## หลักฐานและขอบเขต

- ตรวจทั้ง 7 route: ModeNote, Hermes, FreeFlow, Veluma, Keshi, Zucchini และ Decrypt จาก active renderer จริง
- เปิดภาพปกที่ใช้อยู่ทั้ง 7 ภาพ; ตรวจภาพหน้าจอและ media source ที่นำมาเล่าเรื่อง
- เก็บภาพหน้าเต็มและ section ของ project details ที่ 1440×1000, normal motion พร้อม Gallery, Experience, Stack, Contact
- ตรวจ mobile 390×844 และ reduced motion แบบมีขอบเขต; รายละเอียดอยู่ใน evidence files ด้านล่าง
- ตรวจพฤติกรรม Hermes selectors, media lightbox, menu, และ layout ที่มีอาการ ไม่ได้อาศัยเพียง detector
- การรีวิวความสวยงามเป็นการประเมินโดยอิง brief; ข้อบกพร่องที่พิสูจน์ได้แยกไว้ต่างหาก
- ข้อมูลว่าภาพถูก generate มาจากผู้ใช้ เหตุผลในการเปลี่ยนภาพด้านล่างอิงองค์ประกอบและความสัมพันธ์กับงาน ไม่ได้ตัดสินคุณภาพจากเครื่องมือที่ใช้สร้าง
- ไม่ได้ตรวจ live product ทุกตัวหรือรับรอง claims ทั้งหมดใหม่ คำอธิบายฟีเจอร์ยึดข้อมูลและหลักฐานในพอร์ต ณ วันที่รีวิว
- ไม่มีการแก้ UI, เปลี่ยนภาพปก, เปลี่ยนสิทธิ์เข้าถึง, commit, push หรือ deploy ในรอบนี้

ภาพเปรียบเทียบ:

- [ปกปัจจุบันทั้ง 7 งาน](../../output/design-review-2026-09-05/cover-board.png)
- [หน้าเปิด project details ทั้ง 7 งาน](../../output/design-review-2026-09-05/detail-board.png)
- [Gallery / Experience / Stack / Contact](../../output/design-review-2026-09-05/overall-board.png)

## 1. อะไรทำให้ Keshi เป็น reference ที่เหมาะ

| สิ่งที่เห็น | เหตุผลที่ได้ผล | สิ่งที่ควรนำไปใช้กับงานอื่น |
|---|---|---|
| ภาพ timer / scrapbook เป็นตัวเปิด | คนดูเห็นโปรดักต์และอารมณ์ก่อนคำอธิบาย | ใช้หน้าจอหรือชิ้นงานจริงที่เป็นเอกลักษณ์เป็น hero |
| ข้อความขาวและกรอบที่สงบ | การเน้นเกิดจากตำแหน่ง ขนาด และพื้นที่ | ใช้ลำดับตัวอักษรเดียวกัน ไม่ต้องมีสีประจำหัวข้อ |
| Focus → Relax | เข้าใจจากคู่สถานะและความเปลี่ยนแปลง | เลือกพฤติกรรมหนึ่งอย่างที่มองเห็นแล้วเข้าใจได้ |
| Theme / Settings / Discipline มาจากแอปเดียวกัน | ภาพหลายชิ้นมีความต่อเนื่อง | แต่ละบทควรใช้ context เดียวกัน เช่น session/job/project เดียว |
| ไดอะแกรมผูกกับ session และข้อมูล | สื่อระบบที่อยู่หลังภาพหน้าจอ | ใช้ diagram เฉพาะสิ่งที่ screenshot อธิบายไม่ได้ |

สิ่งที่ไม่ควรคัดลอกทั้งดุ้น: scrapbook เป็น identity ของ Keshi; loop แบบ Hermes ไม่เหมาะกับทุกงาน; จำนวนบท ความสูงหน้า และตำแหน่งสื่อไม่จำเป็นต้องเท่ากันทั้งหมด

## 2. ปัญหาพื้นฐานที่ต้องแก้ก่อนแต่งภาพเพิ่ม

### F1 — Reduced motion ใช้ปก ModeNote เป็นฉากหลังของงานอื่น · P1

`Hero.css:207` กำหนดภาพ ModeNote ให้ `.gallery-scene` ทั่วไป เมื่อปิด motion, WebGL หยุดแต่ภาพนี้ยังอยู่หลังหน้าโปรเจกต์อื่น เห็นชื่อ ModeNote และรูป workspace ซ้อนกับ Hermes / FreeFlow / Keshi

แผน: แยก static fallback ของ gallery และ document routes ให้หน้า detail ใช้ฉากกลางที่สงบและไม่มีแบรนด์ของโปรเจกต์อื่น; มี project index ที่ใช้ได้แม้ไม่มี WebGL

เกณฑ์ผ่าน: เปิดทุก route ด้วย reduced motion แล้วชื่อ/ภาพของอีกโปรเจกต์ไม่ปรากฏด้านหลัง; เนื้อหาและการเลือกงานยังครบ

### F2 — Decrypt มี grid เก่าทำให้ outcome diagram แตก · P1

`.case-decrypt-outcomes` ยังมี `grid-area: outcomes` ที่ `ProjectDetailsStories.css:2018` แต่ composition ใหม่ที่ `:3435` ไม่ได้ประกาศพื้นที่นี้ เกิด implicit columns; มือถือทำให้ trigger เหลือกว้างประมาณ 39px และถูก burn card ทับ ส่วน desktop มีช่องว่างขนาดใหญ่และผลลัพธ์อยู่ผิดแนว

แผน: ทำ layout trigger → burn → outcome split ใหม่ใน scope ของ diagram นี้; mobile เป็นลำดับแนวตั้งพร้อมเส้นแตกแขนงที่อ่านได้

เกณฑ์ผ่าน: ไม่มี node ทับกันที่ 390px และ 1440px; อ่านเส้นทางจนถึงผลลัพธ์ได้โดยไม่ต้องอนุมานจากช่องว่าง

### F3 — Menu ปิดใน state แต่ยังแสดงเมื่อ focus ค้าง · P2

`Navigation.jsx:49` ปิด React state ด้วย Escape แต่ `Navigation.css:267` ใช้ `:focus-within` เปิด panel ด้วย จึงพบ `aria-expanded=false` ขณะ panel ยังมองเห็น; มือถือแตะ MENU ซ้ำแล้วมีอาการเดียวกัน การนำทางยังทำงาน ไม่ได้เสียทั้งหมด

แผน: ให้ visual state และ accessibility state ใช้ตรรกะเดียวกัน; จำกัด hover ตามอุปกรณ์; จัดการ focus หลังปิด; MENU บนเนื้อหาควรมีพื้นที่อ่านชัดและไม่ทับป้ายสำคัญ

### F4 — Hermes มีเส้น/คำอธิบายถูกกล่องบัง · P2

คำว่า `ask in context` และเส้น return บางช่วงอยู่หลัง Command surface จากตำแหน่งและ z-index; คำอธิบายเส้นอยู่ราว 8.5–8.6px และ context captions บนมือถือบางส่วน 8px

แผน: กันพื้นที่สำหรับ connector label จริง; ลด node ที่ผู้ชมต้องอ่านในครั้งแรก; ขยายข้อความที่มีหน้าที่อธิบายเป็นอย่างน้อยราว 12–14px ในขนาดที่ใช้งานจริง ไม่ใช่เพิ่ม font แล้วบีบแผนภาพเดิม

หลักฐานภาพ: [Decrypt mobile](../../output/design-review-2026-09-05/assessment-b-decrypt-mobile-resolution-viewport.png) · [Hermes diagram](../../output/design-review-2026-09-05/assessment-b-hermes-desktop-diagram.png)

## 3. ระบบดีไซน์ร่วมที่ควรวางก่อนปรับรายหน้า

### 3.1 สีและความเรียบหรู

- Heading: ขาว; body: เทาอ่อนอ่านได้; metadata: เทากลางที่ยังอ่านได้ ไม่ใช้การจางจนแทบหายเป็นเครื่องมือหลัก
- เส้นเชื่อม ไอคอนอธิบาย ลูกศร และ active states ใช้ขาว–เทา; state ต่างกันด้วยเส้นทึบ/ประ, label, shape หรือพื้นขาวกลับตัวอักษรดำ
- สีจริงใน screenshot/video คงไว้ เพราะเป็นหลักฐานและ identity ของแอป
- สีแดงเป็นฉากร่วมได้ แต่ในส่วนอ่าน diagram ควรลด contrast/รายละเอียดของ grid ให้เนื้อหามาก่อน; ทดลองบน surface ตัวอย่างก่อนใช้ทั้งหมด
- งด glow หลายสี, gradient text, sticker/chip สีที่ไม่มีความหมาย, การ์ด glass ซ้อนหลายชั้น และเส้นตกแต่งที่ไม่มี relationship
- ไม่จำเป็นต้องทำทุกกล่องเป็น glass; ใช้พื้นที่ว่างและเส้นบางก่อน แล้วใช้พื้นเมื่อจำเป็นต้องแยกข้อมูลจากฉาก
- ModeNote มีตัวแปรเหลือง/ส้ม/เขียวและใช้งานในเนื้อหาที่เรนเดอร์; Hermes และหลายหน้าขาวอยู่แล้ว จึงต้องแก้ตาม effective styles ไม่ไล่แทนทุกสีใน CSS โดยไม่ดูว่าถูก mount หรือไม่

### 3.2 Typography และจังหวะ

- คง Syne / Space Grotesk ที่เป็น incumbent identity ก่อน; ยังไม่มีเหตุผลให้เปลี่ยนฟอนต์ทั้งเว็บ
- ชื่อโปรเจกต์เด่นที่สุด แต่ต้องไม่ข้ามเข้าไปบังพื้นที่ภาพ; ตรวจ title ยาว เช่น Hermes และ Decrypt แยกจาก ModeNote/FreeFlow
- ลดการมีชื่อใหญ่ + thesis ใหญ่ + lede + role + chips ที่ล้วนเรียกร้องความสนใจใน hero เดียว
- แต่ละ section มี 1 heading, คำอธิบาย 0–2 ประโยคตามความจำเป็น, visual 1 ชิ้นที่เด่น, caption ที่ผูกกับสิ่งที่เห็น
- พื้นที่ว่างต้องสร้างจังหวะและแยกเรื่อง ไม่ใช่เว้นเท่ากันทุกบท หรือปล่อยให้เกิดเพราะ grid ผิด
- ใช้ uppercase/mono สำหรับดัชนีสั้น ไม่ใช้กับข้อความอธิบายยาว

### 3.3 ภาพกับไดอะแกรมมีหน้าที่ต่างกัน

| คำถามของคนดู | สื่อที่เหมาะ |
|---|---|
| แอปหน้าตาเป็นอย่างไร | Screenshot/crop จริง |
| กดแล้วอะไรเปลี่ยน | คลิปสั้นหรือ 2–3 frames ที่ต่อกัน |
| ข้อมูลเดินไปไหน/อะไรเป็นเจ้าของ state | Diagram มี node และลูกศรพร้อมกริยา |
| ทำไมเลือกวิธีนี้ | Decision note ใกล้แผนภาพ พร้อมข้อแลกเปลี่ยนสั้น ๆ |
| สิ่งที่ผมทำเองคือส่วนใด | Ownership annotation ที่ผูกกับภาพระบบหรือหน้าจอ |

Diagram ที่ดีไม่ใช่ย่อหน้าในกล่อง: node ต้องเป็นสิ่งจริง เช่น session, invoice, process; เส้นต้องบอกความสัมพันธ์หรือการเปลี่ยนแปลง; แผนภาพหนึ่งมีทิศทางอ่านชัด; ทุก arrow ต้องตอบได้ว่า “ส่ง/อ่าน/บันทึก/กลับไปทำอะไร”

บนมือถือให้เปลี่ยน topology เป็นแนวตั้งหรือ sequence ที่มีความหมาย ไม่ย่อ desktop ทั้งผืน และไม่พึ่ง hover เพื่อดูความหมาย

### 3.4 เนื้อหาและหลักฐาน

- หนึ่ง claim ต่อหนึ่งบท; ลบประโยคที่ซ้ำกับ heading, chip หรือ caption ก่อนตัดรายละเอียดที่จำเป็น
- คำอย่าง `source of truth`, `bounded`, `evidence-aware`, `human-owned` ใช้ได้เมื่อผูกกับตัวอย่าง หลีกเลี่ยงการใช้แทนคำอธิบายพฤติกรรม
- ระบุชนิดสื่อให้ง่าย: `App capture`, `Recorded flow`, `Illustrative diagram`, `Simulated preview`, `Repository demo` เลือก label ที่ตรงความจริง
- อย่านำคำเตือน/ขอบเขตเดิมไปกล่าวซ้ำทุก section; รวมไว้ใกล้จุดที่อาจเข้าใจผิดและคง technical note เมื่อจำเป็น
- หน้าแรกต้องบอก product, role, contribution ที่มีหลักฐาน และมีภาพที่ทำให้เข้าใจผลลัพธ์
- หน้าสุดท้ายควรจบที่ผลลัพธ์/decision/lesson และงานที่เกี่ยวข้อง; stack เป็นรายละเอียดรอง
- การปิด live/repo ถูกทำไว้โดยตั้งใจใน shared `CaseActions`; รอบปรับดีไซน์ควรแทนปุ่ม disabled สองปุ่มด้วยข้อความสถานะกระชับและทางไปดู demo ภายในหน้า ไม่เปิดลิงก์ตาม metadata อัตโนมัติ

## 4. แผนรายโปรเจกต์

### 4.1 Keshi Pomodoro — รักษามาตรฐานและทำให้หลักฐานมาถึงเร็วขึ้น

**ภาพจำที่ต้องได้:** ช่วงเวลาโฟกัสที่มีบรรยากาศ และย้อนกลับมาดูสิ่งที่ทำจริงได้

ปัจจุบัน: Hero → Focus/Relax → Atmosphere/settings → Hermes loop → Discipline → Architecture; desktop สูงประมาณ 6058px ณ 1440×1000 ตัวเลขนี้ใช้เทียบลำดับ ไม่ใช่เพดานความยาว

| ส่วนปัจจุบัน | เก็บ/ปรับอย่างไร | Visual และคำอธิบายที่เสนอ |
|---|---|---|
| Hero | เก็บภาพ timer จริงและ typography; เติม ownership ที่หายไป | Timer เด่น + ประโยคเดียวที่บอกว่า focus ถูกบันทึกกลับมาดูได้ |
| Focus/Relax pair | เก็บ เป็นตัวอย่างสอง state ที่เข้าใจง่าย | วางสถานะคู่พร้อม label; ไม่ต้องมี paragraph อธิบายเรื่อง theme ซ้ำ |
| Atmosphere | ย้ายเป็นบทพักหลังเห็นหลักฐาน | Theme studio ภาพใหญ่หนึ่งภาพ; settings เป็น detail รอง ไม่ให้เท่ากันทุกชิ้น |
| Hermes rhythm | ย้ายหลัง Discipline และลดข้อความ | session → evidence → optional feedback → human choice; แยก capability ที่มีหลักฐานกับตัวอย่างประกอบ |
| Discipline | ดึงขึ้นทันทีหลัง interval | crop วันที่เลือก + habit/focus ที่ปรากฏจริง; caption อธิบาย mark ที่ชี้อยู่ |
| Architecture | รวมข้อมูลซ้ำกับ rhythm | แสดงเส้นทาง browser / agent → API → storage เฉพาะจุดที่ยังไม่อธิบาย; stack ย่อ |

**ลำดับใหม่:** Timer → Focus/Relax → สิ่งที่บันทึกใน Discipline → ปรับบรรยากาศ → ระบบเบื้องหลังและ feedback → ownership/lesson

**ปก:** เก็บ `main_page.webp` เป็นฐาน; เลือก crop ที่ timer กับคำ FOCUS ยังอ่านได้ตอนเป็น thumbnail; ใช้ frame เดียวที่นิ่ง ไม่เพิ่มสโลแกนบนภาพหรือมาสคอตใหม่

**ข้อสังเกตจากภาพ Discipline ปัจจุบัน:** วันที่เลือกในภาพแสดง “No focused learning time is recorded for this day.” จึงเป็นหลักฐานของหน้าตา dashboard แต่ยังไม่ใช่ภาพที่อธิบายการต่อจาก focus session ไปเป็นผลที่บันทึกได้ดี ควรเลือกวัน/ข้อมูลสาธิตที่มีเหตุการณ์จริงและได้รับอนุมัติให้ใช้ แล้วชี้ให้เห็น session ที่สัมพันธ์กัน ไม่เติมตัวเลขลงบนภาพให้ดูมีผลงาน

**เกณฑ์ผ่าน:** คนที่ดูเฉพาะภาพและหัวข้อเข้าใจทั้ง “ใช้โฟกัสอย่างไร” และ “ย้อนดูอะไรได้”; ไม่รู้สึกว่า Keshi เป็นเพียง demo ของ Hermes

Source: `ProjectDetails.jsx:1141–1578`, `ProjectDetailsStories.css:111` เป็นต้นไป

### 4.2 ModeNote — ให้ผลลัพธ์จากบทสนทนาเด่นกว่างานโฆษณา

**ภาพจำที่ต้องได้:** ข้อความจากการคุยหนึ่งช่วง กลายเป็น recap/สิ่งที่ต้องทำ และย้อนกลับไปหาแหล่งอ้างอิงได้

ปัจจุบัน: Poster → Problem → Before/during demos → Capture architecture → After/later demos → System summary → Stack; ประมาณ 6953px

**ปัญหาปก:** มี Note Buddy, หูฟัง/ไมค์, waveform, UI panel, tape, ลูกศร, สโลแกน และ workflow strip แข่งกันในภาพเดียว เห็นคำ “VOICE IN. CLARITY OUT.” มากกว่ารายละเอียดของ workspace และมันซ้ำหน้าที่กับ hero copy

| ส่วน | แผนปรับ | หลักฐาน/รูปแบบใหม่ |
|---|---|---|
| Hero/poster | ลดระดับสโลแกนและอุปกรณ์ประกอบ; เปิดด้วยผลลัพธ์จริง | Crop transcript กับ recap จาก session เดียว; Note Buddy เป็นลายเซ็นเล็กหนึ่งตำแหน่ง |
| Problem before/after | รวมเป็น visual transformation สั้น | Recording fragment → source-linked output; ไม่ต้องมีสองการ์ดข้อความยาว |
| Context setup | ลด prose/chips/closing sentence ที่ซ้ำ | clip ตั้งภาษาและ mode; caption 1 ประโยคบอกผลของการเลือก |
| Next-question loop | คงป้าย simulated preview; ลดน้ำหนักถ้าหลักฐานยังเป็น landing simulation | 1 transcript fragment + 1 suggestion; ให้เห็นบทบาทที่คนตัดสินใจ |
| Durable capture | เก็บเป็น signature engineering diagram | Microphone แตกสองทาง: live transcript / durable audio; แสดง live ขัดข้องแล้ว audio ยังอยู่ โดยไม่อ้างการทดสอบที่ยังไม่มี |
| Recap/search/export | ดึงขึ้นเป็นหลักฐานสำคัญก่อน technical architecture | คลิปกดจาก recap กลับ transcript หรือ crop ที่แสดงความเชื่อมโยงจากข้อมูลเดิม |
| Library | เป็นตอนจบของเรื่อง memory | ค้น session → เปิดกลับ context เดิม ในสอง frames |
| System/MCP/Stack | ลดการเล่า lifecycle ซ้ำกับด้านบน | รวม technical detail เป็นช่วงท้าย; MCP เป็น optional branch ระบุ read-only และข้อจำกัดครั้งเดียว |

**ลำดับใหม่:** ได้อะไรจากการคุย → ตั้ง context → คุย/คำถามเสริม → ย้อนตรวจหลักฐาน → ทำไมเสียงไม่ผูกกับ realtime → กลับมาใช้ session เดิม

**ปกที่แนะนำ:** พื้นสงบ + หน้าจอ workspace จริงเป็น subject ใหญ่ + Note Buddy เล็ก; title อยู่ใน DOM หรือ brand strip ของ collection; ตัด desk props และ decorative waveform ที่ไม่ได้อธิบายข้อมูลจริงออก

**สื่อที่มี:** 4 recorded/preview MP4 พร้อม JPG; ใช้ของเดิมก่อน การทำ “session เดียวต่อเนื่อง” ต้องตรวจว่าคลิปปัจจุบันต่อกันจริงหรือถ่ายใหม่เมื่อถึงรอบ implementation

**เกณฑ์ผ่าน:** เข้าใจว่า ModeNote ให้ผลลัพธ์อะไรภายในภาพแรก; 1 บทไม่พูด claim เดิมสามครั้ง; ตัวอักษรและเส้น UI ของ case study ไม่มีสีเหลือง/ส้ม/เขียว

ตรวจสีจาก DOM บนมือถือพบ text labels สีเหลือง 18 จุดจริง เช่น `The gap`, `Before`, `Under the session` จึงเป็นรายการแก้ที่มีอยู่บนหน้าปัจจุบัน ไม่ใช่เพียงตัวแปร CSS ที่ไม่ได้ใช้งาน

Source: active `ModeNoteLayout` ที่ `ProjectDetails.jsx:3557`; `ModeNoteDemoJourney:3464`, `ModeNoteCaptureArchitecture:3069`; `ProjectDetailsModeNoteStory.css`

### 4.3 Hermes Command Center — เปลี่ยนจากภาพเครื่องจักรเป็นเรื่องการใช้งานหนึ่งครั้ง

**ภาพจำที่ต้องได้:** ส่งคำขอในห้องที่ถูกต้อง → ระบบอ่านแหล่งข้อมูลที่เป็นเจ้าของเรื่อง → กลับมาพร้อมผลที่ตรวจได้

ปัจจุบัน: conceptual metal cover → interactive routing map → scheduler incident → tools/stack; ประมาณ 3414px

**ปัญหาปก:** เหล็ก วงแหวน ช่องอุปกรณ์ และสายต่อจำนวนมากสื่อ hardware/control appliance ทั้งที่ผลิตภัณฑ์อยู่ใน Discord รายละเอียด 3D กลายเป็นหลักฐานทางอารมณ์แทนพฤติกรรมจริง แม้มีป้าย conceptual แล้ว ภาพก็ยังสร้างความคาดหวังคนละแบบกับหน้าใช้งาน

| ส่วน | แผนปรับ | หลักฐาน/รูปแบบใหม่ |
|---|---|---|
| Hero | ย่อ thesis หลายบรรทัด; ให้เข้าใจว่าทำอะไรใน Discord | ข้อความหนึ่งคำขอ + สรุปหนึ่งผลลัพธ์บนฉากเรียบ |
| Cover | ออกแบบใหม่ตาม medium จริง | ถ้ามี approved sanitized capture ให้ใช้ห้องกับ response จริง; ระหว่างยังไม่มี ใช้ diagram เรียบที่เขียนชัดว่า illustrative |
| Context selector | ไม่ให้ผู้ชมเลือก 8 context และ 3 trigger ก่อนเข้าใจเรื่อง | เปิด Daily Ops ที่เล่าไว้ครบเป็น default; context อื่นเป็น explore เพิ่ม |
| Command map | แก้เส้นถูกบังและลดคำศัพท์ที่ซ้ำ | Request → skill → source → returned result; เมื่อเลือก write ค่อยเพิ่ม confirmation/read-back gate |
| Evidence chain | ผูกกับเหตุการณ์ตัวอย่างเดียว | Scheduled / Ran / Delivered / Verified เป็นสถานะคนละขั้น เห็นว่า evidence แต่ละชิ้นรองรับขั้นไหน |
| Scheduler incident | เก็บและขยายคุณค่าด้าน decision | Trace สั้น “งานถูกตั้งไว้ → ไม่มี delivery proof → เปลี่ยนเกณฑ์ตรวจ” พร้อม evidence ตามเอกสาร |
| Tools/stack | ลดรายการโลโก้และคำอธิบายฐานะต่าง ๆ | วางชื่อเครื่องมือตรง node ที่ทำหน้าที่จริง; รายการที่เหลือเป็น footnote |

**ลำดับใหม่:** หนึ่ง request → หนึ่ง complete route → ผลที่กลับมาและตรวจอย่างไร → สำรวจ context อื่น → failure ที่เปลี่ยนวิธีออกแบบ → ส่วนที่ทำเอง

**สื่อที่ขาด:** approved sanitized captures ของ flow จริง ไม่มี gallery ใน project metadata ปัจจุบัน; `docs/projects/hermes-command-center-source-of-truth.md` และ capture plan เป็นจุดตั้งต้น ไม่ใช้ภาพ Discord จำลองเป็นหลักฐานงานจริง

**เกณฑ์ผ่าน:** อ่าน default route ได้โดยไม่กดอะไร; ป้ายเส้นไม่ถูกบัง; กด context แล้วเข้าใจสิ่งที่เปลี่ยน; incident มีน้ำหนักมากกว่าปริมาณระบบที่เชื่อมต่อ

Source: `ProjectDetailsHermes.jsx:13`, `:43`, `:183`, `:402`; `ProjectDetailsHermes.css`

### 4.4 FreeFlow — ตามงานหนึ่งชิ้น และเห็น contribution ฝั่ง backend

**ภาพจำที่ต้องได้:** ลูกค้าหนึ่งคน งานหนึ่งงาน เอกสารและสถานะเงินไม่หลุดออกจากกัน

ปัจจุบัน: marketing cover → fragmented work → ops trail → workspace film → board film → LINE film → ownership → architecture; ประมาณ 4349px

**ปัญหาปก:** เป็นภาพ landing สีฟ้าพร้อม headline/button และ dashboard ภายใน พอใส่ในหน้า portfolio จึงกลายเป็นหน้าเว็บอีกหน้าซ้อนอยู่ในหน้าเว็บ; ไม่ทำให้เห็นชัดว่า backend ที่เจ้าของพอร์ตทำมีบทบาทตรงไหน

| ส่วน | แผนปรับ | Visual ที่เสนอ |
|---|---|---|
| Hero | ใช้ workspace จริง; วาง Backend Engineer + scoped contribution ให้เห็นเร็ว | หน้าข้อมูล job/client หรือ board ที่สะท้อนงาน ไม่ใช้ข้อความบน landing เป็น subject |
| Problem | รวมคำว่า scattered/split/lost trail ที่เล่าซ้ำ | แสดงข้อมูลจาก 3 จุดมาเชื่อมกับ job เดียว โดยใช้ข้อมูลตัวอย่างที่ระบุว่า illustrative หากยังไม่ได้ capture |
| Ops journey | เก็บเป็นแกนกลางของทั้งหน้า | Client → quote → project → invoice; สกรีนช็อตและ caption อ้าง record เดียวกันเมื่อมีหลักฐาน |
| Workspace + board | เชื่อมภาพกับขั้นของ journey | จัดคู่ “ทำงานอยู่ตรงไหน” กับ “ต้องติดตามอะไร” แทนสาม feature cards เท่ากัน |
| LINE intake | ลดเป็น branch ที่เข้าระบบ | LINE → client/job; คำอธิบายขอบเขตครั้งเดียว ไม่ซ้ำหลายหัวข้อ |
| Ownership | ย้ายสรุปขึ้นบนและคง deep section ท้าย | แสดง API/auth/org boundary ที่มีหลักฐาน; ไม่ให้ UI ทีมดูเหมือนผู้ใช้ทำทั้งหมด |
| Architecture | อธิบาย decision เด่นเพียงหนึ่งเส้นทาง | actor → org-scoped API → persisted record; เส้น auth/refresh ที่จำเป็นเท่านั้น |

**ปกที่แนะนำ:** crop product workspace จริงขนาดใหญ่ + strip เล็กของ record trail ขาว–เทา; โลโก้ FreeFlow รอง; ไม่เพิ่ม notification/chat bubble หลายแพลตฟอร์มจนชวนเข้าใจว่าเป็น multi-chat product

**สื่อที่มี/ขาด:** มี workspace, LINE, business board MP4; ถ้าจะเล่า quote → invoice ด้วย record เดียว ต้องตรวจการมีภาพจริงก่อน ไม่อ้างวิดีโอเดิมพิสูจน์ flow ที่ไม่ได้แสดง

**เกณฑ์ผ่าน:** เห็นทั้งประโยชน์ของโปรดักต์และส่วนที่ผู้ใช้ทำเอง; LINE เป็นทางเข้า; ผู้อ่านไม่ต้องไล่ข้อจำกัดเดิมหลายบท

Source: `ProjectDetails.jsx:2367–2680`; `ProjectDetailsFreeflow.css`

### 4.5 Veluma — พื้นที่ coding ที่มี mood และบุคลิกของคนใช้

**อัปเดตจากผู้สร้าง 5 กันยายน 2026:** ใช้ [creator vision](../projects/veluma-product-vision.md) เป็นหลัก. Veluma เกิดจากความต้องการให้ coding มีความเป็นมนุษย์ ความรู้สึก ชีวิต และสีสัน พร้อมแก้ CLI ที่กระจัดกระจายเป็น Project Canvas. ความเป็นระเบียบเป็นประโยชน์หนึ่ง การทำให้หน้าแห้ง/neutral หรือเน้น efficiency อย่างเดียวไม่ตรงเจตนา

**ภาพจำที่ต้องได้:** พื้นที่ coding ที่เป็นของเรา; tools/agents อยู่ร่วมกันในฉากของโปรเจกต์ และกลับมาเจอ arrangement เดิม; เริ่ม process เมื่อสั่ง Start

ปัจจุบัน: cover → shift diagram → return demo → pipeline → remaining demos → stack; ประมาณ 3275px ถือว่าใกล้แนวที่ต้องการกว่างานอื่นด้านความกระชับ

**ปัญหาปก:** ใช้ตัวหนังสือ VELUMA ใหญ่ สโลแกน เส้นแสง cyan และ pane ลอยดูเหมือน wallpaper โฆษณาเครื่องมือ developer; ภาพจริงของ desktop app ซึ่งมีเสน่ห์อยู่แล้วกลับมีขนาดเล็ก

| ส่วน | แผนปรับ | Visual ที่เสนอ |
|---|---|---|
| Hero | ใช้ A — Saved Canvas ที่เลือก พร้อม creator intent สั้น ๆ | Canvas จริงที่มี mood/สี/บุคลิก และ agent/tool icons คู่กับชื่อช่วยให้จำได้ |
| Shift diagram | รวม claim ที่ซ้ำกับ return demo | Before leaving → another project → restored scene ใช้ตำแหน่ง pane เดิม |
| Project return | เก็บเป็น signature proof | loop สั้นก่อน/หลังกลับ; ไม่ต้องเล่าด้วย paragraph อีกชุด |
| Explicit Start | แยก state สำคัญออกจาก persistence | Restored layout / processes stopped → Start → running; label เฉพาะที่มีหลักฐาน |
| Auto Tile | คู่กับภาพก่อนรก/หลังจัด | พฤติกรรมหนึ่งครั้งพิสูจน์ได้ชัดกว่า diagram ทั่วไป |
| Material/backdrop | ยกขึ้นใกล้ต้นเรื่อง เป็นหลักฐานของ emotional purpose | ภาพจริงที่แสดงว่าผู้ใช้เลือกบรรยากาศ/material/arrangement ของโปรเจกต์ได้ |
| Architecture | เสริมเท่าที่จำเป็น | project config ≠ process lifecycle; node-pty/IPC เกี่ยวตรงไหน โดยไม่สร้าง platform map ใหม่ทั้งหน้า |

**ปกที่เลือก:** A — Saved Canvas; พัฒนา mood จากฉากจริงและ recognizable agent/tool icons. คงสัดส่วนจริงของ UI และให้ pane map มีหน้าที่อธิบาย ไม่ทำสี/บรรยากาศหายเพื่อให้คลีนขึ้นอย่างเดียว

**สื่อและประสิทธิภาพ:** `project-return.gif` ประมาณ 21.76 MiB; เปลี่ยนการส่งสื่อเป็น MP4/WebM + still poster ในรอบปรับจริง โดยคงจังหวะและความคมของตัวอักษร มี play/pause หรือ equivalent control และเคารพ reduced motion; อย่าเปลี่ยนเพียงไฟล์โดยไม่ทดสอบ lightbox/wave path

**เกณฑ์ผ่าน:** ภาพก่อน/หลังพิสูจน์การกลับฉาก; เข้าใจว่า layout restoration ไม่เท่ากับสั่งรัน terminal; ภาพปกและภาพ demo ดูเป็นโปรดักต์เดียวกัน

Source: `ProjectDetails.jsx:806–991`; legacy internal name `MuxLayout` แต่ route/public name เป็น Veluma

### 4.6 Zucchini Review — เล่าเรื่องความเห็นต่อหนัง ไม่เล่าเหมือนระบบ enterprise

**ภาพจำที่ต้องได้:** ให้คะแนนหนังห้าด้าน แล้วดูคะแนนรวมพร้อมรีวิวที่สร้างมันขึ้นมา

ปัจจุบัน: homepage → workflow → review math loop → evidence → browser architecture → stack; ประมาณ 5069px มีข้อความราว 720 คำใน rendered capture รวมป้ายต่าง ๆ มากกว่าเคสอื่น แม้ตัวผลิตภัณฑ์อธิบายได้ง่ายกว่า

**ปัญหาปก:** ภาพ homepage จริงไม่ใช่ปัญหา AI แต่หนังและ artwork ใหญ่แย่งความสนใจจากตัว review system; ในปกเล็กแทบไม่รู้ว่ามีโมเดลคะแนน 5 แกน

| ส่วน | แผนปรับ | Visual ที่เสนอ |
|---|---|---|
| Hero | ลด decision paragraph ยาว; คง team/frontend identity | Title context หนึ่งเรื่อง + review result ที่เด่นขึ้น |
| Discovery workflow | ย่อเป็นบทนำสั้น | Search → open film สอง frame พอ ไม่ทำซ้ำเป็น diagram ใหญ่ |
| Review loop | ใช้ interaction เป็นหลัก | เปลี่ยนคะแนน 5 ด้าน → เขียนความเห็น → submit; ห้าบรรทัดคะแนนขาวบน case diagram |
| Aggregate | ผูกผลกับข้อมูลตัวอย่างชัด | input ratings → category means → overall; ตัวอย่างคำนวณที่ระบุว่า illustrative หากไม่ใช่ข้อมูลจริง |
| Evidence gallery | จัดลำดับ result → Reviewed/edit/delete | ขยาย crop ที่เห็นผลและปุ่ม; คง Repository demo / Live still ให้ตรงชนิดหลักฐาน |
| Identity/architecture | ย้ายเป็น technical note สั้นและตรง | Vue → TMDB; Vue → Supabase tables; Pinia/localStorage identity boundary ระบุครั้งเดียว |

**ลำดับใหม่:** เจอหนัง → ให้คะแนนและเขียน → เห็นผลกับรีวิว → กลับมาแก้ → สูตรและขอบเขตที่สำคัญ → contribution ในทีม

**ปกที่แนะนำ:** ภาพหนังหนึ่งเรื่องเป็น context รอง + แผงคะแนน/ข้อความรีวิวจริงเป็น subject; crop ที่สะอาดและมี margin ไม่สร้างโปสเตอร์หนังใหม่

**ต้องยืนยันก่อนเขียน copy ใหม่:** ผู้ใช้รับผิดชอบ feature ใดในทีม 5 คนโดยเฉพาะ; role “Frontend Developer” ในพอร์ตยังไม่พอให้สรุปว่าเป็นเจ้าของระบบทั้งหมด

**เกณฑ์ผ่าน:** อ่านภาพแล้วเข้าใจความพิเศษของ 5-axis review; คำว่า ordinary mean และ explicit user action ไม่ถูกเล่าซ้ำทุกบท; เห็นขอบเขต team contribution ชัด

Source: `ProjectDetails.jsx:1918–2288`

### 4.7 Decrypt The Secret Password — ให้เหตุการณ์ในเกมสร้างความน่าสนใจ

**ภาพจำที่ต้องได้:** พยายามทำรหัสผ่านให้ถูก แต่กฎ เวลา และ mutation ทำให้สิ่งที่เพิ่งแก้เปลี่ยนอีก

ปัจจุบัน: gameplay still → difficulty → validation/mutations → burn/outcome → manual → runtime; ประมาณ 5826px

**ปัญหาปก:** ภาพจริงเป็นหน้าแดงที่มีกฎเรียงยาว; เมื่ออยู่บนฉากพอร์ตแดงและย่อเล็ก จะเป็นบล็อกสีเดียวกับรายละเอียดที่อ่านไม่ออก ความตื่นเต้นของเกมเป็นสิ่งที่เกิดตามเวลา แต่ปกไม่ได้จับจังหวะนั้น

| ส่วน | แผนปรับ | Visual ที่เสนอ |
|---|---|---|
| Hero | ชื่อยาวต้องแบ่งบรรทัดให้มีจังหวะ; เพิ่ม ownership | crop password + time + กฎที่กำลังเปลี่ยน |
| Difficulty | เก็บข้อมูลจริง 10/11/12 rules และ 10:00/7:30/5:00 | comparison strip ขาวที่อ่านง่าย; ไม่ตีความระดับด้วยสี |
| Validation chamber | โฟกัสเหตุการณ์เดียว | edit → revalidate → rule status; ใช้ตัวอย่างที่ไม่สับสนกับ actual gameplay |
| Virus/fire/crown | ให้ state change พิสูจน์กลไก | 2–3 frames หรือคลิปจริงที่เห็น string ก่อน/หลัง mutation |
| Burn/outcome | แก้ layout F2 ก่อน; เป็นบทจบ | trigger → burn → victory/game-over; ใช้ภาพผลจริงถ้ามี มิฉะนั้นระบุ illustrative state diagram |
| Manual | ย้ายไปก่อน gameplay หรือเป็นข้อมูลเสริม | ไม่วางคู่มือหลังจุดจบจนเรื่องย้อนกลับไปเริ่ม |
| Architecture | ย่อเป็น local runtime | Vue state + interval clocks + rule checks; แสดง technical decision ที่ช่วยอ่านเกม |

**ปกที่แนะนำ:** หนึ่ง gameplay moment ที่ password, timer และกฎสำคัญอ่านได้; เว้นพื้นที่ขอบและใช้ภาพมืด/neutral frame คั่นกับฉากแดง ไม่เพิ่ม neon/hacker stock art

**สื่อที่ขาด:** ปัจจุบันมี stills gameplay/manual/mode ยังไม่มีวิดีโอเกมที่อยู่ใน gallery; ต้องถ่าย capture จริงก่อนอ้างว่า demo แสดง mutation หรือ verdict

**เกณฑ์ผ่าน:** คนดูรู้ว่าเกมยากเพราะอะไรจาก state ที่เปลี่ยน; outcome diagram อ่านได้ทั้งมือถือและ desktop; โปรเจกต์จบที่ผลลัพธ์ ไม่จบที่คู่มือ

Source: `ProjectDetails.jsx:1580–1916`; `ProjectDetailsStories.css:2018`, `:3435`

## 5. แผนภาพปกแบบ collection เดียวกัน

### หลักร่วม

1. แยกหน้าที่ **gallery cover / detail hero / evidence capture** ปัจจุบันหลายหน้าดึง `project.image` มาใช้ทั้งสามอย่างจนภาพเดียวแบกงานหลายหน้าที่
2. ทำ master cover ขนาดและ safe area เดียวกัน เช่น 1600×1000 เป็นจุดเริ่มทดลอง; hero ที่ต้องโชว์ UI ใช้สัดส่วนของภาพจริงได้ ไม่บังคับ crop จนข้อมูลหาย
3. หนึ่ง subject ใหญ่ + brand cue รองหนึ่งอย่าง; ตัวหนังสือหลักที่ต้องอ่านอยู่ใน DOM หรือ caption ภายนอกภาพ
4. ทุกปกต้องอ่าน silhouette ได้ที่ราว 240px และ 120px; ใช้ thumbnail contact sheet เทียบกันก่อนนำเข้าวง orbit
5. ความต่างมาจากโปรดักต์: voice/session, Discord route, job trail, terminal canvas, focus timer, review, password ไม่ใช่เปลี่ยนสี glow ของ template เดียว
6. แก้ปกทั้งหมดในรอบเดียวที่ระดับ composition ก่อนเก็บรายละเอียด เพื่อไม่ให้ปกใหม่หนึ่งงานยิ่งขัดกับปกเก่า
7. ไฟล์ที่อยู่จริงไม่เท่ากับหลักฐานที่ได้รับอนุมัติให้เผยแพร่; รอบผลิตภาพต้องใช้ approved media และสาธิตด้วยข้อมูลที่เหมาะสม

| งาน | การตัดสินใจ | Subject หลัก | ตัด/ลด |
|---|---|---|---|
| Keshi | เก็บฐานเดิม | Timer / Focus | ข้อมูลรองที่ทำให้ thumbnail แน่น |
| ModeNote | จัดองค์ประกอบใหม่ | Transcript + recap จริง, Buddy รอง | Props, slogan, tape, waveform ซ้ำหน้าที่ |
| Hermes | เปลี่ยนแนวปก | Request → source → response / approved Discord capture | เครื่องจักรโลหะและสายประดับ |
| FreeFlow | เปลี่ยน subject | Product workspace / job trail | Landing headline และปุ่มเว็บซ้อนเว็บ |
| Veluma | จัดองค์ประกอบใหม่ | Saved Canvas จริง | Cyan trail / marketing tagline |
| Zucchini | เปลี่ยน crop | Film + 5-axis review | Hero artwork ที่กลบ review UI |
| Decrypt | เลือก moment ใหม่ | Password + clock + mutation | ภาพทั้งหน้ายาวที่ย่อจนอ่านไม่ออก |

ไม่เริ่มด้วยการ generate ภาพใหม่อีกชุด เพราะสื่อจริงมีอยู่มากแล้ว งานหลักคือคัด moment, crop, สัดส่วน, margin, hierarchy และการจัดให้เป็น collection

## 6. ภาพรวมเว็บไซต์นอก project details

### Gallery

**เก็บ:** orbit/poster exhibition, ฉากแดง, ความรู้สึกว่าเดินเข้าโลกของเจ้าของงาน ทั้งหมดนี้เป็นจุดจำที่มีอยู่จริง

**ปรับ:** ตอนนี้ cover 5 งานที่ featured ถูกทำซ้ำบน cylinder ส่วน data มี 7 cases; label `SELECTED SYSTEMS / 24` ไม่บอกชัดว่า 24 หมายถึงอะไร อย่าใช้มันเป็นจำนวนงานหากไม่ได้ตั้งใจ ควรระบุ `5 featured projects` และมีทางไป `All 7 case studies` ที่ชัด หรือเปลี่ยน 24 เป็น edition label ที่อธิบายได้

**โครงใหม่ที่เสนอ:** identity มุมเดิม → orbit เป็นพระเอก → ชื่อ/ประเภทของงานที่ active อ่านได้ → `All projects` เปิด index สั้นที่เป็น DOM links → เข้า case ได้ด้วย keyboard และ reduced motion

เพิ่ม role/ประโยคแนะนำตัวสั้นพอให้รู้ว่าเจ้าของพอร์ตทำอะไร ไม่ต้องสร้าง conventional hero ที่แย่งพื้นที่จากแกลเลอรี

Zucchini/Decrypt เป็น active detail routes แต่ไม่ได้อยู่ใน cylinder ปัจจุบัน; ต้องมีทางค้นพบที่ใช้จริง ไม่อิงคอมเมนต์ “Projects archive” เพราะ `Projects` component ไม่ได้อยู่ใน route graph ที่ตรวจ

### Experience

**สิ่งที่ดี:** timeline, โลโก้องค์กร, factual work outcomes และ education มีข้อมูลจริง มีความน่าเชื่อถือกว่าข้อความแนวคุณสมบัติทั่วไป

**สิ่งที่ฉุด:** hero `NEW GRADUATE` และบล็อก Education ใช้พื้นที่เปิดมาก ทำให้ประสบการณ์ SCB/TTB ที่มีน้ำหนักลงไปอยู่ด้านล่าง; หลายช่วงเป็น text column ยาวและว่างอีกฝั่งมาก

**แผน:** เปิดด้วยชื่อหน้าและประโยค scope ของงาน → งานล่าสุด/งานที่เกี่ยวข้องเด่น → role cards แบบ editorial row ไม่ใช่การ์ดเท่ากันทุกใบ → Education กระชับท้ายหรือแถบข้าง

ต่อหนึ่งงานใช้ `บทบาท + ปัญหา + สิ่งที่ทำ + ผลที่มีหลักฐาน` โดยวาง outcome เด่นหนึ่งจุด; ถ้าไม่มี screenshot ที่เผยแพร่ได้ ใช้ diagram conceptual ของขอบเขตงานพร้อม label ไม่สร้างภาพระบบธนาคารปลอม

เก็บข้อความที่ต้องอธิบาย causal reasoning ไม่ลดให้เหลือคำโฆษณาเพียงเพื่อความสั้น

### Stack

**สิ่งที่ฉุด:** Domains / Practice / Position / Layers / Method อธิบายแนวคิดใกล้กันหลายครั้ง และใช้คำกว้าง เช่น operational truth, clarity under change; หน้าใช้พื้นที่มากกว่าข้อมูลใหม่ที่ผู้ชมได้รับ

**แผน:** คง 4 layers แต่ให้แต่ละ layer ผูกกับ 1–2 ตัวอย่างงานจริง: Interface → สิ่งที่สร้าง, Services → API/flow, Data → record/storage decision, Delivery → deployment/operations ที่มีหลักฐาน

แสดงชื่อ technology เป็นรองจากหน้าที่และลิงก์ไป case ที่ใช้จริง; ไม่เพิ่ม skill meters หรือเปอร์เซ็นต์ความเก่ง; เหลือ method note หนึ่งบทเฉพาะ decision ที่ชี้ให้เห็นได้

### Contact / Resume / CV

**สิ่งที่ฉุด:** Channels, Materials, Position และ footer พูดซ้ำว่าหน้านี้ใช้ติดต่อ และมีข้อความอธิบายเจตนาของการจัดหน้า เช่น “This room is for contact only — not a second experience or stack page.” คนดูไม่จำเป็นต้องอ่านเหตุผลเบื้องหลัง layout

**แผน:** email เด่นหนึ่งจุด → Resume / CV / GitHub → logistics สั้น → จบ ให้ action ที่สำคัญอยู่ใน viewport แรก

Resume/CV ต้องมี descriptor ที่บอกความต่างตามไฟล์จริงก่อนตั้ง label ใหม่; `/resume` และ `/cv` ตอนนี้ redirect มาหน้า contact จึงควรให้เมนูเขียน `Contact / Resume` หรือมี Resume PDF ทางตรงที่ชัด

ไม่ต้องเพิ่ม contact form เพราะ mailto และเอกสารมีอยู่แล้ว; ไม่ส่งอีเมลจากการทดสอบดีไซน์

### Loader, navigation และ motion

- Loader เป็น montage ที่มีบุคลิก แต่ source timeline ใช้ประมาณ 5.76s ก่อนขั้นจบของภาพเคลื่อนไหว และมี failsafe 7.2s; เวลาใช้งานจริงขึ้นกับ preload ด้วย ไม่ใช่ค่า performance benchmark
- ให้ฉากเปิดเต็มกับ Gallery และใช้ทางเข้าที่สั้นสำหรับ deep link ไป case เมื่อถึงรอบปรับจริง พร้อม skip ที่อ่านได้; ใครเปิดเคสจาก resume ควรได้เห็นเนื้อหาเร็ว
- คง wave ที่เป็นเอกลักษณ์แต่ให้ช่วย transition/นำสายตา; ไม่ให้ตัวอักษรสำคัญเคลื่อนจนอ่านยากหรือเส้น diagram เปลี่ยนความหมาย
- หน้าจบ project มี `Next relevant project` และ `Back to gallery`; ไม่จบด้วย stack แล้วปล่อยให้คนหาเมนูเอง
- Responsive ต้องตรวจ title wrapping, labels, connector crossings, media lightbox และ fixed menu พร้อมกัน; ไม่มี horizontal overflow ไม่ได้แปลว่าไม่มี overlap

### สิ่งที่ mobile แสดงชัดเป็นพิเศษ

ที่ 390×844 หน้า ModeNote และ Zucchini ใช้เกือบทั้ง viewport แรกกับ metadata, ชื่อ, thesis, ย่อหน้า และสถานะลิงก์ ก่อนภาพโปรดักต์จะเริ่มปรากฏบริเวณล่าง หน้า Contact แสดงรายการชื่อช่องทางที่ยังไม่ใช่ action ก่อนถึง Materials ที่คลิกได้จริง

แผน: mobile hero ใช้ชื่อ + คำอธิบายสั้น + ภาพก่อน แล้วค่อย role/status/detail ที่เหลือ; ลดระยะและ metadata ที่ซ้ำในส่วนเปิด; Contact นำ email/PDF ที่คลิกได้ขึ้นมาแทนการบอกชื่อช่องทางเฉย ๆ ไม่ต้องย่อ desktop ทุกชิ้นตามสัดส่วน

หลักฐาน: [ภาพเปิดมือถือ 4 หน้า](../../output/design-review-2026-09-05/mobile-board.png) · [ตัวอย่าง section ปัจจุบัน](../../output/design-review-2026-09-05/story-board.png)

## 7. โครงสร้างโค้ดที่จะช่วยให้คุมดีไซน์ได้ต่อเนื่อง

นี่เป็นแผนรองรับงานดีไซน์ ไม่ใช่คำแนะนำให้ rewrite ทั้งระบบก่อนเห็นตัวอย่างที่ชอบ

ปัจจุบัน `ProjectDetails.jsx` มีประมาณ 3710 บรรทัด และ `ProjectDetailsStories.css` ประมาณ 4463 บรรทัด รวม shared components, data, หลาย renderer และ legacy definitions ทำให้มีโอกาส override ข้ามงาน เช่น Decrypt grid ที่ตรวจพบ

โครงที่เสนอหลัง storyboard ชัด:

```text
src/components/project-details/
  shared/       # CaseShell, Heading, Media, EvidenceCaption, Ownership, EndNav
  keshi/        # composition + specific diagram + scoped styles
  modenote/
  hermes/
  freeflow/
  veluma/
  zucchini/
  decrypt/
src/data/projects/  # metadata + media provenance + cover/hero references
```

- Shared layer กำหนด type scale, spacing, text palette, media controls, caption grammar และ navigation
- แต่ละโปรเจกต์เป็น explicit composition ของตัวเอง ไม่สร้าง generic page-builder ที่ทุกเรื่องกลายเป็นรายการ cards
- แยก `cover`, `heroMedia`, `evidenceMedia` และ `featured` ให้ชัด; gallery derive จากแหล่งข้อมูลเดียว ป้องกันภาพใหม่ใน detail แต่ภาพเก่ายังค้างใน `GalleryScene.jsx`
- Evidence record เก็บ kind/caption/แหล่งที่มา/ข้อจำกัดที่จำเป็น; ลดการใช้ตำแหน่ง gallery index เป็นความหมายของเรื่องเพียงอย่างเดียว
- แยก access state ออกจากการมี URL; ดีไซน์อ่านสถานะที่ตั้งใจไว้ ไม่สรุปว่า URL มีอยู่จึงต้องทำให้คลิกได้
- ใช้ tokens ของ detail neutral palette ใน scope เดียวกัน หลีกเลี่ยง CSS patch ท้ายไฟล์ที่ไป neutralize selector เก่าจำนวนมาก
- ตรวจ import/route graph ก่อนลบ legacy code; ห้ามจัดการ VCR/Persona/Projects ที่ไม่ใช่หน้าปัจจุบันเพียงเพราะ detector เจอชื่อ
- ย้ายทีละ case และตรวจหน้าตาก่อน/หลัง; ไม่ทำ refactor เจ็ดหน้าพร้อมเปลี่ยนภาพ/เนื้อหาจนหาสาเหตุ regression ไม่ได้

## 8. แผน execute แยกเฟส — ใช้แทนลำดับรอบเดิม

| เฟส | งาน | หน่วยที่หยุดตรวจได้ |
|---|---|---|
| 0 | แก้พื้นฐาน F1–F4 | ทีละอาการ: backdrop, Decrypt grid, menu, Hermes connectors |
| 1 | ออกแบบแนวปก | 1.1 FreeFlow / 1.2 ModeNote previews |
| 2 | ผลิตและเชื่อมภาพปก | Shared metadata แล้วทีละโปรเจกต์ |
| 3 | Project Details | Shared primitives แล้วทีละโปรเจกต์ เริ่ม ModeNote |
| 4 | ส่วนอื่นของเว็บ | Gallery / Experience / Stack / Contact แยกหน่วย |
| 5 | Motion และ media | Entrance/transition และ media แยกหน่วย |
| 6 | ตรวจรับรวม | ตรวจเฉพาะชุดที่เลือก implement และแยกงาน deferred |

ดู [Phase map และ specs รายเฟส](implementation/README.md) สำหรับ prerequisites, targets, outputs, acceptance, statuses และกติกาหยุดงาน ข้อมูลภาพ/ownership เตรียมตามหน่วยที่ใช้ ไม่ต้องรอหลักฐานครบทุกโปรเจกต์จึงเริ่มงานได้ ปกและ detail แยก execution: เลือกปรับ detail ก่อนได้โดยใช้ hero เดิมระหว่างรอ cover

## 9. เกณฑ์รับงานดีไซน์

- ดูภาพและหัวข้อเป็นเวลา 10–15 วินาทีแล้วบอกได้ว่าโปรดักต์ทำอะไร และอะไรคือจุดเด่นหนึ่งอย่างของมัน
- แต่ละ section เพิ่มหลักฐานหรือความสัมพันธ์ใหม่; ไม่มี section ที่คงไว้เพียงเพราะหน้าตาดูเต็ม
- สีของข้อความและ diagram annotations เป็น neutral; screenshot/video คงสีโปรดักต์
- ปกไม่มีสโลแกน/label ยิบย่อยที่ต้องซูมเพื่ออ่าน; เห็นความสัมพันธ์กับโปรดักต์จริงทันที
- เส้น diagram ไม่ทะลุคำ/กล่อง; ทุก node ที่จำเป็นอ่านได้บนมือถือ; มี semantic order
- รูปขยายได้ ใช้ keyboard ปิดได้ คืน focus ได้; motion media ไม่บังคับคนที่ตั้ง reduced motion
- ชนิด evidence และ ownership ถูกต้อง; ไม่เปิด live/repo ที่ตั้ง private จากการเปลี่ยนดีไซน์
- ทดสอบ 1440, notebook 1280/1366, 768, 390 และ 320px รวม short landscape/reduced motion ตามความเปลี่ยนแปลงจริง
- ตรวจสี contrast จากภาพที่ composite กับพื้นหลังจริง; ไม่ใช้ ratio ของ detector ที่อ่าน transparent background ผิดเป็นหลักฐานผ่าน/ตก
- หลังย้ายโค้ดหรือแก้ component ให้ build/lint ตาม repo และตรวจ user flow ที่กระทบ; ไม่เขียน unit tests เลียนแบบ CSS เพื่อวัดรสนิยม

## 10. คะแนนและสัญญาณประกอบ

คะแนน heuristic เป็นการประเมิน UX ของพอร์ตตามหลักฐานที่ตรวจ ไม่ใช่คะแนนคุณค่าผลงานหรือความสวยงามส่วนบุคคล

| Heuristic | /4 | เหตุผล |
|---|---:|---|
| Visibility of status | 3 | มี case number, provenance, private/maintenance และ Hermes state |
| Match to real world | 2 | พฤติกรรมจริงถูกแทรกด้วยคำศัพท์เชิงระบบ/คำอธิบายซ้ำ |
| User control/freedom | 2 | Lightbox ดี แต่ MENU visual state ปิดไม่ตรง state และไม่มี onward case navigation |
| Consistency | 2 | พื้นร่วมมีแล้ว แต่ typography/content density และ fallback ยังไม่สม่ำเสมอ |
| Error prevention | 3 | คง private actions และ evidence labels ไว้ |
| Recognition over recall | 2 | หลักฐานบางจุดอยู่ห่าง claim และต้องจำศัพท์ก่อนเห็นตัวอย่าง |
| Flexibility/efficiency | n/a | Experience portfolio; navigation ประเมินในข้ออื่น |
| Aesthetic/minimalist | 2 | บุคลิกชัด แต่มี decorative overload และ repeated explanation |
| Error recovery | 3 | มี not-found/back; media failure ไม่ได้ตรวจครบ |
| Help/documentation | n/a | ไม่จำเป็นต้องมีระบบเอกสารช่วยใช้พอร์ต |
| **รวม** | **19/32** | **เกณฑ์ตั้งต้นสำหรับ scope นี้ ไม่เทียบกับ score คนละชุดหน้าตรวจโดยตรง** |

Design specificity: **มีความเป็นเจ้าของงานชัด แต่คุณภาพการคัดภาพและการตัดเนื้อหายังไม่สม่ำเสมอ** ควรแก้ด้วย editing และ composition โดยรักษาความเฉพาะของแต่ละผลิตภัณฑ์

Cognitive load: กลุ่มที่ควรลดก่อนคือ Hermes initial choice (8 contexts + 3 modes), claim/chips/paragraph ที่ซ้ำใน ModeNote/FreeFlow/Zucchini, และ background ที่รบกวนใน reduced motion จำนวนคำและจำนวน node เพียงอย่างเดียวไม่ใช่หลักฐานว่าหน้าแย่

Emotional journey: จุดเปิดจำได้จากงานภาพ แต่ความสนใจตกช่วงคำอธิบายซ้ำ และหลายหน้าจบที่ stack list; ปรับให้ยอดของเรื่องอยู่ที่ผลลัพธ์จริงหรือ decision ของคนทำ

Persona risks: ผู้ประเมินทั่วไปอาจเข้าใจบุคลิกแต่ไม่เข้าใจ product/ownership; technical interviewer อาจเห็น diagram มากกว่าหลักฐานที่ตรวจต่อได้; mobile reader เจอ label เล็กและบาง diagram ทับกัน

## 11. Detector, ข้อจำกัด และบันทึกการตรวจ

CLI detector พบ 6 warnings จาก 4 rule types: side-tab 2, broken-image 1, layout-transition 1, overused-font 2; ส่วนใหญ่เป็น inactive/legacy components หรือ false positive (`<img>` ใน comment) ไม่ใช่หกข้อบกพร่องบนหน้าที่ผู้ใช้ดู

Browser detector มี raw signals 93 รายการรวม Hermes/FreeFlow/Decrypt; ไม่ถือเป็น 93 defects โดยเฉพาะ contrast ที่อ่านพื้นโปร่งใสผิดและ stylesheet rules ที่ไม่ได้ถูกใช้อยู่จริง รายงานนี้จึงยึด rendered evidence และ trace source ของปัญหาจริง

สิ่งที่ตรวจผ่านแบบมีขอบเขต: ไม่มี uncaught page/console errors ใน visits ของ B, ไม่พบ broken loaded images หรือ page-level horizontal overflow ใน views ที่ B ตรวจ, FreeFlow mobile journey รักษาลำดับ, Hermes selectors ทำงาน, lightbox focus trap/Escape/return focus ทำงาน, reduced motion หยุด animation ได้แต่ fallback ผิดภาพ

ยังไม่ใช่ full WCAG/performance audit; ไม่ได้ตรวจ Safari/iOS, actual screen reader, ทุก zoom, network throttling หรือ claims ของ live products ทั้งหมด

หลักฐานเก็บใน `output/design-review-2026-09-05/`: `rendered.json`, ภาพแต่ละ route/section, `assessment-a.md`, `assessment-b.md`, `assessment-b-*.json`, `mobile-and-palette.json` และ capture scripts

Run notes: target slug `src-components-projectdetails-jsx`; ignore list ไม่พบ; A/B แยก context และไม่เห็นผลกันก่อนสังเคราะห์; A รอบแรกเกิดข้อจำกัดขนาดบริบทภาพ จึงมี replacement A ที่จบสมบูรณ์; detector CLI รันจริง exit 2; browser ใช้ isolated headless Chromium ไม่ควบคุม Chrome ของผู้ใช้; detector overlay อยู่เฉพาะ headless tabs ไม่ได้เปิดให้ผู้ใช้เห็น; ไม่มี detector server ค้าง; browser ที่ใช้ตรวจปิดแล้ว; dev server ของผู้ใช้ยังเปิดตามคำขอก่อนหน้า; screenshot/scripts เป็น review artifacts ที่ตั้งใจเก็บ

Questions skipped: ผู้ใช้กำหนด reference, palette, สิ่งที่ต้องเน้น และขอบเขต planning-only ชัดแล้ว จึงไม่ต้องถามซ้ำเพื่อทำแผนนี้ให้เสร็จ ข้อเท็จจริงด้าน media/ownership ที่ยังขาดถูกระบุเป็น dependency ของขั้นผลิตงาน ไม่ถูกเดาขึ้นมา
