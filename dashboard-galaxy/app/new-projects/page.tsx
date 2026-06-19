import type { Metadata } from 'next'
import Link from 'next/link'
import { ControlNav } from '@/components/control/ControlNav'
import { getNewProjectSummary, getNewProjects, type NewProjectFilters, type NewProjectStatus } from '@/lib/control-api'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'New Projects' }

type PageProps = { searchParams?: Promise<Record<string, string | undefined>> }

const statuses: NewProjectStatus[] = ['draft', 'published', 'archived']

function normalizeFilters(params: Record<string, string | undefined>): NewProjectFilters {
  return {
    status: statuses.includes(params.status as NewProjectStatus) ? params.status as NewProjectStatus : undefined,
    country: params.country || undefined,
    city: params.city || undefined,
    developer: params.developer || undefined,
    keyword: params.keyword || undefined,
    minPrice: params.minPrice || undefined,
    maxPrice: params.maxPrice || undefined
  }
}

function priceRange(startPrice: number | null, endPrice: number | null) {
  const format = (value: number) => value.toLocaleString()
  if (startPrice !== null && endPrice !== null) return `${format(startPrice)} - ${format(endPrice)}`
  if (startPrice !== null) return `From ${format(startPrice)}`
  if (endPrice !== null) return `Up to ${format(endPrice)}`
  return 'Not set'
}

export default async function NewProjectsAdminPage({ searchParams }: PageProps) {
  await requireAdmin()
  const params = (await searchParams) || {}
  const filters = normalizeFilters(params)
  const [projects, summary] = await Promise.all([getNewProjects(filters), getNewProjectSummary()])

  return (
    <section className="dashboard-shell admin-shell">
      <ControlNav />
      <div className="dashboard-main">
        <div className="dashboard-hero admin-hero"><p className="eyebrow">Public projects control</p><h1>New Projects publishing queue.</h1><p>Create, edit and publish estate development projects while keeping private contact and exact address fields controlled.</p></div>
        <div className="dashboard-grid project-summary-grid">
          <article className="dashboard-card"><span>Draft</span><strong>{summary.draft}</strong><p>Not visible publicly.</p></article>
          <article className="dashboard-card"><span>Published</span><strong>{summary.published}</strong><p>Visible on the website.</p></article>
          <article className="dashboard-card"><span>Archived</span><strong>{summary.archived}</strong><p>Hidden but retained.</p></article>
        </div>
        <div className="admin-quick-actions"><Link className="button button-gold" href="/new-projects/new">Add New Project</Link></div>
        <form className="queue-filter-form project-admin-filter" method="GET">
          <label>Status<select name="status" defaultValue={filters.status || ''}><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
          <label>Country<input name="country" defaultValue={filters.country || ''} /></label>
          <label>City<input name="city" defaultValue={filters.city || ''} /></label>
          <label>Developer<input name="developer" defaultValue={filters.developer || ''} /></label>
          <label>Keyword<input name="keyword" defaultValue={filters.keyword || ''} /></label>
          <button className="button button-dark" type="submit">Apply Filters</button>
        </form>
        <div className="queue-table-wrap">
          <table className="control-table">
            <thead><tr><th>Reference</th><th>Project</th><th>Location</th><th>Price</th><th>Status</th><th>Updated</th><th>Action</th></tr></thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.reference}</td>
                  <td><strong>{project.projectName}</strong><span>{project.developerName || 'No developer name'}</span></td>
                  <td>{project.countryId || 'Any country'}<span>{project.cityId || 'Any city'}</span></td>
                  <td>{priceRange(project.startPrice, project.endPrice)}</td>
                  <td><span className="status-pill">{project.status}</span></td>
                  <td>{project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Pending'}</td>
                  <td><Link className="button button-outline button-small" href={`/new-projects/${encodeURIComponent(project.id)}`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!projects.length ? <div className="empty-state compact-empty"><p>No projects match these filters.</p></div> : null}
        </div>
      </div>
    </section>
  )
}
