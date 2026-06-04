'use client'

import { useState } from 'react'
import { FormStatus } from '@/components/FormStatus'
import { areaCityOptions, availabilityTypeOptions, countryOptions, listingIntentOptions, marketSegmentOptions, ownerRoleOptions, propertyTypeOptions } from '@/lib/taxonomy'

export function AvailabilityForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/availability', { method: 'POST', body: formData })
    setStatus(response.ok ? 'success' : 'error')
    if (response.ok) event.currentTarget.reset()
  }

  return (
    <form className="premium-form" onSubmit={onSubmit}>
      <div className="form-alert">
        <strong>Private by default:</strong> availability is stored in the control dashboard and is not displayed publicly unless compliance approves a verified listing workflow.
      </div>
      <div className="form-grid">
        <label>I am<select name="role" required>{ownerRoleOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Availability type<select name="availabilityType" required>{availabilityTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Listing intent<select name="listingIntent" required>{listingIntentOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Market segment<select name="marketSegment" required>{marketSegmentOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Property type<select name="propertyType" required>{propertyTypeOptions.map((type) => <option key={type}>{type}</option>)}</select></label>
        <label>Country<select name="country" required>{countryOptions.map((country) => <option key={country}>{country}</option>)}</select></label>
        <label>Area / city<select name="cityArea" required>{areaCityOptions.map((area) => <option key={area}>{area}</option>)}</select></label>
        <label>Project / community name<input name="projectName" placeholder="Optional project/community/development" /></label>
        <label>Building / tower name<input name="buildingName" placeholder="Optional building, tower or phase" /></label>
        <label>Size<input name="size" placeholder="Bedrooms, sq ft, sq m, acres, units, camp capacity" /></label>
        <label>Price / rent range<input name="priceRange" placeholder="Example: AED 5M–7M or AED 120K–160K yearly" required /></label>
        <label>Availability date<input name="availabilityDate" placeholder="Now, September 2026, Q4 2026..." required /></label>
        <label>Privacy level<select name="privacyLevel" required><option>Admin only</option><option>Matched users only</option><option>Deal room only</option><option>Public advertising only with permit</option></select></label>
        <label>Authority<select name="authority" required><option>I am the direct owner/landlord</option><option>I have written authority</option><option>I represent a developer</option><option>I am a licensed agent and will upload proof later</option></select></label>
      </div>
      <label>Private description<textarea name="description" rows={5} placeholder="Describe what may be available. Do not enter exact address or sensitive documents here." required /></label>
      <div className="form-grid">
        <label>Name<input name="name" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>Phone / WhatsApp<input name="phone" required /></label>
      </div>
      <label className="checkbox"><input type="checkbox" name="consent" required /> I confirm this is private availability and not a public property advertisement.</label>
      <button className="button button-gold" type="submit">Submit to Control Dashboard</button>
      <FormStatus status={status} successMessage="Private availability submitted. It remains hidden until reviewed." />
    </form>
  )
}
