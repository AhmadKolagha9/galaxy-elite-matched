'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormStatus } from '@/components/FormStatus'
import { useMemberSession } from '@/lib/member-session-client'
import { useSubmissionLock } from '@/lib/use-submission-lock'
import {
  amenitiesOptions,
  areaMatchesCountry,
  availabilityTypeOptions,
  categoryOptions,
  countryScopeFromValue,
  fallbackAreas,
  fallbackCountries,
  formDataToInterestPayload,
  formatZodIssues,
  furnishingTypeOptions,
  interestPayloadSchema,
  interestUserRoles,
  listingIntentOptions,
  marketSegmentOptions,
  offeringTypeOptions,
  privacyLevelOptions,
  preferredPaymentMethodOptions,
  projectStatusOptions,
  propertyTypeOptions
} from '@/lib/interest-submission'

type TaxonomyItem = {
  id?: string
  label: string
  slug: string
  countryScope: string | null
}

async function fetchTaxonomy(type: string, countryScope?: string | null) {
  const params = new URLSearchParams({ type })
  if (countryScope) params.set('country_scope', countryScope)
  const response = await fetch(`/api/taxonomy?${params.toString()}`)
  if (!response.ok) throw new Error('Taxonomy request failed.')
  const body = (await response.json()) as { items?: TaxonomyItem[] }
  return body.items ?? []
}

