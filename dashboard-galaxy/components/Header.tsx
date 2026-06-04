import Link from 'next/link'
import { mainNav, site } from '@/lib/site'

export function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label={`${site.product} home`}>
        <img
          className="brand-logo"
          src="/brand/galaxy-elite-header-logo-transparent.png"
          alt="Galaxy Elite Real Estate"
          width="1200"
          height="220"
        />
        <span className="sr-only">{site.product}</span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        {mainNav.map((item) => (
          <Link key={item.href} href={item.href}>{item.label}</Link>
        ))}
      </nav>
      <div className="header-actions">
        <Link className="ghost-link" href="/login">Login</Link>
        <Link className="button button-small button-gold" href="/register">Join</Link>
      </div>
    </header>
  )
}
