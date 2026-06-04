import { PageHero } from '@/components/PageHero'

export default function MarketPulseLoading() {
  return (
    <>
      <PageHero eyebrow="Newsletter" title="Market intelligence without exposing private property.">
        <p>Loading approved market intelligence.</p>
      </PageHero>
      <section className="section contrast">
        <div className="pulse-grid">
          {[1, 2, 3].map((item) => <article className="market-card skeleton-card" key={item} />)}
        </div>
      </section>
    </>
  )
}
