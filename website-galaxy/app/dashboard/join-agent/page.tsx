import type { Metadata } from 'next'
import { AgentApplicationForm } from '@/components/AgentApplicationForm'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Join like agent',
  description: 'Submit broker identity and licence files for Galaxy Elite agent account approval.',
  path: '/dashboard/join-agent',
  noindex: true
})

export default function JoinAgentPage() {
  return (
    <>
      <div className="dashboard-hero">
        <p className="eyebrow">Join like agent</p>
        <h1>Request verified agent account access.</h1>
        <p>Save your broker profile, attach ID and broker licence files, then send the request for Galaxy Elite compliance approval.</p>
      </div>
      <section className="dashboard-card verification-card">
        <AgentApplicationForm />
      </section>
    </>
  )
}
