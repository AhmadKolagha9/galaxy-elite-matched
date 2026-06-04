export default {
  name: 'investorPost',
  title: 'Investor Post',
  type: 'document',
  fields: [
    { name: 'id', title: 'Submission ID', type: 'string' },
    { name: 'approvalStatus', title: 'Approval Status', type: 'string' },
    { name: 'publicStatus', title: 'Public Status', type: 'string' },
    { name: 'investorProfile', title: 'Investor Profile', type: 'string' },
    { name: 'investorGoal', title: 'Investor Goal', type: 'string' },
    { name: 'marketSegment', title: 'Market Segment', type: 'string' },
    { name: 'country', title: 'Country', type: 'string' },
    { name: 'cityArea', title: 'Area / City', type: 'string' },
    { name: 'propertyType', title: 'Property Type', type: 'string' },
    { name: 'ticketSize', title: 'Ticket Size', type: 'string' },
    { name: 'targetYield', title: 'Target Yield', type: 'string' },
    { name: 'riskPreference', title: 'Risk Preference', type: 'string' },
    { name: 'timeline', title: 'Timeline', type: 'string' },
    { name: 'budgetVisibility', title: 'Budget Visibility', type: 'string' },
    { name: 'agentPreference', title: 'Responder Preference', type: 'string' },
    { name: 'description', title: 'Investor Brief', type: 'text' },
    { name: 'name', title: 'Contact Name', type: 'string' },
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'phone', title: 'Phone', type: 'string' },
    { name: 'submittedAt', title: 'Submitted At', type: 'datetime' }
  ]
}
