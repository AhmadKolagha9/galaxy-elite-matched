import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CorporateLoginForm } from '@/components/CorporateLoginForm'

export const metadata: Metadata = {
  title: 'Corporate Login',
  description: 'Galaxy Elite corporate control platform login.',
  robots: { index: false, follow: false, nocache: true },
  other: { robots: 'noindex, nofollow, noarchive' }
}

export default function LoginPage() {
  return (
    <section className="auth-section">
      <div className="auth-panel">
        <p className="eyebrow">Corporate control</p>
        <h1>Staff access uses native backend email and password.</h1>
        <Suspense fallback={<p className="form-note">Loading secure login...</p>}>
          <CorporateLoginForm />
        </Suspense>
      </div>
      <aside className="auth-aside">
        <p className="eyebrow">Closed perimeter</p>
        <h2>No public dashboard routes.</h2>
        <ul>
          <li>Backend JWTs are verified by the Express API.</li>
          <li>Only admin, compliance, or super_admin users can enter.</li>
          <li>Taxonomy and audit logs require superAdmin access.</li>
          <li>Every route is marked noindex, nofollow, noarchive.</li>
        </ul>
      </aside>
    </section>
  )
}
