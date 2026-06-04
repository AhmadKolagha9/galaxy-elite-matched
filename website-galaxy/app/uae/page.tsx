import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/PageHero'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'UAE Private Property Matching',
  description: 'Post UAE property interest or submit private UAE availability through Galaxy Elite without public property exposure.',
  path: '/uae'
})

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Country gateway" title="UAE Private Property Matching">
        <p>Post UAE property interest or submit private UAE availability through Galaxy Elite without public property exposure.</p>
      </PageHero>
      <section className="section">
        <div className="section-heading"><p className="eyebrow">Locations</p><h2>Start focused, scale carefully.</h2></div>
        <div className="logo-strip"><span>Abu Dhabi</span><span>Al Ain</span><span>Dubai</span><span>Sharjah</span><span>Ajman</span><span>Fujairah</span><span>Ras Al Khaimah</span><span>Umm Al Quwain</span></div>
        <div className="hero-actions" style={{ justifyContent: 'center', marginTop: 28 }}>
          <Link className="button button-gold" href="/post-interest">Post Interest</Link>
          <Link className="button button-outline" href="/private-availability">Submit Availability</Link>
        </div>
      </section>
    </>
  )
}
