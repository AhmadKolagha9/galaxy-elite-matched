import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({ title: 'Privacy Policy', description: 'Privacy is part of the Galaxy Elite Private Match service.', path: '/privacy', noindex: true })

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Privacy" title="Your privacy is part of the service.">
        <p>Galaxy Elite is built around privacy, trust and controlled information sharing. Personal and confidential information is protected throughout the process.</p>
      </PageHero>
      <section className="section">
        <div className="policy-card">
          <h2>Privacy promise</h2>
          <p>Sensitive details are only shared after the proper approval process and agreement from both parties. Private property availability, contact details, identity documents and match-room documents stay protected.</p>
        </div>
      </section>
    </>
  )
}
