import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminSummary } from '@/lib/admin-store'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({ title: 'Admin Control Dashboard', description: 'Galaxy Elite admin control dashboard.', path: '/admin', noindex: true })

export default async function AdminPage() {
  const summary = await getAdminSummary()
  return (
    <>
      <div className="dashboard-hero admin-hero">
        <p className="eyebrow">Control dashboard</p>
        <h1>Approve every post before anything goes live.</h1>
        <p>Interest posts, investor posts, private availability, agent registrations and verified listing requests all enter this dashboard first. Public visibility is controlled by Galaxy Elite.</p>
      </div>
      <div className="dashboard-grid">
        <article className="dashboard-card"><span>Total submissions</span><strong>{summary.total}</strong><p>All intake records across the platform.</p></article>
        <article className="dashboard-card"><span>Pending review</span><strong>{summary.pending}</strong><p>Need approval before visibility.</p></article>
        <article className="dashboard-card"><span>Approved / verified</span><strong>{summary.approved}</strong><p>Cleared by admin decision.</p></article>
        <article className="dashboard-card"><span>Document / compliance holds</span><strong>{summary.holds}</strong><p>Need more documents or review.</p></article>
      </div>
      <div className="admin-quick-actions">
        <Link className="button button-gold" href="/admin/approvals">Open Approval Queue</Link>
        <Link className="button button-outline" href="/admin/compliance">Compliance Vault</Link>
        <Link className="button button-outline" href="/admin/compliance/agents">Agent Review</Link>
        <Link className="button button-outline" href="/admin/private-opportunities">Private Opportunities</Link>
        <Link className="button button-outline" href="/admin/private-club-requests">Private Club Requests</Link>
        <Link className="button button-outline" href="/admin/compliance/interest-matches">Interest Matches</Link>
        <Link className="button button-outline" href="/admin/taxonomy">Manage Dropdown Logic</Link>
        <Link className="button button-outline" href="/admin/site-settings">Site Settings</Link>
      </div>
      <div className="admin-collection-grid">
        {summary.collections.map((collection) => (
          <article className="dashboard-card" key={collection.key}>
            <span>{collection.label}</span>
            <strong>{collection.records.length}</strong>
            <p>{collection.records.filter((record) => record.approvalStatus === 'pending').length} pending review</p>
          </article>
        ))}
      </div>
    </>
  )
}
