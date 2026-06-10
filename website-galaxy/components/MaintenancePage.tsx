import type { SiteSettings } from '@/lib/site-settings'
import { site } from '@/lib/site'

export function MaintenancePage({ settings }: { settings: SiteSettings }) {
  return (
    <main className="maintenance-page">
      <section className="maintenance-hero">
        <div className="maintenance-copy">
          <p className="eyebrow">Maintenance</p>
          <h1>{settings.maintenance.title}</h1>
          <p>{settings.maintenance.message}</p>
          <span>{site.product}</span>
        </div>
        <div className="maintenance-photo" aria-hidden="true">
          <img src="/og/private-match-og.png" alt="" width="1200" height="630" />
        </div>
      </section>
    </main>
  )
}
