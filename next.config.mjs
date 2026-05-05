/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Skip page data collection during build for dynamic routes
  // Firebase will be properly configured at runtime
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  // Generate unique build ID so browsers detect new deployments
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // Cache headers: allow caching but force revalidation on every visit
  // This ensures readers get fast loads from cache,
  // but always see the latest version after a deployment
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
}

export default nextConfig
