import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({ title: 'Privacy Policy', description: 'Privacy policy placeholder for Galaxy Elite Private Match.', path: '/privacy', noindex: true })

export default function PrivacyPage() {
  return <><PageHero eyebrow="Privacy" title="Privacy-first matching."><p>This starter includes a placeholder. Replace with lawyer-reviewed privacy wording covering consent, verification, data retention, deletion, newsletter consent and country-specific rules.</p></PageHero><section className="section"><div className="policy-card"><h2>Privacy promise</h2><p>Private property availability, contact details, identity documents and match-room documents must stay protected and visible only to authorised users.</p></div></section></>
}
