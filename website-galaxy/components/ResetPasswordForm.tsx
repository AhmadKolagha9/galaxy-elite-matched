'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type SubmitState = 'idle' | 'loading' | 'error'

type AuthResponse = {
  ok?: boolean
  token?: string
  error?: string
  message?: string
}

function backendApiUrl() {
  return (
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://api.yourpropertymatch.cloud'
  ).replace(/\/$/, '')
}

async function readAuthResponse(response: Response, fallback: string): Promise<AuthResponse> {
  const body = response.headers.get('content-type')?.includes('application/json')
    ? await response.json().catch(() => null)
    : null

  if (!response.ok) {
    const message = body && typeof body === 'object'
      ? String((body as AuthResponse).error || (body as AuthResponse).message || fallback)
      : fallback
    throw new Error(message)
  }

  return body && typeof body === 'object' ? body as AuthResponse : { ok: true }
}

export function ResetPasswordForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter()
  const apiBase = useMemo(() => backendApiUrl(), [])
  const [email, setEmail] = useState(initialEmail)
  const [status, setStatus] = useState<SubmitState>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setError('')

    const form = new FormData(event.currentTarget)
    const nextEmail = String(form.get('email') || '').trim().toLowerCase()
    const code = String(form.get('code') || '').trim()
    const password = String(form.get('password') || '')
    const confirmPassword = String(form.get('confirmPassword') || '')

    try {
      if (!nextEmail || !code || !password || !confirmPassword) throw new Error('Complete all required fields.')
      if (!/^\d{6}$/.test(code)) throw new Error('Reset code must be six digits.')
      if (password.length < 12) throw new Error('Password must be at least 12 characters.')
      if (password !== confirmPassword) throw new Error('Passwords do not match.')

      const reset = await readAuthResponse(
        await fetch(`${apiBase}/api/auth/reset-password`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email: nextEmail, code, password })
        }),
        'Could not reset this password.'
      )

      if (!reset.token) throw new Error('Password reset, but the backend did not return a session token.')

      await readAuthResponse(
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token: reset.token })
        }),
        'Could not store your secure session.'
      )

      router.replace('/dashboard')
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not reset this password.')
      setStatus('error')
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>Email<input name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={status === 'loading'} required /></label>
      <label>Reset code<input name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" disabled={status === 'loading'} required /></label>
      <label>New password<input name="password" type="password" autoComplete="new-password" minLength={12} disabled={status === 'loading'} required /></label>
      <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} disabled={status === 'loading'} required /></label>
      {error ? <p className="form-error auth-message">{error}</p> : null}
      <button className="button button-gold" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  )
}
