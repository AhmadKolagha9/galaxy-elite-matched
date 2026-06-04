'use client'

import { useState } from 'react'
import { FormStatus } from '@/components/FormStatus'
import { roles } from '@/lib/site'
import { areaCityOptions, budgetVisibilityOptions, countryOptions, marketSegmentOptions, propertyTypeOptions, responsePreferenceOptions, timelineOptions } from '@/lib/taxonomy'

export function InterestForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/interest', { method: 'POST', body: formData })
    setStatus(response.ok ? 'success' : 'error')
    if (response.ok) event.currentTarget.reset()
  }

  return (
    <form className={`premium-form ${compact ? 'premium-form-compact' : ''}`} onSubmit={onSubmit}>
      <div className="form-alert">
        <strong>Approval rule:</strong> interest posts are submitted to the Galaxy Elite control dashboard first. Nothing appears on the Interest Board until admin approval.
      </div>
      <div className="form-grid">
        <label>Role<select name="role" required>{roles.slice(0, 5).map((role) => <option key={role}>{role}</option>)}</select></label>
        <label>Purpose<select name="purpose" required><option>Buy</option><option>Rent</option><option>Invest</option><option>Buy Land</option><option>Lease Commercial</option></select></label>
        <label>Market segment<select name="marketSegment" required>{marketSegmentOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Property type<select name="propertyType" required>{propertyTypeOptions.map((type) => <option key={type}>{type}</option>)}</select></label>
        <label>Country<select name="country" required>{countryOptions.map((country) => <option key={country}>{country}</option>)}</select></label>
        <label>Area / city<select name="cityArea" required>{areaCityOptions.map((area) => <option key={area}>{area}</option>)}</select></label>
        <label>Custom area, if needed<input name="area" placeholder="Specific area, city, district or location notes" /></label>
        <label>Project / community name<input name="projectName" placeholder="Optional: project, tower, community or development" /></label>
        <label>Size<input name="size" placeholder="Example: 1–5 acres, 2 bedrooms, 1,200 sq ft" /></label>
        <label>Budget<input name="budget" placeholder="AED 2M–3M, hidden, negotiable" /></label>
        <label>Budget visibility<select name="budgetVisibility" required>{budgetVisibilityOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Timeline<select name="timeline" required>{timelineOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Who can respond?<select name="agentPreference" required>{responsePreferenceOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <label>Description<textarea name="description" rows={5} placeholder="Describe exactly what you want: location, size, use, budget privacy, project preference, investor goal, and timing." required /></label>
      <div className="form-grid">
        <label>Name<input name="name" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>Phone / WhatsApp<input name="phone" required /></label>
      </div>
      <label className="checkbox"><input type="checkbox" name="consent" required /> I agree that Galaxy Elite may process this interest and contact me for verified matching.</label>
      <button className="button button-gold" type="submit">Submit for Approval</button>
      <FormStatus status={status} successMessage="Submitted for Galaxy Elite approval. It will stay hidden until reviewed." />
    </form>
  )
}
