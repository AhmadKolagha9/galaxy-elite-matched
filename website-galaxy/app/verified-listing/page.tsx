import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { VerifiedListingForm } from '@/components/VerifiedListingForm'
import { pageMetadata } from '@/lib/seo'
import { verificationDocumentTypes } from '@/lib/taxonomy'

export const metadata: Metadata = pageMetadata({
  title: 'Verified Listing Request',
  description: 'Submit a property, land, office, camp, off-plan or secondary asset for strict Galaxy Elite verification before any listing visibility.',
  path: '/verified-listing'
})

export default function VerifiedListingPage() {
  return (
    <>
      <PageHero eyebrow="Strict verification" title="Request a verified listing only after document review.">
        <p>Galaxy Elite can support verified listing workflows, but every property must pass ownership, authority, document and compliance checks before public or member-only visibility.</p>
      </PageHero>
      <section className="section two-col">
        <div>
          <p className="eyebrow">Compliance first</p>
          <h2>Upload proof before approval.</h2>
          <p className="lead">The system supports residential, commercial, off-plan, secondary, land, office, camp and bespoke property types. Verified listing requests stay hidden in the control dashboard until approved.</p>
          <div className="document-checklist compact-list">
            {verificationDocumentTypes.slice(0, 8).map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <VerifiedListingForm />
      </section>
    </>
  )
}
