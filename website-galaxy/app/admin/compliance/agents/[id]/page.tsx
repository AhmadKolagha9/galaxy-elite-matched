import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminAgentApplicationWorkspace } from '@/components/AdminAgentApplicationWorkspace'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({ title: 'Agent Application Review', description: 'Review private agent account application documents.', path: '/admin/compliance/agents', noindex: true })

export default async function AgentApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <div className="dashboard-hero admin-hero">
        <p className="eyebrow">Agent Detail</p>
        <h1>Evaluate broker identity and licence documents.</h1>
        <div className="hero-actions"><Link className="button button-outline" href="/admin/compliance/agents">Back to Agent Queue</Link></div>
      </div>
      <AdminAgentApplicationWorkspace id={id} />
    </>
  )
}
