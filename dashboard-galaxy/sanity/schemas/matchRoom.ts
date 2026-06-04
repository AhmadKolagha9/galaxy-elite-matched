export default {
  name: 'matchRoom',
  title: 'Match Room',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'interest', title: 'Interest Signal', type: 'reference', to: [{ type: 'interestSignal' }] },
    { name: 'availability', title: 'Private Availability', type: 'reference', to: [{ type: 'privateAvailability' }] },
    { name: 'matchScore', title: 'Match Score', type: 'number' },
    { name: 'stage', title: 'Stage', type: 'string' },
    { name: 'notes', title: 'Internal Notes', type: 'text' },
    { name: 'createdAt', title: 'Created At', type: 'datetime' }
  ]
}
