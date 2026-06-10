export const site = {
  company: 'Galaxy Elite',
  product: 'Galaxy Elite Private Match',
  shortProduct: 'Private Match',
  domain: 'yourpropertymatch.cloud',
  get url() {
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://yourpropertymatch.cloud'
  },
  tagline: 'Submit once. Stay private. Get matched.',
  promise: 'More privacy, less noise and smarter property matching through Galaxy Elite approval.',
  description:
    'Submit your property interest once, and let Galaxy Elite discreetly connect you with the right opportunity. Buy, sell, rent, invest or represent a client with privacy, trusted review and mutual approval before confidential details are shared.',
  whatsapp: process.env.WHATSAPP_NUMBER || '971000000000',
  email: process.env.OPERATIONS_EMAIL || 'hello@yourpropertymatch.cloud'
}

export const mainNav = [
  { href: '/private-club', label: 'Private Club' },
  { href: '/interest-board', label: 'Interest Board' },
  { href: '/private-opportunities', label: 'Private Opportunities' },
  { href: '/market-pulse', label: 'Market Pulse' },
  { href: '/submit', label: 'Submit' }
]

export const dashboardNav = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/submit', label: 'Submit' },
  { href: '/private-opportunities?mode=investor', label: 'Private Opportunities' },
  { href: '/dashboard/matches', label: 'Matches' },
  { href: '/dashboard/verify', label: 'Verification' },
  { href: '/dashboard/join-agent', label: 'Join like agent' },
  { href: '/dashboard/profile', label: 'Profile' }
]

export const markets = [
  {
    label: 'UAE',
    href: '/uae',
    intro: 'Private matching for UAE buyers, tenants, owners, landlords, developers and transparent licensed agents.',
    locations: ['Abu Dhabi', 'Al Ain', 'Dubai', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain']
  },
  {
    label: 'UK',
    href: '/uk',
    intro: 'A verified interest-first workflow for UK buyers, land seekers, tenants, landlords, owners and licensed representatives.',
    locations: ['England', 'Scotland', 'Wales', 'Northern Ireland']
  },
  {
    label: 'India',
    href: '/india',
    intro: 'A broad India interest gateway for verified property, land and investment demand before deeper local expansion.',
    locations: ['India']
  }
]

export const propertyTypes = [
  'Residential apartment / flat',
  'Studio apartment',
  'Serviced apartment',
  'Villa',
  'Townhouse',
  'Duplex',
  'Penthouse',
  'Mansion / luxury home',
  'Land / development plot',
  'Residential land',
  'Commercial land',
  'Agricultural land',
  'Industrial land',
  'Mixed-use land',
  'Office',
  'Retail shop / showroom',
  'Warehouse',
  'Industrial unit',
  'Labour camp / staff accommodation',
  'Commercial building',
  'Hospitality / hotel',
  'Restaurant / F&B space',
  'Clinic / medical space',
  'Farmhouse / rural property',
  'Short-term rental opportunity',
  'Off-plan / new development',
  'Branded residence',
  'Investment property',
  'Whole building / bulk units',
  'Other / bespoke requirement'
]


export const roles = [
  'Buyer',
  'Tenant',
  'Investor',
  'Land seeker',
  'Owner',
  'Landlord',
  'Developer',
  'Licensed agent',
  'Property manager',
  'Corporate client',
  'Family office',
  'Admin'
]
