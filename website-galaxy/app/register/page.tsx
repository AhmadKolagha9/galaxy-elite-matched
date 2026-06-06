import Link from 'next/link'
import type { Metadata } from 'next'
import { AuthNotice } from '@/components/AuthNotice'
import { RegisterForm } from '@/components/RegisterForm'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Create Account',
  description: 'Create a Galaxy Elite Private Match account.',
  path: '/register',
  noindex: true
})

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const params = await searchParams
  return (
    <section className="auth-section">
      <div className="auth-panel">
        <p className="eyebrow">Join Private Match</p>
        <h1>Create your account.</h1>
        <AuthNotice searchParams={params} />
        <RegisterForm />
        <p>Already registered? <Link href="/login"><strong>Login</strong></Link></p>
      </div>
      <aside className="auth-aside">
        <p className="eyebrow">Deferred Verification</p>
        <h2>Start now. Verify later.</h2>
        <ul>
          <li>Create a member profile with only your core contact details.</li>
          <li>Confirm your email with a six-digit code before dashboard access.</li>
          <li>Submit identity and authority checks from your private workspace when required.</li>
          <li>Private matching data stays hidden until review and approval.</li>
        </ul>
      </aside>
    </section>
  )
}
