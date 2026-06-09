import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/PageHero'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'India Private Property Matching',
  description: 'Post broad India property, land or investment interest while keeping supply private and compliance-aware.',
  path: '/india'
})

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Country gateway" title="India Private Property Matching">
        <p>Post broad India property, land or investment interest while keeping supply private and compliance-aware.</p>
      </PageHero>
      <section className="section">
        <div className="section-heading"><p className="eyebrow">Locations</p><h2>Start focused, scale carefully.</h2></div>
        <div className="logo-strip"><span>India</span></div>
        <div className="hero-actions" style={{ justifyContent: 'center', marginTop: 28 }}>
          <Link className="button button-gold" href="/post-interest">Post Interest</Link>
          <Link className="button button-outline" href="/private-opportunities?mode=availability">Submit Availability</Link>
        </div>
      </section>
    </>
  )
}
