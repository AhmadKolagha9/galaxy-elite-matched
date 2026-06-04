import Link from 'next/link'
import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { matchStages } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Private Match Workflow',
  description: 'The Galaxy Elite Private Match workflow from interest to agreement execution and completion.',
  path: '/private-match'
})

export default function PrivateMatchPage() {
  return (
    <>
      <PageHero eyebrow="Match Engine" title="The private relationship workflow for serious property people.">
        <p>Matches are controlled by verification, role transparency and mutual approval. The process is intentionally different from public listing portals.</p>
      </PageHero>
      <section className="section split">
        <div>
          <h2>Every connection follows a clear status trail.</h2>
          <p>Public cards use Open, Matching, Matched and Archived. Private rooms track the deeper transaction journey.</p>
          <div className="hero-actions"><Link className="button button-gold" href="/register">Create Account</Link><Link className="button button-outline" href="/interest-board">View Board</Link></div>
        </div>
        <div className="pipeline">
          {matchStages.map((stage, index) => <div className="pipeline-step" key={stage}><span>{index + 1}</span><strong>{stage}</strong></div>)}
        </div>
      </section>
    </>
  )
}