export function InterestForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const { user, loading: authLoading } = useMemberSession()
  const { status, message, isSubmitting, beginSubmit, finishSuccess, finishError } = useSubmissionLock()
  const [countries, setCountries] = useState<TaxonomyItem[]>(fallbackCountries)
  const [areas, setAreas] = useState<TaxonomyItem[]>(fallbackAreas)
  const [country, setCountry] = useState(fallbackCountries[0]?.slug ?? 'uae')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const locked = isSubmitting || authLoading
  const countryScope = useMemo(() => countryScopeFromValue(country, countries), [country, countries])
  const filteredAreas = useMemo(
    () => areas.filter((area) => !countryScope || area.countryScope === null || area.countryScope === countryScope),
    [areas, countryScope]
  )

  useEffect(() => {
    let active = true
    fetchTaxonomy('country')
      .then((items) => {
        if (!active || !items.length) return
        setCountries(items.map((item) => ({ ...item, countryScope: item.countryScope ?? null })))
        setCountry(items[0]?.slug ?? items[0]?.label ?? 'uae')
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchTaxonomy('area_city', countryScope)
      .then((items) => {
        if (!active || !items.length) return
        setAreas(items.map((item) => ({ ...item, countryScope: item.countryScope ?? null })))
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [countryScope])

  function toggleAmenity(item: string) {
    setSelectedAmenities((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])
  }

  function removeAmenity(item: string) {
    setSelectedAmenities((current) => current.filter((value) => value !== item))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!beginSubmit()) return

    if (authLoading) {
      finishError('Authentication is still loading. Try again in a moment.')
      return
    }
    if (!user) {
      finishError('Member login is required before submitting.')
      router.push(`/login?next=${encodeURIComponent('/submit?mode=interest')}`)
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const rawPayload = formDataToInterestPayload(formData)
    const parsed = interestPayloadSchema.safeParse(rawPayload)

    if (!parsed.success) {
      finishError(formatZodIssues(parsed.error))
      return
    }

    if (!areaMatchesCountry(parsed.data.area_city, parsed.data.country, countries, areas)) {
      finishError('Select an area or city that belongs to the chosen country.')
      return
    }

    try {
      const response = await fetch('/api/interest', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(parsed.data)
      })
      const result = await response.json().catch(() => null) as { ok?: boolean; message?: string; error?: string } | null

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || result?.message || 'Interest submission failed.')
      }

      finishSuccess(result.message || 'Submission received and pending Galaxy Elite review.')
      form.reset()
      setSelectedAmenities([])
      setCountry(countries[0]?.slug ?? countries[0]?.label ?? 'uae')
    } catch (error) {
      finishError(error instanceof Error ? error.message : 'Interest submission failed.')
    }
  }

  return (
    <form className={`premium-form ${compact ? 'premium-form-compact' : ''}`} onSubmit={onSubmit}>
      <div className="form-alert">
        <strong>Approval rule:</strong> interest posts are submitted to Galaxy Elite review first. Visibility and verification statuses are attached server-side only.
      </div>

      <fieldset className="form-lockset" disabled={locked}>
        <div className="form-grid">
          <label>Title<input name="title" placeholder="Example: Buyer seeking Dubai Marina apartment" required maxLength={255} /></label>
          <label>Role<select name="user_role" required>{interestUserRoles.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Availability type<select name="availability_type" required>{availabilityTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Listing intent<select name="listing_intent" required>{listingIntentOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Market segment<select name="market_segment" required>{marketSegmentOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Property type<select name="property_type" required>{propertyTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Country<select name="country" value={country} onChange={(event) => setCountry(event.target.value)} required>{countries.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}</select></label>
          <label>Area / city<select name="area_city" required>{filteredAreas.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}</select></label>
          <label>Project / community<input name="project_name" placeholder="Optional community, project, development" maxLength={255} /></label>
          <label>Building / tower<input name="building_name" placeholder="Optional building or tower" maxLength={255} /></label>
          <label>Size target, sqft<input name="size_sqft" type="number" min="0" step="0.01" required /></label>
          <label>Budget min<input name="price_min" type="number" min="0" step="0.01" required /></label>
          <label>Budget max<input name="price_max" type="number" min="0" step="0.01" required /></label>
          <label>Activation date<input name="availability_date" type="date" required onFocus={(event) => event.currentTarget.showPicker?.()} onClick={(event) => event.currentTarget.showPicker?.()} /></label>
          <label>Privacy level<select name="privacy_level" required>{privacyLevelOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Preferred Payment Method<select name="preferred_payment_method" required>{preferredPaymentMethodOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Category<select name="category" required>{categoryOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Offering type<select name="offering_type" required>{offeringTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Rooms<input name="rooms" type="number" min="0" step="1" required /></label>
          <label>Bedrooms<input name="bedrooms" type="number" min="0" step="1" required /></label>
          <label>Total floors<input name="total_floors" type="number" min="0" step="1" required /></label>
          <label>Parking spaces<input name="parking_spaces" type="number" min="0" step="1" required /></label>
          <label>Furnishing<select name="furnishing_type" required>{furnishingTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Project status<select name="project_status" required>{projectStatusOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <fieldset className="form-fieldset amenities-multiselect">
          <legend>Amenities</legend>
          {selectedAmenities.map((item) => <input key={item} type="hidden" name="amenities" value={item} />)}
          <details className="multi-select-dropdown">
            <summary>{selectedAmenities.length ? `${selectedAmenities.length} selected` : 'Select amenities'}</summary>
            <div className="multi-select-panel">
              {amenitiesOptions.map((item) => (
                <button className={selectedAmenities.includes(item) ? 'multi-select-option is-selected' : 'multi-select-option'} type="button" key={item} onClick={() => toggleAmenity(item)}>
                  <span>{item}</span><strong>{selectedAmenities.includes(item) ? 'Selected' : 'Add'}</strong>
                </button>
              ))}
            </div>
          </details>
          {selectedAmenities.length ? (
            <div className="chip-list" aria-label="Selected amenities">
              {selectedAmenities.map((item) => (
                <button key={item} className="chip-item" type="button" onClick={() => removeAmenity(item)}>{item}<span aria-hidden="true">x</span></button>
              ))}
            </div>
          ) : <p className="form-note">Select at least one amenity.</p>}
        </fieldset>
        <label>Private description<textarea name="private_description" rows={5} placeholder="Describe the requirement, budget sensitivity, location preference, and timing." required /></label>
        <label className="checkbox"><input type="checkbox" name="consent" required /> I agree that Galaxy Elite may process this interest for verified private matching.</label>
      </fieldset>

      <button className="button button-gold" type="submit" disabled={locked}>{isSubmitting ? 'Submitting...' : 'Submit for Review'}</button>
      <FormStatus status={status} successMessage={message || 'Submission received and pending Galaxy Elite review.'} errorMessage={message || 'Please check the form and try again.'} />
    </form>
  )
}
