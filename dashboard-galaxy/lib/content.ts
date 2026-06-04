export type InterestStatus = 'Open' | 'Matching' | 'Matched' | 'Archived'

export type InterestCardData = {
  id: string
  status: InterestStatus
  badge: string
  title: string
  country: string
  area: string
  type: string
  size: string
  budget: string
  timeline: string
  accepts: string
  description: string
}

export const interestCards: InterestCardData[] = [
  {
    id: 'uk-land-001',
    status: 'Open',
    badge: 'Verified Buyer',
    title: 'Looking for UK land or development plot',
    country: 'UK',
    area: 'England preferred, strong locations considered',
    type: 'Land / development plot',
    size: '1–5 acres',
    budget: 'Hidden publicly, verified privately',
    timeline: '3–6 months',
    accepts: 'Direct owners, developers and licensed agents',
    description: 'Seeking residential or mixed-use potential. Planning upside preferred. Full buyer profile available only after approved match.'
  },
  {
    id: 'dubai-rental-001',
    status: 'Matching',
    badge: 'Verified Tenant',
    title: 'Dubai tenant seeking September move-in',
    country: 'UAE',
    area: 'Dubai Marina, JBR or Palm Jumeirah',
    type: '2-bedroom apartment',
    size: '900–1,400 sq ft',
    budget: 'AED 120K–160K yearly',
    timeline: 'Move-in September 2026',
    accepts: 'Direct landlords preferred, licensed agents accepted',
    description: 'Professional tenant with documents in progress. Looking for clean, well-managed property with parking.'
  },
  {
    id: 'global-investor-001',
    status: 'Open',
    badge: 'Verified Investor',
    title: 'Income property demand across UAE, UK and India',
    country: 'Global',
    area: 'UAE / UK / India',
    type: 'Investment property',
    size: 'Flexible',
    budget: 'USD 500K–1.5M',
    timeline: 'Ready within 90 days',
    accepts: 'Developers, direct owners and licensed agents',
    description: 'Investor seeks rental income, strong exit potential and verified documentation. Private match room required before details.'
  },
  {
    id: 'uae-landlord-tenant-001',
    status: 'Open',
    badge: 'Verified Tenant',
    title: 'Tenant wants landlord availability before public listing',
    country: 'UAE',
    area: 'Abu Dhabi or Dubai',
    type: 'Family apartment or townhouse',
    size: '2–3 bedrooms',
    budget: 'Visible to verified landlords only',
    timeline: 'Move-in within 60 days',
    accepts: 'Direct landlords and property managers',
    description: 'Family relocation client wants to match with upcoming vacancy before the unit is advertised publicly.'
  }
]

export const processSteps = [
  ['Create a verified profile', 'Each person declares their role: buyer, tenant, owner, landlord, developer, agent or representative. No hidden agents.'],
  ['Post interest or private availability', 'Demand can be visible on the Interest Board. Property supply stays inside the private availability vault.'],
  ['Match by fit and timing', 'The engine considers country, area, budget, type, size, timeline, verification, privacy and agent preference.'],
  ['Approve before contact', 'Both sides review limited summaries, approve the match, then enter a private Match Room.']
] as const

export const marketPulse = [
  { label: 'Demand type', value: 'Buyer + tenant signals', note: 'Capture real market demand before supply is shown.' },
  { label: 'Privacy layer', value: 'Private availability', note: 'Owners and landlords keep address, photos and documents hidden.' },
  { label: 'Trust rule', value: 'No hidden agents', note: 'Agents disclose company, licence, authority and representation side.' },
  { label: 'Match status', value: 'Open → Matched', note: 'Every interest and match has a clean status trail.' }
]

export const faqs = [
  {
    question: 'Does Galaxy Elite Private Match publicly advertise property?',
    answer: 'No. The core model publishes verified interest and keeps private property availability hidden until both sides approve a match.'
  },
  {
    question: 'Can agents register?',
    answer: 'Yes. Agents can participate, but they must disclose that they are agents, provide licence details and clarify who they represent.'
  },
  {
    question: 'Can a buyer hide their budget?',
    answer: 'Yes. Budget can be shown publicly, hidden publicly, or verified privately by Galaxy Elite for serious matching.'
  },
  {
    question: 'What is a Match Room?',
    answer: 'A Match Room is a private page where approved parties can progress through verification, viewing, negotiation, agreement execution and completion.'
  }
]

export const matchStages = [
  'Interest received',
  'Response received',
  'Identity check',
  'Authority check',
  'Match proposed',
  'Mutual approval',
  'Match Room opened',
  'Viewing / meeting',
  'Offer / negotiation',
  'Agreement executed',
  'Completed'
]
