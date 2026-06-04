'use client'

import { useState } from 'react'

export function NewsletterForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/newsletter', { method: 'POST', body: formData })
    setStatus(response.ok ? 'success' : 'error')
    if (response.ok) event.currentTarget.reset()
  }

  return (
    <form className="newsletter-form" onSubmit={onSubmit}>
      <input name="name" placeholder="Name" />
      <input name="email" type="email" placeholder="Email" required />
      <select name="segment" aria-label="Newsletter segment">
        <option>Investor</option>
        <option>Buyer</option>
        <option>Tenant</option>
        <option>Owner / Landlord</option>
        <option>Agent / Developer</option>
      </select>
      <button className="button button-dark" type="submit">Join Market Pulse</button>
      {status === 'success' ? <p className="form-success">You are on the list.</p> : null}
      {status === 'error' ? <p className="form-error">Could not subscribe. Try again.</p> : null}
    </form>
  )
}
