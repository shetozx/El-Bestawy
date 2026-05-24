# 🦷 El-Bestawy Groups — نظام إدارة مستلزمات الأسنان

تطبيق ويب لإدارة المخزون والمبيعات والعملاء لشركة El-Bestawy Groups المتخصصة في مستلزمات الأسنان.

## ✨ المميزات

- **📊 لوحة تحكم** — إحصائيات يومية وشهرية ورسوم بيانية
- **📦 إدارة المنتجات** — مخزون، أسعار، تاريخ انتهاء الصلاحية
- **💰 المبيعات** — إنشاء فواتير وتتبع المعاملات
- **👥 العملاء والموردين** — إدارة كاملة مع رصيد الحسابات
- **📈 التقارير** — تحليلات مفصلة للمبيعات والمخزون
- **🌙 الوضع الليلي** — دعم Dark Mode كامل
- **📱 متجاوب** — يعمل على الجوال والديسكتوب
- **🔒 حماية بكلمة مرور** — مع تشفير كامل عبر Firebase

## 🚀 النشر على GitHub Pages

### 1. إعداد Firebase

1. سجّل دخولك على [Firebase Console](https://console.firebase.google.com)
2. أنشئ مشروعاً جديداً (أو استخدم المشروع الحالي `el-bestawy`)
3. فعّل **Firestore Database** في وضع Production
4. في إعدادات المشروع، انسخ بيانات اعتماد التطبيق

### 2. إعداد GitHub Secrets

في مستودع GitHub → **Settings → Secrets and variables → Actions**، أضف المتغيرات التالية:

| Secret Name | القيمة |
|---|---|
| `VITE_FIREBASE_API_KEY` | من إعدادات Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | معرّف المشروع |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | رقم المُرسِل |
| `VITE_FIREBASE_APP_ID` | معرّف التطبيق |
| `VITE_FIREBASE_MEASUREMENT_ID` | (اختياري) |

### 3. تفعيل GitHub Pages

1. اذهب إلى **Settings → Pages**
2. في **Source**، اختر **GitHub Actions**
3. ادفع الكود إلى الـ `main` branch — سيبدأ النشر تلقائياً

### 4. Firestore Security Rules

في Firebase Console → Firestore → Rules، أضف هذه القواعد:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to all documents (password auth is handled in app)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ **ملاحظة أمنية:** هذه القواعد مناسبة للاستخدام الداخلي مع الحماية بكلمة المرور. للأمان الأعلى، أضف Firebase Authentication.

## 🛠️ التطوير المحلي

```bash
# استنسخ المستودع
git clone https://github.com/your-username/el-bestawy-groups.git
cd el-bestawy-groups

# انسخ ملف البيئة وعدّله
cp .env.example .env
# افتح .env وأدخل بيانات Firebase الخاصة بك

# ثبّت الحزم
npm install

# شغّل بيئة التطوير
npm run dev
```

## 🏗️ التقنيات المستخدمة

| التقنية | الإصدار | الغرض |
|---|---|---|
| React | 19 | واجهة المستخدم |
| TypeScript | 5.9 | Type Safety |
| Vite | 7 | Build Tool |
| Firebase Firestore | 12 | قاعدة البيانات |
| Zustand | 5 | إدارة الحالة |
| Tailwind CSS | 3 | التصميم |
| shadcn/ui | — | مكونات UI |
| Recharts | 2 | الرسوم البيانية |

## 📁 هيكل المشروع

```
src/
├── components/
│   ├── layout/        # Sidebar, Topbar, AppLayout
│   ├── shared/        # DataInitializer
│   └── ui/            # shadcn/ui components
├── lib/
│   ├── firebase.ts    # Firebase setup & helpers
│   └── utils.ts       # Utility functions
├── pages/             # صفحات التطبيق
├── stores/            # Zustand stores
├── types/             # TypeScript types
└── hooks/             # Custom hooks
```

## 🔑 كلمة المرور الافتراضية

كلمة المرور الافتراضية عند أول تشغيل: **`admin123`**

> يمكن تغييرها من صفحة **الإعدادات** بعد تسجيل الدخول.
