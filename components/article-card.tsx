import Link from 'next/link'
import Image from 'next/image'
import type { FirestoreArticle } from '@/lib/types'

interface ArticleCardProps {
  article: FirestoreArticle
  variant?: 'default' | 'featured' | 'small'
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const publishDate = new Date(article.publishedAt).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (variant === 'featured') {
    return (
      <article className="group">
        <Link href={`/article/${article.slug}`}>
          <div className="relative h-48 md:h-64 w-full overflow-hidden rounded-lg bg-muted mb-4">
            {article.imageUrl ? (
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              </div>
            )}
          </div>

          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{article.excerpt}</p>
        <p className="text-xs text-muted-foreground mt-2">{publishDate}</p>
      </article>
    )
  }

  if (variant === 'small') {
    return (
      <article className="flex gap-3 group pb-3 border-b border-border last:border-b-0">
        <Link href={`/article/${article.slug}`} className="flex-shrink-0">
          <div className="relative h-20 w-24 md:h-24 md:w-32 rounded overflow-hidden bg-muted">
            {article.imageUrl ? (
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="128px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              </div>
            )}
          </div>

        </Link>
        <div className="flex-1 flex flex-col justify-between">
          <Link href={`/article/${article.slug}`}>
            <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h4>
          </Link>
          <p className="text-xs text-muted-foreground">{publishDate}</p>
        </div>
      </article>
    )
  }

  // Default card
  const cardImageAspect = article.imageSize === 'portrait' ? 'aspect-[3/4]' :
    article.imageSize === 'square' ? 'aspect-square' : 'aspect-video'
  const imageFocusStyle = article.imageFocus?.replace(/-/g, ' ') || 'center'
  
  return (
    <article className="group">
      <Link href={`/article/${article.slug}`}>
        <div className={`relative w-full ${cardImageAspect} overflow-hidden rounded bg-gray-100 mb-2`}>
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              style={{ objectPosition: imageFocusStyle }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </div>
          )}
        </div>

        <h3 className="text-sm font-bold leading-tight line-clamp-2 group-hover:text-[#FF0000] transition-colors">
          {article.shoulder ? (
            <>
              <span
                className="text-[#FF0000]"
                style={{ color: article.shoulderTextColor || article.shoulderColor || '#FF0000' }}
              >
                {article.shoulder}
              </span>
              <span className="text-[#FF0000] mx-1.5" style={{ color: article.shoulderTextColor || article.shoulderColor || '#FF0000' }}>•</span>
            </>
          ) : null}
          <span className="text-[#000000]">{article.title}</span>
        </h3>
      </Link>
      <p className="text-xs text-[#444444] mt-2">{publishDate}</p>
    </article>
  )
}
