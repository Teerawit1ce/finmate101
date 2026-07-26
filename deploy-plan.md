# Deploy Plan — Starter Template (สำหรับ LLM / openclaw)

เอกสารนี้เขียนให้ **LLM agent อ่านแล้วทำ deploy ได้เอง** โดยใช้ **GitHub + Cloudflare (ฟรีทั้งหมด)**
ทุกขั้นตอนมี label บอกชัดว่าใครทำ:

| Label | ความหมาย |
|---|---|
| 🤖 **AGENT** | agent รันคำสั่งใน terminal ได้เอง |
| 👤 **USER** | ต้องให้มนุษย์ทำเอง (ต้องเข้าเว็บ / login / กรอกความลับในเบราว์เซอร์) — agent ทำแทนไม่ได้ ให้หยุดแล้วบอก user |

> **หลักการ:** อะไรที่เป็น CLI (wrangler, git, gh) → agent ทำได้
> อะไรที่ต้อง login ผ่านเบราว์เซอร์ หรือกรอกค่าลับใน Cloudflare/GitHub Dashboard → user ทำเอง

---

## ภาพรวมสถาปัตยกรรม

```
GitHub repo (push to main)
        │
        ▼
GitHub Actions (.github/workflows/deploy.yml)
        │
        ├─ build-backend  → typecheck + build
        ├─ build-frontend → typecheck + build (ใช้ VITE_BACKEND_URL)
        ├─ deploy-backend  → Cloudflare Workers  (D1 + KV)   → *.workers.dev
        └─ deploy-frontend → Cloudflare Pages                 → *.pages.dev
```

- **Backend**: Hono + Cloudflare Workers + D1 (SQLite) + KV (cache) — โฟลเดอร์ `backend/`
- **Frontend**: Vue 3 + Vuetify + Pinia (SPA) → Cloudflare Pages — โฟลเดอร์ `frontend/`
- **ฟรีทั้งหมด**: GitHub Actions (public repo ฟรี), Cloudflare Workers/Pages/D1/KV มี free tier เพียงพอสำหรับโปรเจกต์นักศึกษา

---

## สิ่งที่ต้องมี (Prerequisites)

| เครื่องมือ | ติดตั้ง | ใครทำ |
|---|---|---|
| Node.js 22+ | https://nodejs.org | 👤/🤖 |
| pnpm 8.6.2 | `npm i -g pnpm@8.6.2` | 🤖 |
| Wrangler CLI | `npm i -g wrangler` หรือใช้ `npx wrangler` | 🤖 |
| Cloudflare account (ฟรี) | https://dash.cloudflare.com/sign-up | 👤 |
| GitHub account | https://github.com | 👤 |

---

## ขั้นตอนทั้งหมด (ทำตามลำดับ)

### STEP 0 — เตรียม repo บน GitHub

**👤 USER** — สร้าง repo บน GitHub และ login (agent สร้าง repo แทนไม่ได้ถ้ายังไม่ได้ auth `gh`)

ถ้า `gh` CLI login แล้ว agent ทำได้:

```bash
# 🤖 AGENT (ถ้า gh auth ok) — สร้าง repo แล้ว push
gh repo create <REPO_NAME> --public --source=. --remote=origin --push
```

ถ้า `gh` ยังไม่ login → **👤 USER** ทำเอง:
1. เข้า https://github.com/new สร้าง repo (public เพื่อให้ Actions ฟรี)
2. รันในเครื่อง:
```bash
git remote add origin https://github.com/<user>/<REPO_NAME>.git
git branch -M main
git push -u origin main
```

---

### STEP 1 — Login Cloudflare (ครั้งเดียว)

**👤 USER** — ต้อง login ผ่านเบราว์เซอร์ (OAuth) — agent ทำแทนไม่ได้เพราะเปิด browser + กดยืนยัน

บอก user ให้พิมพ์ในเทอร์มินัลของ session นี้:

```
! npx wrangler login
```

> `wrangler login` เปิดเบราว์เซอร์ให้ authorize ถ้า agent รันเองจะค้างรอ callback ตลอด — **ต้องให้ user ทำ**
> ทางเลือก: ถ้ามี `CLOUDFLARE_API_TOKEN` อยู่แล้ว สามารถ export เป็น env var แทน login ได้ (ดู STEP 3)

---

### STEP 2 — สร้าง Cloudflare Resources (D1 + KV)

**🤖 AGENT** — รันได้เอง (หลังจาก user login wrangler แล้ว) แล้ว**เก็บ ID ที่ได้ไว้**

```bash
cd backend

# สร้าง D1 database → คัดลอกค่า database_id จาก output
npx wrangler d1 create starter-db

# สร้าง KV namespace → คัดลอกค่า id จาก output
npx wrangler kv namespace create CACHE
```

