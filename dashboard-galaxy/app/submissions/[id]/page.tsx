import type { Metadata } from 'next'
import { ControlNav } from '@/components/control/ControlNav'
import { ModerationActions } from '@/components/control/ModerationActions'
import { fieldText, getSubmissionDetail } from '@/lib/control-api'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Submission Detail' }

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const detail = await getSubmissionDetail(id)
  const record = detail.record

  return (
    <section className="dashboard-shell admin-shell">
      <ControlNav />
      <div className="dashboard-main">
        <div className="dashboard-hero admin-hero"><p className="eyebrow">Submission detail</p><h1>{fieldText(record, ['title', 'purpose', 'investorGoal'], record.id)}</h1><p>Approve, hold or reject with immutable administrative feedback.</p></div>
        <section className="review-split">
          <article className="admin-card">
            <h3>Record summary</h3>
            <div className="admin-detail-grid">
              <div><dt>ID</dt><dd>{record.id}</dd></div>
              <div><dt>Type</dt><dd>{detail.type || record.submissionType || 'submission'}</dd></div>
              <div><dt>Approval</dt><dd>{String(record.approvalStatusRaw || record.approvalStatus || 'pending_review')}</dd></div>
              <div><dt>Public</dt><dd>{String(record.publicStatusRaw || record.publicStatus || 'hidden')}</dd></div>
              <div><dt>Verification</dt><dd>{String(record.verificationStatusRaw || record.verificationLevel || 'unverified')}</dd></div>
              <div><dt>Country</dt><dd>{fieldText(record, ['country'])}</dd></div>
              <div><dt>Area / City</dt><dd>{fieldText(record, ['area_city', 'areaCity', 'cityArea'])}</dd></div>
              <div><dt>Market</dt><dd>{fieldText(record, ['market_segment', 'marketSegment'])}</dd></div>
            </div>
            <p className="admin-description">{fieldText(record, ['private_description', 'description', 'summary'], 'No description submitted.')}</p>
          </article>
          <ModerationActions id={record.id} />
        </section>
      </div>
    </section>
  )
}
