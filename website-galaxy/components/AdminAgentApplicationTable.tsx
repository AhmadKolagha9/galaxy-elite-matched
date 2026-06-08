"use client"

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { type AgentApplicationRow, useAgentApplicationQueue } from '@/lib/use-admin-agent-applications'

type SortKey = 'submittedAt' | 'email' | 'companyName' | 'country' | 'documentCount'
type SortDirection = 'asc' | 'desc'

function formatDate(value: string | null | undefined) {
  return value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not captured'
}

function compareRows(left: AgentApplicationRow, right: AgentApplicationRow, key: SortKey) {
  if (key === 'submittedAt') return new Date(left.submittedAt || 0).getTime() - new Date(right.submittedAt || 0).getTime()
  if (key === 'documentCount') return Number(left.documentCount || 0) - Number(right.documentCount || 0)
  if (key === 'email') return String(left.user?.email || '').localeCompare(String(right.user?.email || ''), undefined, { sensitivity: 'base' })
  return String(left[key] || '').localeCompare(String(right[key] || ''), undefined, { sensitivity: 'base' })
}

export function AdminAgentApplicationTable() {
  const { rows, loading, error } = useAgentApplicationQueue()
  const [sortKey, setSortKey] = useState<SortKey>('submittedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const sortedRows = useMemo(() => [...rows].sort((left, right) => {
    const comparison = compareRows(left, right, sortKey)
    return sortDirection === 'asc' ? comparison : -comparison
  }), [rows, sortDirection, sortKey])

  function toggleSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => current === 'asc' ? 'desc' : 'asc')
      return
    }
    setSortKey(nextKey)
    setSortDirection(nextKey === 'documentCount' ? 'desc' : 'asc')
  }

  function SortButton({ column, children }: { column: SortKey; children: React.ReactNode }) {
    const active = column === sortKey
    return <button className="identity-sort-button" type="button" onClick={() => toggleSort(column)}>{children}<span>{active ? (sortDirection === 'asc' ? 'ASC' : 'DESC') : ''}</span></button>
  }

  if (loading) return <div className="admin-section"><p className="form-note">Loading agent applications...</p></div>
  if (error) return <div className="admin-section"><p className="form-error">{error}</p></div>

  return (
    <section className="admin-section identity-table-section">
      <div className="section-heading-inline"><h2>Pending agent applications</h2><span>{sortedRows.length} pending</span></div>
      <div className="identity-table" role="table" aria-label="Agent application queue">
        <div className="identity-table-row identity-table-head agent-table-row" role="row">
          <SortButton column="email">Applicant</SortButton>
          <SortButton column="companyName">Company</SortButton>
          <span>Licence</span>
          <SortButton column="country">Country</SortButton>
          <SortButton column="documentCount">Files</SortButton>
          <SortButton column="submittedAt">Submitted</SortButton>
          <span>Action</span>
        </div>
        {sortedRows.length ? sortedRows.map((row) => (
          <div className="identity-table-row agent-table-row identity-row-priority" role="row" key={row.id}>
            <strong>{row.user?.email || row.userId}</strong>
            <span>{row.companyName || 'Not provided'}</span>
            <span>{row.brokerLicenceNumber}</span>
            <span>{row.country}</span>
            <span className="status status-priority">{row.documentCount || 0}</span>
            <span>{formatDate(row.submittedAt)}</span>
            <Link className="button button-small button-dark" href={`/admin/compliance/agents/${row.id}`}>Review</Link>
          </div>
        )) : <p className="form-note identity-empty">No pending agent applications.</p>}
      </div>
    </section>
  )
}
