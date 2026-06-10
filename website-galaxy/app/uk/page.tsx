import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/PageHero'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'UK Private Property Matching',
  description: 'Post UK buyer, tenant, investor or land demand and match privately with verified owners, landlords, developers and licensed agents.',
  path: '/uk'
})

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Country gateway" title="UK Private Property Matching">
        <p>Post UK buyer, tenant, investor or land demand and match privately with verified owners, landlords, developers and licensed agents.</p>
      </PageHero>
      <section className="section">
        <div className="section-heading"><p className="eyebrow">Locations</p><h2>Start focused, scale carefully.</h2></div>
        <div className="logo-strip"><span>England</span><span>Scotland</span><span>Wales</span><span>Northern Ireland</span></div>
        <div className="hero-actions" style={{ justifyContent: 'center', marginTop: 28 }}>
          <Link className="button button-gold" href="/submit?mode=interest">Post Interest</Link>
          <Link className="button button-outline" href="/submit?mode=property">Private Club</Link>
        </div>
      </section>
    </>
  )
}
