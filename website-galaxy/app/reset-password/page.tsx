import Link from 'next/link'
import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/ResetPasswordForm'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Reset Password',
  description: 'Enter your secure reset code and set a new Galaxy Elite Private Match password.',
  path: '/reset-password',
  noindex: true
})

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const params = await searchParams
  return (
    <section className="auth-section">
      <div className="auth-panel">
        <p className="eyebrow">Password reset</p>
        <h1>Enter your reset code.</h1>
        <ResetPasswordForm initialEmail={params.email || ''} />
        <p>Need another code? <Link href="/forgot-password"><strong>Request reset code</strong></Link></p>
      </div>
      <aside className="auth-aside">
        <p className="eyebrow">Secure session</p>
        <h2>Your dashboard opens after reset.</h2>
        <ul>
          <li>Reset codes are single-purpose and time-limited.</li>
          <li>Old reset attempts are cleared after success.</li>
          <li>Your email is confirmed when the reset succeeds.</li>
        </ul>
      </aside>
    </section>
  )
}
