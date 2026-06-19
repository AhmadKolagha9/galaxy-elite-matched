import type { Metadata } from 'next'
import Link from 'next/link'
import { ControlNav } from '@/components/control/ControlNav'
import { getAdminSummary } from '@/lib/admin-store'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Control Overview' }

export default async function ControlOverviewPage() {
  await requireAdmin()
  const summary = await getAdminSummary()

  return (
    <section className="dashboard-shell admin-shell">
      <ControlNav />
      <div className="dashboard-main">
        <div className="dashboard-hero admin-hero">
          <p className="eyebrow">Corporate overview</p>
          <h1>Closed control platform for approved staff claims.</h1>
          <p>Review submissions, documents, match requests and compliance queues without exposing private customer or property data publicly.</p>
        </div>
        <div className="dashboard-grid">
          <article className="dashboard-card"><span>New pending submissions</span><strong>{summary.pending}</strong><p>Require admin or compliance review.</p></article>
          <article className="dashboard-card"><span>Compliance holds</span><strong>{summary.holds}</strong><p>Documents, authority, or verification issues.</p></article>
          <article className="dashboard-card"><span>Approved / verified</span><strong>{summary.approved}</strong><p>Cleared records still governed by visibility rules.</p></article>
          <article className="dashboard-card"><span>Total intake</span><strong>{summary.total}</strong><p>All tracked submissions across queues.</p></article>
        </div>
        <div className="admin-quick-actions">
          <Link className="button button-gold" href="/submissions">Open Submissions</Link>
          <Link className="button button-outline" href="/documents">Review Documents</Link>
          <Link className="button button-outline" href="/matches">Manage Matches</Link>
          <Link className="button button-outline" href="/new-projects">New Projects</Link>
        </div>
      </div>
    </section>
  )
}
