import crypto from 'crypto'
import { cookies } from 'next/headers'
import { BACKEND_AUTH_COOKIE } from '@/lib/auth-constants'
import { getBackendApiUrl } from '@/lib/backend-api'
import type { AppUser } from '@/lib/demo-auth'

export type BackendJwtPayload = {
  sub?: string
  email?: string
  role?: string
  primary_role?: string
  roles?: string[]
  verification_level?: string
  verification_status?: string
  verification_review_note?: string
  review_note?: string
  exp?: number
}

type BackendProfileResponse = {
  ok?: boolean
  user?: {
    id?: string
    email?: string
    roles?: string[]
    primaryRole?: string
    primary_role?: string
    verificationLevel?: string
    verification_level?: string
    customClaims?: Record<string, unknown>
  }
}

export type BackendVerificationState = 'unverified' | 'under_review' | 'action_required' | 'verified' | 'unknown'

function base64UrlDecode(value: string) {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

function verifySignature(token: string, secret: string) {
  const [header, payload, signature] = token.split('.')
  if (!header || !payload || !signature) return false
  const expected = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url')
  return timingSafeEqual(expected, signature)
}

export function readBackendJwtPayload(token: string): BackendJwtPayload | null {
  const [encodedHeader, encodedPayload] = token.split('.')
  if (!encodedHeader || !encodedPayload) return null

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader).toString('utf8')) as { alg?: string }
    if (header.alg !== 'HS256') return null

    const secret = process.env.AUTH_JWT_SECRET
    if (!secret || !verifySignature(token, secret)) return null

    const payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8')) as BackendJwtPayload
    if (!payload.sub || !payload.email) return null
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

function readBackendJwtPayloadWithoutLocalSecret(token: string): BackendJwtPayload | null {
  const [encodedHeader, encodedPayload] = token.split('.')
  if (!encodedHeader || !encodedPayload) return null

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader).toString('utf8')) as { alg?: string }
    if (header.alg !== 'HS256') return null

    const payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8')) as BackendJwtPayload
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

async function getValidatedBackendJwtPayloadFromToken(token: string): Promise<BackendJwtPayload | null> {
  const decoded = readBackendJwtPayload(token) || readBackendJwtPayloadWithoutLocalSecret(token)
  if (!decoded) return null

  const response = await fetch(`${getBackendApiUrl()}/api/profile/me`, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
      origin: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourpropertymatch.cloud'
    },
    cache: 'no-store'
  }).catch(() => null)

  if (!response?.ok) return null

  const body = (await response.json().catch(() => null)) as BackendProfileResponse | null
  const user = body?.user
  if (!body?.ok || !user?.id || !user.email) return null

  const claims = user.customClaims || {}
  const roles = stringArray(user.roles).length ? stringArray(user.roles) : stringArray(claims.roles)
  const primaryRole = user.primaryRole || user.primary_role || stringValue(claims.primary_role) || stringValue(claims.role) || roles[0] || 'user'
  const verificationLevel = user.verificationLevel || user.verification_level || stringValue(claims.verification_level) || decoded.verification_level || 'unverified'

  return {
    sub: user.id,
    email: user.email,
    roles: Array.from(new Set([...roles, primaryRole])),
    role: primaryRole,
    primary_role: primaryRole,
    verification_level: verificationLevel,
    verification_status: stringValue(claims.verification_status) || decoded.verification_status || verificationLevel,
    verification_review_note: stringValue(claims.verification_review_note) || decoded.verification_review_note,
    review_note: stringValue(claims.review_note) || decoded.review_note,
    exp: decoded.exp
  }
}

export async function getBackendAuthToken() {
  const cookieStore = await cookies()
  return cookieStore.get(BACKEND_AUTH_COOKIE)?.value || null
}

export function getVerificationState(payload: BackendJwtPayload | null | undefined): BackendVerificationState {
  const status = payload?.verification_status || payload?.verification_level
  if (status === 'unverified' || status === 'under_review' || status === 'action_required' || status === 'verified') return status
  return 'unknown'
}

export function getVerificationReviewNote(payload: BackendJwtPayload | null | undefined) {
  return payload?.verification_review_note || payload?.review_note || ''
}

export function getNativeRoles(payload: BackendJwtPayload | null | undefined) {
  const roles = Array.isArray(payload?.roles) ? payload.roles : []
  const primary = payload?.primary_role || payload?.role
  return Array.from(new Set([...roles, primary].filter((role): role is string => Boolean(role))))
}

export function hasComplianceRole(payload: BackendJwtPayload | null | undefined) {
  const roles = getNativeRoles(payload)
  return roles.includes('compliance') || roles.includes('super_admin')
}

export function hasPlatformStaffRole(payload: BackendJwtPayload | null | undefined) {
  const roles = getNativeRoles(payload)
  return roles.includes('admin') || roles.includes('compliance') || roles.includes('super_admin')
}

export async function getBackendJwtPayloadFromCookie() {
  const token = await getBackendAuthToken()
  return token ? getValidatedBackendJwtPayloadFromToken(token) : null
}

export async function getBackendUser(): Promise<AppUser | null> {
  const payload = await getBackendJwtPayloadFromCookie()
  if (!payload?.sub || !payload.email) return null

  const role = payload.primary_role || payload.role || payload.roles?.[0] || 'user'
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.email.split('@')[0],
    role,
    provider: 'backend'
  }
}

export async function clearBackendSession() {
  const cookieStore = await cookies()
  cookieStore.set(BACKEND_AUTH_COOKIE, '', { path: '/', maxAge: 0 })
}
