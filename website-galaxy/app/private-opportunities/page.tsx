import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { PrivateOpportunitiesClient } from '@/components/PrivateOpportunitiesClient'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Investor Demand',
  description: 'Submit private investor demand through Galaxy Elite review-first workflow.',
  path: '/private-opportunities'
})

export default function PrivateOpportunitiesPage() {
  return (
    <>
      <PageHero eyebrow="Investor demand" title="Post investor demand for private matching.">
        <p>Private Club now handles property supply. Use this page when capital is looking for a specific asset, ticket range, yield profile or development opportunity.</p>
      </PageHero>
      <section className="section"><PrivateOpportunitiesClient /></section>
    </>
  )
}
