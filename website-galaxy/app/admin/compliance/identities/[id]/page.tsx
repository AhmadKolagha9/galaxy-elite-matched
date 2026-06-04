import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminIdentityReviewWorkspace } from '@/components/AdminIdentityReviewWorkspace'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({ title: 'Identity Detail Review', description: 'Compliance identity document detail workspace.', path: '/admin/compliance/identities', noindex: true })

export default async function IdentityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <div className="dashboard-hero admin-hero">
        <p className="eyebrow">Identity Detail</p>
        <h1>Evaluate customer validation records.</h1>
        <div className="hero-actions"><Link className="button button-outline" href="/admin/compliance/identities">Back to Queue</Link></div>
      </div>
      <AdminIdentityReviewWorkspace id={id} />
    </>
  )
}
