import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/PageHero'
import { formatProjectPrice, getPublicNewProjects, projectLocation, type NewProjectSearchParams, type PublicNewProject } from '@/lib/new-projects'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: 'New Projects',
  description: 'Browse approved new estate projects from developers through Galaxy Elite.',
  path: '/new-projects'
})

type NewProjectsPageProps = {
  searchParams?: Promise<NewProjectSearchParams>
}

function uniqueOptions(projects: PublicNewProject[], key: 'countryId' | 'cityId' | 'developerName') {
  return [...new Set(projects.map((project) => project[key]).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b))
}

function hasActiveFilters(params: NewProjectSearchParams) {
  return Boolean(params.country || params.city || params.developer || params.keyword || params.min_price || params.max_price)
}

function resultLabel(count: number) {
  if (count === 1) return '1 published project'
  return `${count} published projects`
}

function ProjectCard({ project }: { project: PublicNewProject }) {
  const image = project.images[0]
  return (
    <article className="project-card">
      <Link className="project-card-media" href={`/new-projects/${encodeURIComponent(project.reference)}`} aria-label={`View ${project.projectName}`}>
        {image ? <img src={image} alt={project.projectName} /> : <div className="project-card-placeholder">{project.reference}</div>}
      </Link>
      <div className="project-card-body">
        <div className="card-topline">
          <span className="verified-pill">{project.reference}</span>
          <span className="status status-open">Published</span>
        </div>
        <h3>{project.projectName}</h3>
        <dl>
          <div><dt>Developer</dt><dd>{project.developerName || 'Galaxy Elite approved developer'}</dd></div>
          <div><dt>Location</dt><dd>{projectLocation(project)}</dd></div>
          <div><dt>Price</dt><dd>{formatProjectPrice(project)}</dd></div>
        </dl>
        <p>{project.description.length > 170 ? `${project.description.slice(0, 167)}...` : project.description}</p>
        <div className="card-footer">
          <Link className="button button-dark button-small" href={`/new-projects/${encodeURIComponent(project.reference)}`}>View Project</Link>
        </div>
      </div>
    </article>
  )
}

export default async function NewProjectsPage({ searchParams }: NewProjectsPageProps) {
  const params = (await searchParams) || {}
  const projects = await getPublicNewProjects(params)
  const allProjects = await getPublicNewProjects()
  const countries = uniqueOptions(allProjects, 'countryId')
  const cities = uniqueOptions(allProjects, 'cityId')
  const developers = uniqueOptions(allProjects, 'developerName')

  return (
    <>
      <PageHero eyebrow="New Projects" title="Approved estate projects, open to browse.">
        <p>Explore developer-led projects reviewed by Galaxy Elite. Public project details stay curated, while direct contact and private fields remain controlled.</p>
      </PageHero>
      <section className="section contrast">
        <div className="project-board-tools">
          <div className="project-results-bar">
            <div>
              <p className="eyebrow">Project finder</p>
              <h2>{resultLabel(projects.length)}</h2>
            </div>
            {hasActiveFilters(params) ? <Link className="button button-outline button-small" href="/new-projects">Clear Filters</Link> : null}
          </div>
          <form className="project-filter-form" method="GET">
            <label className="project-filter-search">Search<input name="keyword" defaultValue={params.keyword || ''} placeholder="Project name, developer, or NP reference" /></label>
            <label>Country<select name="country" defaultValue={params.country || ''}><option value="">All countries</option>{countries.map((country) => <option key={country} value={country}>{country}</option>)}</select></label>
            <label>City<select name="city" defaultValue={params.city || ''}><option value="">All cities</option>{cities.map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
            <label>Developer<select name="developer" defaultValue={params.developer || ''}><option value="">All developers</option>{developers.map((developer) => <option key={developer} value={developer}>{developer}</option>)}</select></label>
            <div className="project-price-group" aria-label="Price range">
              <label>Min price<input name="min_price" type="number" min="0" inputMode="numeric" defaultValue={params.min_price || ''} placeholder="0" /></label>
              <label>Max price<input name="max_price" type="number" min="0" inputMode="numeric" defaultValue={params.max_price || ''} placeholder="Any" /></label>
            </div>
            <button className="button button-dark project-filter-submit" type="submit">Apply Filters</button>
          </form>
        </div>
        <div className="project-grid">
          {projects.map((project) => <ProjectCard key={project.reference} project={project} />)}
        </div>
        {!projects.length ? <div className="empty-state compact-empty"><p>No published projects match these filters.</p></div> : null}
      </section>
    </>
  )
}
