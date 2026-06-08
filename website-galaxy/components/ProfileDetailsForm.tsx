"use client"

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

type ProfileDetailsFormProps = {
  initialName: string
  initialEmail: string
}

type ProfileUpdateResponse = {
  ok?: boolean
  error?: string
  message?: string
  emailVerificationRequired?: boolean
  user?: {
    email?: string
    fullName?: string | null
  }
}

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

export function ProfileDetailsForm({ initialName, initialEmail }: ProfileDetailsFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'verifying' | 'resending' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const apiBase = useMemo(() => backendApiUrl(), [])
  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email])
  const emailChanged = normalizedEmail !== initialEmail.toLowerCase()
  const busy = status === 'saving' || status === 'verifying' || status === 'resending'

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('saving')
    setMessage('')
    setPendingVerificationEmail('')

    try {
      const response = await fetch('/api/profile/me', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fullName: name.trim(), email: normalizedEmail })
      })
      const body = (await response.json().catch(() => null)) as ProfileUpdateResponse | null
      if (!response.ok || !body?.ok) throw new Error(body?.error || 'Profile update failed.')

      if (body.user?.fullName) setName(body.user.fullName)
      if (body.user?.email) setEmail(body.user.email)
      if (body.emailVerificationRequired) {
        setPendingVerificationEmail(body.user?.email || normalizedEmail)
        setCode('')
      }

      setStatus('saved')
      setMessage(body.message || 'Profile updated.')
      router.refresh()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Profile update failed.')
    }
  }

  async function verifyNewEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('verifying')
    setMessage('')

    try {
      const nextEmail = pendingVerificationEmail.trim().toLowerCase()
      const nextCode = code.trim()
      if (!nextEmail) throw new Error('Save the new email before verifying it.')
      if (!/^\d{6}$/.test(nextCode)) throw new Error('Verification code must be six digits.')

      const verified = await readAuthResponse(
        await fetch(`${apiBase}/api/auth/verify-email`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email: nextEmail, code: nextCode })
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
        'Could not refresh your secure session.'
      )

      setStatus('saved')
      setPendingVerificationEmail('')
      setCode('')
      setMessage('Email verified and your session was refreshed.')
      router.refresh()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Could not verify this code.')
    }
  }

  async function resendCode() {
    setStatus('resending')
    setMessage('')

    try {
      const nextEmail = pendingVerificationEmail.trim().toLowerCase()
      if (!nextEmail) throw new Error('Save the new email before requesting another code.')
      const body = await readAuthResponse(
        await fetch(`${apiBase}/api/auth/resend-verification`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email: nextEmail })
        }),
        'Could not resend verification code.'
      )
      setStatus('saved')
      setMessage(body.message || 'A new verification code has been sent. Use the latest code from your inbox.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Could not resend verification code.')
    }
  }

  return (
    <div className="profile-form-stack">
      <form className="profile-form" onSubmit={saveProfile}>
        <div className="form-grid">
          <label>
            Full name
            <input
              name="fullName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              disabled={busy}
              required
              maxLength={160}
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={busy}
              required
            />
          </label>
        </div>
        {emailChanged ? (
          <p className="form-note">Changing your email sends a new verification code to the updated address.</p>
        ) : null}
        <div className="profile-form-actions">
          <button className="button button-gold" type="submit" disabled={busy}>
            {status === 'saving' ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      {pendingVerificationEmail ? (
        <form className="profile-verification-panel" onSubmit={verifyNewEmail}>
          <div>
            <strong>Verify new email</strong>
            <p>Enter the six-digit code sent to {pendingVerificationEmail}.</p>
          </div>
          <label>
            Verification code
            <input
              name="code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={busy}
              required
            />
          </label>
          <div className="profile-form-actions">
            <button className="button button-gold" type="submit" disabled={busy}>
              {status === 'verifying' ? 'Verifying...' : 'Verify Email'}
            </button>
            <button className="button button-outline" type="button" onClick={resendCode} disabled={busy}>
              {status === 'resending' ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        </form>
      ) : null}

      {message ? <p className={`form-status ${status === 'error' ? 'form-status-error' : 'form-status-success'}`}>{message}</p> : null}
    </div>
  )
}
