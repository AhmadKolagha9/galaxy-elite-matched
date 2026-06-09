import type { Metadata } from 'next'
import { AdminInterestMatchRequests } from '@/components/AdminInterestMatchRequests'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({ title: 'Interest Match Requests', description: 'Manual admin processing for owner-approved Interest Board matched requests.', path: '/admin/compliance/interest-matches', noindex: true })

export default function AdminInterestMatchRequestsPage() {
  return (
    <>
      <div className="dashboard-hero admin-hero"><p className="eyebrow">Interest matches</p><h1>Manual processing for owner-approved matched requests.</h1><p>Owner approval moves a request here. Admin can change status and continue the private process manually without revealing contact details automatically.</p></div>
      <AdminInterestMatchRequests />
    </>
  )
}
