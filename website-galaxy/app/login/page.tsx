import Link from 'next/link'
import type { Metadata } from 'next'
import { AuthNotice } from '@/components/AuthNotice'
import { loginAction } from '@/lib/auth'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Login',
  description: 'Login to your Galaxy Elite Private Match dashboard.',
  path: '/login',
  noindex: true
})

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const params = await searchParams
  return (
    <section className="auth-section">
      <div className="auth-panel">
        <p className="eyebrow">Member login</p>
        <h1>Access your private match dashboard.</h1>
        <AuthNotice searchParams={params} />
        <form className="auth-form" action={loginAction}>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          <button className="button button-gold" type="submit">Login</button>
        </form>
        <p>New to Private Match? <Link href="/register"><strong>Create an account</strong></Link></p>
      </div>
      <aside className="auth-aside">
        <p className="eyebrow">Protected experience</p>
        <h2>Login unlocks the private side.</h2>
        <ul>
          <li>Post and manage interest signals.</li>
          <li>Track Open, Matching, Matched and Archived requests.</li>
          <li>Prepare verified Match Rooms.</li>
          <li>Use the member session to submit backend-authenticated private match requests.</li>
        </ul>
      </aside>
    </section>
  )
}
