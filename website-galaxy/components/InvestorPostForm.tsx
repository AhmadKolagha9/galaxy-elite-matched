'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormStatus } from '@/components/FormStatus'
import { useMemberSession } from '@/lib/member-session-client'
import {
  amenitiesOptions,
  budgetVisibilityOptions,
  categoryOptions,
  financingMethodOptions,
  formDataToInvestorPostPayload,
  formatZodIssues,
  furnishingTypeOptions,
  holdingPeriodOptions,
  investorMarketSegmentOptions,
  investorPostPayloadSchema,
  investorTypeOptions,
  offeringTypeOptions,
  projectStatusOptions,
  propertyCategoryOptions,
  propertyTypeOptions,
  riskPreferenceOptions,
  timelineOptions
} from '@/lib/investor-post-submission'
import { useInvestorTaxonomy } from '@/lib/use-investor-taxonomy'

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'
const draftStorageKey = 'galaxy-investor-post-draft'

export function InvestorPostForm() {
  const router = useRouter()
  const { user, loading: authLoading } = useMemberSession()
  const { countries, selectedCountries, toggleCountry, filteredAreas } = useInvestorTaxonomy()
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/login?next=${encodeURIComponent('/investor-post')}`)
  }, [authLoading, router, user])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (authLoading) return
    if (!user) {
      router.push(`/login?next=${encodeURIComponent('/investor-post')}`)
      return
    }

    const form = event.currentTarget
    const rawPayload = formDataToInvestorPostPayload(new FormData(form))
    const parsed = investorPostPayloadSchema.safeParse(rawPayload)

    if (!parsed.success) {
      setStatus('error')
      setMessage(formatZodIssues(parsed.error))
      return
    }

    setStatus('loading')

    try {
      const response = await fetch('/api/investor-post', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(parsed.data)
      })
      const result = await response.json().catch(() => null) as { ok?: boolean; message?: string; error?: string } | null

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || result?.message || 'Investor post submission failed.')
      }

      localStorage.removeItem(draftStorageKey)
      setStatus('success')
      setMessage(result.message || 'Investor demand profile securely submitted and pending Galaxy Elite review.')
      form.reset()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Investor post submission failed.')
    }
  }

  return (
    <form className="premium-form" onSubmit={onSubmit}>
      <div className="form-alert">
        <strong>Investor approval:</strong> investor demand profiles are reviewed before public or member visibility. Identity, budget details and private strategy remain controlled.
      </div>
      <div className="form-grid">
        <label>Title<input name="title" placeholder="Example: Family office seeking UAE income assets" required maxLength={255} /></label>
        <label>Investor type<select name="investor_type" required>{investorTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Area / city<select name="area_city" required>{filteredAreas.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}</select></label>
        <label>Ticket min<input name="ticket_min" type="number" min="0" step="0.01" required /></label>
        <label>Ticket max<input name="ticket_max" type="number" min="0" step="0.01" required /></label>
        <label>Budget visibility<select name="budget_visibility" required>{budgetVisibilityOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Target yield %<input name="target_yield" type="number" min="0" step="0.01" required /></label>
        <label>Risk preference<select name="risk_preference" required>{riskPreferenceOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Timeline<select name="timeline" required>{timelineOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Holding period<select name="holding_period" required>{holdingPeriodOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Financing method<select name="financing_method" required>{financingMethodOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Category<select name="category" required>{categoryOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Offering type<select name="offering_type" required>{offeringTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Rooms<input name="rooms" type="number" min="0" step="1" required /></label>
        <label>Bedrooms<input name="bedrooms" type="number" min="0" step="1" required /></label>
        <label>Total floors<input name="total_floors" type="number" min="0" step="1" required /></label>
        <label>Parking spaces<input name="parking_spaces" type="number" min="0" step="1" required /></label>
        <label>Furnishing<select name="furnishing_type" required>{furnishingTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Project status<select name="project_status" required>{projectStatusOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>

      <fieldset className="form-fieldset">
        <legend>Target countries</legend>
        <div className="checkbox-grid">
          {countries.map((item) => (
            <label className="checkbox" key={item.slug}>
              <input type="checkbox" name="countries" value={item.slug} checked={selectedCountries.includes(item.slug)} onChange={(event) => toggleCountry(item.slug, event.target.checked)} /> {item.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="form-fieldset">
        <legend>Property categories</legend>
        <div className="checkbox-grid">
          {propertyCategoryOptions.map((item) => <label className="checkbox" key={item}><input type="checkbox" name="property_categories" value={item} /> {item}</label>)}
        </div>
      </fieldset>

      <fieldset className="form-fieldset">
        <legend>Property types</legend>
        <div className="checkbox-grid">
          {propertyTypeOptions.map((item) => <label className="checkbox" key={item}><input type="checkbox" name="property_types" value={item} /> {item}</label>)}
        </div>
      </fieldset>

      <fieldset className="form-fieldset">
        <legend>Market segments</legend>
        <div className="checkbox-grid">
          {investorMarketSegmentOptions.map((item) => <label className="checkbox" key={item}><input type="checkbox" name="market_segments" value={item} /> {item}</label>)}
        </div>
      </fieldset>

      <fieldset className="form-fieldset">
        <legend>Respondent permissions</legend>
        <div className="checkbox-grid">
          <label className="checkbox"><input type="checkbox" name="accepts_direct_owner" defaultChecked /> Direct owners</label>
          <label className="checkbox"><input type="checkbox" name="accepts_developer" defaultChecked /> Developers</label>
          <label className="checkbox"><input type="checkbox" name="accepts_agent" /> Licensed agents</label>
        </div>
      </fieldset>

      <fieldset className="form-fieldset">
        <legend>Amenities</legend>
        <div className="checkbox-grid">
          {amenitiesOptions.map((item) => <label className="checkbox" key={item}><input type="checkbox" name="amenities" value={item} /> {item}</label>)}
        </div>
      </fieldset>

      <label>Investment goal<textarea name="investment_goal" rows={4} required placeholder="Detail capital targets, asset class priorities, holding period logic and expected execution method." /></label>
      <label>Exit strategy<textarea name="exit_strategy" rows={3} required placeholder="Describe resale, refinance, hold, portfolio aggregation, JV exit or liquidity expectations." /></label>
      <label>Private description<textarea name="private_description" rows={5} required placeholder="Confidential investor profiling notes, source preference, budget nuance and verification expectations." /></label>
      <label className="checkbox"><input type="checkbox" name="consent" required /> I agree that Galaxy Elite may review this investor post for verified private matching.</label>
      <button className="button button-gold" type="submit" disabled={status === 'loading' || authLoading}>{status === 'loading' ? 'Submitting...' : 'Submit Investor Profile'}</button>
      <FormStatus status={status} successMessage={message || 'Investor demand profile securely submitted and pending Galaxy Elite review.'} errorMessage={message || 'Please check the form and try again.'} />
    </form>
  )
}
