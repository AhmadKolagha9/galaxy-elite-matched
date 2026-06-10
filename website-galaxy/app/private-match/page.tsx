import Link from 'next/link'
import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { matchStages } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Private Match Workflow',
  description: 'One request, private review and the right match through Galaxy Elite approval.',
  path: '/private-match'
})

export default function PrivateMatchPage() {
  return (
    <>
      <PageHero eyebrow="How It Works" title="One request. Private review. The right match.">
        <p>Tell Galaxy Elite what you are looking for, and we handle the matching process with care while protecting your information.</p>
      </PageHero>
      <section className="section split">
        <div>
          <h2>You stay in control at every stage.</h2>
          <p>Your request is reviewed, filtered and matched with suitable property opportunities or serious interests. Confidential details are only shared when the process is approved by both sides.</p>
          <div className="hero-actions"><Link className="button button-gold" href="/register">Create Account</Link><Link className="button button-outline" href="/interest-board">View Board</Link></div>
        </div>
        <div className="pipeline">
          {matchStages.map((stage, index) => <div className="pipeline-step" key={stage}><span>{index + 1}</span><strong>{stage}</strong></div>)}
        </div>
      </section>
    </>
  )
}
