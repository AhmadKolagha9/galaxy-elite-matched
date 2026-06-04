import type { Metadata } from 'next'
import { AccessDeniedPanel } from '@/components/control/AccessDeniedPanel'
import { ControlNav } from '@/components/control/ControlNav'
import { getCurrentUser } from '@/lib/auth'
import { getTaxonomyItems } from '@/lib/control-api'
import { TaxonomyManager } from './_components/TaxonomyManager'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Taxonomy' }

export default async function TaxonomyPage() {
  const user = await getCurrentUser()
  if (!user?.roles.includes('super_admin')) return <AccessDeniedPanel title="Taxonomy is restricted to SuperAdmin claims." />

  const items = await getTaxonomyItems()
  return (
    <section className="dashboard-shell admin-shell">
      <ControlNav />
      <div className="dashboard-main">
        <div className="dashboard-hero admin-hero">
          <p className="eyebrow">SuperAdmin taxonomy</p>
          <h1>Recursive dropdown tree control.</h1>
          <p>Manage MySQL-backed taxonomy nodes, slugs, country scopes and parent-child relationships without allowing looped parent references.</p>
        </div>
        <TaxonomyManager initialItems={items} />
      </div>
    </section>
  )
}
