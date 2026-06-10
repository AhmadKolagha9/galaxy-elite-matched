import { readJson, writeJson } from '@/lib/local-store'
import { mainNav } from '@/lib/site'
import type { HeaderSectionKey, SiteSettings } from '@/lib/site-settings-shared'
export { headerSectionLabels } from '@/lib/site-settings-shared'
export type { HeaderSectionKey, SiteSettings } from '@/lib/site-settings-shared'

const settingsFile = 'site-settings.json'

export const defaultSiteSettings: SiteSettings = {
  maintenance: {
    enabled: false,
    title: 'Private Match is being refined.',
    message: 'We are improving the member experience. Please check back shortly.',
    updatedAt: null
  },
  navigation: {
    'private-club': true,
    'interest-board': true,
    'private-opportunities': true,
    'market-pulse': true,
    submit: true
  }
}

function sectionKeyFromHref(href: string): HeaderSectionKey | null {
  const slug = href.replace(/^\//, '').split('?')[0]
  return Object.prototype.hasOwnProperty.call(defaultSiteSettings.navigation, slug) ? slug as HeaderSectionKey : null
}

export function cleanSiteSettings(value: Partial<SiteSettings> | null | undefined): SiteSettings {
  const navigation = { ...defaultSiteSettings.navigation }
  const rawNavigation = value?.navigation && typeof value.navigation === 'object' ? value.navigation as Partial<Record<HeaderSectionKey, unknown>> : {}
  ;(Object.keys(navigation) as HeaderSectionKey[]).forEach((key) => {
    if (typeof rawNavigation[key] === 'boolean') navigation[key] = rawNavigation[key]
  })

  const maintenance = value?.maintenance && typeof value.maintenance === 'object' ? value.maintenance as Partial<SiteSettings['maintenance']> : {}
  return {
    maintenance: {
      enabled: typeof maintenance.enabled === 'boolean' ? maintenance.enabled : defaultSiteSettings.maintenance.enabled,
      title: typeof maintenance.title === 'string' && maintenance.title.trim() ? maintenance.title.trim().slice(0, 120) : defaultSiteSettings.maintenance.title,
      message: typeof maintenance.message === 'string' && maintenance.message.trim() ? maintenance.message.trim().slice(0, 400) : defaultSiteSettings.maintenance.message,
      updatedAt: typeof maintenance.updatedAt === 'string' ? maintenance.updatedAt : null
    },
    navigation
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const stored = await readJson<Partial<SiteSettings>>(settingsFile, defaultSiteSettings)
  return cleanSiteSettings(stored)
}

export async function saveSiteSettings(next: SiteSettings): Promise<SiteSettings> {
  const clean = cleanSiteSettings({
    ...next,
    maintenance: { ...next.maintenance, updatedAt: new Date().toISOString() }
  })
  await writeJson(settingsFile, clean as unknown as never)
  return clean
}

export async function getVisibleMainNav() {
  const settings = await getSiteSettings()
  return mainNav.filter((item) => {
    const key = sectionKeyFromHref(item.href)
    return !key || settings.navigation[key]
  })
}

export function filterNavigationWithSettings(settings: SiteSettings, items: typeof mainNav) {
  return items.filter((item) => {
    const key = sectionKeyFromHref(item.href)
    return !key || settings.navigation[key]
  })
}

export function isMaintenanceBypassPath(pathname: string) {
  return pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname === '/favicon.ico' || pathname === '/robots.txt' || pathname === '/sitemap.xml'
}
