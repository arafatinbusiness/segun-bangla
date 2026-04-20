# সেগুন বাংলা - অনলাইন সংবাদ পোর্টাল

A complete, production-ready Bengali news portal built with modern web technologies.

## 🎯 Project Overview

Segun Bangla is a comprehensive online news platform with:
- User authentication and profiles
- Admin dashboard for article management
- Email notification system
- Advanced search and filtering
- Analytics and SEO optimization
- Image optimization with CDN
- Performance monitoring
- Full deployment pipeline

## 🚀 Features Implemented

### Core Features
- ✅ **User Authentication** - Firebase Auth with email/password
- ✅ **Admin Dashboard** - Full CRUD for articles, categories, and subcategories
- ✅ **Article Management** - Create, edit, publish, and archive articles
- ✅ **Category System** - Organize content with categories and subcategories
- ✅ **User Profiles** - Personalized user profiles with preferences
- ✅ **Email Notifications** - Welcome, article, and subscription emails via Resend

### Advanced Features
- ✅ **Advanced Search** - Multi-filter search with sorting and date ranges
- ✅ **Analytics Tracking** - User engagement and article view tracking
- ✅ **Dynamic Sitemap** - Auto-generated XML sitemap for SEO
- ✅ **Robots.txt** - Search engine crawling rules
- ✅ **Image Optimization** - Responsive images with CDN support
- ✅ **Performance Monitoring** - Built-in analytics and error tracking

## 📦 Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Component library
- **React 19** - Latest React features

### Backend & Database
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User auth
- **Firebase Storage** - File storage

### Services
- **Resend** - Email service
- **Vercel** - Hosting and deployment
- **Next.js Image Optimization** - Image CDN

## 📋 Project Structure

```
segun-bangla/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   ├── admin/                   # Admin dashboard
│   ├── profile/                 # User profiles
│   ├── search/                  # Search page
│   ├── article/                 # Article detail page
│   ├── category/                # Category pages
│   └── api/                     # API routes
├── components/                  # Reusable React components
│   ├── header.tsx              # Navigation header
│   ├── article-card.tsx        # Article preview card
│   ├── advanced-search.tsx     # Search with filters
│   ├── optimized-image.tsx     # Image optimization
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── firebase.ts             # Firebase config
│   ├── auth-context.tsx        # Auth provider
│   ├── types.ts                # TypeScript types
│   └── services/               # Business logic
│       ├── articles.ts         # Article operations
│       ├── categories.ts       # Category operations
│       ├── email.ts            # Email sending
│       ├── analytics.ts        # Analytics tracking
│       └── image-optimization.ts # Image utilities
├── public/                      # Static assets
│   └── robots.txt              # SEO robots file
├── styles/
│   └── globals.css             # Global styles
├── .env.example                # Environment variables template
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- npm/pnpm/yarn
- Firebase project
- Resend email API key (optional)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/segun-bangla.git
cd segun-bangla
```

### 2. Install Dependencies
```bash
pnpm install
# or
npm install
# or
yarn install
```

### 3. Configure Environment Variables
```bash
# Copy example to .env.local
cp .env.example .env.local

# Edit .env.local with your actual values
nano .env.local
```

