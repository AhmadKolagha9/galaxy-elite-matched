import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_SESSION_COOKIE, hasAdminAccess, hasSuperAdminAccess, verifyAdminTokenWithBackend, type AdminRole } from '@/lib/admin-auth'

export type AppUser = {
  id: string
  email: string
  name: string
  role: AdminRole
  roles: AdminRole[]
  provider: 'backend-jwt' | 'demo'
}

function loginRedirect(path = '/'): never {
  redirect('/login?next=' + encodeURIComponent(path))
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const cookieStore = await cookies()
  const idToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  if (!idToken) return null

  const session = await verifyAdminTokenWithBackend(idToken)
  if (!session) return null

  return {
    id: session.uid,
    email: session.email || 'admin@galaxyelite.local',
    name: session.email?.split('@')[0] || 'Control User',
    role: session.roles[0] || 'admin',
    roles: session.roles,
    provider: 'backend-jwt'
  }
}

export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser()
  if (!user) loginRedirect('/')
  return user
}

export function isAdminUser(user: AppUser | null) {
  return Boolean(user && hasAdminAccess({ uid: user.id, email: user.email, roles: user.roles, claims: {} }))
}

export async function requireAdmin(): Promise<AppUser> {
  const user = await requireUser()
  if (!isAdminUser(user)) loginRedirect('/')
  return user
}

export async function requireSuperAdmin(): Promise<AppUser> {
  const user = await requireAdmin()
  if (!hasSuperAdminAccess({ uid: user.id, email: user.email, roles: user.roles, claims: {} })) redirect('/')
  return user
}

export async function registerAction() {
  'use server'
  redirect('/login')
}

export async function loginAction() {
  'use server'
  redirect('/login')
}

export async function logoutAction() {
  'use server'
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  redirect('/login')
}
