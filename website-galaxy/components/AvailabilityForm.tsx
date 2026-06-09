'use client'

import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormStatus } from '@/components/FormStatus'
import { useMemberSession } from '@/lib/member-session-client'
import { uploadAvailabilityOwnershipDocument, validateOwnershipDocumentFile } from '@/lib/availability-document-upload'
import { useSubmissionLock } from '@/lib/use-submission-lock'
import {
  amenitiesOptions,
  areaMatchesCountry,
  authorityDeclarationOptions,
  availabilityPayloadSchema,
  availabilityTypeOptions,
  availabilityUserRoles,
  categoryOptions,
  countryScopeFromValue,
  fallbackAreas,
  fallbackCountries,
  formDataToAvailabilityPayload,
  formatZodIssues,
  furnishingTypeOptions,
  listingIntentOptions,
  marketSegmentOptions,
  offeringTypeOptions,
  privacyLevelOptions,
  preferredPaymentMethodOptions,
  projectStatusOptions,
  propertyTypeOptions,
  requiresProfessionalVerification
} from '@/lib/availability-submission'

type TaxonomyItem = {
  id?: string
  label: string
  slug: string
  countryScope: string | null
}

const draftStorageKey = 'galaxy-private-availability-draft'
type AvailabilityFormProps = {
  submitEndpoint?: string
  loginNext?: string
  opportunityType?: 'availability'
}

async function fetchTaxonomy(type: string, countryScope?: string | null) {
  const params = new URLSearchParams({ type })
  if (countryScope) params.set('country_scope', countryScope)
  const response = await fetch(`/api/taxonomy?${params.toString()}`)
  if (!response.ok) throw new Error('Taxonomy request failed.')
  const body = (await response.json()) as { items?: TaxonomyItem[] }
  return body.items ?? []
}

