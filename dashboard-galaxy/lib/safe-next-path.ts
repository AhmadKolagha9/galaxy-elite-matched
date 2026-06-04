export function safeDashboardNextPath(value: string | null | undefined) {
  const candidate = typeof value === 'string' ? value.trim() : ''
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) return '/'

  try {
    const base = 'https://control.galaxyelite.local'
    const parsed = new URL(candidate, base)
    if (parsed.origin !== base) return '/'

    const nextPath = `${parsed.pathname}${parsed.search}${parsed.hash}`
    if (!nextPath.startsWith('/') || nextPath.startsWith('//')) return '/'
    return nextPath
  } catch {
    return '/'
  }
}
