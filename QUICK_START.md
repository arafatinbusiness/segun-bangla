# সেগুন বাংলা - দ্রুত শুরু গাইড

## 🚀 প্রথম ধাপ: Firebase সেটআপ (5 মিনিট)

### Firebase নিয়ম প্রয়োগ করুন

আপনার Firebase প্রকল্পে এই দুটি নিয়ম ফাইল কপি-পেস্ট করুন:

#### 1️⃣ Firestore নিয়ম
**যান**: Firebase Console → Firestore Database → Rules

**কপি করুন**: `firestore.rules` ফাইলের সম্পূর্ণ বিষয়বস্তু

**পেস্ট করুন**: Firebase Rules Editor এ
**প্রকাশ করুন**: Publish বাটন ক্লিক করুন

#### 2️⃣ Cloud Storage নিয়ম
**যান**: Firebase Console → Storage → Rules

**কপি করুন**: `storage.rules` ফাইলের সম্পূর্ণ বিষয়বস্তু

**পেস্ট করুন**: Firebase Rules Editor এ
**প্রকাশ করুন**: Publish বাটন ক্লিক করুন

---

## 🔐 অ্যাডমিন অ্যাকাউন্ট সেটআপ (2 মিনিট)

আপনার অ্যাডমিন অ্যাকাউন্ট ইতিমধ্যে তৈরি করা হয়েছে:

```
🔑 প্রাথমিক অ্যাডমিন
ইমেইল: razzakgorfotu@gmail.com
পাসওয়ার্ড: gorfotu2026

🔑 সেকেন্ডারি অ্যাডমিন
ইমেইল: arafatinbusiness@gmail.com
পাসওয়ার্ড: gorfotu2026
```

**খুব গুরুত্বপূর্ণ**: প্রথম লগইনের পরে পাসওয়ার্ড পরিবর্তন করুন!

---

## 🌐 স্থানীয় ডেভেলপমেন্ট (3 মিনিট)

