import type { Metadata } from 'next'
import Link from 'next/link'
import { ControlNav } from '@/components/control/ControlNav'
import { fieldText, getSubmissionQueue, queueStatusOptions, queueTypeOptions, type SubmissionQueueFilters } from '@/lib/control-api'
import { requireAdmin } from '@/lib/auth'
import { areaCityOptions, countryOptions } from '@/lib/taxonomy'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Submissions' }

type PageProps = { searchParams?: Promise<Record<string, string | undefined>> }

function normalizeFilters(params: Record<string, string | undefined>): SubmissionQueueFilters {
  const type = queueTypeOptions.some((item) => item.value === params.type) ? params.type as SubmissionQueueFilters['type'] : undefined
  const approvalStatus = queueStatusOptions.some((item) => item.value === params.approvalStatus) ? params.approvalStatus as SubmissionQueueFilters['approvalStatus'] : undefined
  return {
    type,
    approvalStatus,
    country: params.country || undefined,
    areaCity: params.areaCity || undefined
  }
}

function statusLabel(value: unknown) {
  return String(value || 'pending_review').replace(/_/g, ' ')
}

export default async function SubmissionsPage({ searchParams }: PageProps) {
  await requireAdmin()
  const params = (await searchParams) || {}
  const filters = normalizeFilters(params)
  const records = await getSubmissionQueue(filters)

  return (
    <section className="dashboard-shell admin-shell">
      <ControlNav />
      <div className="dashboard-main">
        <div className="dashboard-hero admin-hero"><p className="eyebrow">Central queue</p><h1>Moderation tracking across demand, supply and investor intake.</h1><p>Filter MySQL-backed rows by type, status and location before opening the decision interface.</p></div>
        <form className="queue-filter-form" method="GET">
          <label>Type segment<select name="type" defaultValue={filters.type || ''}><option value="">All types</option>{queueTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label>Status<select name="approvalStatus" defaultValue={filters.approvalStatus || ''}><option value="">All statuses</option>{queueStatusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label>Country<select name="country" defaultValue={filters.country || ''}><option value="">All countries</option>{countryOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label>Area / City<select name="areaCity" defaultValue={filters.areaCity || ''}><option value="">All areas</option>{areaCityOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <button className="button button-dark" type="submit">Apply Filters</button>
        </form>
        <div className="queue-table-wrap">
          <table className="control-table">
            <thead><tr><th>Type</th><th>Title</th><th>Status</th><th>Location</th><th>Submitted</th><th>Action</th></tr></thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{String(record.submissionType || record.type || 'submission')}</td>
                  <td><strong>{fieldText(record, ['title', 'purpose', 'investorGoal', 'availabilityType'], record.id)}</strong><span>{record.id}</span></td>
                  <td><span className="status-pill">{statusLabel(record.approvalStatusRaw || record.approvalStatus)}</span></td>
                  <td>{fieldText(record, ['country'])}<span>{fieldText(record, ['area_city', 'areaCity', 'cityArea'], 'Any area')}</span></td>
                  <td>{record.submittedAt ? new Date(String(record.submittedAt)).toLocaleDateString() : 'Pending'}</td>
                  <td><Link className="button button-outline button-small" href={'/submissions/' + encodeURIComponent(record.id)}>Review</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!records.length ? <div className="empty-state compact-empty"><p>No submissions match these filters.</p></div> : null}
        </div>
      </div>
    </section>
  )
}
