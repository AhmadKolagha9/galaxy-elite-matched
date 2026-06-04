import type { Metadata } from 'next'
import { ControlNav } from '@/components/control/ControlNav'
import { MatchRoomLookup } from '@/components/control/MatchRoomLookup'
import { requireAdmin } from '@/lib/auth'
import { dealFlowStages } from '@/lib/control-model'

export const metadata: Metadata = { title: 'Matches' }

export default async function MatchesPage() {
  await requireAdmin()
  return (
    <section className="dashboard-shell admin-shell">
      <ControlNav />
      <div className="dashboard-main">
        <div className="dashboard-hero admin-hero"><p className="eyebrow">Matches</p><h1>Deal-flow stage manager.</h1><p>Open a match room to control the strict 11-stage lifecycle and append audit comments for every override.</p></div>
        <div className="admin-card-grid">
          <MatchRoomLookup />
          <article className="admin-card">
            <h3>Lifecycle stages</h3>
            <div className="document-checklist compact-list">{dealFlowStages.map((stage, index) => <span key={stage.value}>{index + 1}. {stage.label}</span>)}</div>
          </article>
        </div>
      </div>
    </section>
  )
}
