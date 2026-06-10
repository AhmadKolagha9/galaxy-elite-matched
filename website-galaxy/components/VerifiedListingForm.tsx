'use client'

import { useState } from 'react'
import { FormStatus } from '@/components/FormStatus'
import {
  areaCityOptions,
  availabilityTypeOptions,
  countryOptions,
  listingIntentOptions,
  marketSegmentOptions,
  propertyTypeOptions,
  purposeOptions
} from '@/lib/taxonomy'
import {
  amenitiesOptions,
  authorityDeclarationOptions,
  categoryOptions,
  furnishingTypeOptions,
  offeringTypeOptions,
  preferredPaymentMethodOptions,
  privacyLevelOptions,
  projectStatusOptions
} from '@/lib/availability-submission'

type VerifiedListingFormProps = {
  compact?: boolean
}

const directSubmitterRoles = new Set(['Direct owner', 'Direct landlord'])
const planDocumentPropertyTypes = new Set(['Off-plan unit', 'Villa'])

export function VerifiedListingForm({ compact = false }: VerifiedListingFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [submitterRole, setSubmitterRole] = useState('Direct owner')
  const [propertyType, setPropertyType] = useState(propertyTypeOptions[0] || '')
  const locked = status === 'loading'
  const showAuthorityDocument = !directSubmitterRoles.has(submitterRole)
  const showPlanDocuments = planDocumentPropertyTypes.has(propertyType)

  function toggleAmenity(item: string) {
    setSelectedAmenities((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])
  }

  function removeAmenity(item: string) {
    setSelectedAmenities((current) => current.filter((value) => value !== item))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')
    const form = event.currentTarget
    const formData = new FormData(form)
    const response = await fetch('/api/verified-listing', { method: 'POST', body: formData })
    const body = await response.json().catch(() => null) as { ok?: boolean; message?: string; error?: string; id?: string } | null
    if (!response.ok || !body?.ok) {
      setStatus('error')
      setMessage(body?.error || body?.message || 'Private Club post submission failed.')
      return
    }
    setStatus('success')
    setMessage(body.message || 'Private Club property post submitted for strict compliance review.')
    form.reset()
    setSelectedAmenities([])
    setSubmitterRole('Direct owner')
    setPropertyType(propertyTypeOptions[0] || '')
  }

  return (
    <form className={`premium-form ${compact ? 'premium-form-compact' : ''}`} onSubmit={onSubmit}>
      <div className="form-alert form-alert-gold">
        <strong>Private Club review:</strong> property posts stay hidden until Galaxy Elite approves ownership, authority, documents, and compliance status.
      </div>
      <fieldset className="form-lockset" disabled={locked}>
        <div className="private-club-form-section">
          <p className="eyebrow">Property match fields</p>
          <h3>Core property details</h3>
        </div>
      <div className="form-grid">
        <label>Title<input name="title" required maxLength={255} placeholder="Example: Private Club villa availability in Dubai" /></label>
        <label>Submitter role<select name="submitterRole" required value={submitterRole} onChange={(event) => setSubmitterRole(event.target.value)}><option>Direct owner</option><option>Direct landlord</option><option>Developer</option><option>Licensed agent with authority</option><option>Property manager with authority</option><option>Representative with written mandate</option></select></label>
        <label>Availability type<select name="availabilityType" required>{availabilityTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Listing intent<select name="listingIntent" required>{listingIntentOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Requirement type<select name="purpose" required>{purposeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Market segment<select name="marketSegment" required>{marketSegmentOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Property type<select name="propertyType" required value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>{propertyTypeOptions.map((type) => <option key={type}>{type}</option>)}</select></label>
        <label>Country<select name="country" required>{countryOptions.map((country) => <option key={country}>{country}</option>)}</select></label>
        <label>Area / city<select name="cityArea" required>{areaCityOptions.map((area) => <option key={area}>{area}</option>)}</select></label>
        <label>Project / community<input name="projectName" placeholder="Project, community, development or master plan" /></label>
        <label>Building / tower<input name="buildingName" placeholder="Building, tower, phase or plot reference" /></label>
        <label>Size label<input name="size" placeholder="Bedrooms, sq ft, sq m, acres, units, camp capacity" /></label>
        <label>Size, sqft<input name="sizeSqft" type="number" min="0" step="0.01" /></label>
        <label>Price / rent range<input name="priceRange" required placeholder="Private verified range" /></label>
        <label>Price / rent min<input name="priceMin" type="number" min="0" step="0.01" /></label>
        <label>Price / rent max<input name="priceMax" type="number" min="0" step="0.01" /></label>
        <label>Availability date<input name="availabilityDate" type="date" onFocus={(event) => event.currentTarget.showPicker?.()} onClick={(event) => event.currentTarget.showPicker?.()} /></label>
        <label>Bedrooms<input name="bedrooms" type="number" min="0" step="1" /></label>
        <label>Rooms<input name="rooms" type="number" min="0" step="1" /></label>
        <label>Total floors<input name="totalFloors" type="number" min="0" step="1" /></label>
        <label>Parking spaces<input name="parkingSpaces" type="number" min="0" step="1" /></label>
        <label>Category<select name="category" required>{categoryOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Offering type<select name="offeringType" required>{offeringTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Furnishing<select name="furnishingType" required>{furnishingTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Project status<select name="projectStatus" required>{projectStatusOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Preferred payment<select name="preferredPaymentMethod" required>{preferredPaymentMethodOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Privacy level<select name="privacyLevel" required>{privacyLevelOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Authority declaration<select name="authorityDeclaration" required>{authorityDeclarationOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Ownership status<select name="ownershipStatus" required><option>Direct owner confirmed</option><option>Owner authority available</option><option>Developer authority available</option><option>POA available</option><option>Documents pending</option></select></label>
        <label>Permit status<select name="permitStatus" required><option>Private match only - no public advert requested</option><option>Public advert requested - permit required</option><option>DLD/RERA/Trakheesi/Madmoun available</option><option>UK/India/local compliance to be reviewed</option><option>Not sure - request compliance guidance</option></select></label>
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
        ) : <p className="form-note">Select amenities that help matching quality.</p>}
      </fieldset>

      <label>Description<textarea name="description" rows={5} required placeholder="Describe the property, restrictions, verification notes, and matching context. Do not include sensitive personal data." /></label>
      <div className="private-club-form-section">
        <p className="eyebrow">Compliance files</p>
        <h3>Private review documents</h3>
      </div>
      <div className="document-upload-panel">
        <h3>Private document uploads</h3>
        <p>Documents remain private and are visible only to Galaxy Elite compliance/admin review.</p>
        <div className="form-grid">
          <label>Title deed / ownership proof<input name="titleDeed" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" /></label>
          {showAuthorityDocument ? <label>Authority letter / POA<input name="authorityDocument" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" /></label> : null}
          <label>Permit / RERA / Madmoun / project approval<input name="permitDocument" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" /></label>
          {showPlanDocuments ? <label>Floor plan / photos / supporting docs<input name="supportingDocuments" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp" /></label> : null}
        </div>
      </div>
      <label className="checkbox"><input type="checkbox" name="strictVerification" required /> I understand this Private Club post cannot be shown until Galaxy Elite approves documents and compliance status.</label>
      <label className="checkbox"><input type="checkbox" name="consent" required /> I confirm I have authority to submit this property information for private verification.</label>
      </fieldset>
      <button className="button button-gold" type="submit" disabled={locked}>{locked ? 'Submitting...' : 'Submit Private Club Post'}</button>
      <FormStatus status={status} successMessage={message || 'Private Club post submitted for strict compliance review.'} errorMessage={message || 'Please check the form and try again.'} />
    </form>
  )
}
