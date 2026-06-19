import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatProjectPrice, getPublicNewProject, projectLocation } from '@/lib/new-projects'
import { pageMetadata } from '@/lib/seo'
import { site } from '@/lib/site'

export const dynamic = 'force-dynamic'

type ProjectDetailPageProps = {
  params: Promise<{ reference: string }>
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { reference } = await params
  const project = await getPublicNewProject(reference)
  if (!project) return pageMetadata({ title: 'New Project', description: 'Approved Galaxy Elite new project.', path: '/new-projects' })
  return pageMetadata({
    title: project.projectName,
    description: `${project.projectName}${project.developerName ? ` by ${project.developerName}` : ''} in ${projectLocation(project)}.`,
    path: `/new-projects/${project.reference}`
  })
}

export default async function NewProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { reference } = await params
  const project = await getPublicNewProject(reference)
  if (!project) notFound()

  const primaryImage = project.images[0]

  return (
    <section className="project-detail-page">
      <div className="project-detail-hero">
        <div className="project-detail-copy">
          <p className="eyebrow">New Projects / {project.reference}</p>
          <h1>{project.projectName}</h1>
          <p>{project.description}</p>
          <div className="hero-proof">
            <span>{formatProjectPrice(project)}</span>
            <span>{projectLocation(project)}</span>
            <span>{project.developerName || 'Galaxy Elite approved developer'}</span>
          </div>
        </div>
        <div className="project-detail-media">
          {primaryImage ? <img src={primaryImage} alt={project.projectName} /> : <div className="project-card-placeholder">{project.reference}</div>}
        </div>
      </div>

      <div className="section project-detail-section">
        <article className="admin-card project-summary-card">
          <h2>Project Summary</h2>
          <div className="admin-detail-grid">
            <div><dt>Reference</dt><dd>{project.reference}</dd></div>
            <div><dt>Developer</dt><dd>{project.developerName || 'Approved developer'}</dd></div>
            <div><dt>Location</dt><dd>{projectLocation(project)}</dd></div>
            <div><dt>Price</dt><dd>{formatProjectPrice(project)}</dd></div>
          </div>
          <p className="admin-description">Direct phone numbers, exact private addresses and internal project controls are managed by Galaxy Elite and are not exposed publicly.</p>
          <Link className="button button-gold" href={`mailto:${site.email}?subject=${encodeURIComponent(`New Projects enquiry ${project.reference}`)}`}>Enquire Through Galaxy Elite</Link>
        </article>

        <article className="admin-card project-gallery-card">
          <h2>Gallery</h2>
          {project.video ? <a className="button button-outline button-small" href={project.video} target="_blank" rel="noreferrer">Open Project Video</a> : null}
          <div className="project-gallery-grid">
            {project.images.map((image, index) => <img key={image} src={image} alt={`${project.projectName} image ${index + 1}`} />)}
          </div>
          {!project.images.length ? <p className="form-note">Gallery images will appear after Galaxy Elite publishes them.</p> : null}
        </article>
      </div>
    </section>
  )
}
