import type { ControlNewProject } from '@/lib/control-api'

type ProjectFormProps = {
  project?: ControlNewProject
  action: (formData: FormData) => Promise<void>
  submitLabel: string
  error?: string
}

function imagesText(project?: ControlNewProject) {
  return project?.images.join('\n') || ''
}

export function NewProjectForm({ project, action, submitLabel, error }: ProjectFormProps) {
  return (
    <form className="admin-card new-project-form" action={action}>
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <div className="form-grid">
        <label>Project name<input name="projectName" required maxLength={180} defaultValue={project?.projectName || ''} /></label>
        <label>Developer name<input name="developerName" maxLength={180} defaultValue={project?.developerName || ''} /></label>
        <label>Start price<input name="startPrice" type="number" min="0" step="1" defaultValue={project?.startPrice ?? ''} /></label>
        <label>End price<input name="endPrice" type="number" min="0" step="1" defaultValue={project?.endPrice ?? ''} /></label>
        <label>Country<input name="countryId" maxLength={64} defaultValue={project?.countryId || ''} /></label>
        <label>City<input name="cityId" maxLength={64} defaultValue={project?.cityId || ''} /></label>
        <label>Video URL<input name="video" maxLength={500} defaultValue={project?.video || ''} /></label>
        <label>Status<select name="status" defaultValue={project?.status || 'draft'}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <label>Phone<input name="phone" maxLength={40} defaultValue={project?.phone || ''} /></label>
        <label>Map location<input name="mapLocation" maxLength={500} defaultValue={project?.mapLocation || ''} /></label>
      </div>
      <label>Address<input name="address" maxLength={500} defaultValue={project?.address || ''} /></label>
      <label>Images<textarea name="images" rows={5} placeholder="One image URL per line" defaultValue={imagesText(project)} /></label>
      <label>Description<textarea name="description" required rows={7} defaultValue={project?.description || ''} /></label>
      <p className="form-note">Phone, exact address and precise map location are stored for admin review and are not exposed by the public New Projects API by default.</p>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="action-row"><button className="button button-gold" type="submit">{submitLabel}</button></div>
    </form>
  )
}
