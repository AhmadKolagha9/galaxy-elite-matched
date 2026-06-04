'use client'

import Link from 'next/link'
import { type ReactNode, useMemo, useState } from 'react'
import { type IdentityQueueRow, useIdentityReviewQueue } from '@/lib/use-admin-identity-review'

type SortKey = 'submittedAt' | 'email' | 'primaryRole' | 'paymentMode' | 'documentCount' | 'priority'
type SortDirection = 'asc' | 'desc'

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not captured'
}

function paymentLabel(value: string | null | undefined) {
  return value || 'Not configured'
}

function compareRows(left: IdentityQueueRow, right: IdentityQueueRow, sortKey: SortKey) {
  if (sortKey === 'submittedAt') return new Date(left.submittedAt || 0).getTime() - new Date(right.submittedAt || 0).getTime()
  if (sortKey === 'documentCount') return left.documentCount - right.documentCount
  if (sortKey === 'priority') return Number(left.hasVerificationFilesAttached) - Number(right.hasVerificationFilesAttached)
  return String(left[sortKey] || '').localeCompare(String(right[sortKey] || ''), undefined, { sensitivity: 'base' })
}

export function AdminIdentityReviewTable() {
  const { rows, loading, error } = useIdentityReviewQueue()
  const [sortKey, setSortKey] = useState<SortKey>('priority')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [priorityOnly, setPriorityOnly] = useState(false)

  const visibleRows = useMemo(() => {
    const filtered = priorityOnly ? rows.filter((row) => row.hasVerificationFilesAttached) : rows
    return [...filtered].sort((left, right) => {
      const comparison = compareRows(left, right, sortKey)
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [priorityOnly, rows, sortDirection, sortKey])

  function toggleSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => current === 'asc' ? 'desc' : 'asc')
      return
    }
    setSortKey(nextKey)
    setSortDirection(nextKey === 'priority' || nextKey === 'documentCount' ? 'desc' : 'asc')
  }

  function SortButton({ column, children }: { column: SortKey; children: ReactNode }) {
    const active = column === sortKey
    return (
      <button className="identity-sort-button" type="button" aria-sort={active ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} onClick={() => toggleSort(column)}>
        {children}<span>{active ? (sortDirection === 'asc' ? 'ASC' : 'DESC') : ''}</span>
      </button>
    )
  }

  if (loading) return <div className="admin-section"><p className="form-note">Loading identity review queue...</p></div>
  if (error) return <div className="admin-section"><p className="form-error">{error}</p></div>

  const priorityCount = rows.filter((row) => row.hasVerificationFilesAttached).length

  return (
    <section className="admin-section identity-table-section">
      <div className="section-heading-inline">
        <h2>Active identity review queue</h2>
        <span>{visibleRows.length} shown · {priorityCount} with ownership papers</span>
      </div>

      <div className="identity-grid-toolbar">
        <button className={`button button-small ${priorityOnly ? 'button-gold' : 'button-outline'}`} type="button" onClick={() => setPriorityOnly((current) => !current)}>
          {priorityOnly ? 'Showing Priority' : 'Priority Only'}
        </button>
        <p>Rows with ownership papers attached are prioritized for faster compliance handling.</p>
      </div>

      <div className="identity-table identity-table-wide" role="table" aria-label="Identity review queue">
        <div className="identity-table-row identity-table-head" role="row">
          <span>Customer ID</span>
          <SortButton column="email">Email Address</SortButton>
          <SortButton column="primaryRole">Role</SortButton>
          <SortButton column="paymentMode">Payment Mode</SortButton>
          <SortButton column="priority">Ownership Papers</SortButton>
          <SortButton column="submittedAt">Date Submitted</SortButton>
          <span>State</span>
          <SortButton column="documentCount">Files</SortButton>
          <span>Action</span>
        </div>
        {visibleRows.length ? visibleRows.map((row) => (
          <div className={`identity-table-row ${row.hasVerificationFilesAttached ? 'identity-row-priority' : ''}`} role="row" key={row.id}>
            <code>{row.id.slice(0, 8)}...</code>
            <strong>{row.email}</strong>
            <span>{row.primaryRole}</span>
            <span>{paymentLabel(row.paymentMode)}</span>
            <span className={`status ${row.hasVerificationFilesAttached ? 'status-priority' : 'status-muted'}`}>
              {row.hasVerificationFilesAttached ? 'Attached' : 'None'}
            </span>
            <span>{formatDate(row.submittedAt)}</span>
            <span className="status status-matching">{row.verificationStatus}</span>
            <span>{row.documentCount}</span>
            <Link className="button button-small button-dark" href={`/admin/compliance/identities/${row.id}`}>Review</Link>
          </div>
        )) : <p className="form-note identity-empty">No customer identity files match this view.</p>}
      </div>
    </section>
  )
}
