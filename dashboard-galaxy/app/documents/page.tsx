import type { Metadata } from 'next'
import Link from 'next/link'
import { ControlNav } from '@/components/control/ControlNav'
import { getDocuments } from '@/lib/control-api'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Documents' }

function fileSize(value?: number) {
  if (!value) return 'Unknown size'
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

export default async function DocumentsPage() {
  await requireAdmin()
  const documents = await getDocuments()

  return (
    <section className="dashboard-shell admin-shell">
      <ControlNav />
      <div className="dashboard-main">
        <div className="dashboard-hero admin-hero"><p className="eyebrow">Compliance vault</p><h1>Verification document queue.</h1><p>Storage paths are never rendered. Reviewers request short-lived signed views from the backend when needed.</p></div>
        <div className="queue-table-wrap">
          <table className="control-table">
            <thead><tr><th>Document</th><th>Related object</th><th>Status</th><th>File</th><th>Created</th><th>Action</th></tr></thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td><strong>{document.documentType || 'Document'}</strong><span>{document.id}</span></td>
                  <td>{document.relatedObjectType || 'Object'}<span>{document.relatedObjectId || 'Unassigned'}</span></td>
                  <td><span className="status-pill">{document.verificationStatus || 'under_review'}</span></td>
                  <td>{document.originalFilename || 'Private file'}<span>{fileSize(document.fileSize)}</span></td>
                  <td>{document.createdAt ? new Date(document.createdAt).toLocaleDateString() : 'Pending'}</td>
                  <td><Link className="button button-outline button-small" href={'/documents/' + encodeURIComponent(document.id)}>Review</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!documents.length ? <div className="empty-state compact-empty"><p>No documents are currently queued.</p></div> : null}
        </div>
      </div>
    </section>
  )
}
