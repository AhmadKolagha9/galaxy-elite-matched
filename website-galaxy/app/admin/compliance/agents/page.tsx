import type { Metadata } from 'next'
import { AdminAgentApplicationTable } from '@/components/AdminAgentApplicationTable'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({ title: 'Agent Review Queue', description: 'Compliance review queue for agent account applications.', path: '/admin/compliance/agents', noindex: true })

export default function AgentApplicationQueuePage() {
  return (
    <>
      <div className="dashboard-hero admin-hero">
        <p className="eyebrow">Agent Review</p>
        <h1>Approve broker licence requests before account promotion.</h1>
        <p>Agent accounts are created only after ID and broker licence documents are reviewed through signed private document links.</p>
      </div>
      <AdminAgentApplicationTable />
    </>
  )
}
