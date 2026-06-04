'use client'

import { useCallback, useEffect, useState } from 'react'

export type IdentityQueueRow = {
  id: string
  email: string
  primaryRole: string
  paymentMode: string | null
  hasVerificationFilesAttached: boolean
  submittedAt: string | null
  verificationStatus: string
  documentCount: number
}

export type IdentityDocument = {
  id: string
  documentType: string
  originalFilename: string | null
  mimeType: string | null
  fileSize: number | null
  verificationStatus: string
  createdAt: string | null
}

export type IdentityDetail = {
  user: {
    id: string
    email: string
    fullName: string | null
    phone: string | null
    primaryRole: string
    verificationStatus: string
    verificationReviewNote: string | null
    submittedAt: string | null
    createdAt: string | null
  }
  documents: IdentityDocument[]
}

type QueueResponse = { ok?: boolean; rows?: IdentityQueueRow[]; error?: string }
type DetailResponse = IdentityDetail & { ok?: boolean; error?: string }
type DocumentViewResponse = { ok?: boolean; signedUrl?: string; document?: IdentityDocument; error?: string }

async function readJson<T extends { error?: string }>(response: Response, fallback: string): Promise<T> {
  const body = await response.json().catch(() => null) as T | null
  if (!response.ok) throw new Error(body?.error || fallback)
  if (!body) throw new Error(fallback)
  return body
}

export function useIdentityReviewQueue() {
  const [rows, setRows] = useState<IdentityQueueRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError('')
    try {
      const body = await readJson<QueueResponse>(
        await fetch('/api/admin/compliance/identities', { cache: 'no-store', signal }),
        'Could not load identity queue.'
      )
      setRows(body.rows || [])
    } catch (caught) {
      if ((caught as Error).name === 'AbortError') return
      setError(caught instanceof Error ? caught.message : 'Could not load identity queue.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    reload(controller.signal)
    return () => controller.abort()
  }, [reload])

  return { rows, loading, error, reload }
}

export function useIdentityDetail(id: string) {
  const [detail, setDetail] = useState<IdentityDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError('')
    try {
      const body = await readJson<DetailResponse>(
        await fetch(`/api/admin/compliance/identities/${id}`, { cache: 'no-store', signal }),
        'Could not load identity detail.'
      )
      setDetail({ user: body.user, documents: body.documents || [] })
    } catch (caught) {
      if ((caught as Error).name === 'AbortError') return
      setError(caught instanceof Error ? caught.message : 'Could not load identity detail.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const controller = new AbortController()
    reload(controller.signal)
    return () => controller.abort()
  }, [reload])

  return { detail, loading, error, setError, reload }
}

export function useSecureDocumentView() {
  const [activeDocument, setActiveDocument] = useState<IdentityDocument | null>(null)
  const [signedUrl, setSignedUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const openDocument = useCallback(async (document: IdentityDocument) => {
    setActiveDocument(document)
    setSignedUrl('')
    setError('')
    setLoading(true)
    try {
      const body = await readJson<DocumentViewResponse>(
        await fetch(`/api/admin/compliance/documents/${document.id}/view`, { cache: 'no-store' }),
        'Could not create document view URL.'
      )
      if (!body.signedUrl) throw new Error('Document view URL was not returned.')
      setSignedUrl(body.signedUrl)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load secure document view.')
    } finally {
      setLoading(false)
    }
  }, [])

  const clearDocument = useCallback(() => {
    setActiveDocument(null)
    setSignedUrl('')
    setError('')
    setLoading(false)
  }, [])

  return { activeDocument, signedUrl, loading, error, openDocument, clearDocument }
}

export function useIdentityReviewDecision(id: string, onReviewed: () => void) {
  const [decisionLoading, setDecisionLoading] = useState<'approve' | 'reject' | ''>('')
  const [error, setError] = useState('')

  const submitDecision = useCallback(async (action: 'approve' | 'reject', reason?: string) => {
    if (decisionLoading) return
    setDecisionLoading(action)
    setError('')
    try {
      const response = await fetch(`/api/admin/compliance/identities/${id}/review`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(action === 'approve' ? { action: 'approve' } : { action: 'reject', rejection_reason: reason })
      })
      const body = await response.json().catch(() => null) as { error?: string } | null
      if (!response.ok) throw new Error(body?.error || 'Could not update identity status.')
      onReviewed()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update identity status.')
      setDecisionLoading('')
    }
  }, [decisionLoading, id, onReviewed])

  return { decisionLoading, error, setError, submitDecision }
}
