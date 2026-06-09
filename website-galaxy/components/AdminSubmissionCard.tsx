import { adminDecisionAction } from '@/app/admin/actions'
import { type CollectionKey, type SubmissionRecord, getCollectionLabel } from '@/lib/admin-store'
import { adminDecisionOptions, publicStatusOptions, verificationLevelOptions } from '@/lib/taxonomy'

function text(value: unknown, fallback = '—') {
  if (value === undefined || value === null || value === '') return fallback
  if (Array.isArray(value)) return value.length ? `${value.length} item(s)` : fallback
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const fieldMap = ['role', 'submitterRole', 'investorProfile', 'investor_type', 'purpose', 'availabilityType', 'listingIntent', 'investorGoal', 'investment_goal', 'marketSegment', 'market_segments', 'propertyType', 'property_types', 'country', 'countries', 'cityArea', 'area_city', 'area', 'projectName', 'buildingName', 'size', 'budget', 'ticketSize', 'ticket_min', 'ticket_max', 'priceRange', 'targetYield', 'target_yield', 'riskPreference', 'risk_preference', 'timeline', 'holding_period', 'financing_method', 'availabilityDate', 'budgetVisibility', 'budget_visibility', 'agentPreference', 'authority', 'ownershipStatus', 'permitStatus', 'has_verification_files_attached', 'company', 'licenceNumber', 'representation']

export function AdminSubmissionCard({ collection, record }: { collection: CollectionKey; record: SubmissionRecord }) {
  const title = text(record.title || record.projectName || record.propertyType || record.investorGoal || record.email, getCollectionLabel(collection))
  const docs = Array.isArray(record.uploadedDocuments) ? record.uploadedDocuments : []
  return (
    <article className="admin-card">
      <div className="card-topline">
        <span className="verified-pill">{getCollectionLabel(collection)}</span>
        <span className="status status-hidden">{text(record.status)}</span>
      </div>
      <h3>{title}</h3>
      <p className="admin-meta">ID: {record.id} · Submitted: {new Date(record.submittedAt).toLocaleString()}</p>
      <div className="admin-detail-grid">
        {fieldMap.filter((key) => record[key] !== undefined && record[key] !== '').map((key) => (
          <div key={key}><dt>{key.replace(/([A-Z])/g, ' $1')}</dt><dd>{text(record[key])}</dd></div>
        ))}
      </div>
      {record.description ? <p className="admin-description">{text(record.description)}</p> : null}
      {docs.length ? <div className="uploaded-docs"><strong>Uploaded documents</strong>{docs.map((doc) => <span key={`${doc.field}-${doc.name}`}>{doc.field}: {doc.name} ({Math.round(doc.size / 1024)} KB)</span>)}</div> : null}
      <form className="admin-decision-form" action={adminDecisionAction}>
        <input type="hidden" name="collection" value={collection} />
        <input type="hidden" name="id" value={record.id} />
        <label>Approval decision<select name="approvalStatus" defaultValue={String(record.approvalStatus || 'pending')}>{adminDecisionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label>Public status<select name="publicStatus" defaultValue={String(record.publicStatus || 'Hidden')}>{publicStatusOptions.map((status) => <option key={status}>{status}</option>)}</select></label>
        <label>Verification level<select name="verificationLevel" defaultValue={String(record.verificationLevel || 'Not started')}>{verificationLevelOptions.map((level) => <option key={level}>{level}</option>)}</select></label>
        <label>Compliance notes<textarea name="complianceNotes" rows={3} defaultValue={String(record.complianceNotes || '')} placeholder="Reason for approval, rejected documents, permit notes, authority status, next step..." /></label>
        <button className="button button-gold button-small" type="submit">Save Admin Decision</button>
      </form>
    </article>
  )
}
