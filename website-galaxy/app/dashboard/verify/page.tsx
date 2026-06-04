import type { Metadata } from 'next'
import { VerificationCenterForm } from '@/components/VerificationCenterForm'
import { getBackendJwtPayloadFromCookie, getVerificationReviewNote, getVerificationState } from '@/lib/native-session'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Verification Center',
  description: 'Upload identity and licence records for Galaxy Elite Private Match account verification.',
  path: '/dashboard/verify',
  noindex: true
})

export default async function DashboardVerifyPage() {
  const payload = await getBackendJwtPayloadFromCookie()
  const state = getVerificationState(payload)
  const note = getVerificationReviewNote(payload)

  return (
    <>
      <div className="dashboard-hero">
        <p className="eyebrow">Verification Center</p>
        <h1>Upload identity records for compliance review.</h1>
        <p>Submit one approved document type at a time. Accepted files are PDF, PNG, or JPEG up to 10MB.</p>
        {state === 'action_required' && note ? <p className="form-error">Review note: {note}</p> : null}
      </div>
      <section className="dashboard-card verification-card">
        <VerificationCenterForm initialStatus={state} />
      </section>
    </>
  )
}
