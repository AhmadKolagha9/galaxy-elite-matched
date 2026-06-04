import crypto from 'crypto'
import { cookies } from 'next/headers'
import { BACKEND_AUTH_COOKIE } from '@/lib/auth-constants'
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
  return token ? readBackendJwtPayload(token) : null
}

export async function getBackendUser(): Promise<AppUser | null> {
  const token = await getBackendAuthToken()
  if (!token) return null

  const payload = readBackendJwtPayload(token)
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
