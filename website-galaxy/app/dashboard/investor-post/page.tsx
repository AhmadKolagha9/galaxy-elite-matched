import type { Metadata } from 'next'
import { InvestorPostForm } from '@/components/InvestorPostForm'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({ title: 'Dashboard Investor Post', description: 'Submit investor demand from your member dashboard.', path: '/dashboard/investor-post', noindex: true })

export default function DashboardInvestorPostPage() {
  return (
    <>
      <div className="dashboard-hero"><p className="eyebrow">Investor Post</p><h1>Create an investor demand signal.</h1><p>Investor posts are reviewed before they appear anywhere publicly or to members.</p></div>
      <InvestorPostForm />
    </>
  )
}