Required variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
RESEND_API_KEY=
```

### 4. Firebase Setup
1. Create Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Enable Firebase Authentication (Email/Password)
4. Copy credentials to `.env.local`

### 5. Create Firestore Collections
Collections needed:
- `categories` - News categories
- `articles` - News articles
- `users` - User profiles
- `subscriptions` - Email subscriptions

### 6. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### For Readers
1. **Browse articles** by category on homepage
2. **Search** using advanced search filters
3. **Create account** to save preferences
4. **Subscribe** to categories for email updates
5. **Manage** email preferences in profile

### For Administrators
1. **Login** with admin credentials
2. **Dashboard** at `/admin`
3. **Create articles** with title, content, category
4. **Upload images** for featured content
5. **Publish/schedule** articles
6. **Monitor** article analytics

### For Developers
1. **API routes** in `app/api/`
2. **Services** in `lib/services/`
3. **Components** in `components/`
4. **Types** in `lib/types.ts`
5. **Styling** with Tailwind CSS

## 🎨 Customization

### Colors & Branding
Edit in `app/globals.css`:
```css
@theme {
  --color-primary: #0066cc;
  --color-secondary: #ff6b6b;
  /* ... more colors ... */
}
```

### Typography
Edit in `app/layout.tsx`:
```typescript
import { YourFont } from 'next/font/google'
const yourFont = YourFont({ subsets: ['latin'] })
```

### Components
All components in `components/` can be customized:
- Modify styling
- Change behavior
- Add new props
- Extend functionality

## 📚 Documentation

### Detailed Guides
- **[Email Notifications](./EMAIL_NOTIFICATIONS_GUIDE.md)** - Setup and usage
- **[Analytics & SEO](./ANALYTICS_SITEMAP_GUIDE.md)** - Tracking and optimization
- **[Deployment](./DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Architecture](./ARCHITECTURE.md)** - System design (if exists)

### API Documentation
See `app/api/` for endpoint specifications:
- `POST /api/articles` - Create article
- `GET /api/articles` - List articles
- `PUT /api/articles/[id]` - Update article
- `DELETE /api/articles/[id]` - Delete article

## 🚀 Deployment

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Setup
1. Set environment variables in Vercel dashboard
2. Configure custom domain
3. Enable production SSL
4. Set up automatic deployments from Git

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🔒 Security

### Best Practices Implemented
- ✅ Firebase security rules configured
- ✅ No hardcoded secrets
- ✅ Environment variable validation
- ✅ HTTPS only communication
- ✅ CORS properly configured
- ✅ Input validation on all forms
- ✅ Password hashing via Firebase
- ✅ Session management with tokens

### Security Checklist
- [ ] Review Firebase rules for production
- [ ] Enable email verification
- [ ] Set up password reset flow
- [ ] Configure rate limiting
- [ ] Monitor authentication logs
- [ ] Regular security audits

## 📊 Analytics

### Configured Analytics
- Google Analytics integration ready
- Custom event tracking
- User engagement monitoring
- Article view tracking
- Search analytics

### Enable Google Analytics
1. Create GA4 property
2. Set `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`
3. Verify tracking in GA dashboard

## 🎯 Performance Metrics

### Target Metrics
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### Optimization Features
- Image optimization with next/image
- Code splitting and lazy loading
- ISR (Incremental Static Regeneration)
- Database query optimization
- Caching strategies

## 🧪 Testing

### Run Tests (if implemented)
```bash
pnpm test
```

### Type Checking
```bash
pnpm type-check
```

### Linting
```bash
pnpm lint
```

### Build
```bash
pnpm build
```

## 🤝 Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes following code style
3. Test thoroughly
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Create Pull Request

### Code Style
- Use TypeScript for type safety
- Follow ESLint rules
- Format with Prettier
- Write meaningful comments
- Test new features

## 🐛 Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm build
```

**Firebase Connection Error**
- Verify `.env.local` has correct values
- Check Firebase project is active
- Ensure Firestore is enabled
- Review security rules

**Email Not Sending**
- Check RESEND_API_KEY is set
- Verify email format is correct
- Check spam folder
- Review Resend dashboard logs

**Images Not Loading**
- Verify Firebase Storage access
- Check image URLs are correct
- Review CORS configuration
- Check image optimization settings

## 📝 License

MIT License - See LICENSE file for details

## 📞 Support

### Getting Help
1. Check documentation in guides
2. Search GitHub issues
3. Review Firebase documentation
4. Check Next.js docs
5. Contact project maintainers

### Community
- GitHub Issues: Bug reports and features
- GitHub Discussions: Questions and ideas
- Email: support@segunbangla.com (if available)

## 🎉 Acknowledgments

Built with:
- [Next.js](https://nextjs.org)
- [Firebase](https://firebase.google.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Vercel](https://vercel.com)

## 📈 Roadmap

### Phase 1 - Core (✅ Complete)
- [x] User authentication
- [x] Article management
- [x] Basic search
- [x] Email notifications

### Phase 2 - Enhancement (✅ Complete)
- [x] Advanced search
- [x] Analytics tracking
- [x] Image optimization
- [x] SEO optimization

### Phase 3 - Scaling
- [ ] Admin user roles
- [ ] Comment system
- [ ] Article recommendations
- [ ] Mobile app (React Native)

### Phase 4 - Monetization
- [ ] Premium subscriptions
- [ ] Ad integration
- [ ] Content sponsorship
- [ ] API access

## 🔄 Updates and Maintenance

### Regular Tasks
- Update dependencies monthly
- Review security quarterly
- Check performance metrics weekly
- Monitor error rates daily
- Backup database daily

### Version History
- **v1.0.0** (Current) - Initial release with all core features

## 📄 Additional Notes

This project demonstrates best practices for:
- Building scalable Next.js applications
- Firebase database design
- User authentication flows
- Email integration
- Analytics implementation
- SEO optimization
- Production deployment

For questions or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for Bengali news readers**

سیگون بنگلہ - آن لائن خبروں کی پورٹل
سেগুন बंगला - ऑनलाइन समाचार पोर्टल

Happy coding! 🚀
