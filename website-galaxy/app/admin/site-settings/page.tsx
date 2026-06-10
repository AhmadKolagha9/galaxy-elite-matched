import type { Metadata } from 'next'
import { SiteSettingsForm } from '@/components/SiteSettingsForm'
import { pageMetadata } from '@/lib/seo'
import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({ title: 'Site Settings', description: 'Manage website sections and maintenance mode.', path: '/admin/site-settings', noindex: true })

export default async function AdminSiteSettingsPage() {
  const settings = await getSiteSettings()
  return (
    <>
      <div className="dashboard-hero admin-hero">
        <p className="eyebrow">Site settings</p>
        <h1>Control public sections and maintenance mode.</h1>
        <p>Hide header tabs without deleting routes, and close the public website for maintenance while keeping admin access available.</p>
      </div>
      <SiteSettingsForm initialSettings={settings} />
    </>
  )
}
