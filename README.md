# সেগুন বাংলা - বাংলাদেশের শীর্ষস্থানীয় সংবাদ পোর্টাল

একটি আধুনিক, উচ্চ-কর্মক্ষমতা সম্পন্ন বাংলা সংবাদ পোর্টাল যা Next.js, Tailwind CSS এবং Firebase দ্বারা চালিত।

## বৈশিষ্ট্য

✨ **মূল বৈশিষ্ট্য**
- দ্রুত লোডিং এবং SEO-অপ্টিমাইজড পৃষ্ঠা
- প্রতিক্রিয়াশীল ডিজাইন (মোবাইল, ট্যাবলেট, ডেস্কটপ)
- বাংলা ভাষা সমর্থন
- বিভাগ এবং উপ-বিভাগ ভিত্তিক সংবাদ ব্রাউজিং
- নমনীয় অনুসন্ধান কার্যকারিতা
- নিবন্ধ দেখার পরিসংখ্যান ট্র্যাকিং

🏗️ **প্রযুক্তিগত স্ট্যাক**
- **ফ্রেমওয়ার্ক**: Next.js 16 (App Router)
- **স্টাইলিং**: Tailwind CSS v4
- **ডাটাবেস**: Firebase Firestore
- **স্টোরেজ**: Firebase Cloud Storage
- **প্রমাণীকরণ**: Firebase Auth (আসন্ন)
- **হোস্টিং**: Vercel

## প্রজেক্ট কাঠামো

```
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Homepage
│   ├── article/[slug]/
│   │   └── page.tsx            # Dynamic article pages
│   ├── category/[slug]/
│   │   └── page.tsx            # Category pages
│   ├── search/
│   │   └── page.tsx            # Search results page
│   ├── not-found.tsx           # 404 page
│   └── globals.css             # Global styles
├── components/
│   ├── header.tsx              # Navigation header
│   ├── footer.tsx              # Footer
│   ├── article-card.tsx        # Reusable article card
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── firebase.ts             # Firebase configuration
│   ├── types.ts                # TypeScript interfaces
│   └── services/
│       ├── articles.ts         # Article data operations
│       └── categories.ts       # Category data operations
├── scripts/
│   └── seed-db.mjs             # Database seeding script
├── public/                     # Static assets
└── .env.example                # Environment variables template
```

## দ্রুত শুরু করুন

### পূর্বশর্ত
- Node.js 18+ এবং pnpm
- Firebase প্রকল্প
- Vercel অ্যাকাউন্ট (ডিপ্লয়মেন্টের জন্য)

### ইনস্টলেশন

1. **প্রকল্প ক্লোন করুন বা ডাউনলোড করুন**
   ```bash
   git clone <repository-url>
   cd segun-bangla
   ```

2. **নির্ভরতা ইনস্টল করুন**
   ```bash
   pnpm install
   ```

3. **পরিবেশ ভেরিয়েবল সেট করুন**
   ```bash
   cp .env.example .env.local
   ```

   এবং আপনার Firebase প্রকল্পের শংসাপত্র দিয়ে `.env.local` সম্পাদন করুন।

4. **উন্নয়ন সার্ভার চালু করুন**
   ```bash
   pnpm dev
   ```

   `http://localhost:3000` এ ভিজিট করুন

## Firebase সেটআপ

### Firestore কালেকশন কাঠামো

**categories** কালেকশন:
```javascript
{
  id: string,
  name: string,
  slug: string,
  description?: string,
  order: number,
  subcategories: {
    id: string,
    name: string,
    slug: string,
    order: number
  }[]
}
```

**articles** কালেকশন:
```javascript
{
  title: string,
  slug: string,
  content: string,
  excerpt: string,
  imageUrl: string,
  categoryId: string,
  subcategoryId?: string,
  authorId: string,
  isLead: boolean,
  isSpecial: boolean,
  isFeatured: boolean,
  publishedAt: number,
  updatedAt: number,
  viewCount: number,
  tags?: string[]
}
```

### নমুনা ডেটা দিয়ে বীজ বপন করুন

```bash
pnpm run seed-db
```

## পরিবেশ ভেরিয়েবল

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://example.com

# Firebase Emulator (optional)
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
```

## ডেভেলপমেন্ট

### উপলব্ধ স্ক্রিপ্ট

```bash
pnpm dev        # উন্নয়ন সার্ভার চালু করুন
pnpm build      # উৎপাদনের জন্য বিল্ড করুন
pnpm start      # উৎপাদন সার্ভার চালু করুন
pnpm lint       # কোড লিন্ট করুন
pnpm seed-db    # নমুনা ডেটা দিয়ে বীজ বপন করুন
```

### কোডিং মান

এই প্রকল্পটি নিম্নলিখিত সেরা অনুশীলন অনুসরণ করে:

- TypeScript শক্তিশালী প্রকার নিরাপত্তার জন্য
- Server Components SEO এবং কর্মক্ষমতার জন্য
- Tailwind CSS ইউটিলিটি-প্রথম স্টাইলিং এর জন্য
- Responsive Design মোবাইল-প্রথম পদ্ধতি
- সিমান্টিক HTML অ্যাক্সেসযোগ্যতার জন্য

## স্থাপনা

### Vercel এ স্থাপনা করুন

সবচেয়ে সহজ স্থাপনা বিকল্প:

1. GitHub এ আপনার রেপোজিটরি পুশ করুন
2. https://vercel.com এ আপনার অ্যাকাউন্ট সংযোগ করুন
3. নতুন প্রকল্প যোগ করুন এবং রেপোজিটরি নির্বাচন করুন
4. পরিবেশ ভেরিয়েবল যোগ করুন
5. স্থাপনা করুন!

## পারফরম্যান্স অপ্টিমাইজেশন

- ✅ Image Optimization (Next.js Image)
- ✅ Incremental Static Regeneration (ISR)
- ✅ Code Splitting
- ✅ CSS Minification
- ✅ JSON-LD Structured Data

## ভবিষ্যত বৈশিষ্ট্য

- 🔄 ব্যবহারকারী অ্যাকাউন্ট এবং সাবস্ক্রিপশন
- 💬 মন্তব্য সিস্টেম
- 📊 বিস্তারিত বিশ্লেষণ ড্যাশবোর্ড
- 🔔 পুশ বিজ্ঞপ্তি
- 🌙 ডার্ক মোড থিম
- 📱 নেটিভ মোবাইল অ্যাপ

## অবদান রাখুন

আমরা সম্প্রদায়ের অবদান স্বাগত জানাই! অনুগ্রহ করুন:

1. প্রকল্পটি ফর্ক করুন
2. একটি ফিচার শাখা তৈরি করুন (`git checkout -b feature/amazing-feature`)
3. আপনার পরিবর্তনগুলি কমিট করুন (`git commit -m 'Add amazing feature'`)
4. শাখায় পুশ করুন (`git push origin feature/amazing-feature`)
5. একটি পুল রিকোয়েস্ট খুলুন

## লাইসেন্স

এই প্রকল্পটি MIT লাইসেন্সের অধীন। বিস্তারিত জানতে `LICENSE` ফাইলটি দেখুন।

## সমর্থন

প্রশ্ন বা সমস্যার জন্য, অনুগ্রহ করে একটি ইস্যু খুলুন বা আমাদের সাথে যোগাযোগ করুন।

---

**সেগুন বাংলা দিয়ে বাংলাদেশের খবর পান! 🇧🇩**
