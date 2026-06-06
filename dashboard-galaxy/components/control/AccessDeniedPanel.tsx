import Link from 'next/link'

export function AccessDeniedPanel({ title = 'SuperAdmin access required.' }: { title?: string }) {
  return (
    <section className="dashboard-shell admin-shell">
      <aside className="dashboard-nav admin-nav">
        <strong>Galaxy Elite Control</strong>
        <Link href="/">Overview</Link>
        <Link href="/submissions">Submissions</Link>
        <Link href="/documents">Documents</Link>
        <Link href="/matches">Matches</Link>
      </aside>
      <div className="dashboard-main">
        <div className="dashboard-hero admin-hero access-denied-panel">
          <p className="eyebrow">Access denied</p>
          <h1>{title}</h1>
          <p>This route is restricted to backend staff sessions with the <code>super_admin</code> role. No taxonomy or audit data was requested.</p>
        </div>
      </div>
    </section>
  )
}
