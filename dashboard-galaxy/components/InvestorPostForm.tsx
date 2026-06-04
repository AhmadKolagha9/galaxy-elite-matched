'use client'

import { useState } from 'react'
import { FormStatus } from '@/components/FormStatus'
import { areaCityOptions, budgetVisibilityOptions, countryOptions, investorGoalOptions, investorProfileOptions, marketSegmentOptions, propertyTypeOptions, responsePreferenceOptions, riskPreferenceOptions, timelineOptions } from '@/lib/taxonomy'

export function InvestorPostForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/investor-post', { method: 'POST', body: formData })
    setStatus(response.ok ? 'success' : 'error')
    if (response.ok) event.currentTarget.reset()
  }

  return (
    <form className="premium-form" onSubmit={onSubmit}>
      <div className="form-alert">
        <strong>Investor approval:</strong> investor posts are reviewed first. The platform can show approved demand while keeping budget and identity private.
      </div>
      <div className="form-grid">
        <label>Investor profile<select name="investorProfile" required>{investorProfileOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Investment goal<select name="investorGoal" required>{investorGoalOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Market segment<select name="marketSegment" required>{marketSegmentOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Property type<select name="propertyType" required>{propertyTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Country<select name="country" required>{countryOptions.map((country) => <option key={country}>{country}</option>)}</select></label>
        <label>Area / city<select name="cityArea" required>{areaCityOptions.map((area) => <option key={area}>{area}</option>)}</select></label>
        <label>Ticket size / budget<input name="ticketSize" required placeholder="USD 500K–1.5M, AED 2M+, hidden" /></label>
        <label>Target yield / return<input name="targetYield" placeholder="Example: 6% net, capital growth, to be advised" /></label>
        <label>Risk preference<select name="riskPreference" required>{riskPreferenceOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Timeline<select name="timeline" required>{timelineOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Budget visibility<select name="budgetVisibility" required>{budgetVisibilityOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Who can respond?<select name="agentPreference" required>{responsePreferenceOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <label>Investor brief<textarea name="description" rows={5} required placeholder="Explain asset class, residential/commercial/off-plan/secondary preference, target return, holding period, countries, and verification expectations." /></label>
      <div className="form-grid">
        <label>Name<input name="name" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>Phone / WhatsApp<input name="phone" required /></label>
      </div>
      <label className="checkbox"><input type="checkbox" name="consent" required /> I agree that Galaxy Elite may review this investor post and contact me for verified matching.</label>
      <button className="button button-gold" type="submit">Submit Investor Post</button>
      <FormStatus status={status} successMessage="Investor post submitted for approval." />
    </form>
  )
}
