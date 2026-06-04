import type { Metadata } from 'next'
import { InterestForm } from '@/components/InterestForm'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({ title: 'Dashboard Post Interest', description: 'Post a private match interest from your dashboard.', path: '/dashboard/post-interest', noindex: true })

export default function DashboardPostInterestPage() {
  return (
    <>
      <div className="dashboard-hero"><p className="eyebrow">New interest</p><h1>Post a fresh demand signal.</h1><p>Choose whether your budget is public, hidden, broad or verified privately.</p></div>
      <InterestForm compact />
    </>
  )
}
