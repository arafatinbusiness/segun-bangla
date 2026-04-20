# Code Architecture & Refactoring Guide

## মডুলার সার্ভিস আর্কিটেকচার

আমরা একটি পরিষ্কার, রক্ষণাবেক্ষণযোগ্য কোড সংগঠন তৈরি করেছি যা স্কেলেবল এবং পরীক্ষাযোগ্য।

---

## সার্ভিস লেয়ার পৃথকীকরণ

### আগে (একক ফাইল):
```
lib/services/auth.ts (বিশাল ফাইল - সবকিছু মিশ্রিত)
```

### এখন (মডুলার):
```
lib/services/auth/
├── auth-service.ts      (শুধু প্রমাণীকরণ)
├── user-service.ts      (শুধু প্রোফাইল)
├── role-service.ts      (শুধু অনুমোদন)
└── index.ts             (রপ্তানি)
```

---

## প্রতিটি সার্ভিস কী করে?

### 1. `auth-service.ts` - Firebase প্রমাণীকরণ

**দায়িত্ব:**
- ব্যবহারকারী নিবন্ধন
- ব্যবহারকারী লগইন
- ব্যবহারকারী লগআউট
- পাসওয়ার্ড রিসেট
- বর্তমান ব্যবহারকারী পান

**স্বাধীন:**
- Firestore সম্পর্কে জানে না
- ভূমিকা সম্পর্কে জানে না

**উদাহরণ ব্যবহার:**
```typescript
import { loginUser } from '@/lib/services/auth/auth-service'

const result = await loginUser('user@example.com', 'password123')
console.log(result.uid) // Firebase UID
```

---

### 2. `user-service.ts` - Firestore প্রোফাইল

**দায়িত্ব:**
- Firestore এ ব্যবহারকারী প্রোফাইল তৈরি করা
- প্রোফাইল ডেটা পাওয়া
- প্রোফাইল আপডেট করা
- অ্যাডমিন ভূমিকা নির্ধারণ করা

**স্বাধীন:**
- Firebase Auth সম্পর্কে জানে না (শুধু UID গ্রহণ করে)
- ভূমিকা যাচাইকরণ সম্পর্কে জানে না

**ডেটা স্ট্রাকচার:**
```typescript
interface UserProfile {
  uid: string
  email: string
  displayName?: string
  role: 'user' | 'author' | 'admin'
  createdAt: number
  lastLogin?: number
  photoURL?: string
}
```

**উদাহরণ ব্যবহার:**
```typescript
import { createUserProfile, getUserProfile } from '@/lib/services/auth/user-service'

// প্রোফাইল তৈরি করা
await createUserProfile('uid123', 'user@example.com', 'John')

// প্রোফাইল পাওয়া
const profile = await getUserProfile('uid123')
console.log(profile.role) // 'admin', 'author', বা 'user'
```

---

### 3. `role-service.ts` - অনুমোদন এবং যাচাইকরণ

**দায়িত্ব:**
- ব্যবহারকারীর ভূমিকা চেক করা
- অ্যাডমিন স্ট্যাটাস যাচাই করা
- লেখক স্ট্যাটাস যাচাই করা
- অনুমোদন সিদ্ধান্ত নেওয়া

**স্বাধীন:**
- প্রমাণীকরণ বা প্রোফাইল তৈরি করে না
- শুধু ডেটা পরীক্ষা করে

**অনুমোদন চেকলিস্ট:**
```typescript
// যাচাইকরণ ফাংশন
canAccessAdminPanel(profile)      // অ্যাডমিন?
canEditArticle(profile)           // লেখক বা অ্যাডমিন?
canManageUsers(profile)           // অ্যাডমিন?
```

**উদাহরণ ব্যবহার:**
```typescript
import { isAdmin, canEditArticle } from '@/lib/services/auth/role-service'

const userIsAdmin = await isAdmin('uid123')
if (userIsAdmin) {
  // অ্যাডমিন বৈশিষ্ট্য দেখান
}
```

---

## কম্পোনেন্ট ইন্টিগ্রেশন

### পদ্ধতি 1: সার্ভিস সরাসরি ব্যবহার করা

**পৃষ্ঠা বা ফর্মে:**
```typescript
// app/login/page.tsx
import { loginUser } from '@/lib/services/auth'
import { isAdmin } from '@/lib/services/auth'

async function handleLogin(email, password) {
  const user = await loginUser(email, password)
  const admin = await isAdmin(user.uid)
  
  if (admin) {
    router.push('/admin')
  }
}
```

---

### পদ্ধতি 2: React হুকস ব্যবহার করা (সুপারিশকৃত)

**যেকোনো কম্পোনেন্টে:**
```typescript
import { useAuth, useIsAdmin } from '@/lib/hooks/use-auth'

function MyComponent() {
  const { user, profile, loading } = useAuth()
  const isAdmin = useIsAdmin()
  
  if (loading) return <div>লোড হচ্ছে...</div>
  
  return (
    <div>
      <p>হ্যালো, {profile?.displayName}</p>
      {isAdmin && <AdminFeatures />}
    </div>
  )
}
```

---

### পদ্ধতি 3: প্রসঙ্গ সরাসরি ব্যবহার করা

**উন্নত ব্যবহারের জন্য:**
```typescript
import { AuthContext } from '@/lib/auth-context'

function MyComponent() {
  const authContext = useContext(AuthContext)
  // সম্পূর্ণ অ্যাক্সেস সব তথ্যে
}
```

---

## ডেটা প্রবাহ

