import type { Metadata } from 'next'
import Link from 'next/link'
import { isAdminUser, requireUser } from '@/lib/auth'
import { matchStages } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Dashboard',
  description: 'Galaxy Elite Private Match member dashboard.',
  path: '/dashboard',
  noindex: true
})

export default async function DashboardPage() {
  const user = await requireUser()
  return (
    <>
      <div className="dashboard-hero">
        <p className="eyebrow">Welcome back</p>
        <h1>{user.name}, manage your private property matches.</h1>
        <p>You are signed in as <strong>{user.role}</strong> using <strong>{user.provider}</strong> auth.</p>
        {user.provider === 'demo' ? <p className="form-note">Demo auth is active for this local workspace. Backend submissions are authorized with server-signed JWTs.</p> : null}
      </div>
      <div className="dashboard-grid">
        <article className="dashboard-card"><span>Open interests</span><strong>3</strong><p>Demand signals ready for review.</p></article>
        <article className="dashboard-card"><span>Matching</span><strong>2</strong><p>Responses under review.</p></article>
        <article className="dashboard-card"><span>Private rooms</span><strong>1</strong><p>Approved match room in progress.</p></article>
      </div>
      <div className="dashboard-hero" style={{ marginTop: 22 }}>
        <h2>Next best actions</h2>
        <div className="hero-actions"><Link className="button button-gold" href="/dashboard/post-interest">Post New Interest</Link><Link className="button button-outline" href="/dashboard/verified-listing">Verified Listing Request</Link><Link className="button button-outline" href="/private-opportunities?mode=investor">Private Opportunities</Link>{isAdminUser(user) ? <Link className="button button-dark" href="/admin">Control Dashboard</Link> : null}</div>
      </div>
      <div className="pipeline">
        {matchStages.slice(0, 7).map((stage, index) => <div className="pipeline-step" key={stage}><span>{index + 1}</span><strong>{stage}</strong></div>)}
      </div>
    </>
  )
}
