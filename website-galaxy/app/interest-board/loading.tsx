import { PageHero } from '@/components/PageHero'

export default function InterestBoardLoading() {
  return (
    <>
      <PageHero eyebrow="Interest Board" title="Approved demand signals, not public property adverts.">
        <p>Loading approved public demand records.</p>
      </PageHero>
      <section className="section contrast">
        <div className="interest-grid">
          {[1, 2, 3].map((item) => <article className="interest-card skeleton-card" key={item} />)}
        </div>
      </section>
    </>
  )
}
