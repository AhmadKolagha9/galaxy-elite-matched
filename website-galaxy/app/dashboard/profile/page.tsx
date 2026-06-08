import type { Metadata } from 'next'
import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { getBackendJwtPayloadFromCookie, getVerificationState } from '@/lib/native-session'
import { ProfileDetailsForm } from '@/components/ProfileDetailsForm'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({ title: 'Profile', description: 'Private Match profile.', path: '/dashboard/profile', noindex: true })

function verificationCopy(status: string) {
  if (status === 'verified') return 'Verified account'
  if (status === 'under_review') return 'Verification under review'
  if (status === 'action_required') return 'Action required'
  return 'Not verified yet'
}

export default async function DashboardProfilePage() {
  const user = await requireUser()
  const payload = user.provider === 'backend' ? await getBackendJwtPayloadFromCookie() : null
  const verificationStatus = getVerificationState(payload)

  return (
    <>
      <div className="dashboard-hero">
        <p className="eyebrow">Profile</p>
        <h1>Manage your private match account.</h1>
        <p>Keep your account details, password, and verification records ready for Galaxy Elite review.</p>
        <div className="hero-actions">
          <Link className="button button-gold" href="/dashboard/verify">Upload ID / Verify</Link>
          <Link className="button button-outline" href={`/forgot-password?email=${encodeURIComponent(user.email)}`}>Change Password</Link>
        </div>
      </div>
      <section className="policy-card profile-management-card">
        <h2>Account Details</h2>
        <p>Update the member name and email used for private match communication.</p>
        <ProfileDetailsForm initialName={user.name} initialEmail={user.email} />
      </section>
      <div className="policy-grid">
        <article className="policy-card"><h3>Role</h3><p>{user.role}</p></article>
        <article className="policy-card"><h3>Verification</h3><p>{verificationCopy(verificationStatus)}</p></article>
      </div>
    </>
  )
}
