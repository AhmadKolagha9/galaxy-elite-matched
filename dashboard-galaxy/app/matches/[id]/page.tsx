import type { Metadata } from 'next'
import { ControlNav } from '@/components/control/ControlNav'
import { DealStageTracker } from '@/components/control/DealStageTracker'
import { requireAdmin } from '@/lib/auth'
import { dealFlowStages, type DealFlowStage } from '@/lib/control-model'

export const metadata: Metadata = { title: 'Match Detail' }

type PageProps = { params: Promise<{ id: string }>; searchParams?: Promise<{ stage?: string }> }

function initialStage(value?: string): DealFlowStage {
  const match = dealFlowStages.find((stage) => stage.value === value)
  return match?.value || 'interest_received'
}

export default async function MatchDetailPage({ params, searchParams }: PageProps) {
  await requireAdmin()
  const { id } = await params
  const query = (await searchParams) || {}

  return (
    <section className="dashboard-shell admin-shell">
      <ControlNav />
      <div className="dashboard-main">
        <div className="dashboard-hero admin-hero"><p className="eyebrow">Match workflow</p><h1>{id}</h1><p>Move the room forward or backward one stage at a time with a required audit comment.</p></div>
        <DealStageTracker id={id} initialStage={initialStage(query.stage)} />
      </div>
    </section>
  )
}
