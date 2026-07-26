# หารเท่า.ai (HarnTao) — Flutter Mobile App 🐾

AI Agent ช่วยนักศึกษาบริหารจัดการเงินและติดตาม Subscription บนมือถือ

## Features

| ฟีเจอร์ | รายละเอียด |
|---------|------------|
| 📊 **Dashboard** | สรุปยอดคงเหลือ, การแจ้งเตือน, สัดส่วนค่าใช้จ่าย, รายการล่าสุด |
| 🤖 **Chat AI** | พิมพ์ "กินข้าว 60", "เงินจะหมดแล้ว", "sub", "ใช้เงินเปลือง" — AI ตอบกลับอัตโนมัติ |
| 📋 **Subscriptions** | จัดการ Subscription, Toggle เปิด/ปิด, แสดงวันตัดเงิน |
| 🔔 **แจ้งเตือนจริง** | แจ้งเตือน Push Notification ก่อน Subscription ใกล้ถึงกำหนดตัดเงิน |
| 💾 **ข้อมูลในเครื่อง** | ใช้ SQLite เก็บข้อมูลทั้งหมดของผู้ใช้ — ไม่ต้องใช้ API |

## Tech Stack

- **Framework:** Flutter 3.4+
- **ภาษา:** Dart
- **State Management:** Provider + ChangeNotifier
- **Local Database:** sqflite (SQLite)
- **Notifications:** flutter_local_notifications
- **Font:** Kanit (Google Fonts)
- **Design:** Dark Theme, Primary Color #1431FF

## วิธีรัน

```bash
cd flutter_app

# ติดตั้ง dependencies
flutter pub get

# รันบน emulator หรือ device
flutter run

# Build APK
flutter build apk --release

# Build iOS
flutter build ios --release
```

## โครงสร้างไฟล์

```
lib/
├── main.dart                    # Entry point
├── app.dart                     # App widget + BottomNav
├── models/
│   ├── subscription.dart        # Subscription model
│   ├── transaction.dart         # Transaction model  
│   └── chat_message.dart        # Chat message model
├── providers/
│   └── finance_provider.dart    # State management (Zustand-like)
├── screens/
│   ├── dashboard_screen.dart    # หน้า Dashboard
│   ├── chat_screen.dart         # หน้า Chat AI
│   └── subscriptions_screen.dart # หน้า Subscription
├── services/
│   ├── database_service.dart    # SQLite service (seed data + CRUD)
│   └── notification_service.dart # Push notification service
└── theme/
    └── app_theme.dart           # Dark theme + colors
```

## ข้อมูล Demo

- **ยอดคงเหลือ:** 4,500 บาท
- **Subscriptions:** 5 รายการ (Netflix 419฿, Spotify 139฿, ChatGPT 750฿, iCloud 99฿, YouTube 159฿)
- **ธุรกรรม:** 5 รายการ (รายรับ 11,000 + รายจ่าย 575)

## การแจ้งเตือน

แอปจะแจ้งเตือน Push Notification เมื่อ:
1. Subscription ใกล้ถึงกำหนดตัดเงิน (≤ 1 วัน)
2. สรุปค่าใช้จ่ายประจำวัน (ตอนเย็น)
3. เมื่อผู้ใช้กดยกเลิก Netflix — แจ้งเตือนยอดเงินคืน
