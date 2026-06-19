import type { Metadata } from 'next'
import Link from 'next/link'
import { ControlNav } from '@/components/control/ControlNav'
import { getNewProject } from '@/lib/control-api'
import { requireAdmin } from '@/lib/auth'
import { archiveNewProjectAction, setNewProjectStatusAction } from '../actions'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'New Project Detail' }

type PageProps = { params: Promise<{ id: string }>; searchParams?: Promise<{ error?: string }> }

function priceRange(startPrice: number | null, endPrice: number | null) {
  if (startPrice !== null && endPrice !== null) return `${startPrice.toLocaleString()} - ${endPrice.toLocaleString()}`
  if (startPrice !== null) return `From ${startPrice.toLocaleString()}`
  if (endPrice !== null) return `Up to ${endPrice.toLocaleString()}`
  return 'Not set'
}

function StatusForm({ id, status, label }: { id: string; status: 'draft' | 'published' | 'archived'; label: string }) {
  return <form action={setNewProjectStatusAction}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={status} /><button className="button button-outline button-small" type="submit">{label}</button></form>
}

export default async function NewProjectDetailPage({ params, searchParams }: PageProps) {
  await requireAdmin()
  const { id } = await params
  const query = (await searchParams) || {}
  const project = await getNewProject(id)

  return (
    <section className="dashboard-shell admin-shell">
      <ControlNav />
      <div className="dashboard-main">
        <div className="dashboard-hero admin-hero"><p className="eyebrow">{project.reference}</p><h1>{project.projectName}</h1><p>Review public-safe fields, edit project data and control publish status.</p></div>
        {query.error ? <p className="form-error">{query.error}</p> : null}
        <section className="review-split">
          <article className="admin-card">
            <h3>Project summary</h3>
            <div className="admin-detail-grid">
              <div><dt>ID</dt><dd>{project.id}</dd></div>
              <div><dt>Status</dt><dd>{project.status}</dd></div>
              <div><dt>Reference</dt><dd>{project.reference}</dd></div>
              <div><dt>Developer</dt><dd>{project.developerName || 'Not provided'}</dd></div>
              <div><dt>Country</dt><dd>{project.countryId || 'Not provided'}</dd></div>
              <div><dt>City</dt><dd>{project.cityId || 'Not provided'}</dd></div>
              <div><dt>Price</dt><dd>{priceRange(project.startPrice, project.endPrice)}</dd></div>
              <div><dt>Images</dt><dd>{project.images.length}</dd></div>
              <div><dt>Phone</dt><dd>{project.phone || 'Private/not provided'}</dd></div>
              <div><dt>Address</dt><dd>{project.address || 'Private/not provided'}</dd></div>
            </div>
            <p className="admin-description">{project.description || 'No description provided.'}</p>
            <div className="action-row">
              <Link className="button button-gold button-small" href={`/new-projects/${encodeURIComponent(project.id)}/edit`}>Edit Project</Link>
              {project.status !== 'published' ? <StatusForm id={project.id} status="published" label="Publish" /> : <StatusForm id={project.id} status="draft" label="Unpublish" />}
              {project.status !== 'archived' ? <form action={archiveNewProjectAction}><input type="hidden" name="id" value={project.id} /><button className="button button-dark button-small" type="submit">Archive/Delete</button></form> : null}
            </div>
          </article>
          <article className="admin-card">
            <h3>Public preview data</h3>
            <div className="admin-detail-grid">
              <div><dt>Name</dt><dd>{project.projectName}</dd></div>
              <div><dt>Location label</dt><dd>{project.publicAddressLabel || [project.cityId, project.countryId].filter(Boolean).join(', ') || 'Not public'}</dd></div>
              <div><dt>Public map</dt><dd>{project.publicMapLocation || 'Not exposed'}</dd></div>
              <div><dt>Video</dt><dd>{project.video || 'Not provided'}</dd></div>
            </div>
            <div className="project-admin-gallery">{project.images.slice(0, 6).map((image) => <img key={image} src={image} alt={project.projectName} />)}</div>
            {!project.images.length ? <p className="form-note">At least one image is required before publishing.</p> : null}
          </article>
        </section>
      </div>
    </section>
  )
}
