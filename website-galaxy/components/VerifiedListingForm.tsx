'use client'

import { useState } from 'react'
import { FormStatus } from '@/components/FormStatus'
import { areaCityOptions, countryOptions, listingIntentOptions, marketSegmentOptions, propertyTypeOptions, purposeOptions, verificationDocumentTypes } from '@/lib/taxonomy'

export function VerifiedListingForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/verified-listing', { method: 'POST', body: formData })
    setStatus(response.ok ? 'success' : 'error')
    if (response.ok) event.currentTarget.reset()
  }

  return (
    <form className="premium-form" onSubmit={onSubmit}>
      <div className="form-alert form-alert-gold">
        <strong>Strict verification:</strong> a verified listing cannot go live until Galaxy Elite approves ownership, authority, ID, document quality, and local permit requirements where applicable.
      </div>
      <div className="form-grid">
        <label>Submitter role<select name="submitterRole" required><option>Direct owner</option><option>Direct landlord</option><option>Developer</option><option>Licensed agent with authority</option><option>Property manager with authority</option></select></label>
        <label>Listing intent<select name="listingIntent" required>{listingIntentOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Market segment<select name="marketSegment" required>{marketSegmentOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Purpose<select name="purpose" required>{purposeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Property type<select name="propertyType" required>{propertyTypeOptions.map((type) => <option key={type}>{type}</option>)}</select></label>
        <label>Country<select name="country" required>{countryOptions.map((country) => <option key={country}>{country}</option>)}</select></label>
        <label>Area / city<select name="cityArea" required>{areaCityOptions.map((area) => <option key={area}>{area}</option>)}</select></label>
        <label>Project / community name<input name="projectName" placeholder="Project, community, development or master plan" /></label>
        <label>Building / tower name<input name="buildingName" placeholder="Building, tower, phase or plot reference" /></label>
        <label>Size<input name="size" placeholder="Bedrooms, sq ft, sq m, acres, units, camp capacity" /></label>
        <label>Price / rent range<input name="priceRange" required placeholder="Price/rent range for private verification" /></label>
        <label>Availability date<input name="availabilityDate" placeholder="Now, vacant from, handover date, Q4 2026" /></label>
        <label>Ownership status<select name="ownershipStatus" required><option>Direct owner confirmed</option><option>Owner authority available</option><option>Developer authority available</option><option>POA available</option><option>Documents pending</option></select></label>
        <label>Permit status<select name="permitStatus" required><option>Private match only - no public advert requested</option><option>Public advert requested - permit required</option><option>DLD/RERA/Trakheesi/Madmoun available</option><option>UK/India/local compliance to be reviewed</option><option>Not sure - request compliance guidance</option></select></label>
      </div>
      <label>Description<textarea name="description" rows={5} required placeholder="Describe the property, land, office, camp, off-plan/secondary status, restrictions and verification notes. Do not include sensitive personal data in this description." /></label>
      <div className="document-upload-panel">
        <h3>Document upload checklist</h3>
        <p>Upload available documents for review. This starter stores document metadata locally; production should use Supabase Storage or secure cloud storage with access controls.</p>
        <div className="document-checklist">
          {verificationDocumentTypes.map((doc) => <span key={doc}>{doc}</span>)}
        </div>
        <div className="form-grid">
          <label>Title deed / ownership proof<input name="titleDeed" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" /></label>
          <label>Owner ID / passport / Emirates ID<input name="ownerId" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" /></label>
          <label>Authority letter / POA<input name="authorityDocument" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" /></label>
          <label>Broker / company licence<input name="brokerLicence" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" /></label>
          <label>Permit / RERA / Madmoun / project approval<input name="permitDocument" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" /></label>
          <label>Floor plan / photos / supporting docs<input name="supportingDocuments" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp" /></label>
        </div>
      </div>
      <div className="form-grid">
        <label>Name<input name="name" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>Phone / WhatsApp<input name="phone" required /></label>
      </div>
      <label className="checkbox"><input type="checkbox" name="strictVerification" required /> I understand this cannot be listed as verified until Galaxy Elite approves the documents and compliance status.</label>
      <label className="checkbox"><input type="checkbox" name="consent" required /> I confirm I have authority to submit this property information for private verification.</label>
      <button className="button button-gold" type="submit">Submit Verified Listing Request</button>
      <FormStatus status={status} successMessage="Verified listing request submitted for strict compliance review." />
    </form>
  )
}
