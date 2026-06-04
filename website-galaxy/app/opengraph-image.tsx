import { ImageResponse } from 'next/og'
import { site } from '@/lib/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 72, background: 'linear-gradient(135deg, #08111f, #142235)', color: 'white' }}>
      <div style={{ color: '#e9d39a', fontSize: 28, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 28 }}>{site.company}</div>
      <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.02, letterSpacing: -3, maxWidth: 980 }}>Private property matching without public listings.</div>
      <div style={{ marginTop: 34, color: '#e9d39a', fontSize: 34, fontWeight: 800 }}>{site.tagline}</div>
    </div>,
    size
  )
}
