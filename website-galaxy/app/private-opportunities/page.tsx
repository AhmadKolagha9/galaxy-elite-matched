import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { PrivateOpportunitiesClient } from '@/components/PrivateOpportunitiesClient'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Private Opportunities',
  description: 'Submit private supply availability or investor demand through one Galaxy Elite review-first workflow.',
  path: '/private-opportunities'
})

export default function PrivateOpportunitiesPage({ searchParams }: { searchParams?: { mode?: string | string[] } }) {
  const mode = Array.isArray(searchParams?.mode) ? searchParams?.mode[0] : searchParams?.mode

  return (
    <>
      <PageHero eyebrow="Private opportunities" title="One place for private supply and investor demand.">
        <p>Choose the right workflow below. Availability and investor demand stay private by default, enter Galaxy Elite review, and only move forward through controlled matching and approval.</p>
      </PageHero>
      <section className="section"><PrivateOpportunitiesClient initialMode={mode} /></section>
    </>
  )
}
