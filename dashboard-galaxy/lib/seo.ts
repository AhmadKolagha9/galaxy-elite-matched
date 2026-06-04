import type { Metadata } from 'next'
import { site } from '@/lib/site'

export function absoluteUrl(path = '/') {
  const base = site.url.replace(/\/$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

export function pageMetadata({
  title,
  description,
  path = '/',
  noindex = false
}: {
  title: string
  description: string
  path?: string
  noindex?: boolean
}): Metadata {
  const fullTitle = title.includes(site.company) ? title : `${title} | ${site.company}`
  const url = absoluteUrl(path)
  return {
    metadataBase: new URL(site.url),
    title: fullTitle,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: site.product,
      type: 'website',
      images: [{ url: absoluteUrl('/og/private-match-og.png'), width: 1200, height: 630, alt: site.product }]
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [absoluteUrl('/og/private-match-og.png')]
    }
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: site.company,
    url: site.url,
    email: site.email,
    areaServed: ['United Arab Emirates', 'United Kingdom', 'India', 'Global'],
    brand: {
      '@type': 'Brand',
      name: site.product,
      slogan: site.tagline
    },
    description: site.description
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.product,
    url: site.url,
    description: site.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${site.url}/interest-board?query={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  }
}
