'use client'

import { useEffect, useMemo, useState } from 'react'
import { countryScopeFromSelected, fallbackAreas, fallbackCountries, type TaxonomyItem } from '@/lib/investor-post-submission'

async function fetchTaxonomy(type: string, countryScope?: string | null) {
  const params = new URLSearchParams({ type })
  if (countryScope) params.set('country_scope', countryScope)
  const response = await fetch(`/api/taxonomy?${params.toString()}`)
  if (!response.ok) throw new Error('Taxonomy request failed.')
  const body = (await response.json()) as { items?: TaxonomyItem[] }
  return body.items ?? []
}

export function useInvestorTaxonomy() {
  const [countries, setCountries] = useState<TaxonomyItem[]>(fallbackCountries)
  const [areas, setAreas] = useState<TaxonomyItem[]>(fallbackAreas)
  const [selectedCountries, setSelectedCountries] = useState<string[]>([fallbackCountries[0]?.slug ?? 'uae'])

  const countryScope = useMemo(() => countryScopeFromSelected(selectedCountries), [selectedCountries])
  const filteredAreas = useMemo(
    () => areas.filter((area) => !countryScope || area.countryScope === null || area.countryScope === countryScope),
    [areas, countryScope]
  )

  useEffect(() => {
    let active = true
    fetchTaxonomy('country')
      .then((items) => {
        if (!active || !items.length) return
        const normalized = items.map((item) => ({ ...item, countryScope: item.countryScope ?? null }))
        setCountries(normalized)
        setSelectedCountries([normalized[0]?.slug ?? normalized[0]?.label ?? 'uae'])
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchTaxonomy('area_city', countryScope)
      .then((items) => {
        if (!active || !items.length) return
        setAreas(items.map((item) => ({ ...item, countryScope: item.countryScope ?? null })))
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [countryScope])

  const toggleCountry = (country: string, checked: boolean) => {
    setSelectedCountries((current) => {
      const next = checked ? Array.from(new Set([...current, country])) : current.filter((item) => item !== country)
      return next.length ? next : [fallbackCountries[0]?.slug ?? 'uae']
    })
  }

  return { countries, selectedCountries, toggleCountry, filteredAreas, countryScope }
}
