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
const siteDescription = 'বাংলা নিউজ, গালফ নিউজ ও বিশ্ব সংবাদ এর সর্বশেষ আপডেট। বাংলাদেশ, মধ্যপ্রাচ্য ও আন্তর্জাতিক রাজনীতি, অর্থনীতি, বিনোদন এবং প্রযুক্তির খবরের নির্ভরযোগ্য উৎস।'

export const metadata: Metadata = {
  title: {
    default: `${siteName} - বাংলা নিউজ | Gulf News | World News Bangla`,
    template: `%s - ${siteName}`,
  },
  description: siteDescription,
  generator: 'Next.js',
  keywords: [
    'বাংলা নিউজ',
    'gulf news',
    'world news bangla',
    'সেগুন বাংলা',
    'bangla news',
    'বাংলা খবর',
    'আজকের খবর',
    'bangladesh news',
    'মধ্যপ্রাচ্যের খবর',
    'আন্তর্জাতিক খবর',
    'রাজনীতি',
    'ক্রীড়া',
    'তাজা খবর',
    'ব্রেকিং নিউজ',
    'live news',
    'today news',
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
    'fb:app_id': '',
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
      'https://www.facebook.com/profile.php?id=61589151984086',
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
        <link rel="dns-prefetch" href={siteUrl} />
        <link rel="preconnect" href={siteUrl} />
        <meta name="geo.country" content="BD" />
        <meta name="geo.placename" content="Bangladesh" />
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