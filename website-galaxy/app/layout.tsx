import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import { organizationJsonLd, pageMetadata, websiteJsonLd } from '@/lib/seo'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
