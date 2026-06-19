import type { Metadata } from 'next'
import { ControlNav } from '@/components/control/ControlNav'
import { getNewProject } from '@/lib/control-api'
import { requireAdmin } from '@/lib/auth'
import { updateNewProjectAction } from '../../actions'
import { NewProjectForm } from '../../_components/NewProjectForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit New Project' }

type PageProps = { params: Promise<{ id: string }>; searchParams?: Promise<{ error?: string }> }

export default async function NewProjectEditPage({ params, searchParams }: PageProps) {
  await requireAdmin()
  const { id } = await params
  const query = (await searchParams) || {}
  const project = await getNewProject(id)
  return (
    <section className="dashboard-shell admin-shell">
      <ControlNav />
      <div className="dashboard-main">
        <div className="dashboard-hero admin-hero"><p className="eyebrow">Edit {project.reference}</p><h1>{project.projectName}</h1><p>System fields such as ID, reference, user ID and timestamps remain backend controlled.</p></div>
        <NewProjectForm project={project} action={updateNewProjectAction} submitLabel="Save Project" error={query.error} />
      </div>
    </section>
  )
}
