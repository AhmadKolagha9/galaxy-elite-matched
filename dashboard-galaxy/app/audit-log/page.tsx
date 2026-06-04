import type { Metadata } from 'next'
import { AccessDeniedPanel } from '@/components/control/AccessDeniedPanel'
import { ControlNav } from '@/components/control/ControlNav'
import { getCurrentUser } from '@/lib/auth'
import { getAuditLog } from '@/lib/control-api'
import type { AuditLogEntry } from '@/lib/control-model'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Audit Log' }

function timestampValue(value: unknown) {
  if (!value) return 0
  if (typeof value === 'string') return new Date(value).getTime() || 0
  if (typeof value === 'number') return value
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const seconds = Number(record.seconds ?? record._seconds)
    if (Number.isFinite(seconds)) return seconds * 1000
  }
  return 0
}

function formatTimestamp(value: unknown) {
  const time = timestampValue(value)
  if (!time) return 'Pending timestamp'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(time))
}

function actionTone(action?: string | null) {
  const value = String(action || '').toLowerCase()
  if (value.includes('reject') || value.includes('failed')) return 'ruby'
  if (value.includes('hold') || value.includes('request')) return 'amber'
  if (value.includes('taxonomy') || value.includes('modify')) return 'gold'
  if (value.includes('approve') || value.includes('verify')) return 'teal'
  return 'neutral'
}

function sortedActions(actions: AuditLogEntry[]) {
  return [...actions].sort((a, b) => timestampValue(b.timestamp) - timestampValue(a.timestamp))
}

export default async function AuditLogPage() {
  const user = await getCurrentUser()
  if (!user?.roles.includes('super_admin')) return <AccessDeniedPanel title="Audit logs are restricted to SuperAdmin claims." />

  const actions = sortedActions(await getAuditLog(250))
  return (
    <section className="dashboard-shell admin-shell">
      <ControlNav />
      <div className="dashboard-main">
        <div className="dashboard-hero admin-hero">
          <p className="eyebrow">Immutable audit log</p>
          <h1>Compliance timeline and administrative trace.</h1>
          <p>Read-only chronology from the backend audit source. Rows are color-coded by structural action type.</p>
        </div>
        <div className="queue-table-wrap audit-grid-wrap">
          <table className="control-table audit-grid">
            <thead><tr><th>Timestamp</th><th>Actor Email</th><th>Actor ID</th><th>Action</th><th>Object Type</th><th>Object ID</th><th>Previous</th><th>New</th><th>IP</th><th>Note</th></tr></thead>
            <tbody>
              {actions.map((entry) => (
                <tr className={'audit-row audit-' + actionTone(entry.actionType)} key={entry.id}>
                  <td>{formatTimestamp(entry.timestamp)}</td>
                  <td>{entry.adminEmail || 'Service account'}</td>
                  <td><span>{entry.adminUserId || 'system'}</span></td>
                  <td><strong>{entry.actionType || 'action'}</strong></td>
                  <td>{entry.targetObjectType || 'object'}</td>
                  <td><span>{entry.targetObjectId || 'n/a'}</span></td>
                  <td>{entry.previousStatus || 'none'}</td>
                  <td>{entry.newStatus || 'none'}</td>
                  <td>{entry.ipAddress || 'not recorded'}</td>
                  <td>{entry.note || 'No note provided.'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!actions.length ? <div className="empty-state compact-empty"><p>No audit entries returned from the backend.</p></div> : null}
        </div>
      </div>
    </section>
  )
}
