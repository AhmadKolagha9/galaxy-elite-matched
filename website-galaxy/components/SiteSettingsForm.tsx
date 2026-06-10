'use client'

import { useState } from 'react'
import type { HeaderSectionKey, SiteSettings } from '@/lib/site-settings-shared'
import { headerSectionLabels } from '@/lib/site-settings-shared'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const sectionKeys = Object.keys(headerSectionLabels) as HeaderSectionKey[]

export function SiteSettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
  const [settings, setSettings] = useState(initialSettings)
  const [state, setState] = useState<SaveState>('idle')
  const [message, setMessage] = useState('')

  function setMaintenance<K extends keyof SiteSettings['maintenance']>(key: K, value: SiteSettings['maintenance'][K]) {
    setSettings((current) => ({ ...current, maintenance: { ...current.maintenance, [key]: value } }))
  }

  function setNavigation(key: HeaderSectionKey, value: boolean) {
    setSettings((current) => ({ ...current, navigation: { ...current.navigation, [key]: value } }))
  }

  async function save() {
    setState('saving')
    setMessage('')
    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(settings)
      })
      const body = await response.json().catch(() => null) as { ok?: boolean; settings?: SiteSettings; message?: string; error?: string } | null
      if (!response.ok || !body?.ok || !body.settings) throw new Error(body?.error || body?.message || 'Could not save site settings.')
      setSettings(body.settings)
      setState('saved')
      setMessage(body.message || 'Site settings updated.')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Could not save site settings.')
    }
  }

  return (
    <div className="site-settings-grid">
      <section className="admin-card site-settings-card">
        <div className="section-heading-inline">
          <div>
            <p className="eyebrow">Maintenance</p>
            <h2>Website service state</h2>
          </div>
          <label className="settings-toggle">
            <input type="checkbox" checked={settings.maintenance.enabled} onChange={(event) => setMaintenance('enabled', event.target.checked)} />
            <span>{settings.maintenance.enabled ? 'Maintenance on' : 'Website live'}</span>
          </label>
        </div>
        <label>Maintenance title<input value={settings.maintenance.title} onChange={(event) => setMaintenance('title', event.target.value)} maxLength={120} /></label>
        <label>Maintenance message<textarea rows={4} value={settings.maintenance.message} onChange={(event) => setMaintenance('message', event.target.value)} maxLength={400} /></label>
        {settings.maintenance.updatedAt ? <p className="form-note">Last updated {new Date(settings.maintenance.updatedAt).toLocaleString()}</p> : null}
      </section>

      <section className="admin-card site-settings-card">
        <p className="eyebrow">Header sections</p>
        <h2>Show or hide public tabs</h2>
        <div className="settings-toggle-list">
          {sectionKeys.map((key) => (
            <label className="settings-toggle-row" key={key}>
              <span>{headerSectionLabels[key]}</span>
              <input type="checkbox" checked={settings.navigation[key]} onChange={(event) => setNavigation(key, event.target.checked)} />
            </label>
          ))}
        </div>
      </section>

      <div className="site-settings-actions">
        <button className="button button-gold" type="button" onClick={save} disabled={state === 'saving'}>{state === 'saving' ? 'Saving...' : 'Save Site Settings'}</button>
        {message ? <p className={state === 'error' ? 'form-error' : 'form-status form-status-success'}>{message}</p> : null}
      </div>
    </div>
  )
}
