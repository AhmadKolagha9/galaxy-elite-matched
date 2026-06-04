export default {
  name: 'agentProfile',
  title: 'Agent Profile',
  type: 'document',
  fields: [
    { name: 'name', title: 'Full Name', type: 'string' },
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'phone', title: 'Phone', type: 'string' },
    { name: 'company', title: 'Company', type: 'string' },
    { name: 'licenceNumber', title: 'Licence Number', type: 'string' },
    { name: 'country', title: 'Country', type: 'string' },
    { name: 'representation', title: 'Representation Side', type: 'string' },
    { name: 'authority', title: 'Authority Status', type: 'string' },
    { name: 'status', title: 'Status', type: 'string' },
    { name: 'submittedAt', title: 'Submitted At', type: 'datetime' }
  ]
}
