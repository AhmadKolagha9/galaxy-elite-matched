"use client"

import { useCallback, useEffect, useState } from 'react'

export type AgentApplicationRow = {
  id: string
  userId: string
  companyName: string
  brokerLicenceNumber: string
  country: string
  notes?: string | null
  status: string
  submittedAt?: string | null
  updatedAt: string
  documentCount?: number
  user?: {
    email: string
    fullName?: string | null
    phone?: string | null
    primaryRole: string
    verificationStatus: string
  }
}

export type AgentApplicationDocument = {
  id: string
  documentType: string
  originalFilename: string | null
  mimeType: string | null
  fileSize: number | null
  verificationStatus: string
  createdAt: string | null
}

export type AgentApplicationDetail = {
  application: AgentApplicationRow
  documents: AgentApplicationDocument[]
  documentState?: { requiredComplete?: boolean; hasOwnerId?: boolean; hasBrokerLicence?: boolean }
}

type QueueResponse = { ok?: boolean; rows?: AgentApplicationRow[]; error?: string }
type DetailResponse = AgentApplicationDetail & { ok?: boolean; error?: string }
type DocumentViewResponse = { ok?: boolean; signedUrl?: string; document?: AgentApplicationDocument; error?: string }

async function readJson<T extends { error?: string }>(response: Response, fallback: string): Promise<T> {
  const body = await response.json().catch(() => null) as T | null
  if (!response.ok) throw new Error(body?.error || fallback)
  if (!body) throw new Error(fallback)
  return body
}

export function useAgentApplicationQueue() {
  const [rows, setRows] = useState<AgentApplicationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError('')
    try {
      const body = await readJson<QueueResponse>(await fetch('/api/admin/compliance/agents', { cache: 'no-store', signal }), 'Could not load agent applications.')
      setRows(body.rows || [])
    } catch (caught) {
      if ((caught as Error).name === 'AbortError') return
      setError(caught instanceof Error ? caught.message : 'Could not load agent applications.')
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

export function useAgentApplicationDetail(id: string) {
  const [detail, setDetail] = useState<AgentApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError('')
    try {
      const body = await readJson<DetailResponse>(await fetch(`/api/admin/compliance/agents/${id}`, { cache: 'no-store', signal }), 'Could not load agent application.')
      setDetail({ application: body.application, documents: body.documents || [], documentState: body.documentState })
    } catch (caught) {
      if ((caught as Error).name === 'AbortError') return
      setError(caught instanceof Error ? caught.message : 'Could not load agent application.')
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

export function useAgentDocumentView() {
  const [activeDocument, setActiveDocument] = useState<AgentApplicationDocument | null>(null)
  const [signedUrl, setSignedUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const openDocument = useCallback(async (document: AgentApplicationDocument) => {
    setActiveDocument(document)
    setSignedUrl('')
    setError('')
    setLoading(true)
    try {
      const body = await readJson<DocumentViewResponse>(await fetch(`/api/admin/compliance/documents/${document.id}/view`, { cache: 'no-store' }), 'Could not create document view URL.')
      if (!body.signedUrl) throw new Error('Document view URL was not returned.')
      setSignedUrl(body.signedUrl)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load secure document view.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { activeDocument, signedUrl, loading, error, openDocument }
}

export function useAgentApplicationDecision(id: string, onReviewed: () => void) {
  const [decisionLoading, setDecisionLoading] = useState<'approve' | 'reject' | ''>('')
  const [error, setError] = useState('')

  const submitDecision = useCallback(async (action: 'approve' | 'reject', reason?: string) => {
    if (decisionLoading) return
    setDecisionLoading(action)
    setError('')
    try {
      const response = await fetch(`/api/admin/compliance/agents/${id}/review`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(action === 'approve' ? { action: 'approve' } : { action: 'reject', rejection_reason: reason })
      })
      const body = await response.json().catch(() => null) as { error?: string } | null
      if (!response.ok) throw new Error(body?.error || 'Could not review agent application.')
      onReviewed()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not review agent application.')
      setDecisionLoading('')
    }
  }, [decisionLoading, id, onReviewed])

  return { decisionLoading, error, setError, submitDecision }
}
