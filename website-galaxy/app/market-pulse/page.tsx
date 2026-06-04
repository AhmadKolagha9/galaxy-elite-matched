import type { Metadata } from 'next'
import { MarketPulseCard } from '@/components/MarketPulseCard'
import { NewsletterForm } from '@/components/NewsletterForm'
import { PageHero } from '@/components/PageHero'
import { SectionHeading } from '@/components/SectionHeading'
import { getMarketPulseArticles } from '@/lib/market-pulse'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Market Pulse',
  description: 'Galaxy Elite Market Pulse: anonymous property demand signals, price ranges, volume trends and rental movement insights.',
  path: '/market-pulse'
})

export default async function MarketPulsePage() {
  const articles = await getMarketPulseArticles()

  return (
    <>
      <PageHero eyebrow="Newsletter" title="Market intelligence without exposing private property.">
        <p>Use anonymous interest signals to build authority around demand, price ranges, vacancy timing and matching patterns.</p>
      </PageHero>
      <section className="section split">
        <div>
          <SectionHeading eyebrow="Join" title="Galaxy Elite Market Pulse" />
          <NewsletterForm />
        </div>
        <div className="metric-list">
          {articles.slice(0, 4).map((article) => <MarketPulseCard key={article.id} article={article} />)}
        </div>
      </section>
      <section className="section contrast">
        <SectionHeading eyebrow="Insights" title="Approved market intelligence">
          <p>Editorial content comes from Sanity and stays separate from private availability records, user documents and match-room data.</p>
        </SectionHeading>
        <div className="pulse-grid">
          {articles.map((article) => <MarketPulseCard key={article.id} article={article} />)}
        </div>
      </section>
    </>
  )
}
