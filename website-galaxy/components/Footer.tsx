import Link from 'next/link'
import { markets, site } from '@/lib/site'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <img
            className="footer-logo"
            src="/brand/galaxy-elite-private-match-horizontal-transparent.png"
            alt="Galaxy Elite Private Match"
            width="1800"
            height="520"
          />
          <p>{site.description}</p>
          <p className="footer-promise">{site.promise}</p>
        </div>
        <div>
          <h3>Platform</h3>
          <Link href="/post-interest">Post Interest</Link>
          <Link href="/interest-board">Interest Board</Link>
          <Link href="/private-opportunities">Private Opportunities</Link>
          <Link href="/private-club">Private Club</Link>
        </div>
        <div>
          <h3>Markets</h3>
          {markets.map((market) => <Link key={market.href} href={market.href}>{market.label}</Link>)}
        </div>
        <div>
          <h3>Trust</h3>
          <Link href="/for-agents">Agent Disclosure</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href={`https://wa.me/${site.whatsapp}`}>WhatsApp</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {site.company}. Built for private property matching.</span>
        <span>{site.tagline}</span>
      </div>
    </footer>
  )
}
