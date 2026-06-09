export const site = {
  company: 'Galaxy Elite',
  product: 'Galaxy Elite Private Match',
  shortProduct: 'Private Match',
  domain: 'yourpropertymatch.cloud',
  get url() {
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://yourpropertymatch.cloud'
  },
  tagline: 'Public Interest. Private Property. Verified Match.',
  promise: 'No public listings. No spam. No hidden agents. Just verified private property matches.',
  description:
    'Galaxy Elite Private Match is a closed property matching experience where buyers, tenants, investors and land seekers post interest, owners and landlords submit availability privately, agents disclose their role, and matches open only after mutual approval.',
  whatsapp: process.env.WHATSAPP_NUMBER || '971000000000',
  email: process.env.OPERATIONS_EMAIL || 'hello@yourpropertymatch.cloud'
}

export const mainNav = [
  { href: '/interest-board', label: 'Interest Board' },
  { href: '/private-availability', label: 'Private Availability' },
  { href: '/verified-listing', label: 'Verified Listing' },
  { href: '/private-match', label: 'Private Match' },
  { href: '/market-pulse', label: 'Market Pulse' }
]

export const dashboardNav = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/interest-board?add=1', label: 'Add Interest' },
  { href: '/dashboard/verified-listing', label: 'Verified Listing Request' },
  { href: '/dashboard/investor-post', label: 'Investor Post' },
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
