# 🌱 Wellness Backend — คู่มือฉบับเข้าใจง่าย

โปรเจกต์นี้คือ **หลังบ้าน (backend)** ที่เขียนด้วย [Hono](https://hono.dev)
รันได้ 2 ที่จากโค้ดชุดเดียวกัน:

- ☁️ **Cloudflare Workers** — ใช้ D1 (ฐานข้อมูล) และ KV (ที่เก็บแคช)
- 🟠 **AWS Lambda** — ใช้ที่เก็บข้อมูลแบบชั่วคราวไปก่อน (เปลี่ยนทีหลังได้)

---

## 🍜 นึกภาพว่าโค้ดนี้คือ "ร้านก๋วยเตี๋ยว"

โค้ดถูกแบ่งเป็นชั้น ๆ แต่ละชั้นมีหน้าที่เดียว เหมือนคนในร้านก๋วยเตี๋ยว:

| ในร้านก๋วยเตี๋ยว | ในโค้ด | หน้าที่ |
| --- | --- | --- |
| 🚪 ป้ายหน้าร้าน | `router` | บอกว่าเมนูอะไรสั่งได้บ้าง (มี URL อะไรบ้าง) |
| 🤵 พนักงานเสิร์ฟ | `handler` | รับออเดอร์จากลูกค้า ส่งให้ครัว แล้วยกอาหารมาเสิร์ฟ |
| 👨‍🍳 พ่อครัว | `service` | ทำอาหารตามสูตร (business logic) — ตรวจว่าวัตถุดิบถูกต้องไหม |
| 📦 คนดูแลคลัง | `repository` | หยิบ/เก็บวัตถุดิบ (ข้อมูล) ให้พ่อครัว |
| 🏬 ตัวคลังสินค้า | `infrastructure` | คลังจริง ๆ — จะเป็น D1, KV หรือกล่องในความจำก็ได้ |

**กฎเหล็กของร้าน:** พ่อครัว (service) ไม่สนใจว่าคลังอยู่ที่ไหน
แค่ตะโกนว่า "ขอเส้นหมี่!" คนดูแลคลัง (repository) จะไปหยิบมาให้เอง
เพราะงั้นถ้าวันหนึ่งย้ายคลังจาก D1 ไป DynamoDB **พ่อครัวไม่ต้องเรียนสูตรใหม่เลย** 🎉

---

## 📁 ไฟล์อะไรอยู่ตรงไหน

```
src/
├── domain/            🧠 กฎของร้าน (ไม่ผูกกับเทคโนโลยีใด ๆ)
│   ├── entities/         → หน้าตาของข้อมูล เช่น User มี id, email, name
│   ├── errors.ts         → ข้อผิดพลาดที่เป็นไปได้ เช่น "หาไม่เจอ" "ข้อมูลซ้ำ"
│   └── repositories/     → "สัญญา" ว่าคลังต้องหยิบ/เก็บอะไรได้บ้าง (interface)
│
├── infrastructure/    🏬 คลังจริง ๆ แต่ละแบบ
│   ├── d1/               → เก็บลงฐานข้อมูล D1 ของ Cloudflare
│   ├── kv/               → เก็บแคชลง KV ของ Cloudflare
│   └── memory/           → เก็บในความจำ (ไว้ทดสอบ หรือใช้บน Lambda)
│
├── services/          👨‍🍳 สูตรอาหาร — logic ทั้งหมดอยู่ที่นี่
├── handlers/          🤵 รับ request → เรียก service → ตอบกลับเป็น JSON
├── routers/           🚪 ประกาศ URL เช่น GET /users, POST /users
├── di/container.ts    🔌 จุดประกอบร่าง — จับทุกชั้นมาต่อกัน
│
├── app.ts             🏗️ โครงร้าน (ใช้ร่วมกันทุก runtime)
├── server.ts          ☁️ ประตูฝั่ง Cloudflare Workers
└── lambda.ts          🟠 ประตูฝั่ง AWS Lambda
```

ลำดับการไหลของ 1 request:

```
ลูกค้า → router → handler → service → repository → ฐานข้อมูล
                                                        ↓
ลูกค้า ← handler (แปลงเป็น JSON) ← service ← ข้อมูลที่หยิบมา
```

---

## 🚀 เริ่มรันบนเครื่องตัวเอง (3 ขั้นตอน)

> ต้องมี [Node.js](https://nodejs.org) เวอร์ชัน 20 ขึ้นไปก่อนนะ

```bash
# 1. ติดตั้งของที่ต้องใช้
npm install

# 2. สร้างตารางในฐานข้อมูล (บนเครื่องเราเอง ยังไม่แตะของจริง)
npm run db:migrate:local

# 3. เปิดร้าน!
npm run dev
```

เสร็จแล้วลองเปิด http://localhost:8787/health ถ้าเห็น `{"status":"ok"}` แปลว่าร้านเปิดแล้ว 🎊

---

## 🧪 ลองสั่งอาหารดู (เรียก API)

```bash
# ดูรายชื่อ user ทั้งหมด
curl http://localhost:8787/api/v1/users

# สร้าง user ใหม่
curl -X POST http://localhost:8787/api/v1/users \
  -H "content-type: application/json" \
  -d '{"email":"nong@example.com","name":"น้องใหม่"}'

# ดู user คนเดียว (เอา id จากคำตอบข้างบนมาใส่)
curl http://localhost:8787/api/v1/users/<id>

# แก้ชื่อ
curl -X PATCH http://localhost:8787/api/v1/users/<id> \
  -H "content-type: application/json" \
  -d '{"name":"ชื่อใหม่"}'

# ลบ
curl -X DELETE http://localhost:8787/api/v1/users/<id>
```

### 📖 ขี้เกียจพิมพ์ curl? เปิด "เมนูเล่มใหญ่" ดูเลย

เข้า **http://localhost:8788/docs** (หรือพอร์ตที่ `npm run dev` บอก)
จะเจอหน้าเว็บสวย ๆ (Scalar) ที่โชว์ทุก API พร้อมปุ่ม **ลองยิงได้จากหน้าเว็บเลย**
ไม่ต้องจำคำสั่ง curl สักตัว 🎉

- `/docs` → หน้าคู่มือ API แบบ interactive
- `/openapi.json` → ตัว spec ดิบ ๆ (เอาไปใช้กับ Postman หรือ generate client ได้)

เมนูเล่มนี้ **สร้างตัวเองอัตโนมัติ** จาก schema ที่ประกาศไว้ใน `src/schemas/`
เพิ่ม route ใหม่เมื่อไหร่ เมนูอัปเดตเองทันที

เมนูทั้งหมดของร้าน:

| Method | URL | ทำอะไร |
| --- | --- | --- |
| GET | `/health` | เช็กว่าร้านยังเปิดอยู่ไหม |
| GET | `/docs` | 📖 คู่มือ API แบบเปิดดูในเบราว์เซอร์ |
| GET | `/openapi.json` | OpenAPI spec (สำหรับเครื่องมืออื่น) |
| GET | `/api/v1/users` | ดู user ทั้งหมด |
| POST | `/api/v1/users` | สร้าง user ใหม่ |
| GET | `/api/v1/users/:id` | ดู user 1 คน (มีแคชผ่าน KV 5 นาที) |
| PATCH | `/api/v1/users/:id` | แก้ข้อมูล user |
| DELETE | `/api/v1/users/:id` | ลบ user |

---

## 🍳 อยากเพิ่มเมนูใหม่ (เพิ่ม resource เช่น `bookings`)

ทำตามลำดับนี้ทีละไฟล์ ไม่หลงแน่นอน:

1. **บอกหน้าตาข้อมูล** → สร้าง `src/domain/entities/booking.ts`
2. **เขียนสัญญากับคลัง** → สร้าง `src/domain/repositories/booking-repository.ts` (interface)
3. **สร้างคลังจริง** → สร้าง `src/infrastructure/d1/d1-booking-repository.ts`
4. **เขียนสูตรอาหาร** → สร้าง `src/services/booking-service.ts`
5. **จ้างพนักงานเสิร์ฟ** → สร้าง `src/handlers/booking-handler.ts`
6. **ติดป้ายเมนู** → สร้าง `src/schemas/booking-schemas.ts` (zod) + `src/routers/booking-router.ts` แล้วไปผูกใน `src/routers/index.ts`
7. **ประกอบร่าง** → เพิ่มใน `src/di/container.ts` และ `src/server.ts`
8. **สร้างตารางใหม่** → เพิ่มไฟล์ SQL ใน `migrations/` แล้วรัน `npm run db:migrate:local`

ดูไฟล์ของ `user` เป็นตัวอย่างได้เลย ทุกเมนูหน้าตาเหมือนกันหมด

---

## ☁️ พาร้านขึ้นออนไลน์ (Deploy)

### ครั้งแรก: สร้างที่อยู่บน Cloudflare ก่อน

```bash
npx wrangler d1 create wellness-db     # สร้างฐานข้อมูล
npx wrangler kv namespace create KV    # สร้างที่เก็บแคช
```

คำสั่งจะพ่น `id` ออกมา → เอาไปแทนที่ `<REPLACE_WITH_...>` ใน `wrangler.jsonc`

### หลังจากนั้น: ให้หุ่นยนต์ deploy ให้ (GitHub Actions)

ตั้งค่า Secrets ใน GitHub repo (Settings → Secrets and variables → Actions):

- `CLOUDFLARE_API_TOKEN` — กุญแจสำหรับ deploy (สร้างได้ที่ Cloudflare dashboard)
- `CLOUDFLARE_ACCOUNT_ID` — เลขบัญชี Cloudflare ของเรา

แค่ `git push` ขึ้น branch `main` หุ่นยนต์จะทำให้ครบ:
ตรวจโค้ด → build → อัปเดตตารางฐานข้อมูล → deploy 🤖

(อยาก deploy เองด้วยมือก็ได้: `npm run deploy`)

### แล้ว AWS Lambda ล่ะ?

```bash
npm run build:lambda   # ได้ไฟล์ dist/lambda/index.mjs (handler ชื่อ index.handler)
```

ใน `.github/workflows/ci.yml` มี job สำหรับ deploy Lambda เตรียมไว้แล้วแบบปิดอยู่ (comment)
เปิดใช้เมื่อพร้อม แล้วอย่าลืมเปลี่ยนคลังจาก `memory` เป็นของจริง (เช่น DynamoDB) ใน `src/lambda.ts`

---

## 📝 คำสั่งที่ใช้บ่อย สรุปไว้ให้

| คำสั่ง | ทำอะไร |
| --- | --- |
| `npm run dev` | เปิดร้านบนเครื่องตัวเอง |
| `npm run typecheck` | ตรวจว่าโค้ดพิมพ์ type ถูกไหม |
| `npm run db:migrate:local` | อัปเดตตารางฐานข้อมูล (บนเครื่องเรา) |
| `npm run db:migrate:remote` | อัปเดตตารางฐานข้อมูล (บน Cloudflare จริง) |
| `npm run deploy` | deploy ขึ้น Cloudflare Workers |
| `npm run build:lambda` | build ไฟล์สำหรับ AWS Lambda |

---

## ❓ คำถามที่น่าจะสงสัย

**ถาม: ทำไมต้องแบ่งชั้นเยอะแยะ เขียนรวมไฟล์เดียวไม่ได้เหรอ?**
ตอบ: ได้ แต่พอโปรเจกต์โต ไฟล์เดียวจะยาวเป็นพันบรรทัดแล้วแก้ยากมาก
การแบ่งชั้นทำให้รู้ทันทีว่าจะแก้อะไรต้องไปไฟล์ไหน และเปลี่ยนฐานข้อมูลได้โดยไม่ต้องรื้อ logic

**ถาม: `interface` ใน `domain/repositories` มีไว้ทำไม?**
ตอบ: มันคือ "สัญญา" — service บอกแค่ว่า "ฉันต้องการของที่ findById ได้ create ได้"
ใครจะมาทำหน้าที่นั้นก็ได้ (D1, memory, DynamoDB) ขอแค่ทำตามสัญญา

**ถาม: แคชใน KV คืออะไร ทำไมต้องมี?**
ตอบ: เวลามีคนขอดู user คนเดิมซ้ำ ๆ เราจดคำตอบใส่กระดาษโน้ต (KV) ไว้ 5 นาที
ครั้งถัดไปหยิบจากโน้ตเลย ไม่ต้องเดินไปคลัง (ฐานข้อมูล) ทุกรอบ → เร็วขึ้น

**ถาม: แก้โค้ดแล้วต้อง restart ไหม?**
ตอบ: ไม่ต้อง `npm run dev` จะโหลดโค้ดใหม่ให้เองทุกครั้งที่กด save
