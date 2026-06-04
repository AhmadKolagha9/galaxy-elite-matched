import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Galaxy Elite Private Match',
    short_name: 'GE Private Match',
    description: 'Public Interest. Private Property. Verified Match.',
    start_url: '/',
    display: 'standalone',
    background_color: '#03060b',
    theme_color: '#03060b',
    icons: [
      { src: '/icons/icon-256.png', sizes: '256x256', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
}
