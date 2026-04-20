# Admin Setup Instructions - সেগুন বাংলা

## বিস্তারিত নির্দেশনা

এই গাইডটি আপনাকে সেগুন বাংলা নিউজপোর্টালের প্রশাসক সিস্টেম সেটআপ করতে সাহায্য করবে।

---

## 1. Firebase কনফিগারেশন

আপনার প্রজেক্ট ইতিমধ্যে বাস্তব Firebase সংসদান দিয়ে সংজ্ঞায়িত করা হয়েছে:

**Firebase Project:** `segun-bangla-newspaper`

এই সংসদানগুলি ইতিমধ্যে সেট আপ করা হয়েছে:
- API Key: AIzaSyCTw0_CgOnhD9SBiRdU1fezQ-N1Ic6cCBc
- Auth Domain: segun-bangla-newspaper.firebaseapp.com
- Project ID: segun-bangla-newspaper
- Storage Bucket: segun-bangla-newspaper.firebasestorage.app

### 2. অ্যাডমিন ব্যবহারকারী সেটআপ

#### অপশন A: স্বয়ংক্রিয় সেটআপ (সুপারিশকৃত)

আমরা একটি সেটআপ স্ক্রিপ্ট প্রদান করেছি যা স্বয়ংক্রিয়ভাবে অ্যাডমিন ব্যবহারকারী তৈরি করে।

**পদক্ষেপ:**

1. **Firebase Service Account ডাউনলোড করুন:**
   - Firebase Console এ যান: https://console.firebase.google.com
   - "segun-bangla-newspaper" প্রজেক্ট নির্বাচন করুন
   - Project Settings > Service Accounts এ যান
   - "Generate new private key" ক্লিক করুন
   - JSON ফাইলটি ডাউনলোড করুন এবং আপনার প্রজেক্টে `firebase-service-account.json` নামে সংরক্ষণ করুন

2. **পরিবেশ ভেরিয়েবল যোগ করুন:**
   
   `.env.local` ফাইলে যোগ করুন:
   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

3. **সেটআপ স্ক্রিপ্ট চালান:**
   ```bash
   npm run setup-admin
   # অথবা
   pnpm setup-admin
   ```

**স্ক্রিপ্ট স্বয়ংক্রিয়ভাবে:**
- দুই জন অ্যাডমিন ব্যবহারকারী তৈরি বা আপডেট করে
- Firebase Authentication এ ব্যবহারকারী রেজিস্টার করে
- Firestore এ তাদের প্রোফাইল তৈরি করে
- "admin" রোল নির্ধারণ করে

#### অপশন B: ম্যানুয়াল সেটআপ

আপনি Firebase Console এ সরাসরি ব্যবহারকারী তৈরি করতে পারেন:

1. Firebase Console এ যান
2. Authentication > Users এ যান
3. "Create user" ক্লিক করুন
4. নিম্নলিখিত বিবরণ যোগ করুন:
   - Email: `razzakgorfotu@gmail.com`
   - Password: `gorfotu2026`

5. Firestore এ একটি নথি তৈরি করুন:
   - Collection: `users`
   - Document ID: ব্যবহারকারীর UID (Firebase এ পাবেন)
   - ডেটা:
     ```json
     {
       "uid": "ব্যবহারকারীর_UID",
       "email": "razzakgorfotu@gmail.com",
       "displayName": "রাজ্জাক গোরফোটু",
       "role": "admin",
       "createdAt": 1700000000000,
       "lastLogin": null
     }
     ```

---

## 3. অ্যাডমিন লগইন পরীক্ষা করুন

### লগইন প্রক্রিয়া:

1. আপনার অ্যাপ চালু করুন:
   ```bash
   npm run dev
   # অথবা
   pnpm dev
   ```

2. ব্রাউজারে খুলুন: `http://localhost:3000/login`

3. অ্যাডমিন সংসদান ব্যবহার করে লগইন করুন:
   - **ইমেইল:** razzakgorfotu@gmail.com
   - **পাসওয়ার্ড:** gorfotu2026

### অ্যাডমিন ড্যাশবোর্ড অ্যাক্সেস:

সফল লগইনের পরে, আপনি স্বয়ংক্রিয়ভাবে অ্যাডমিন ড্যাশবোর্ডে পুনর্নির্দেশিত হবেন:
- **URL:** http://localhost:3000/admin

অ্যাডমিন ড্যাশবোর্ডে আপনি পারবেন:
- নিবন্ধ পরিচালনা করতে (তৈরি, সম্পাদনা, প্রকাশ, মুছতে)
- ক্যাটাগরি পরিচালনা করতে
- বিশ্লেষণ দেখতে
- ব্যবহারকারীদের পরিচালনা করতে
- সিস্টেম সেটিংস কনফিগার করতে

---

## 4. কোড আর্কিটেকচার (Refactored)

আমরা প্রশাসক সিস্টেমের জন্য মডুলার এবং পরিষ্কার কোড সংগঠন প্রয়োগ করেছি:

### ফাইল কাঠামো:

