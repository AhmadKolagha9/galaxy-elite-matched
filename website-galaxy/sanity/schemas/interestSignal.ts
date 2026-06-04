export default {
  name: 'interestSignal',
  title: 'Interest Signal',
  type: 'document',
  fields: [
    { name: 'name', title: 'Client Name', type: 'string' },
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'phone', title: 'Phone', type: 'string' },
    { name: 'role', title: 'Role', type: 'string' },
    { name: 'purpose', title: 'Purpose', type: 'string' },
    { name: 'country', title: 'Country', type: 'string' },
    { name: 'area', title: 'Area', type: 'string' },
    { name: 'propertyType', title: 'Property Type', type: 'string' },
    { name: 'size', title: 'Size', type: 'string' },
    { name: 'budget', title: 'Budget', type: 'string' },
    { name: 'budgetVisibility', title: 'Budget Visibility', type: 'string' },
    { name: 'timeline', title: 'Timeline', type: 'string' },
    { name: 'agentPreference', title: 'Agent Preference', type: 'string' },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'status', title: 'Status', type: 'string', initialValue: 'Open' },
    { name: 'submittedAt', title: 'Submitted At', type: 'datetime' }
  ]
}
