import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

const routes = ['/', '/post-interest', '/interest-board', '/private-opportunities', '/for-agents', '/for-owners', '/for-landlords', '/for-developers', '/market-pulse', '/uae', '/uk', '/india']

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({ url: absoluteUrl(route), lastModified: new Date(), changeFrequency: route === '/' ? 'weekly' : 'monthly', priority: route === '/' ? 1 : 0.75 }))
}
