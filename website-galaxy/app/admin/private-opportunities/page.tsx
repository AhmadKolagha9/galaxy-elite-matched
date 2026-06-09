import type { Metadata } from 'next'
import { AdminSubmissionCard } from '@/components/AdminSubmissionCard'
import { getCollection } from '@/lib/admin-store'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({ title: 'Private Opportunities Queue', description: 'Review private availability and investor demand in one admin queue.', path: '/admin/private-opportunities', noindex: true })

export default async function AdminPrivateOpportunitiesPage() {
  const [availability, investor] = await Promise.all([getCollection('availability'), getCollection('investor')])
  const records = [
    ...availability.map((record) => ({ collection: 'availability' as const, record })),
    ...investor.map((record) => ({ collection: 'investor' as const, record }))
  ].sort((a, b) => String(b.record.submittedAt).localeCompare(String(a.record.submittedAt)))
  const pending = records.filter(({ record }) => ['pending', 'pending_review', 'Pending Review'].includes(String(record.approvalStatus || record.status))).length
  const documentBacked = records.filter(({ record }) => record.has_verification_files_attached === true || record.hasVerificationFilesAttached === true || Array.isArray(record.uploadedDocuments) && record.uploadedDocuments.length > 0).length

  return (
    <>
      <div className="dashboard-hero admin-hero">
        <p className="eyebrow">Private opportunities</p>
        <h1>Review private supply and investor demand together.</h1>
        <p>Availability remains supply-side and investor posts remain demand-side. This queue only merges the review workspace, not the underlying record logic.</p>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card"><span>Total opportunities</span><strong>{records.length}</strong><p>Availability and investor demand combined.</p></article>
        <article className="dashboard-card"><span>Pending review</span><strong>{pending}</strong><p>Need admin decision before visibility.</p></article>
        <article className="dashboard-card"><span>Document backed</span><strong>{documentBacked}</strong><p>Availability records with attached file metadata.</p></article>
      </div>

      <section className="admin-section">
        <div className="section-heading-inline"><h2>Combined queue</h2><span>{records.length} record(s)</span></div>
        <div className="admin-card-grid">
          {records.length ? records.map(({ collection, record }) => (
            <AdminSubmissionCard key={`${collection}-${record.id}`} collection={collection} record={record} />
          )) : <p className="form-note">No private opportunities yet.</p>}
        </div>
      </section>
    </>
  )
}
