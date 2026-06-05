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

export function RegisterForm() {
  const router = useRouter()
  const [status, setStatus] = useState<SubmitState>('idle')
  const [error, setError] = useState('')
  const apiBase = useMemo(() => backendApiUrl(), [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setError('')

    const form = new FormData(event.currentTarget)
    const fullName = String(form.get('fullName') || '').trim()
    const email = String(form.get('email') || '').trim().toLowerCase()
    const phone = String(form.get('phone') || '').trim()
    const password = String(form.get('password') || '')

    try {
      if (!fullName || !email || !phone || !password) throw new Error('Complete all required fields.')
      if (password.length < 12) throw new Error('Password must be at least 12 characters.')

      await readAuthResponse(
        await fetch(`${apiBase}/api/auth/register`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ fullName, email, phone, password })
        }),
        'Could not create account.'
      )

      const loginBody = await readAuthResponse(
        await fetch(`${apiBase}/api/auth/login`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, password })
        }),
        'Account created, but automatic login failed.'
      )

      if (!loginBody.token) throw new Error('Backend login did not return an authorization token.')

      await readAuthResponse(
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token: loginBody.token })
        }),
        'Could not store your secure session.'
      )

      router.replace('/dashboard')
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create account.')
      setStatus('error')
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>Full name<input name="fullName" autoComplete="name" required /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Phone number<input name="phone" type="tel" autoComplete="tel" required /></label>
      <label>Password<input name="password" type="password" autoComplete="new-password" minLength={12} required /></label>
      {error ? <p className="form-error auth-message">{error}</p> : null}
      <button className="button button-gold" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  )
}
