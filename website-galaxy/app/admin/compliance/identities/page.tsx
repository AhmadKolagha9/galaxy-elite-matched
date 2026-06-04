import type { Metadata } from 'next'
import { AdminIdentityReviewTable } from '@/components/AdminIdentityReviewTable'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({ title: 'Identity Review Queue', description: 'Compliance identity review queue.', path: '/admin/compliance/identities', noindex: true })

export default function IdentityReviewQueuePage() {
  return (
    <>
      <div className="dashboard-hero admin-hero">
        <p className="eyebrow">Identity Review</p>
        <h1>Customer verification files under compliance review.</h1>
        <p>Review only active under_review accounts. Private file paths remain masked behind signed viewing URLs.</p>
      </div>
      <AdminIdentityReviewTable />
    </>
  )
}
