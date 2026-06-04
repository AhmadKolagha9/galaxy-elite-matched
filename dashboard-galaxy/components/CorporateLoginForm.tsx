"use client"

import { useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { safeDashboardNextPath } from '@/lib/safe-next-path'

type SubmitState = 'idle' | 'submitting' | 'error'

export function CorporateLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState('')

  const nextPath = safeDashboardNextPath(searchParams.get('next'))

  async function establishSession(token: string) {
    const response = await fetch('/api/admin-session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token })
    })
    const body = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null
    if (!response.ok || body?.ok === false) throw new Error(body?.error || 'Corporate authorization failed.')
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('submitting')
    setMessage('')

    const formData = new FormData(event.currentTarget)
    const token = String(formData.get('token') || '').trim()

    try {
      await establishSession(token)
      router.replace(nextPath)
      router.refresh()
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Corporate login failed.')
    }
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <label>Backend Staff Token<input name="token" type="password" autoComplete="one-time-code" required /></label>
      {message ? <p className="form-error">{message}</p> : null}
      <button className="button button-gold" type="submit" disabled={state === 'submitting'}>
        {state === 'submitting' ? 'Verifying Token...' : 'Access Control Platform'}
      </button>
    </form>
  )
}