### লগইন প্রবাহ:
```
user@login.tsx
    ↓ loginUser()
    ↓
auth-service.ts (Firebase সাথে কথা বলে)
    ↓ UID প্রদান করে
    ↓
isAdmin(uid)
    ↓
user-service.ts (Firestore থেকে প্রোফাইল পায়)
    ↓
role-service.ts (ভূমিকা চেক করে)
    ↓ true/false
    ↓
রাউটার → /admin বা /
```

### প্রোফাইল অ্যাক্সেস:
```
component.tsx
    ↓ useAuth()
    ↓
auth-context.tsx
    ↓ onAuthStateChanged
    ↓
auth-service.ts (বর্তমান ব্যবহারকারী পায়)
    ↓ UID পায়
    ↓
user-service.ts (প্রোফাইল লোড করে)
    ↓
context এ সংরক্ষণ করে
    ↓ কম্পোনেন্টে উপলব্ধ
```

---

## ত্রুটি পরিচালনা

প্রতিটি সার্ভিসে সুসংগত ত্রুটি পরিচালনা:

```typescript
// auth-service.ts
export interface AuthError {
  code: string
  message: string
}

// ত্রুটি ম্যাপিং (বাংলায়)
const errorMessages = {
  'auth/email-already-in-use': 'এই ইমেইল ইতিমধ্যে নিবন্ধিত',
  'auth/invalid-email': 'অবৈধ ইমেইল ঠিকানা',
  'auth/weak-password': 'পাসওয়ার্ড কমপক্ষে 6 অক্ষর',
}
```

---

## পরীক্ষা কৌশল

এই মডুলার কাঠামোর সাথে পরীক্ষা করা সহজ:

### auth-service.ts পরীক্ষা করা:
```typescript
// শুধু Firebase Auth কে মক করুন
jest.mock('firebase/auth')

test('loginUser ত্রুটি ফেরত দেয়', async () => {
  const error = await loginUser('invalid', 'password')
  expect(error.code).toBe('auth/user-not-found')
})
```

### user-service.ts পরীক্ষা করা:
```typescript
// শুধু Firestore কে মক করুন
jest.mock('firebase/firestore')

test('getUserProfile প্রোফাইল প্রদান করে', async () => {
  const profile = await getUserProfile('uid123')
  expect(profile.role).toBe('admin')
})
```

### role-service.ts পরীক্ষা করা:
```typescript
// কোন Firebase মক প্রয়োজন নেই
// শুধু প্রোফাইল অবজেক্ট পাস করুন

test('isAdmin সঠিক ফলাফল প্রদান করে', () => {
  const admin = canAccessAdminPanel({ role: 'admin' })
  expect(admin).toBe(true)
})
```

---

## সুবিধা এই আর্কিটেকচারের

### 1. পৃথকীকরণ (Separation of Concerns)
প্রতিটি সার্ভিস একটি কাজ করে এবং তা ভালোভাবে করে।

### 2. পুনর্ব্যবহারযোগ্যতা (Reusability)
যেকোনো জায়গায় সার্ভিস ব্যবহার করুন:
```typescript
// পৃষ্ঠায়
import { loginUser } from '@/lib/services/auth'

// API রুটে
import { isAdmin } from '@/lib/services/auth'

// অন্য সার্ভিসে
import { getUserProfile } from '@/lib/services/auth'
```

### 3. রক্ষণাবেক্ষণযোগ্যতা (Maintainability)
প্রতিটি সার্ভিস ছোট এবং বোধগম্য।

### 4. পরীক্ষাযোগ্যতা (Testability)
প্রতিটি সার্ভিস স্বাধীনভাবে পরীক্ষা করুন।

### 5. স্কেলেবিলিটি (Scalability)
নতুন বৈশিষ্ট্য যোগ করা সহজ।

---

## ভবিষ্যত বিস্তারে আপডেটস

যখন আপনি নতুন বৈশিষ্ট্য যোগ করেন:

### নতুন অনুমোদন যোগ করা:
```typescript
// role-service.ts এ যোগ করুন
export function canPublishArticles(profile: UserProfile): boolean {
  return profile.role === 'admin' || profile.role === 'author'
}
```

### নতুন ব্যবহারকারী ক্ষেত্র যোগ করা:
```typescript
// user-service.ts এ যোগ করুন
export async function updateUserBio(uid: string, bio: string) {
  await updateDoc(doc(db, 'users', uid), { bio })
}
```

### নতুন প্রমাণীকরণ পদ্ধতি যোগ করা:
```typescript
// auth-service.ts এ যোগ করুন
export async function loginWithGoogle(credential) {
  // Google লজইন বাস্তবায়ন
}
```

---

## সংক্ষিপ্ত চেকলিস্ট

এই আর্কিটেকচার অনুসরণ করতে:

- [ ] প্রতিটি ফাইল একটি কাজ করে
- [ ] সার্ভিসগুলি একে অপরের সাথে জিজ্ঞাসা করে না
- [ ] কম্পোনেন্টগুলি `index.ts` থেকে রপ্তানি ব্যবহার করে
- [ ] ত্রুটিগুলি মানব-পঠনযোগ্য বার্তায় ম্যাপ করা হয়
- [ ] হুকস কম্পোনেন্টের মধ্যে ব্যবহৃত হয়
- [ ] প্রসঙ্গ বৈশ্বিকভাবে সরবরাহ করা হয়

**এই আর্কিটেকচার দীর্ঘমেয়াদী রক্ষণাবেক্ষণ এবং বৃদ্ধির জন্য প্রস্তুত!**
