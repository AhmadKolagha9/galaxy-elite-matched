import type { Metadata } from 'next'
import { AdminPrivateClubRequests } from '@/components/AdminPrivateClubRequests'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({ title: 'Private Club Requests', description: 'Review Private Club matched requests.', path: '/admin/private-club-requests', noindex: true })

export default function AdminPrivateClubRequestsPage() {
  return (
    <>
      <div className="dashboard-hero admin-hero"><p className="eyebrow">Private Club</p><h1>Manual processing queue for matched property requests.</h1><p>Owner-approved Private Club matched requests can be moved through manual Galaxy Elite admin processing here.</p></div>
      <AdminPrivateClubRequests />
    </>
  )
}
