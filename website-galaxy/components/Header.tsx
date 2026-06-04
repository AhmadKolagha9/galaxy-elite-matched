'use client'

import Link from 'next/link'
import { mainNav, site } from '@/lib/site'
import { useMemberSession } from '@/lib/member-session-client'

const protectedPaths = new Set(['/post-interest', '/private-availability', '/investor-post'])

function authAwareHref(href: string, authenticated: boolean) {
  if (authenticated || !protectedPaths.has(href)) return href
  return `/login?next=${encodeURIComponent(href)}`
}

export function Header() {
  const { user, loading } = useMemberSession()
  const authenticated = Boolean(user)

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
          <Link key={item.href} href={authAwareHref(item.href, authenticated)}>{item.label}</Link>
        ))}
      </nav>
      <div className="header-actions">
        {authenticated ? (
          <Link className="button button-small button-gold" href="/dashboard">Go to Dashboard</Link>
        ) : (
          <>
            <Link className="ghost-link" href="/login">Login</Link>
            <Link className="button button-small button-gold" href="/register">Register</Link>
          </>
        )}
        {loading ? <span className="sr-only">Checking session</span> : null}
      </div>
    </header>
  )
}
