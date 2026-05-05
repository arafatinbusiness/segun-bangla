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
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
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
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="128px"
            />
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
  return (
    <article className="group">
      <Link href={`/article/${article.slug}`}>
        <div className="relative w-full aspect-video overflow-hidden rounded bg-gray-100 mb-2">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
        <span className="text-[#FF0000] text-[10px] font-bold uppercase tracking-wider">
          {article.source || 'বিশেষ'}
        </span>
        <h3 className="text-[#000000] font-bold text-sm leading-tight line-clamp-2 mt-1 group-hover:text-[#FF0000] transition-colors">
          {article.title}
        </h3>
      </Link>
      <p className="text-xs text-[#444444] mt-2">{publishDate}</p>
    </article>
  )
}