ผลลัพธ์ที่ต้องเก็บ:
- `D1_DATABASE_ID` = ค่า `database_id` (รูปแบบ `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- `KV_NAMESPACE_ID` = ค่า `id` (32 ตัวอักษร)

> **AGENT:** เก็บสองค่านี้ไว้ ต้องเอาไปกรอกเป็น GitHub Secret ใน STEP 4
> ถ้าซ้ำ (สร้างไว้แล้ว) ให้ใช้ `npx wrangler d1 list` / `npx wrangler kv namespace list` เพื่อดึง ID เดิม

---

### STEP 3 — สร้าง Cloudflare API Token + Account ID

**👤 USER** — ต้องทำใน Cloudflare Dashboard (เบราว์เซอร์) — agent เข้าถึง dashboard ไม่ได้

**3.1 API Token** — https://dash.cloudflare.com/profile/api-tokens
1. **Create Token → Create Custom Token**
2. ตั้งชื่อ เช่น `starter-deploy`
3. Permissions (เพิ่มให้ครบ 4):

   | Scope | Resource | Permission |
   |---|---|---|
   | Account | Cloudflare Pages | Edit |
   | Account | Workers Scripts | Edit |
   | Account | Workers KV Storage | Edit |
   | Account | D1 | Edit |

4. Account Resources → **Include → All accounts**
5. **Continue to summary → Create Token → คัดลอกทันที** (แสดงครั้งเดียว)
   → นี่คือค่า `CLOUDFLARE_API_TOKEN`

**3.2 Account ID** — https://dash.cloudflare.com → **Workers & Pages** → ดูมุมขวา **Account ID** (32 ตัว)
   → นี่คือค่า `CLOUDFLARE_ACCOUNT_ID`

---

### STEP 4 — ตั้งค่า GitHub Secrets (6 ตัว)

**👤 USER** — ต้องกรอกใน GitHub UI เพราะเป็นค่าลับ (agent ไม่ควรถือ token)
**GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

| # | Secret | ค่าที่ใส่ | มาจาก |
|---|---|---|---|
| 1 | `CLOUDFLARE_API_TOKEN` | API token | STEP 3.1 |
| 2 | `CLOUDFLARE_ACCOUNT_ID` | Account ID | STEP 3.2 |
| 3 | `D1_DATABASE_ID` | database_id | STEP 2 |
| 4 | `KV_NAMESPACE_ID` | kv id | STEP 2 |
| 5 | `PAGES_PROJECT_NAME` | ชื่อ project ตั้งเอง ต้อง **unique ทั่วโลก** เช่น `john-starter-app` | ตั้งเอง |
| 6 | `VITE_BACKEND_URL` | ใส่ทีหลัง (STEP 6) — รอบแรกเว้นว่างหรือใส่ placeholder | หลัง deploy backend |

> **ทำไม agent ทำแทนไม่ได้:** ถ้ามี `gh secret set` และ user ยินยอมส่ง token มาให้ agent สามารถรันได้
> ```bash
> # 🤖 AGENT (เฉพาะเมื่อ user ยินยอมให้ถือค่าลับ) — ตัวอย่าง
> gh secret set D1_DATABASE_ID --body "<ค่าจาก STEP 2>"
> gh secret set KV_NAMESPACE_ID --body "<ค่าจาก STEP 2>"
> gh secret set PAGES_PROJECT_NAME --body "<ชื่อ unique>"
> ```
> แต่ `CLOUDFLARE_API_TOKEN` แนะนำให้ **user กรอกเองใน GitHub UI** เพื่อความปลอดภัย

---

### STEP 5 — Deploy รอบแรก (push to main)

**🤖 AGENT** — commit + push ได้เอง (workflow trigger อัตโนมัติ)

```bash
git add .
git commit -m "chore: setup deploy"
git push origin main
```

Workflow `.github/workflows/deploy.yml` จะทำงานตามลำดับ:
1. `build-backend` + `build-frontend` (typecheck + build)
2. `deploy-backend` → apply D1 migrations (`--remote`) + `wrangler deploy` → ได้ URL `*.workers.dev`
3. `deploy-frontend` → สร้าง Pages project (ถ้ายังไม่มี) + deploy → `*.pages.dev`

**🤖 AGENT** ตรวจสถานะได้:
```bash
gh run list --limit 3
gh run watch          # ดู log แบบ realtime
```

> รอบแรก frontend จะยัง build ด้วย `VITE_BACKEND_URL` ที่ยังไม่ถูก (เพราะยังไม่รู้ URL backend) — แก้ใน STEP 6

---

### STEP 6 — เติม `VITE_BACKEND_URL` แล้ว deploy ซ้ำ

หลัง `deploy-backend` ผ่านครั้งแรก จะได้ URL backend เช่น
`https://starter-backend.<subdomain>.workers.dev`

**🤖 AGENT** — ดึง URL จาก log ได้:
```bash
gh run view --log | grep "Backend deployed to"
```

**👤 USER** (หรือ 🤖 AGENT ถ้าถือ token ได้) — ใส่ค่า Secret `VITE_BACKEND_URL`:
```bash
# 🤖 AGENT (ถ้า gh login ok)
gh secret set VITE_BACKEND_URL --body "https://starter-backend.<subdomain>.workers.dev"
```

แล้ว trigger deploy อีกครั้งให้ frontend build ด้วย URL ที่ถูกต้อง:
```bash
# 🤖 AGENT
git commit --allow-empty -m "chore: rebuild frontend with backend url"
git push origin main
# หรือ: gh workflow run Deploy
```

---

### STEP 7 — ตรวจสอบว่าใช้งานได้จริง

**🤖 AGENT** — ตรวจได้เอง:

```bash
# Backend health check
curl https://starter-backend.<subdomain>.workers.dev/health

# API docs (เปิดในเบราว์เซอร์)
# https://starter-backend.<subdomain>.workers.dev/docs

# Frontend
curl -I https://<PAGES_PROJECT_NAME>.pages.dev
```

เกณฑ์ผ่าน:
- `/health` ตอบ 200
- `/api/v1/users` เรียกได้
- หน้า Pages โหลดขึ้น และเรียก backend สำเร็จ (เช็ค CORS/Network tab)

---

## ทางเลือก: Deploy ด้วยมือ (ไม่ผ่าน GitHub Actions)

**🤖 AGENT** ทำได้ทั้งหมด (หลัง user login wrangler แล้ว):

```bash
# --- Backend ---
cd backend
cp wrangler.example.jsonc wrangler.jsonc
# แทนที่ <REPLACE_WITH_D1_DATABASE_ID> และ <REPLACE_WITH_KV_NAMESPACE_ID> ด้วยค่าจริงจาก STEP 2
npx wrangler d1 migrations apply starter-db --remote
npm run deploy

# --- Frontend ---
cd ../frontend
pnpm install
VITE_BACKEND_URL="https://starter-backend.<subdomain>.workers.dev" pnpm build
npx wrangler pages deploy dist --project-name=<PAGES_PROJECT_NAME> --branch=main
```

> `wrangler.jsonc` มี ID จริง = ไฟล์ลับ อย่า commit (ควรอยู่ใน `.gitignore`) — CI ใช้ `wrangler.example.jsonc` + inject ID จาก Secret แทน

---

## สรุปตารางความรับผิดชอบ (Agent vs User)

| ขั้นตอน | 🤖 AGENT ทำได้ | 👤 USER ต้องทำเอง |
|---|---|---|
| สร้าง GitHub repo | ✅ ถ้า `gh` login แล้ว | ❌ ถ้ายังไม่ login |
| `wrangler login` | ❌ | ✅ เปิดเบราว์เซอร์ OAuth |
| สร้าง D1 / KV (`wrangler ... create`) | ✅ | — |
| สร้าง Cloudflare API Token | ❌ | ✅ ใน Dashboard |
| หา Account ID | ❌ | ✅ ใน Dashboard |
| ใส่ GitHub Secrets | ⚠️ ได้ถ้าถือ token (`gh secret set`) | ✅ แนะนำให้ user กรอก token เอง |
| git push / trigger deploy | ✅ | — |
| ดู log / ดึง URL | ✅ (`gh run ...`) | — |
| ตรวจ health / smoke test | ✅ (`curl`) | — |

**สิ่งที่ agent ทำแทนไม่ได้เด็ดขาด (ต้องหยุดแล้วบอก user):**
1. `wrangler login` — OAuth ผ่านเบราว์เซอร์
2. สร้าง Cloudflare API Token + หา Account ID — อยู่ใน Dashboard
3. กรอกค่าลับ (โดยเฉพาะ `CLOUDFLARE_API_TOKEN`) ใน GitHub Secrets UI

---

## Troubleshooting

| อาการ | สาเหตุ / วิธีแก้ |
|---|---|
| Pages deploy error "name already taken" | `PAGES_PROJECT_NAME` ซ้ำทั่วโลก → เปลี่ยนชื่อให้ unique |
| Frontend เรียก backend ไม่ได้ | `VITE_BACKEND_URL` ผิด/ว่าง → แก้ Secret แล้ว push ใหม่ (STEP 6) |
| `deploy-backend` fail ที่ migrations | D1 ยังไม่ถูกสร้าง / `D1_DATABASE_ID` ผิด → เช็ค STEP 2 + Secret |
| Workflow ไม่ทำงาน | ต้อง push ไป branch `main` เท่านั้น (deploy job มี `if ref == main`) |
| `Authentication error [code 10000]` | `CLOUDFLARE_API_TOKEN` ผิด/permission ไม่ครบ → สร้าง token ใหม่ตาม STEP 3.1 |

---

## Free Tier ที่ใช้ (อ้างอิง)

- **GitHub Actions**: public repo ฟรีไม่จำกัด (private มีโควตานาที/เดือน)
- **Cloudflare Workers**: 100,000 requests/วัน ฟรี
- **Cloudflare Pages**: build 500 ครั้ง/เดือน, bandwidth ไม่จำกัด
- **Cloudflare D1**: 5 GB storage, 5M rows read/วัน ฟรี
- **Cloudflare KV**: 100,000 reads/วัน, 1,000 writes/วัน ฟรี

เพียงพอสำหรับโปรเจกต์นักศึกษา / demo / portfolio
</content>
</invoke>
