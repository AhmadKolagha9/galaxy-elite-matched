import type { MarketPulseCardData } from '@/lib/market-pulse'

function formatDate(value: string) {
  if (!value) return 'Latest'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Latest'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export function MarketPulseCard({ article }: { article: MarketPulseCardData }) {
  return (
    <article className="market-card market-pulse-card">
      <span>{article.category}</span>
      <strong>{article.title}</strong>
      <p>{article.summary}</p>
      <div className="pulse-meta">
        <time dateTime={article.publishedAt || undefined}>{formatDate(article.publishedAt)}</time>
        <span>Approved insight</span>
      </div>
    </article>
  )
}
