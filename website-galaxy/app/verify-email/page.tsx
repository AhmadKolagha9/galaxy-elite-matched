import Link from 'next/link'
import type { Metadata } from 'next'
import { EmailVerificationForm } from '@/components/EmailVerificationForm'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Verify Email',
  description: 'Verify your Galaxy Elite Private Match email address.',
  path: '/verify-email',
  noindex: true
})

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const params = await searchParams
  const email = typeof params.email === 'string' ? params.email : ''

  return (
    <section className="auth-section">
      <div className="auth-panel">
        <p className="eyebrow">Email Verification</p>
        <h1>Enter your verification code.</h1>
        <EmailVerificationForm initialEmail={email} />
        <p>Already verified? <Link href="/login"><strong>Login</strong></Link></p>
      </div>
      <aside className="auth-aside">
        <p className="eyebrow">Account Activation</p>
        <h2>Your account opens after email confirmation.</h2>
        <ul>
          <li>Use the six-digit code sent to your registered email.</li>
          <li>Request a new code if the first one expires.</li>
          <li>After verification, your secure member session starts automatically.</li>
        </ul>
      </aside>
    </section>
  )
}
