'use client'

import { useState, useEffect } from 'react'
import { getAdvertisementsBySlot } from '@/lib/services/advertisements'
import type { Advertisement } from '@/lib/types'

interface AdRendererProps {
  slotName: string
  className?: string
  imageClassName?: string
  htmlClassName?: string
}

export function AdRenderer({ slotName, className = '', imageClassName = '', htmlClassName = '' }: AdRendererProps) {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchAds = async () => {
      try {
        const data = await getAdvertisementsBySlot(slotName)
        if (mounted) setAds(data)
      } catch (error) {
        console.error(`Error fetching ads for slot "${slotName}":`, error)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchAds()
    return () => { mounted = false }
  }, [slotName])

  if (loading || ads.length === 0) return null

  return (
    <>
      {ads.map((ad) => (
        <div key={ad.docId} className={className}>
          {ad.type === 'image' ? (
            ad.linkUrl ? (
              <a
                href={ad.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full h-full ${imageClassName}`}
              >
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              </a>
            ) : (
              <div className={`w-full h-full ${imageClassName}`}>
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )
          ) : (
            <div
              className={`w-full h-full ${htmlClassName}`}
              dangerouslySetInnerHTML={{ __html: ad.htmlCode || '' }}
            />
          )}
        </div>
      ))}
    </>
  )
}
