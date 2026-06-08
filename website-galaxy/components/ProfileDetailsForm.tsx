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

export function ProfileDetailsForm({ initialName, initialEmail }: ProfileDetailsFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email])
  const emailChanged = normalizedEmail !== initialEmail.toLowerCase()
  const busy = status === 'saving'

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('saving')
    setMessage('')

    try {
      const response = await fetch('/api/profile/me', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fullName: name.trim(), email: normalizedEmail })
      })
      const body = (await response.json().catch(() => null)) as ProfileUpdateResponse | null
      if (!response.ok || !body?.ok) throw new Error(body?.error || 'Profile update failed.')

      setStatus('saved')
      setMessage(body.message || 'Profile updated.')
      router.refresh()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Profile update failed.')
    }
  }

  return (
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
          {busy ? 'Saving...' : 'Save Profile'}
        </button>
        {status === 'saved' && emailChanged ? (
          <a className="button button-outline" href={`/verify-email?email=${encodeURIComponent(normalizedEmail)}`}>Verify New Email</a>
        ) : null}
      </div>
      {message ? <p className={`form-status ${status === 'error' ? 'form-status-error' : 'form-status-success'}`}>{message}</p> : null}
    </form>
  )
}
