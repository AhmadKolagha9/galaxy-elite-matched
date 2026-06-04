import type { Metadata } from 'next'
import { AvailabilityForm } from '@/components/AvailabilityForm'
import { PageHero } from '@/components/PageHero'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Submit Private Availability',
  description: 'Owners, landlords, developers and transparent licensed agents can submit private availability without public advertising.',
  path: '/private-availability'
})

export default function PrivateAvailabilityPage() {
  return (
    <>
      <PageHero eyebrow="Private supply" title="Submit availability without putting property online.">
        <p>Use this for owners, landlords, developers, property managers and licensed agents. Exact addresses, sensitive documents and private photos should remain inside the verified Match Room.</p>
      </PageHero>
      <section className="section"><AvailabilityForm /></section>
    </>
  )
}
