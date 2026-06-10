import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { InterestBoardClient } from '@/components/InterestBoardClient'
import { PageHero } from '@/components/PageHero'
import { fallbackCountries, marketSegmentOptions, propertyTypeOptions } from '@/lib/interest-submission'
import { getPublicInterestCards, type PublicInterestBoardSearchParams } from '@/lib/public-interest-board'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: 'Global Interest Board',
  description: 'Approved buyer, tenant, investor and land seeker demand signals. Property supply stays private until approved matching.',
  path: '/interest-board'
})

type InterestBoardPageProps = {
  searchParams?: Promise<PublicInterestBoardSearchParams & { add?: string }>
}

export default async function InterestBoardPage({ searchParams }: InterestBoardPageProps) {
  const params = (await searchParams) || {}
  if (params.add === '1') redirect('/submit?mode=interest')
  const cards = await getPublicInterestCards(params)

  return (
    <>
      <PageHero eyebrow="Interest Board" title="Approved demand signals, not public property adverts.">
        <p>Only Galaxy Elite approved interests can appear here. Owners, landlords, developers and transparent licensed agents can request to match without exposing property publicly.</p>
      </PageHero>
      <section className="section contrast">
        <form className="board-filter-form" method="GET">
          <label>
            Country
            <select name="country" defaultValue={params.country || ''}>
              <option value="">All countries</option>
              {fallbackCountries.map((country) => <option key={country.label} value={country.label}>{country.label}</option>)}
            </select>
          </label>
          <label>
            Segment
            <select name="market_segment" defaultValue={params.market_segment || ''}>
              <option value="">All segments</option>
              {marketSegmentOptions.map((segment) => <option key={segment} value={segment}>{segment}</option>)}
            </select>
          </label>
          <label>
            Property type
            <select name="property_type" defaultValue={params.property_type || ''}>
              <option value="">All property types</option>
              {propertyTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <button className="button button-dark" type="submit">Apply Filters</button>
        </form>
        <div className="hero-proof" style={{ justifyContent: 'center', marginBottom: 28 }}>
          <span>Open</span><span>Matching</span><span>Matched</span><span>Admin approved only</span><span>Public-safe summaries</span>
        </div>
        <InterestBoardClient cards={cards} />
      </section>
    </>
  )
}
