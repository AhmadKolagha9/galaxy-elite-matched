import type { Metadata } from 'next'
import { AgentForm } from '@/components/AgentForm'
import { PageHero } from '@/components/PageHero'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Transparent Agent Registration',
  description: 'Licensed agents can join Galaxy Elite Private Match only with clear role, licence and authority disclosure.',
  path: '/for-agents'
})

export default function ForAgentsPage() {
  return (
    <>
      <PageHero eyebrow="No hidden agents" title="Agents can join, but must be transparent.">
        <p>Galaxy Elite Private Match welcomes professional agents who disclose licence, company, authority and representation side. No fake direct owners. No fake direct buyers.</p>
      </PageHero>
      <section className="section"><AgentForm /></section>
    </>
  )
}
