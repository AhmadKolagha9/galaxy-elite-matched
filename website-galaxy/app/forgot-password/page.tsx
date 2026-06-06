import Link from 'next/link'
import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/ForgotPasswordForm'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Forgot Password',
  description: 'Request a secure password reset code for your Galaxy Elite Private Match account.',
  path: '/forgot-password',
  noindex: true
})

export default function ForgotPasswordPage() {
  return (
    <section className="auth-section">
      <div className="auth-panel">
        <p className="eyebrow">Password reset</p>
        <h1>Request a secure reset code.</h1>
        <ForgotPasswordForm />
        <p>Remember your password? <Link href="/login"><strong>Login</strong></Link></p>
      </div>
      <aside className="auth-aside">
        <p className="eyebrow">Account recovery</p>
        <h2>Reset codes are sent to your registered email.</h2>
        <ul>
          <li>Use the six-digit code before it expires.</li>
          <li>Choose a new password with at least 12 characters.</li>
          <li>Successful reset creates a secure member session.</li>
        </ul>
      </aside>
    </section>
  )
}
