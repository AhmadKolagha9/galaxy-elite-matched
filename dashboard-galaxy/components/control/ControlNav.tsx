import Link from 'next/link'
import { logoutAction, getCurrentUser } from '@/lib/auth'

const standardLinks = [
  { href: '/', label: 'Overview' },
  { href: '/submissions', label: 'Submissions' },
  { href: '/documents', label: 'Documents' },
  { href: '/matches', label: 'Matches' },
  { href: '/new-projects', label: 'New Projects' }
]

const superAdminLinks = [
  { href: '/taxonomy', label: 'Taxonomy' },
  { href: '/audit-log', label: 'Audit Log' }
]

export async function ControlNav() {
  const user = await getCurrentUser()
  const isSuperAdmin = Boolean(user?.roles.includes('super_admin'))
  const links = isSuperAdmin ? [...standardLinks, ...superAdminLinks] : standardLinks

  return (
    <aside className="dashboard-nav admin-nav">
      <strong>Galaxy Elite Control</strong>
      {links.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
      <span className="admin-meta">{user?.email || 'Verified staff'}</span>
      <form action={logoutAction}>
        <button className="button button-outline button-small" type="submit">Sign out</button>
      </form>
    </aside>
  )
}
