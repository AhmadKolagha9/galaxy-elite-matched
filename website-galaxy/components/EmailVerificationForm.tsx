'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type SubmitState = 'idle' | 'loading' | 'resending' | 'error' | 'sent'

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

export function EmailVerificationForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter()
  const apiBase = useMemo(() => backendApiUrl(), [])
  const [email, setEmail] = useState(initialEmail)
  const [state, setState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState(initialEmail ? 'Enter the six-digit code sent to your email.' : '')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('loading')
    setMessage('')

    const form = new FormData(event.currentTarget)
    const nextEmail = String(form.get('email') || '').trim().toLowerCase()
    const code = String(form.get('code') || '').trim()

    try {
      if (!nextEmail || !code) throw new Error('Enter your email and verification code.')
      if (!/^\d{6}$/.test(code)) throw new Error('Verification code must be six digits.')

      const verified = await readAuthResponse(
        await fetch(`${apiBase}/api/auth/verify-email`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email: nextEmail, code })
        }),
        'Could not verify this code.'
      )

      if (!verified.token) throw new Error('Email verified, but the backend did not return a session token.')

      await readAuthResponse(
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token: verified.token })
        }),
        'Could not store your secure session.'
      )

      router.replace('/dashboard')
      router.refresh()
    } catch (caught) {
      setState('error')
      setMessage(caught instanceof Error ? caught.message : 'Could not verify this code.')
    }
  }

  async function resendCode() {
    setState('resending')
    setMessage('')
    try {
      const nextEmail = email.trim().toLowerCase()
      if (!nextEmail) throw new Error('Enter your email before requesting another code.')
      const body = await readAuthResponse(
        await fetch(`${apiBase}/api/auth/resend-verification`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email: nextEmail })
        }),
        'Could not resend verification code.'
      )
      setState('sent')
      setMessage(body.message || 'If the account is pending verification, a new code has been sent.')
    } catch (caught) {
      setState('error')
      setMessage(caught instanceof Error ? caught.message : 'Could not resend verification code.')
    }
  }

  const busy = state === 'loading' || state === 'resending'

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>Email<input name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy} required /></label>
      <label>Verification code<input name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" disabled={busy} required /></label>
      {message ? <p className={state === 'error' ? 'form-error auth-message' : 'form-note auth-message'}>{message}</p> : null}
      <button className="button button-gold" type="submit" disabled={busy}>
        {state === 'loading' ? 'Verifying...' : 'Verify Email'}
      </button>
      <button className="button button-outline" type="button" onClick={resendCode} disabled={busy}>
        {state === 'resending' ? 'Sending...' : 'Resend Code'}
      </button>
    </form>
  )
}
