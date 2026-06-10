import Link from 'next/link'
import type { Metadata } from 'next'
import { AuthNotice } from '@/components/AuthNotice'
import { LoginForm } from '@/components/LoginForm'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Login',
  description: 'Access your private matching account and continue securely with Galaxy Elite.',
  path: '/login',
  noindex: true
})

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string; next?: string }> }) {
  const params = await searchParams
  return (
    <section className="auth-section">
      <div className="auth-panel">
        <p className="eyebrow">Login</p>
        <h1>Access your private matching account.</h1>
        <AuthNotice searchParams={params} />
        <LoginForm next={params.next} />
        <p><Link href="/forgot-password"><strong>Forgot password?</strong></Link></p>
        <p>New to Private Match? <Link href="/register"><strong>Create an account</strong></Link></p>
      </div>
      <aside className="auth-aside">
        <p className="eyebrow">Protected experience</p>
        <h2>Your private property journey continues from where you left off.</h2>
        <ul>
          <li>Submit requests and manage your property interests.</li>
          <li>Track matches and private opportunities.</li>
          <li>Continue securely with Galaxy Elite review and approval steps.</li>
          <li>Keep confidential details protected until the right stage.</li>
        </ul>
      </aside>
    </section>
  )
}
