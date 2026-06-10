import { PageHero } from '@/components/PageHero'

export default function InterestBoardLoading() {
  return (
    <>
      <PageHero eyebrow="Interest Board" title="Real property interest, shared with privacy.">
        <p>Loading active property interests.</p>
      </PageHero>
      <section className="section contrast">
        <div className="interest-grid">
          {[1, 2, 3].map((item) => <article className="interest-card skeleton-card" key={item} />)}
        </div>
      </section>
    </>
  )
}
