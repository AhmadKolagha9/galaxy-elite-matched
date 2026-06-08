import type { Metadata } from 'next'
import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { getBackendJwtPayloadFromCookie, getVerificationState } from '@/lib/native-session'
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
      <div className="policy-grid">
        <article className="policy-card"><h3>Name</h3><p>{user.name}</p></article>
        <article className="policy-card"><h3>Email</h3><p>{user.email}</p></article>
        <article className="policy-card"><h3>Role</h3><p>{user.role}</p></article>
        <article className="policy-card"><h3>Verification</h3><p>{verificationCopy(verificationStatus)}</p></article>
        <article className="policy-card"><h3>Auth mode</h3><p>{user.provider}</p></article>
        <article className="policy-card"><h3>Edit name</h3><p>Profile name editing will be stored through the backend profile endpoint in the next profile-management release.</p></article>
      </div>
    </>
  )
}
