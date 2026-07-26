# หารเท่า.ai (HarnTao) — AI Personal Finance Tracker

**Hackathon Demo MVP** — AI Agent ช่วยนักศึกษาบริหารจัดการเงินและติดตาม Subscription ผ่านระบบแชท

## Tech Stack

| Technology | Usage |
|-----------|-------|
| React 19 | UI Library |
| Vite 8 | Build Tool |
| TypeScript | Language |
| Tailwind CSS v4 | Styling |
| shadcn/ui (style) | Design System |
| Framer Motion | Animation |
| Zustand | State Management |
| Lucide React | Icons |
| Recharts | Charts |

## Design System

- **Primary Color:** `#1431ff`
- **Font:** Kanit (Google Fonts)
- **Vibe:** Minimal, Modern, Mobile-first
- **Layout:** Bottom Navigation (Mobile) / Sidebar (Desktop)

## วิธีรัน

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## หน้าจอ

1. **Dashboard** — เงินคงเหลือ, การแจ้งเตือน, สัดส่วนค่าใช้จ่าย
2. **Chat** — AI Agent (พิมพ์ "กินข้าว 60", "เงินจะหมดแล้ว", "sub", "ใช้เงินเปลือง")
3. **Subscriptions** — จัดการ Subscription + Toggle เปิด/ปิด

## วิธี Build

```bash
npm run build    # → dist/
npm run preview  # Preview build
```

## Deploy (Cloudflare Pages)

```bash
npx wrangler pages deploy dist --project-name=finmate
```

---

## 🎯 Hackathon Demo Script

### 1. เปิดแอป → Dashboard (30 วินาที)

> "นี่คือหน้า Dashboard ของ **หารเท่า.ai** — AI Agent ที่ช่วยนักศึกษาบริหารเงินโดยเฉพาะ"
>
> "เห็นตัวเลขยอดคงเหลือ 4,500 บาท และมีการแจ้งเตือน **⚠️ พรุ่งนี้มีตัดค่า Netflix 419 บาท**"
>
> "ด้านล่างเป็นกราฟสัดส่วนค่าใช้จ่ายที่แบ่งตามหมวด"

### 2. ไปที่แชท → โมเมนต์สำคัญ (1 นาที)

> "หัวใจของแอปคือ **Chat AI Agent** — เราโหลดบทสนทนาตัวอย่างไว้..."
>
> (ชี้ที่ข้อความ AI ที่ตอบกลับว่า Netflix ใกล้ตัด)
>
> "AI เช็กพบว่าผู้ใช้ไม่ได้เปิด Netflix มา 2 เดือนแล้ว เลยแนะนำให้ยกเลิก"
>
> (กดปุ่ม **"[ยกเลิก Netflix]"**)
>
> "กดปุ่มเดียว — ระบบยกเลิกทันที พร้อม Animation เด้ง และ **อัพเดทยอดเงินเหลือ 4,919 บาท** (คืน 419 บาท)"
>
> "AI ตอบกลับ: 'ยกเลิกเรียบร้อย! คุณมีเงินเหลือไปกินหมูกระทะเพิ่มอีก 419 บาท!'"

### 3. ทดสอบพิมพ์รายจ่าย (30 วินาที)

> "ลองพิมพ์ 'กินข้าว 60' → AI บันทึกและหักเงินทันที!"
>
> "พิมพ์ 'เงินจะหมดแล้ว' → เช็คสถานะ + Subscription ที่ใกล้ถึงกำหนด"
>
> "พิมพ์ 'ใช้เงินเปลือง' → วิเคราะห์ว่าหมวดไหนใช้เงินเยอะสุด พร้อมคำแนะนำ"

### 4. หน้า Subscription (30 วินาที)

> "หน้านี้รวมทุก Subscription ที่สมัครไว้ — Netflix 419฿, Spotify 139฿, ChatGPT 750฿"
>
> "มี Toggle สีฟ้า/แดงกดเปิด-ปิดได้ทันที สะท้อนไปที่ยอดรวมด้านบน"
>
> "รวม 5 รายการ 1,566 บาท/เดือน — คิดเป็น 13% ของรายรับ"

### 5. ปิด (30 วินาที)

> "สิ่งที่ทำให้ **หารเท่า.ai** ต่างจากแอปการเงินทั่วไป:
> - **AI Agent** คุยภาษาคน — ไม่ต้องกดเมนู ใช้คำสั่งธรรมชาติ
> - **Subscription Hunter** — หาแอปที่ไม่ได้ใช้ให้ยกเลิกโดยเฉพาะ
> - **Mobile-first** — ออกแบบมาให้นักศึกษาใช้บนมือถือโดยเฉพาะ
>
> Tech Stack: React + TypeScript + Tailwind CSS + Framer Motion + Zustand
>
> **ขอบคุณครับ! 🙏**"
