import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({ title: 'Terms', description: 'Terms placeholder for Galaxy Elite Private Match.', path: '/terms', noindex: true })

export default function TermsPage() {
  return <><PageHero eyebrow="Terms" title="Platform terms placeholder."><p>Replace this with lawyer-reviewed terms covering brokerage disclosure, agent disclosure, no-public-advertising rules, fees, commissions, verification, and match-room conduct.</p></PageHero><section className="section"><div className="policy-card"><h2>Core rule</h2><p>Galaxy Elite Private Match publishes verified interest and handles private availability through approved matching. It should not be used to bypass local advertising, licensing, AML or data-protection rules.</p></div></section></>
}