export function AvailabilityForm({ submitEndpoint = '/api/availability', loginNext = '/private-availability', opportunityType }: AvailabilityFormProps = {}) {
  const router = useRouter()
  const { user, loading: authLoading } = useMemberSession()
  const { status, message, isSubmitting, beginSubmit, finishSuccess, finishError, resetSubmit } = useSubmissionLock()
  const [countries, setCountries] = useState<TaxonomyItem[]>(fallbackCountries)
  const [areas, setAreas] = useState<TaxonomyItem[]>(fallbackAreas)
  const [country, setCountry] = useState(fallbackCountries[0]?.slug ?? 'uae')
  const [role, setRole] = useState<(typeof availabilityUserRoles)[number]>('Direct owner')
  const [ownershipFile, setOwnershipFile] = useState<File | null>(null)

  const locked = isSubmitting || authLoading
  const countryScope = useMemo(() => countryScopeFromValue(country, countries), [country, countries])
  const filteredAreas = useMemo(
    () => areas.filter((area) => !countryScope || area.countryScope === null || area.countryScope === countryScope),
    [areas, countryScope]
  )

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/login?next=${encodeURIComponent(loginNext)}`)
  }, [authLoading, loginNext, router, user])

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

  function onOwnershipFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null
    if (!nextFile) {
      setOwnershipFile(null)
      return
    }

    try {
      validateOwnershipDocumentFile(nextFile)
      setOwnershipFile(nextFile)
      resetSubmit()
    } catch (error) {
      setOwnershipFile(null)
      event.target.value = ''
      finishError(error instanceof Error ? error.message : 'Invalid ownership document.')
    }
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
      router.push(`/login?next=${encodeURIComponent(loginNext)}`)
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const rawPayload = formDataToAvailabilityPayload(formData)
    const parsed = availabilityPayloadSchema.safeParse(rawPayload)

    if (!parsed.success) {
      finishError(formatZodIssues(parsed.error))
      return
    }

    if (!areaMatchesCountry(parsed.data.area_city, parsed.data.country, countries, areas)) {
      finishError('Select an area or city that belongs to the chosen country.')
      return
    }

    try {
      const verificationDocuments = ownershipFile ? [await uploadAvailabilityOwnershipDocument(ownershipFile)] : []
      const payload = {
        ...(opportunityType ? { opportunity_type: opportunityType } : {}),
        ...parsed.data,
        verification_documents: verificationDocuments
      }

      const response = await fetch(submitEndpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      const result = await response.json().catch(() => null) as { ok?: boolean; message?: string; error?: string } | null

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || result?.message || 'Availability submission failed.')
      }

      localStorage.removeItem(draftStorageKey)
      finishSuccess(result.message || 'Availability profile securely logged. Pending Galaxy Elite administrative review.')
      form.reset()
      setOwnershipFile(null)
      setRole('Direct owner')
      setCountry(countries[0]?.slug ?? countries[0]?.label ?? 'uae')
    } catch (error) {
      finishError(error instanceof Error ? error.message : 'Availability submission failed.')
    }
  }

  return (
    <form className="premium-form" onSubmit={onSubmit}>
      <div className="form-alert">
        <strong>Private by default:</strong> availability is sent to Galaxy Elite administrative review. Visibility and verification states are attached server-side only.
      </div>
      {requiresProfessionalVerification(role) ? (
        <div className="form-alert form-alert-gold">
          Verification required: Professional brokerage credentials must be uploaded within your profile dashboard to validate active matching capability.
        </div>
      ) : null}

      <fieldset className="form-lockset" disabled={locked}>
        <div className="form-grid">
          <label>Title<input name="title" placeholder="Example: Direct owner may sell villa privately" required maxLength={255} /></label>
          <label>I am<select name="user_role" value={role} onChange={(event) => setRole(event.target.value as typeof role)} required>{availabilityUserRoles.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Availability type<select name="availability_type" required>{availabilityTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Listing intent<select name="listing_intent" required>{listingIntentOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Market segment<select name="market_segment" required>{marketSegmentOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Property type<select name="property_type" required>{propertyTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Country<select name="country" value={country} onChange={(event) => setCountry(event.target.value)} required>{countries.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}</select></label>
          <label>Area / city<select name="area_city" required>{filteredAreas.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}</select></label>
          <label>Project / community<input name="project_name" placeholder="Optional project, community or development" maxLength={255} /></label>
          <label>Building / tower<input name="building_name" placeholder="Optional building, tower or phase" maxLength={255} /></label>
          <label>Size, sqft<input name="size_sqft" type="number" min="0" step="0.01" required /></label>
          <label>Price / rent min<input name="price_min" type="number" min="0" step="0.01" required /></label>
          <label>Price / rent max<input name="price_max" type="number" min="0" step="0.01" required /></label>
          <label>Availability date<input name="availability_date" type="date" required /></label>
          <label>Privacy level<select name="privacy_level" required>{privacyLevelOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Preferred Payment Method<select name="preferred_payment_method" required>{preferredPaymentMethodOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Authority<select name="authority_declaration" required>{authorityDeclarationOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
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
          <legend>Amenities</legend>
          <div className="checkbox-grid">
            {amenitiesOptions.map((item) => (
              <label className="checkbox" key={item}><input type="checkbox" name="amenities" value={item} /> {item}</label>
            ))}
          </div>
        </fieldset>
        <div className="document-upload-panel">
          <h3>Attach Ownership Papers / Title Deeds (Optional)</h3>
          <p>PDF, PNG, or JPEG only. Files are uploaded to private storage before the availability request is created.</p>
          <label className="file-dropzone">
            <input name="ownership_document" type="file" accept="application/pdf,image/png,image/jpeg" onChange={onOwnershipFileChange} />
            <span>{ownershipFile ? ownershipFile.name : 'Choose an ownership document'}</span>
            <small>{ownershipFile ? `${(ownershipFile.size / 1024 / 1024).toFixed(2)} MB selected` : 'Maximum file size: 10MB'}</small>
          </label>
        </div>
        <label>Private description<textarea name="private_description" rows={5} placeholder="Describe what may be available. Do not enter exact address or sensitive documents here." required /></label>
        <label className="checkbox"><input type="checkbox" name="consent" required /> I confirm this is private availability and not a public property advertisement.</label>
      </fieldset>

      <button className="button button-gold" type="submit" disabled={locked}>{isSubmitting ? 'Submitting...' : 'Submit for Review'}</button>
      <FormStatus status={status} successMessage={message || 'Availability profile securely logged. Pending Galaxy Elite administrative review.'} errorMessage={message || 'Please check the form and try again.'} />
    </form>
  )
}
