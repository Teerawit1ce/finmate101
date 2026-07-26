# FinMate Demo - Quick Start Guide

## 🚀 Setup in 3 Steps

### 1. Install Dependencies
```bash
cd backend && npm install
cd ../frontend && pnpm install
```

### 2. Start Servers
```bash
# Terminal 1 - Backend
cd backend
npx wrangler d1 migrations apply harn-tao-db --local
npx wrangler dev --port 8787

# Terminal 2 - Frontend
cd frontend
pnpm dev
```

### 3. Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:8787
- API Docs: http://localhost:8787/docs

---

## 📊 Database Schema

### 5 Tables
```
users
├── subscriptions (Netflix, Spotify, etc.)
├── transactions (income/expense)
├── budgets (monthly limits)
└── chat_messages (conversation history)
```

### Key Relationships
- All tables link to `users` via `user_id`
- One user can have many subscriptions, transactions, budgets, and messages

---

## 🔌 API Endpoints

| Module | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Users | GET | `/api/v1/users` | List all users |
| Users | POST | `/api/v1/users` | Create user |
| Subscriptions | GET | `/api/v1/subscriptions?userId=<id>` | List subscriptions |
| Subscriptions | POST | `/api/v1/subscriptions` | Add subscription |
| Transactions | GET | `/api/v1/transactions?userId=<id>` | List transactions |
| Transactions | POST | `/api/v1/transactions` | Add transaction |
| Budgets | GET | `/api/v1/budgets?userId=<id>` | List budgets |
| Budgets | POST | `/api/v1/budgets` | Set budget |
| Chat | GET | `/api/v1/chat?userId=<id>` | Get chat history |
| Chat | POST | `/api/v1/chat` | Add message |

---

## 💻 Example Usage

### Create User
```bash
curl -X POST http://localhost:8787/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@finmate.com","name":"Demo User"}'
```

### Add Subscription
```bash
curl -X POST http://localhost:8787/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"USER_ID",
    "name":"Netflix Premium",
    "serviceName":"Netflix",
    "category":"บันเทิง",
    "amount":419,
    "billingDate":26,
    "nextBilling":"2026-08-26"
  }'
```

### Add Transaction
```bash
curl -X POST http://localhost:8787/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"USER_ID",
    "type":"expense",
    "category":"อาหาร",
    "amount":180,
    "description":"หมูกระทะ",
    "date":"2026-07-26"
  }'
```

---

## ✅ What's Implemented

- ✅ User management
- ✅ Subscription tracking
- ✅ Transaction recording
- ✅ Budget management
- ✅ Chat history
- ✅ REST API with validation
- ✅ Database migrations
- ✅ Clean architecture
- ✅ Type safety (TypeScript)
- ✅ API documentation (OpenAPI)

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── domain/         # Business entities & interfaces
│   ├── services/       # Business logic
│   ├── handlers/       # HTTP handlers
│   ├── routers/        # Route definitions
│   ├── schemas/        # Validation schemas
│   └── infrastructure/ # Database implementations
└── migrations/         # SQL migrations

frontend/
├── src/
│   ├── components/     # React components
│   ├── store/          # State management
│   └── lib/api.ts      # API client
```

---

## 🎯 Features

1. **Subscription Management**
   - Track all subscriptions
   - Billing cycle tracking
   - Category organization

2. **Transaction Tracking**
   - Income & expenses
   - Category-based
   - Date filtering

3. **Budget Management**
   - Monthly limits
   - Daily quotas
   - Automatic calculations

4. **Chat Interface**
   - Conversation history
   - Action suggestions

---

## 🛠️ Tech Stack

**Backend:** Hono + Cloudflare Workers + D1 (SQLite)  
**Frontend:** React 19 + Vite + Zustand + Tailwind  
**Database:** SQLite via Cloudflare D1  
**Validation:** Zod schemas  
**Architecture:** Clean Architecture + DI

---

**Status:** ✅ Ready to submit  
**Files:** 50+ new files created  
**Endpoints:** 20+ API endpoints  
**Tables:** 5 database tables
