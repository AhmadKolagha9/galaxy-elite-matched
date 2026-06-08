'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'

type SubmitState = 'idle' | 'loading' | 'sent' | 'error'

type AuthResponse = {
  ok?: boolean
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

export function ForgotPasswordForm({ initialEmail = '' }: { initialEmail?: string }) {
  const apiBase = useMemo(() => backendApiUrl(), [])
  const [email, setEmail] = useState(initialEmail)
  const [state, setState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('loading')
    setMessage('')

    const nextEmail = email.trim().toLowerCase()

    try {
      if (!nextEmail) throw new Error('Enter your email address.')
      const body = await readAuthResponse(
        await fetch(`${apiBase}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email: nextEmail })
        }),
        'Could not send a reset code.'
      )
      setState('sent')
      setMessage(body.message || 'If an account exists for this email, a reset code has been sent.')
    } catch (caught) {
      setState('error')
      setMessage(caught instanceof Error ? caught.message : 'Could not send a reset code.')
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>Email<input name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={state === 'loading'} required /></label>
      {message ? <p className={state === 'error' ? 'form-error auth-message' : 'form-note auth-message'}>{message}</p> : null}
      <button className="button button-gold" type="submit" disabled={state === 'loading'}>
        {state === 'loading' ? 'Sending...' : 'Send Reset Code'}
      </button>
      {state === 'sent' ? <Link className="button button-outline" href={`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`}>Enter Reset Code</Link> : null}
    </form>
  )
}