### প্রয়োজনীয় সফটওয়্যার
- Node.js 18+ (https://nodejs.org)
- npm বা pnpm

### সেটআপ করুন
```bash
# প্রকল্প ক্লোন করুন (ইতিমধ্যে আছে)
cd /vercel/share/v0-project

# ডেভেলপমেন্ট সার্ভার শুরু করুন
npm run dev
# বা
pnpm dev

# ব্রাউজারে খুলুন
http://localhost:3000
```

### ডেটা যোগ করুন (ঐচ্ছিক)
```bash
# নমুনা নিবন্ধ এবং বিভাগ যোগ করুন
npm run seed-db
```

---

## 📝 অ্যাডমিন ড্যাশবোর্ড ব্যবহার করুন

### লগইন
1. যান: `http://localhost:3000/login`
2. ইমেইল: `razzakgorfotu@gmail.com`
3. পাসওয়ার্ড: `gorfotu2026`
4. অটোমেটিক রিডিরেক্ট: `/admin`

### প্রথম নিবন্ধ তৈরি করুন
1. ক্লিক করুন: **নিবন্ধ** → **নতুন নিবন্ধ**
2. ভরুন:
   - শিরোনাম: "আমার প্রথম নিবন্ধ"
   - স্লাগ: "my-first-article"
   - বিষয়বস্তু: আপনার লেখা
   - বিভাগ: নির্বাচন করুন
   - ছবি: আপলোড করুন
3. প্রকাশ করুন: **প্রকাশ করুন** বাটন

### হোমপেজে যান
- যান: `http://localhost:3000`
- আপনার নিবন্ধ দেখুন!

---

## 📂 প্রধান ফাইল এবং ফোল্ডার

```
project/
├── app/
│   ├── page.tsx               ← হোমপেজ
│   ├── login/page.tsx         ← লগইন পৃষ্ঠা
│   ├── admin/                 ← অ্যাডমিন ড্যাশবোর্ড
│   ├── article/[slug]/        ← নিবন্ধ বিবরণ পৃষ্ঠা
│   └── category/[slug]/       ← বিভাগ পৃষ্ঠা
├── lib/
│   ├── firebase.ts            ← Firebase সংসদান
│   ├── auth-context.tsx       ← প্রমাণীকরণ অবস্থা
│   └── services/
│       ├── auth/              ← প্রমাণীকরণ সেবা
│       ├── articles.ts        ← নিবন্ধ অপারেশন
│       └── categories.ts      ← বিভাগ অপারেশন
├── components/                ← পুনঃব্যবহারযোগ্য উপাদান
├── firestore.rules            ← Firestore নিয়ম (Firebase এ কপি করুন)
├── storage.rules              ← Storage নিয়ম (Firebase এ কপি করুন)
└── HOW_TO_APPLY_FIREBASE_RULES.md ← বিস্তারিত নির্দেশনা
```

---

## 🔥 Firebase নিয়ম সংক্ষেপ

### কী কাজ করে:

**পাবলিক** (সবাই)
- পড়ুন: প্রকাশিত নিবন্ধ, বিভাগ
- লিখুন: নতুন অ্যাকাউন্ট তৈরি করুন

**অনুমোদিত ব্যবহারকারী** (লগইন করা)
- পড়ুন: নিজের প্রোফাইল, প্রকাশিত নিবন্ধ
- লিখুন: আপডেট নিজের প্রোফাইল

**লেখক** (author role)
- পড়ুন: সব নিবন্ধ (খসড়া + প্রকাশিত)
- লিখুন: নতুন নিবন্ধ তৈরি করুন, নিজের সম্পাদনা করুন

**প্রশাসক** (admin role)
- পড়ুন: সবকিছু
- লিখুন: সবকিছু

---

## 🚀 প্রকাশনা করুন

### Vercel এ প্রকাশ করুন (বিনামূল্যে)

1. **Vercel এ সাইন আপ করুন**
   - যান: https://vercel.com
   - GitHub/আপনার ইমেইল দিয়ে সাইন আপ করুন

2. **প্রকল্প সংযুক্ত করুন**
   - **Import Project** ক্লিক করুন
   - আপনার GitHub রেপো নির্বাচন করুন
   - **Deploy** ক্লিক করুন

3. **পরিবেশ ভেরিয়েবল সেট করুন**
   - Vercel Project Settings → Environment Variables
   - যোগ করুন:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCTw0_CgOnhD9SBiRdU1fezQ-N1Ic6cCBc
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=segun-bangla-newspaper.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=segun-bangla-newspaper
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=segun-bangla-newspaper.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=365261076399
   NEXT_PUBLIC_FIREBASE_APP_ID=1:365261076399:web:d31c334f73814d2048e15a
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

4. **ডোমেইন যোগ করুন** (ঐচ্ছিক)
   - Settings → Domains
   - আপনার কাস্টম ডোমেইন যোগ করুন

---

## 📖 বিস্তারিত নির্দেশিকা

| নথি | বিষয় |
|------|-------|
| `PROJECT_CONTEXT_SUMMARY.md` | সম্পূর্ণ প্রকল্প ওভারভিউ |
| `ADMIN_SETUP_INSTRUCTIONS.md` | অ্যাডমিন সেটআপ বিস্তারিত |
| `HOW_TO_APPLY_FIREBASE_RULES.md` | Firebase নিয়ম প্রয়োগের পূর্ণ গাইড |
| `CODE_ARCHITECTURE.md` | কোড সংগঠন এবং ডিজাইন |
| `AUTHENTICATION_COMPLETE.md` | প্রমাণীকরণ ব্যবস্থা |

---

## ⚠️ সাধারণ সমস্যা

### সমস্যা: "Permission denied" ত্রুটি
**সমাধান**: 
1. Firebase নিয়ম প্রয়োগ করেছেন কিনা চেক করুন
2. ব্রাউজার ক্যাশ সাফ করুন (Ctrl+Shift+Delete)
3. পুনরায় লগইন করুন

### সমস্যা: পৃষ্ঠা লোড হচ্ছে না
**সমাধান**:
1. সার্ভার চলছে কিনা চেক করুন (`npm run dev`)
2. `http://localhost:3000` ব্যবহার করুন
3. ব্রাউজার কনসোল ত্রুটি দেখুন (F12)

### সমস্যা: নিবন্ধ প্রকাশ করতে পারছেন না
**সমাধান**:
1. আপনি অ্যাডমিন হিসাবে লগইন করেছেন কিনা চেক করুন
2. সব প্রয়োজনীয় ফিল্ড পূরণ করেছেন কিনা চেক করুন
3. নিবন্ধ স্লাগ অনন্য কিনা চেক করুন

---

## 📞 সহায়তা প্রয়োজন?

1. **ডকুমেন্টেশন পড়ুন**: উপরের নির্দেশিকা ফাইলগুলি দেখুন
2. **ব্রাউজার কনসোল**: F12 → Console ট্যাব
3. **Firebase কনসোল**: https://console.firebase.google.com
4. **পরবর্তী পদক্ষেপ নথি পড়ুন**

---

## ✅ চেকলিস্ট

- [ ] Firebase নিয়ম প্রয়োগ করেছেন (Firestore + Storage)
- [ ] অ্যাডমিন অ্যাকাউন্টে লগইন করেছেন
- [ ] নমুনা নিবন্ধ তৈরি করেছেন
- [ ] হোমপেজে নিবন্ধ দেখছেন
- [ ] পরিবেশ ভেরিয়েবল যোগ করেছেন
- [ ] Vercel এ প্রকাশ করেছেন (ঐচ্ছিক)
- [ ] কাস্টম ডোমেইন সেট আপ করেছেন (ঐচ্ছিক)

---

**আপনার সেগুন বাংলা নিউজপোর্টাল এখন লাইভ! 🎉**
