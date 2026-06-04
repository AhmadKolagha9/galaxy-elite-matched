import Link from 'next/link'
import { InterestCard } from '@/components/InterestCard'
import { JsonLd } from '@/components/JsonLd'
import { NewsletterForm } from '@/components/NewsletterForm'
import { SectionHeading } from '@/components/SectionHeading'
import { faqs, interestCards, marketPulse, processSteps } from '@/lib/content'
import { faqJsonLd } from '@/lib/seo'
import { markets, site } from '@/lib/site'

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <section className="hero hero-premium">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-copy">
          <img
            className="hero-logo"
            src="/brand/galaxy-elite-private-match-horizontal-transparent.png"
            alt="Galaxy Elite Private Match"
            width="1800"
            height="520"
          />
          <p className="eyebrow">{site.company} Private Match</p>
          <h1>Private property matching without public listings.</h1>
          <p>{site.description}</p>
          <div className="hero-actions">
            <Link className="button button-gold" href="/post-interest">Post My Interest</Link>
            <Link className="button button-outline" href="/private-availability">Submit Private Availability</Link>
            <Link className="button button-outline" href="/verified-listing">Verified Listing Request</Link>
            <Link className="button button-outline" href="/investor-post">Investor Post</Link>
          </div>
          <div className="hero-proof">
            <span>Public Interest</span>
            <span>Private Property</span>
            <span>Verified Match</span>
          </div>
        </div>
        <aside className="match-console" aria-label="Private Match console preview">
          <div className="console-header">
            <span className="pulse-dot" />
            <strong>Live Match Engine</strong>
            <small>Private</small>
          </div>
          <div className="console-card elevated">
            <span className="verified-pill">Verified Buyer</span>
            <h2>UK land request</h2>
            <p>1–5 acres • England • budget hidden publicly</p>
            <div className="match-score"><span>91%</span><small>match confidence</small></div>
          </div>
          <div className="console-row"><span>Owner identity</span><strong>Hidden</strong></div>
          <div className="console-row"><span>Agent status</span><strong>Must disclose</strong></div>
          <div className="console-row"><span>Connection</span><strong>Mutual approval only</strong></div>
          <Link className="button button-dark" href="/interest-board">View Interest Board</Link>
        </aside>
      </section>

      <section className="section logo-strip">
        <span>No public listings</span>
        <span>No spam calls</span>
        <span>No hidden agents</span>
        <span>Verified match rooms</span>
        <span>Brokerage-led execution</span>
        <span>Admin approval required</span>
        <span>Strict document verification</span>
      </section>

      <section className="section">
        <SectionHeading eyebrow="The innovation" title="A different relationship structure for real estate.">
          Traditional portals show property first. Galaxy Elite Private Match starts with verified intention, private availability and transparent roles.
        </SectionHeading>
        <div className="feature-grid feature-grid-large">
          <article><span>01</span><h3>Public demand</h3><p>Buyers, tenants, investors and land seekers post what they want, while controlling budget visibility.</p></article>
          <article><span>02</span><h3>Private supply</h3><p>Owners, landlords and developers can respond without exposing address, photos, price, documents or identity online.</p></article>
          <article><span>03</span><h3>Transparent agents</h3><p>Agents are welcome only when they disclose company, licence, authority and representation side.</p></article>
          <article><span>04</span><h3>Mutual approval</h3><p>No one connects until both sides approve and a private Match Room opens.</p></article>
          <article><span>05</span><h3>Verified listing requests</h3><p>Listings require title deed, owner ID, authority, permit checks and admin approval before visibility.</p></article>
          <article><span>06</span><h3>Control dashboard</h3><p>Galaxy Elite reviews every post, investor signal, agent registration and verified listing request before anything is published.</p></article>
        </div>
      </section>

      <section className="section contrast">
        <SectionHeading eyebrow="Interest Board" title="Verified interest signals, not public property adverts.">
          The board shows what serious people are looking for. The private property side stays in the Availability Vault until approval.
        </SectionHeading>
        <div className="interest-grid">
          {interestCards.slice(0, 3).map((card) => <InterestCard key={card.id} card={card} />)}
        </div>
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">How it works</p>
          <h2>From intention to agreement, every stage is controlled.</h2>
          <p>Private matching feels like a relationship platform, but backed by brokerage process, verification and clear status tracking.</p>
          <Link href="/private-match" className="button button-gold">See the workflow</Link>
        </div>
        <div className="steps compact-steps">
          {processSteps.map(([title, text], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading eyebrow="Global-ready" title="Start with GalaxyElite.ae. Scale with dedicated country gateways.">
          The architecture supports UAE, UK and India first, then global expansion through yourpropertymatch.co, .ae and .co.uk.
        </SectionHeading>
        <div className="market-grid">
          {markets.map((market) => (
            <Link href={market.href} key={market.label} className="market-card">
              <strong>{market.label}</strong>
              <p>{market.intro}</p>
              <span>{market.locations.join(' • ')}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section contrast split">
        <div>
          <p className="eyebrow">Market Pulse</p>
          <h2>Turn private demand into authority, newsletters and market intelligence.</h2>
          <p>Publish price ranges, demand volume, rental movement, upcoming vacancy trends and anonymous buyer signals without advertising private properties.</p>
          <NewsletterForm />
        </div>
        <div className="metric-list">
          {marketPulse.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
