'use client'

import { useState } from 'react'
import { FormStatus } from '@/components/FormStatus'

export function AgentForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/agent', { method: 'POST', body: formData })
    setStatus(response.ok ? 'success' : 'error')
    if (response.ok) event.currentTarget.reset()
  }

  return (
    <form className="premium-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label>Full name<input name="name" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>Phone / WhatsApp<input name="phone" required /></label>
        <label>Company<input name="company" required /></label>
        <label>Licence number<input name="licenceNumber" required /></label>
        <label>Country of licence<select name="country" required><option>UAE</option><option>UK</option><option>India</option><option>Other</option></select></label>
        <label>Representation side<select name="representation" required><option>I represent an owner/seller</option><option>I represent a landlord</option><option>I represent a buyer</option><option>I represent a tenant</option><option>I represent a developer</option><option>I represent more than one side and will disclose clearly</option></select></label>
        <label>Authority status<select name="authority" required><option>Written authority available</option><option>Client authority pending</option><option>Developer mandate</option><option>Buyer/tenant mandate</option></select></label>
      </div>
      <label className="checkbox"><input type="checkbox" name="disclosure" required /> I confirm I will not hide my agent role and will disclose representation, authority and commission position.</label>
      <button className="button button-gold" type="submit">Register as Transparent Agent</button>
      <FormStatus status={status} />
    </form>
  )
}
