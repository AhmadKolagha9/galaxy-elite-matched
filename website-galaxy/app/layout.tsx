import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import './globals.css'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import { MaintenancePage } from '@/components/MaintenancePage'
import { getCurrentUser, isAdminUser } from '@/lib/auth'
import { organizationJsonLd, pageMetadata, websiteJsonLd } from '@/lib/seo'
import { getSiteSettings, getVisibleMainNav, isMaintenanceBypassPath } from '@/lib/site-settings'

export const metadata: Metadata = pageMetadata({
  title: 'Galaxy Elite Private Match',
  description: 'Private property matching without public listings. Public interest, private property, verified match.',
  path: '/'
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#03060b'
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, navItems, requestHeaders, user] = await Promise.all([
    getSiteSettings(),
    getVisibleMainNav(),
    headers(),
    getCurrentUser()
  ])
  const pathname = requestHeaders.get('x-galaxy-pathname') || '/'
  const showMaintenance = settings.maintenance.enabled && !isMaintenanceBypassPath(pathname) && !isAdminUser(user)

  return (
    <html lang="en">
      <body>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        {showMaintenance ? (
          <MaintenancePage settings={settings} />
        ) : (
          <>
            <Header navItems={navItems} />
            <main>{children}</main>
            <Footer />
          </>
        )}
      </body>
    </html>
  )
}
