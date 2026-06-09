import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/PageHero'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'For Landlords',
  description: 'Match upcoming vacancy with verified tenants.',
  path: '/for-landlords'
})

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Galaxy Elite Private Match" title="For Landlords">
        <p>Match upcoming vacancy with verified tenants.</p>
      </PageHero>
      <section className="section split">
        <div>
          <h2>Private by default. Verified by process.</h2>
          <p>Landlords can register future availability and match tenants by move-in month, rent range, area and verification readiness before public advertising.</p>
          <div className="hero-actions"><Link className="button button-gold" href="/private-opportunities?mode=availability">Submit Private Availability</Link><Link className="button button-outline" href="/interest-board">View Interest Board</Link></div>
        </div>
        <div className="policy-grid">
          <article className="policy-card"><h3>Privacy</h3><p>Exact property identity stays hidden until a private match is approved.</p></article>
          <article className="policy-card"><h3>Authority</h3><p>Owners, landlords, developers and agents must confirm authority before matching.</p></article>
          <article className="policy-card"><h3>Matching</h3><p>Responses are reviewed by fit, timing, budget range and verification level.</p></article>
          <article className="policy-card"><h3>Execution</h3><p>Galaxy Elite can guide viewing, negotiation and agreement stages after approval.</p></article>
        </div>
      </section>
    </>
  )
}
