import type { Metadata } from 'next'
import Link from 'next/link'
import { getBackendJwtPayloadFromCookie, hasComplianceRole } from '@/lib/native-session'

export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } }
}

function AccessRestrictionPanel() {
  return (
    <div className="access-panel">
      <p className="eyebrow">Restricted Compliance Area</p>
      <h1>Compliance or super admin access required.</h1>
      <p>This workspace requires a native backend JWT with an explicit compliance or super_admin role claim.</p>
      <Link className="button button-outline" href="/admin">Return to Control Overview</Link>
    </div>
  )
}

export default async function ComplianceLayout({ children }: { children: React.ReactNode }) {
  const payload = await getBackendJwtPayloadFromCookie()
  if (!hasComplianceRole(payload)) return <AccessRestrictionPanel />
  return children
}
