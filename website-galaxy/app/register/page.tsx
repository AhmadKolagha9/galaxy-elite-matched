import Link from 'next/link'
import type { Metadata } from 'next'
import { AuthNotice } from '@/components/AuthNotice'
import { RegisterForm } from '@/components/RegisterForm'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Create Account',
  description: 'Join Galaxy Elite Private Match to submit property interests and access private opportunities.',
  path: '/register',
  noindex: true
})

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const params = await searchParams
  return (
    <section className="auth-section">
      <div className="auth-panel">
        <p className="eyebrow">Join</p>
        <h1>Join Galaxy Elite Private Match.</h1>
        <AuthNotice searchParams={params} />
        <RegisterForm />
        <p>Already registered? <Link href="/login"><strong>Login</strong></Link></p>
      </div>
      <aside className="auth-aside">
        <p className="eyebrow">Private matching</p>
        <h2>Join once, stay private, and let the right opportunities come to you.</h2>
        <ul>
          <li>Create your account to submit property interests.</li>
          <li>Access private opportunities through a trusted secure process.</li>
          <li>Manage requests from your private workspace.</li>
          <li>Keep private matching data hidden until review and approval.</li>
        </ul>
      </aside>
    </section>
  )
}
