import type { Metadata } from 'next'
import { VerifiedListingForm } from '@/components/VerifiedListingForm'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({ title: 'Dashboard Verified Listing Request', description: 'Submit a verified listing request from your member dashboard.', path: '/dashboard/verified-listing', noindex: true })

export default function DashboardVerifiedListingPage() {
  return (
    <>
      <div className="dashboard-hero"><p className="eyebrow">Verified Listing</p><h1>Submit property for strict verification.</h1><p>Documents are reviewed by Galaxy Elite before any property can be marked as verified or listed.</p></div>
      <VerifiedListingForm />
    </>
  )
}
