import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({ title: 'Profile', description: 'Private Match profile.', path: '/dashboard/profile', noindex: true })

export default async function DashboardProfilePage() {
  const user = await requireUser()
  return (
    <>
      <div className="dashboard-hero"><p className="eyebrow">Profile</p><h1>Your verified identity layer.</h1><p>Production profiles should be stored in Supabase with verification level, role, authority and consent logs.</p></div>
      <div className="policy-grid">
        <article className="policy-card"><h3>Name</h3><p>{user.name}</p></article>
        <article className="policy-card"><h3>Email</h3><p>{user.email}</p></article>
        <article className="policy-card"><h3>Role</h3><p>{user.role}</p></article>
        <article className="policy-card"><h3>Auth mode</h3><p>{user.provider}</p></article>
      </div>
    </>
  )
}
