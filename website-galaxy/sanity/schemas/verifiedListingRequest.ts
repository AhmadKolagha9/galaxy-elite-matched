export default {
  name: 'verifiedListingRequest',
  title: 'Verified Listing Request',
  type: 'document',
  fields: [
    { name: 'id', title: 'Submission ID', type: 'string' },
    { name: 'approvalStatus', title: 'Approval Status', type: 'string' },
    { name: 'publicStatus', title: 'Public Status', type: 'string' },
    { name: 'verificationLevel', title: 'Verification Level', type: 'string' },
    { name: 'submitterRole', title: 'Submitter Role', type: 'string' },
    { name: 'listingIntent', title: 'Listing Intent', type: 'string' },
    { name: 'marketSegment', title: 'Market Segment', type: 'string' },
    { name: 'purpose', title: 'Purpose', type: 'string' },
    { name: 'country', title: 'Country', type: 'string' },
    { name: 'cityArea', title: 'Area / City', type: 'string' },
    { name: 'projectName', title: 'Project Name', type: 'string' },
    { name: 'buildingName', title: 'Building Name', type: 'string' },
    { name: 'propertyType', title: 'Property Type', type: 'string' },
    { name: 'size', title: 'Size', type: 'string' },
    { name: 'priceRange', title: 'Price / Rent Range', type: 'string' },
    { name: 'ownershipStatus', title: 'Ownership Status', type: 'string' },
    { name: 'permitStatus', title: 'Permit Status', type: 'string' },
    { name: 'uploadedDocuments', title: 'Uploaded Document Metadata', type: 'array', of: [{ type: 'object', fields: [
      { name: 'field', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'size', type: 'number' },
      { name: 'type', type: 'string' }
    ]}]},
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'name', title: 'Contact Name', type: 'string' },
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'phone', title: 'Phone', type: 'string' },
    { name: 'submittedAt', title: 'Submitted At', type: 'datetime' }
  ]
}
