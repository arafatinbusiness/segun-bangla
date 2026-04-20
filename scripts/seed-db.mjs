import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  writeBatch,
  doc,
} from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = [
  {
    name: 'দেশীয় সংবাদ',
    slug: 'domestic-news',
    description: 'বাংলাদেশের সকল গুরুত্বপূর্ণ সংবাদ',
    order: 1,
  },
  {
    name: 'আন্তর্জাতিক',
    slug: 'international',
    description: 'বিশ্বজুড়ে সর্বশেষ ঘটনাবলী',
    order: 2,
  },
  {
    name: 'ক্রীড়া',
    slug: 'sports',
    description: 'খেলাধুলার সব খবর',
    order: 3,
  },
  {
    name: 'বিনোদন',
    slug: 'entertainment',
    description: 'সিনেমা, সঙ্গীত এবং শিল্পকলা',
    order: 4,
  },
  {
    name: 'প্রযুক্তি',
    slug: 'technology',
    description: 'প্রযুক্তি জগতের নতুন আবিষ্কার',
    order: 5,
  },
];

const subcategories = {
  'domestic-news': [
    { name: 'রাজনীতি', slug: 'politics', order: 1 },
    { name: 'অর্থনীতি', slug: 'economy', order: 2 },
    { name: 'সামাজিক', slug: 'social', order: 3 },
  ],
  'international': [
    { name: 'এশিয়া', slug: 'asia', order: 1 },
    { name: 'ইউরোপ', slug: 'europe', order: 2 },
    { name: 'আমেরিকা', slug: 'americas', order: 3 },
  ],
  'sports': [
    { name: 'ক্রিকেট', slug: 'cricket', order: 1 },
    { name: 'ফুটবল', slug: 'football', order: 2 },
  ],
};

