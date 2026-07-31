'use client'

import Image from 'next/image'
import { useState } from 'react'
import {
  getOptimizedImageUrl,
  getThumbnailImage,
  generateSrcset,
  generateBlurPlaceholder,
} from '@/lib/services/image-optimization'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  sizes?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down'
  quality?: number
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  blurPlaceholder?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  priority = false,
  className = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  objectFit = 'cover',
  quality = 75,
  loading = 'lazy',
  onLoad,
  blurPlaceholder = false,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(!blurPlaceholder)
  const [blurUrl, setBlurUrl] = useState<string | null>(null)

  const optimizedSrc = getOptimizedImageUrl(src, { width, height, quality })

  const handleLoadComplete = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  // Generate blur placeholder on mount if enabled
  React.useEffect(() => {
    if (blurPlaceholder && !blurUrl) {
      generateBlurPlaceholder(src).then(setBlurUrl)
    }
  }, [blurPlaceholder, src, blurUrl])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={loading}
        sizes={sizes}
        placeholder={blurUrl ? 'blur' : 'empty'}
        blurDataURL={blurUrl || undefined}
        onLoadingComplete={handleLoadComplete}
        style={{
          objectFit,
        }}
        className={`w-full h-full transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {!isLoaded && blurPlaceholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}
