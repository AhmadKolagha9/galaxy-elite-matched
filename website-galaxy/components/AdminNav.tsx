import Link from 'next/link'
import { logoutAction } from '@/lib/auth'

const adminLinks = [
  { href: '/admin', label: 'Control Overview' },
  { href: '/admin/approvals', label: 'Approval Queue' },
  { href: '/admin/compliance', label: 'Compliance Vault' },
  { href: '/admin/compliance/identities', label: 'Identity Review' },
  { href: '/admin/taxonomy', label: 'Dropdowns / Taxonomy' },
  { href: '/dashboard', label: 'Member Dashboard' }
]

export function AdminNav() {
  return (
    <aside className="dashboard-nav admin-nav">
      <strong>Galaxy Elite Control</strong>
      {adminLinks.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
      <form action={logoutAction}>
        <button className="button button-outline button-small" type="submit">Sign out</button>
      </form>
    </aside>
  )
}
