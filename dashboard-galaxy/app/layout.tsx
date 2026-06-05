import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://admin.yourpropertymatch.cloud'),
  title: {
    default: 'Galaxy Elite Control Platform',
    template: '%s | Galaxy Elite Control Platform'
  },
  description: 'Closed corporate administration platform for Galaxy Elite Private Match.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      nocache: true
    }
  },
  other: {
    robots: 'noindex, nofollow, noarchive'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#03060b'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
