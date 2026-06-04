import { AdminNav } from '@/components/AdminNav'
import { requireAdmin } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return (
    <section className="dashboard-shell admin-shell">
      <AdminNav />
      <div className="dashboard-main">{children}</div>
    </section>
  )
}
