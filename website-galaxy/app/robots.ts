import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/dashboard/', '/login', '/register', '/private-match', '/privacy', '/terms'] }],
    sitemap: `${site.url.replace(/\/$/, '')}/sitemap.xml`
  }
}