```
lib/services/auth/
├── auth-service.ts       # মূল Firebase সংযোজন (লগইন, নিবন্ধন, লগআউট)
├── user-service.ts       # Firestore ব্যবহারকারী প্রোফাইল পরিচালনা
├── role-service.ts       # ভূমিকা যাচাইকরণ এবং অনুমোদন
└── index.ts              # পরিষ্কার রপ্তানি পোর্ট

lib/hooks/
└── use-auth.ts           # React হুকস (useAuth, useIsAdmin, etc.)

lib/auth-context.tsx      # বৈশ্বিক অথেন্টিকেশন অবস্থা

components/
├── protected-route.tsx    # অ্যাডমিন রুট সুরক্ষা
└── admin/
    ├── sidebar.tsx        # অ্যাডমিন নেভিগেশন
    └── ...                # অ্যাডমিন উপাদান
```

### ভূমিকা-ভিত্তিক সুরক্ষা:

```typescript
// ব্যবহার করতে:
import { useIsAdmin } from '@/lib/hooks/use-auth'

function MyComponent() {
  const isAdmin = useIsAdmin()
  
  if (!isAdmin) {
    return <div>অ্যাক্সেস অনুমোদিত নয়</div>
  }
  
  return <AdminPanel />
}
```

### সেবা ব্যবহার:

```typescript
// অ্যাডমিন প্রমাণীকরণ
import { loginUser, isAdmin } from '@/lib/services/auth'

const result = await loginUser(email, password)
const userIsAdmin = await isAdmin(result.uid)

// ব্যবহারকারী প্রোফাইল অ্যাক্সেস
import { getUserProfile, setAdminRole } from '@/lib/services/auth'

const profile = await getUserProfile(uid)
await setAdminRole(uid)
```

---

## 5. সমস্যা সমাধান

### সমস্যা: "আপনার অ্যাডমিন অ্যাক্সেস নেই" বার্তা

**সমাধান:**
1. Firestore এ যান এবং `users` সংগ্রহ পরীক্ষা করুন
2. নিশ্চিত করুন যে ব্যবহারকারীর ডকুমেন্টে `role: "admin"` রয়েছে
3. যদি না থাকে, তা যোগ করুন এবং সংরক্ষণ করুন

### সমস্যা: সেটআপ স্ক্রিপ্ট ব্যর্থ হয়েছে

**কারণ:** Firebase Service Account ফাইল সঠিক নয়
**সমাধান:**
1. Console থেকে নতুন Service Account JSON ডাউনলোড করুন
2. `.env.local` এ পথ পরীক্ষা করুন
3. স্ক্রিপ্টটি আবার চালান

### সমস্যা: লগইন পেজ লোড হচ্ছে না

**কারণ:** Firebase শুরু করার সমস্যা
**সমাধান:**
1. পরিবেশ ভেরিয়েবল পরীক্ষা করুন
2. নিশ্চিত করুন Firebase সংসদান সঠিক
3. ব্রাউজার কনসোল পরীক্ষা করুন সম্ভাব্য ত্রুটির জন্য

---

## 6. নিরাপত্তা নোট

### গুরুত্বপূর্ণ:

1. **কখনও সংসদান প্রকাশ করবেন না:**
   - Firebase API কীগুলি `.env.local` এ রাখুন (সর্বজনীন করবেন না)
   - Service Account JSON ফাইল নিরাপদে রাখুন

2. **শক্তিশালী পাসওয়ার্ড ব্যবহার করুন:**
   - উৎপাদনে শক্তিশালী পাসওয়ার্ড সেট করুন
   - নিয়মিত পাসওয়ার্ড পরিবর্তন করুন

3. **Firestore নিয়মগুলি কনফিগার করুন:**
   - শুধুমাত্র অনুমোদিত অ্যাডমিন ব্যবহারকারীরাই নির্দিষ্ট সংগ্রহ অ্যাক্সেস করতে পারে তা নিশ্চিত করুন

---

## 7. পরবর্তী পদক্ষেপ

1. **অতিরিক্ত অ্যাডমিন যোগ করুন:**
   - সেটআপ স্ক্রিপ্ট সম্পাদনা করুন এবং আরও ইমেইল যোগ করুন
   - অথবা Firebase Console এ ম্যানুয়ালি যোগ করুন

2. **লেখক ভূমিকা সেটআপ করুন:**
   - ব্যবহারকারীদের "author" ভূমিকা নিয়োগ করুন
   - তারা নিবন্ধ তৈরি ও সম্পাদনা করতে পারবে (প্রকাশ নয়)

3. **অনুমোদন ওয়ার্কফ্লো বাস্তবায়ন করুন:**
   - অ্যাডমিন দ্বারা প্রকাশনা অনুমোদন চাই
   - Firestore এ স্ট্যাটাস ফিল্ড যোগ করুন ("খসড়া", "অপেক্ষা", "প্রকাশিত")

---

## সমর্থন

যদি সমস্যা হয়:
1. ব্রাউজার কনসোল (DevTools) পরীক্ষা করুন
2. Firebase Console লগ পরীক্ষা করুন
3. এই গাইড পুনরায় পড়ুন এবং প্রতিটি ধাপ পুনরায় করুন

**সব প্রস্তুত! আপনার অ্যাডমিন ড্যাশবোর্ড এখন সক্রিয়।**
