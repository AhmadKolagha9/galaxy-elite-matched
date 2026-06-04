'use client'

import { useCallback, useMemo, useState } from 'react'

export type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

export function useSubmissionLock(initialStatus: SubmitStatus = 'idle') {
  const [status, setStatus] = useState<SubmitStatus>(initialStatus)
  const [message, setMessage] = useState('')

  const isSubmitting = status === 'loading'

  const beginSubmit = useCallback(() => {
    if (isSubmitting) return false
    setStatus('loading')
    setMessage('')
    return true
  }, [isSubmitting])

  const finishSuccess = useCallback((nextMessage: string) => {
    setStatus('success')
    setMessage(nextMessage)
  }, [])

  const finishError = useCallback((nextMessage: string) => {
    setStatus('error')
    setMessage(nextMessage)
  }, [])

  const resetSubmit = useCallback(() => {
    setStatus('idle')
    setMessage('')
  }, [])

  return useMemo(() => ({
    status,
    message,
    isSubmitting,
    beginSubmit,
    finishSuccess,
    finishError,
    resetSubmit
  }), [beginSubmit, finishError, finishSuccess, isSubmitting, message, resetSubmit, status])
}
