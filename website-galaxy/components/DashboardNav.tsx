import Link from 'next/link'
import { logoutAction } from '@/lib/auth'
import { dashboardNav } from '@/lib/site'

export function DashboardNav() {
  return (
    <aside className="dashboard-nav">
      <strong>Member Dashboard</strong>
      {dashboardNav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
      <form action={logoutAction}>
        <button className="button button-outline button-small" type="submit">Sign out</button>
      </form>
    </aside>
  )
}
