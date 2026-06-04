import type { Metadata } from 'next'
import { DashboardNav } from '@/components/DashboardNav'
import { VerificationAlertBanner } from '@/components/VerificationAlertBanner'
import { requireUser } from '@/lib/auth'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false }
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser()
  return (
    <section className="dashboard-shell">
      <DashboardNav />
      <div className="dashboard-main">
        <VerificationAlertBanner />
        {children}
      </div>
    </section>
  )
}
