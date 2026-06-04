export default {
  name: 'privateAvailability',
  title: 'Private Availability',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string' },
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'phone', title: 'Phone', type: 'string' },
    { name: 'role', title: 'Role', type: 'string' },
    { name: 'availabilityType', title: 'Availability Type', type: 'string' },
    { name: 'country', title: 'Country', type: 'string' },
    { name: 'area', title: 'Area', type: 'string' },
    { name: 'propertyType', title: 'Property Type', type: 'string' },
    { name: 'priceRange', title: 'Price / Rent Range', type: 'string' },
    { name: 'availabilityDate', title: 'Availability Date', type: 'string' },
    { name: 'privacyLevel', title: 'Privacy Level', type: 'string' },
    { name: 'authority', title: 'Authority', type: 'string' },
    { name: 'description', title: 'Private Description', type: 'text' },
    { name: 'publicVisibility', title: 'Public Visibility', type: 'boolean', initialValue: false },
    { name: 'status', title: 'Status', type: 'string' },
    { name: 'submittedAt', title: 'Submitted At', type: 'datetime' }
  ]
}
