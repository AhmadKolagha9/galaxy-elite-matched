import Link from 'next/link'
import { mainNav, site } from '@/lib/site'
import { filterNavigationWithSettings, getSiteSettings } from '@/lib/site-settings'

export async function Footer() {
  const settings = await getSiteSettings()
  const platformLinks = filterNavigationWithSettings(settings, mainNav).filter((item) => item.href !== '/market-pulse')
  return (
    <footer className="site-footer old-site-footer">
      <div className="footer-compact">
        <div className="footer-statement">
          <img
            className="footer-mark"
            src="/brand/galaxy-elite-icon-only-gold-transparent.png"
            alt=""
            width="512"
            height="512"
          />
          <div>
            <strong>{site.product}</strong>
            <p>No public private-property uploads. No hidden agents. No direct contact before approval.</p>
          </div>
        </div>
        <nav className="footer-short-nav" aria-label="Footer navigation">
          {platformLinks.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          <Link href="/for-agents">Agents</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {site.company}. Built for private property matching.</span>
        <span>{site.tagline}</span>
      </div>
    </footer>
  )
}
