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

function safeNextPath(next?: string) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/dashboard'
  if (next.startsWith('/api/')) return '/dashboard'
  return next
}

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter()
  const apiBase = useMemo(() => backendApiUrl(), [])
  const [status, setStatus] = useState<SubmitState>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setError('')

    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '').trim().toLowerCase()
    const password = String(form.get('password') || '')

    try {
      if (!email || !password) throw new Error('Enter your email and password.')

      const loggedIn = await readAuthResponse(
        await fetch(`${apiBase}/api/auth/login`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, password })
        }),
        'Invalid email or password.'
      )

      if (!loggedIn.token) throw new Error('Login succeeded, but the backend did not return a session token.')

      await readAuthResponse(
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token: loggedIn.token })
        }),
        'Could not store your secure session.'
      )

      router.replace(safeNextPath(next))
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not login.')
      setStatus('error')
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>Email<input name="email" type="email" autoComplete="email" disabled={status === 'loading'} required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" disabled={status === 'loading'} required /></label>
      {error ? <p className="form-error auth-message">{error}</p> : null}
      <button className="button button-gold" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
