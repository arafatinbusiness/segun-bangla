import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.segunbangla.com'
const siteName = 'সেগুন বাংলা'
const siteDescription = 'সেগুন বাংলায় পান সর্বশেষ বাংলাদেশ এবং আন্তর্জাতিক সংবাদ। রাজনীতি, ক্রীড়া, বিনোদন, ব্যবসা, চাকরি, আবহাওয়া, খেলাধুলা এবং প্রযুক্তির খবর পড়ুন।'

export const metadata: Metadata = {
  title: {
    default: `${siteName} - বাংলাদেশের শীর্ষস্থানীয় সংবাদ পোর্টাল`,
    template: `%s - ${siteName}`,
  },
  description: siteDescription,
  generator: 'Next.js',
  keywords: [
    'সেগুন বাংলা',
    'bangla news',
    'বাংলা খবর',
    'আজকের খবর',
    'bangladesh news',
    'বাংলাদেশের খবর',
    'খবর',
    'khobor',
    'আবহাওয়ার খবর',
    'চাকরির খবর',
    'পে স্কেল',
    'খেলার খবর',
    'আন্তর্জাতিক খবর',
    'রাজনীতি',
    'ক্রীড়া',
    'তাজা খবর',
    'ব্রেকিং নিউজ',
    'live news',
    'today news',
    'latest news bangladesh',
  ],
  authors: [
    {
      name: siteName,
      url: siteUrl,
    },
  ],
  metadataBase: new URL(siteUrl),
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: siteUrl,
    siteName: siteName,
    locale: 'bn_BD',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: [`${siteUrl}/logo.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'H-RG64OgOajqZ7Sex1XlW0SUCfkzX1U920Yc3v4i-NU',
  },
  category: 'news',
  other: {
    'fb:app_id': '', // Add Facebook app ID if you have one
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      // Add social media URLs when available
      // 'https://facebook.com/...',
      // 'https://youtube.com/...',
      // 'https://twitter.com/...',
    ],
    description: siteDescription,
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BD',
    },
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="bn" className="bg-background">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href={siteUrl} />
        <link rel="preconnect" href={siteUrl} />
        <meta name="geo.country" content="BD" />
        <meta name="geo.placename" content="Bangladesh" />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-71ES9GL54Y" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-71ES9GL54Y');
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </AuthProvider>
      </body>
    </html>
  )
}