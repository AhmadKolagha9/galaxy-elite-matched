import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminSubmissionCard } from '@/components/AdminSubmissionCard'
import { getCollection } from '@/lib/admin-store'
import { pageMetadata } from '@/lib/seo'
import { verificationDocumentTypes } from '@/lib/taxonomy'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({ title: 'Compliance Vault', description: 'Verified listing and compliance review dashboard.', path: '/admin/compliance', noindex: true })

export default async function CompliancePage() {
  const listings = await getCollection('verifiedListing')
  return (
    <>
      <div className="dashboard-hero admin-hero"><p className="eyebrow">Compliance vault</p><h1>Strict verification before verified listing visibility.</h1><p>Property, land, office, camp, off-plan and secondary requests must pass ownership, authority, ID and permit checks where applicable.</p></div>
      <div className="admin-quick-actions">
        <Link className="button button-outline" href="/admin/compliance/agents">Open Agent Review</Link>
        <Link className="button button-outline" href="/admin/compliance/identities">Open Identity Review</Link>
      </div>
      <section className="admin-section">
        <div className="section-heading-inline"><h2>Required document checklist</h2><span>{verificationDocumentTypes.length} checks</span></div>
        <div className="document-checklist">{verificationDocumentTypes.map((doc) => <span key={doc}>{doc}</span>)}</div>
      </section>
      <section className="admin-section">
        <div className="section-heading-inline"><h2>Verified listing requests</h2><span>{listings.length} record(s)</span></div>
        <div className="admin-card-grid">{listings.length ? listings.map((record) => <AdminSubmissionCard key={record.id} collection="verifiedListing" record={record} />) : <p className="form-note">No verified listing requests yet.</p>}</div>
      </section>
    </>
  )
}
