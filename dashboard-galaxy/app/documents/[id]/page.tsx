import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ControlNav } from '@/components/control/ControlNav'
import { DocumentReviewPanel } from '@/components/control/DocumentReviewPanel'
import { getDocuments } from '@/lib/control-api'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Document Detail' }

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const document = (await getDocuments()).find((item) => item.id === id)
  if (!document) notFound()

  return (
    <section className="dashboard-shell admin-shell">
      <ControlNav />
      <div className="dashboard-main">
        <div className="dashboard-hero admin-hero"><p className="eyebrow">Document verification</p><h1>{document.documentType || document.id}</h1><p>Use the signed preview control to request a short-lived backend URL for inspection.</p></div>
        <DocumentReviewPanel document={document} />
      </div>
    </section>
  )
}
