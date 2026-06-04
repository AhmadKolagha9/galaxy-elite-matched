import Link from 'next/link'
import { getBackendJwtPayloadFromCookie, getVerificationReviewNote, getVerificationState } from '@/lib/native-session'

export async function VerificationAlertBanner() {
  const payload = await getBackendJwtPayloadFromCookie()
  const state = getVerificationState(payload)
  const note = getVerificationReviewNote(payload)

  if (state === 'verified' || state === 'unknown') return null

  const config = {
    unverified: {
      className: 'verification-banner verification-banner-gold',
      title: 'Verification Pending',
      body: 'Your account remains restricted from match pairing systems. Please visit the Verification Center to submit identity validation records.',
      action: 'Open Verification Center'
    },
    under_review: {
      className: 'verification-banner verification-banner-amber',
      title: 'Documents Submitted',
      body: 'Your identity verification tracking files are currently undergoing compliance review by our corporate desk managers.',
      action: 'View Verification Status'
    },
    action_required: {
      className: 'verification-banner verification-banner-ruby',
      title: 'Verification Failed',
      body: `The documents provided failed our compliance check parameters. Reason: ${note || 'Additional document review notes are required.'} Please update your files in the verification center.`,
      action: 'Update Files'
    }
  }[state]

  return (
    <div className={config.className} role="status">
      <div>
        <strong>{config.title}</strong>
        <p>{config.body}</p>
      </div>
      <Link className="button button-small button-outline" href="/dashboard/verify">{config.action}</Link>
    </div>
  )
}
