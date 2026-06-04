import type { Metadata } from 'next'
import { AdminSubmissionCard } from '@/components/AdminSubmissionCard'
import { getAllAdminCollections } from '@/lib/admin-store'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({ title: 'Approval Queue', description: 'Review and approve Galaxy Elite Private Match submissions.', path: '/admin/approvals', noindex: true })

export default async function AdminApprovalsPage() {
  const collections = await getAllAdminCollections()
  return (
    <>
      <div className="dashboard-hero admin-hero"><p className="eyebrow">Approval queue</p><h1>Review, approve, verify, request documents or reject.</h1><p>Set public status to Hidden by default. Use Open/Matching/Matched/Archived only when the post is approved for the Interest Board or controlled member visibility.</p></div>
      {collections.filter((collection) => collection.key !== 'newsletter').map((collection) => (
        <section className="admin-section" key={collection.key}>
          <div className="section-heading-inline"><h2>{collection.label}</h2><span>{collection.records.length} record(s)</span></div>
          <div className="admin-card-grid">
            {collection.records.length ? collection.records.map((record) => <AdminSubmissionCard key={record.id} collection={collection.key} record={record} />) : <p className="form-note">No submissions yet.</p>}
          </div>
        </section>
      ))}
    </>
  )
}