const sampleArticles = [
  {
    title: 'বাংলাদেশের অর্থনীতি ক্রমাগত উন্নতি করছে',
    slug: 'bangladesh-economy-improving',
    excerpt: 'সর্বশেষ পরিসংখ্যান অনুযায়ী বাংলাদেশের অর্থনীতি গত বছরের তুলনায় ৬.৫% বৃদ্ধি পেয়েছে।',
    content: 'বাংলাদেশের অর্থনীতি ক্রমাগত উন্নতি করছে এবং এটি দক্ষিণ এশিয়ার দ্রুততম বর্ধনশীল অর্থনীতিগুলির মধ্যে একটি। সর্বশেষ পরিসংখ্যান অনুযায়ী দেশের মোট দেশজ পণ্য (জিডিপি) গত বছরের তুলনায় ৬.৫% বৃদ্ধি পেয়েছে। এই বৃদ্ধি বিভিন্ন খাতে উন্নতির ফলস্বরূপ, যেমন কৃষি, শিল্প এবং সেবা খাত।',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
    isLead: true,
    isSpecial: false,
    isFeatured: true,
    publishedAt: Date.now() - 1000000,
    updatedAt: Date.now(),
    viewCount: 5420,
    tags: ['অর্থনীতি', 'বাংলাদেশ'],
  },
  {
    title: 'বাংলাদেশ ক্রিকেট টিম আন্তর্জাতিক ম্যাচে বিজয়ী',
    slug: 'bangladesh-cricket-team-wins',
    excerpt: 'বাংলাদেশের জাতীয় ক্রিকেট দল আজ একটি রোমাঞ্চকর ম্যাচে বিশ্ব র‍্যাঙ্কিংয়ে তৃতীয় স্থানীয় দলকে পরাজিত করেছে।',
    content: 'বাংলাদেশের জাতীয় ক্রিকেট দল আজ একটি রোমাঞ্চকর এবং ঐতিহাসিক ম্যাচে বিশ্ব র‍্যাঙ্কিংয়ে তৃতীয় স্থানীয় একটি পেশাদার দলকে পরাজিত করেছে। এই বিজয় বাংলাদেশী ক্রিকেটারদের জন্য একটি গর্বের মুহূর্ত এবং এটি দেশের ক্রিকেটিং সম্ভাবনা প্রদর্শন করে।',
    imageUrl: 'https://images.unsplash.com/photo-1540159550336-aff92a04f4f5?w=800&h=600&fit=crop',
    isLead: false,
    isSpecial: true,
    isFeatured: true,
    publishedAt: Date.now() - 2000000,
    updatedAt: Date.now(),
    viewCount: 8932,
    tags: ['ক্রিকেট', 'ক্রীড়া'],
  },
  {
    title: 'নতুন মোবাইল প্রযুক্তি বাজারে বিপ্লব আনতে চলেছে',
    slug: 'new-mobile-technology',
    excerpt: 'আগামী মাসে একটি নতুন মোবাইল প্রযুক্তি বাজারে আসতে চলেছে যা সম্পূর্ণভাবে আমাদের ব্যবহারের পদ্ধতি পরিবর্তন করবে।',
    content: 'আগামী মাসে একটি নতুন মোবাইল প্রযুক্তি বাজারে আসতে চলেছে যা সম্পূর্ণভাবে আমাদের স্মার্টফোন ব্যবহারের পদ্ধতি পরিবর্তন করবে। এই প্রযুক্তিটি কৃত্রিম বুদ্ধিমত্তা এবং মেশিন লার্নিং এর উন্নত ব্যবহার করে ব্যবহারকারীদের একটি অভূতপূর্ব অভিজ্ঞতা প্রদান করবে।',
    imageUrl: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800&h=600&fit=crop',
    isLead: false,
    isSpecial: false,
    isFeatured: true,
    publishedAt: Date.now() - 3000000,
    updatedAt: Date.now(),
    viewCount: 3200,
    tags: ['প্রযুক্তি', 'মোবাইল'],
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 সংস্করণ শুরু হচ্ছে...');

    // Add categories
    console.log('📁 ক্যাটাগরি যোগ করছেন...');
    const categoryRefs = {};

    for (const category of categories) {
      const docRef = await addDoc(collection(db, 'categories'), {
        name: category.name,
        slug: category.slug,
        description: category.description,
        order: category.order,
      });
      categoryRefs[category.slug] = docRef.id;
      console.log(`✅ যোগ করা হয়েছে: ${category.name}`);

      // Add subcategories
      if (subcategories[category.slug]) {
        for (const sub of subcategories[category.slug]) {
          await addDoc(
            collection(db, 'categories', docRef.id, 'subcategories'),
            {
              name: sub.name,
              slug: sub.slug,
              order: sub.order,
            }
          );
          console.log(`  └─ সাব-ক্যাটাগরি যোগ: ${sub.name}`);
        }
      }
    }

    // Add sample articles
    console.log('\n📰 নিবন্ধ যোগ করছেন...');
    for (let i = 0; i < sampleArticles.length; i++) {
      const article = sampleArticles[i];
      const categorySlug = i === 0 ? 'domestic-news' : i === 1 ? 'sports' : 'technology';

      await addDoc(collection(db, 'articles'), {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        imageUrl: article.imageUrl,
        categoryId: categoryRefs[categorySlug],
        authorId: 'demo-author-1',
        isLead: article.isLead,
        isSpecial: article.isSpecial,
        isFeatured: article.isFeatured,
        publishedAt: article.publishedAt,
        updatedAt: article.updatedAt,
        viewCount: article.viewCount,
        tags: article.tags,
      });
      console.log(`✅ যোগ করা হয়েছে: ${article.title}`);
    }

    console.log('\n✨ সংস্করণ সফলভাবে সম্পন্ন হয়েছে!');
    process.exit(0);
  } catch (error) {
    console.error('❌ ত্রুটি ঘটেছে:', error);
    process.exit(1);
  }
}

seedDatabase();
