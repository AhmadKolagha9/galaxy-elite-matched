import { fetchSanityDocuments } from '@/lib/sanity'
import { marketPulse } from '@/lib/content'

export const marketPulseQuery = `*[_type == "marketPulse" && active == true] | order(publishedAt desc) {
  id,
  title,
  slug,
  category,
  summary,
  body,
  publishedAt,
  mainImage
}`

export type MarketPulseArticle = {
  id?: string
  _id?: string
  title?: string
  slug?: string | { current?: string }
  category?: string
  summary?: string
  excerpt?: string
  body?: unknown
  content?: unknown
  publishedAt?: string
  mainImage?: unknown
}

export type MarketPulseCardData = {
  id: string
  title: string
  slug: string
  category: string
  summary: string
  publishedAt: string
}

const fallbackArticles: MarketPulseCardData[] = marketPulse.map((item, index) => ({
  id: `fallback-market-pulse-${index + 1}`,
  title: item.value,
  slug: `market-pulse-${index + 1}`,
  category: item.label,
  summary: item.note,
  publishedAt: ''
}))

function slugFrom(value: MarketPulseArticle['slug'], fallback: string) {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (value && typeof value === 'object' && typeof value.current === 'string' && value.current.trim()) return value.current.trim()
  return fallback
}

function text(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function cardFromArticle(article: MarketPulseArticle, index: number): MarketPulseCardData {
  const title = text(article.title, 'Market pulse update')
  const fallbackSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `market-pulse-${index + 1}`

  return {
    id: text(article.id ?? article._id, fallbackSlug),
    title,
    slug: slugFrom(article.slug, fallbackSlug),
    category: text(article.category, 'Market intelligence'),
    summary: text(article.summary ?? article.excerpt, 'Approved market intelligence from Galaxy Elite Private Match.'),
    publishedAt: text(article.publishedAt)
  }
}

export async function getMarketPulseArticles() {
  const documents = await fetchSanityDocuments<MarketPulseArticle[]>(marketPulseQuery, [])
  const cards = documents.map(cardFromArticle)
  return cards.length ? cards : fallbackArticles
}
