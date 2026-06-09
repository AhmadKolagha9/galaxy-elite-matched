'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { mainNav, site } from '@/lib/site'
import { useMemberSession } from '@/lib/member-session-client'

const protectedPathPrefixes = ['/private-opportunities', '/private-availability', '/investor-post']


function initials(name: string, email: string) {
  const source = name || email
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U'
}

function verificationLabel(status?: string) {
  if (status === 'verified') return 'Verified account'
  if (status === 'under_review') return 'Verification under review'
  if (status === 'action_required') return 'Verification action required'
  return 'Verification needed'
}

function authAwareHref(href: string, authenticated: boolean) {
  if (authenticated || !protectedPathPrefixes.some((path) => href.startsWith(path))) return href
  return `/login?next=${encodeURIComponent(href)}`
}

export function Header() {
  const router = useRouter()
  const { user, loading } = useMemberSession()
  const authenticated = Boolean(user)

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null)
    router.replace('/')
    router.refresh()
  }

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
        {authenticated && user ? (
          <details className="account-menu">
            <summary className="account-menu-trigger" aria-label="Open account menu">
              <span className="account-avatar">{initials(user.name, user.email)}</span>
              <span className="account-menu-text">
                <span>{user.name}</span>
                <small>{user.role}</small>
              </span>
              <span className={user.verificationStatus === 'verified' ? 'account-verified-badge' : 'account-status-badge'} title={verificationLabel(user.verificationStatus)}>
                {user.verificationStatus === 'verified' ? 'V' : '!'}
              </span>
            </summary>
            <div className="account-menu-panel">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/dashboard/profile">Manage Profile</Link>
              <Link href="/dashboard/verify">Upload ID / Verify</Link>
              <Link href="/dashboard/join-agent">Join like agent</Link>
              <Link href="/forgot-password">Change Password</Link>
              <button type="button" onClick={logout}>Sign out</button>
            </div>
          </details>
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
