import type { Metadata } from 'next'
import { AgentForm } from '@/components/AgentForm'
import { PageHero } from '@/components/PageHero'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Transparent Agent Registration',
  description: 'Galaxy Elite helps serious agents connect with genuine property interests through a focused private matching process.',
  path: '/for-agents'
})

export default function ForAgentsPage() {
  return (
    <>
      <PageHero eyebrow="Agents" title="Better matches for serious agents.">
        <p>Register, submit opportunities, and work with serious clients while Galaxy Elite manages privacy, review, approvals and confidential detail sharing.</p>
      </PageHero>
      <section className="section"><AgentForm /></section>
    </>
  )
}
