export const ADMIN_SESSION_COOKIE = 'gepm_admin_id_token'

export type AdminRole = 'admin' | 'compliance' | 'super_admin'

export type VerifiedAdminSession = {
  uid: string
  email?: string
  roles: AdminRole[]
  claims: Record<string, unknown>
}

type BackendProfileResponse = {
  ok?: boolean
  user?: {
    id?: string
    email?: string
    roles?: unknown
    primaryRole?: string
    customClaims?: Record<string, unknown>
  }
}

const allowedRoles = new Set<AdminRole>(['admin', 'compliance', 'super_admin'])

function backendBaseUrl() {
  return (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4000').replace(/\/$/, '')
}

export function adminDashboardOrigin() {
  const origin = process.env.ADMIN_DASHBOARD_ORIGIN || process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_ORIGIN || 'https://control.galaxyelite.ae'
  if (origin === '*') throw new Error('ADMIN_DASHBOARD_ORIGIN cannot be a wildcard.')
  return origin
}

export function adminAuthVerifyPath() {
  return process.env.ADMIN_AUTH_VERIFY_PATH || '/api/profile/me'
}

export function normalizeAdminRole(value: unknown): AdminRole | null {
  const role = String(value || '').trim()
  const normalized = role === 'superAdmin' ? 'super_admin' : role
  return allowedRoles.has(normalized as AdminRole) ? (normalized as AdminRole) : null
}

function rolesFromClaims(claims: Record<string, unknown>) {
  const roles = new Set<AdminRole>()
  if (claims.admin === true) roles.add('admin')
  if (claims.compliance === true) roles.add('compliance')
  if (claims.superAdmin === true || claims.super_admin === true) roles.add('super_admin')
  if (Array.isArray(claims.roles)) {
    claims.roles.forEach((role) => {
      const normalized = normalizeAdminRole(role)
      if (normalized) roles.add(normalized)
    })
  }
  const role = normalizeAdminRole(claims.role)
  if (role) roles.add(role)
  return roles
}

export function hasAdminAccess(session: VerifiedAdminSession | null) {
  return Boolean(session?.roles.some((role) => allowedRoles.has(role)))
}

export function hasSuperAdminAccess(session: VerifiedAdminSession | null) {
  return Boolean(session?.roles.includes('super_admin'))
}

export async function verifyAdminTokenWithBackend(idToken: string): Promise<VerifiedAdminSession | null> {
  if (!idToken) return null

  const response = await fetch(`${backendBaseUrl()}${adminAuthVerifyPath()}`, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${idToken}`,
      origin: adminDashboardOrigin()
    },
    cache: 'no-store'
  })

  if (!response.ok) return null

  const body = (await response.json().catch(() => null)) as BackendProfileResponse | null
  const user = body?.user
  if (!user) return null

  const claims = user.customClaims || {}
  const roles = new Set<AdminRole>()
  if (Array.isArray(user.roles)) {
    user.roles.forEach((role) => {
      const normalized = normalizeAdminRole(role)
      if (normalized) roles.add(normalized)
    })
  }
  const primaryRole = normalizeAdminRole(user.primaryRole)
  if (primaryRole) roles.add(primaryRole)
  rolesFromClaims(claims).forEach((role) => roles.add(role))

  const session = {
    uid: user.id || '',
    email: user.email,
    roles: Array.from(roles),
    claims
  }

  return session.uid && hasAdminAccess(session) ? session : null
}
