import { redirect } from 'next/navigation'
import { clearDemoSession, getDemoUser, loginLocalUser, registerLocalUser, setDemoSession, type AppUser } from '@/lib/demo-auth'
import { isSupabaseConfigured } from '@/lib/env'
import { clearBackendSession, getBackendJwtPayloadFromCookie, getBackendUser, hasPlatformStaffRole } from '@/lib/native-session'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function field(formData: FormData, name: string) {
  return String(formData.get(name) || '').trim()
}

function authError(path: string, message: string) {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const backendUser = await getBackendUser()
  if (backendUser) return backendUser

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase.auth.getUser()
    const user = data.user
    if (!user?.email) return null
    return {
      id: user.id,
      email: user.email,
      name: String(user.user_metadata?.name || user.email.split('@')[0]),
      role: String(user.user_metadata?.role || 'Member'),
      provider: 'supabase'
    }
  }
  return getDemoUser()
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/dashboard')
  return user
}

function adminEmails() {
  return (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminUser(user: AppUser | null) {
  if (!user) return false
  const allowedEmails = adminEmails()
  return ['admin', 'compliance', 'super_admin'].includes(user.role.toLowerCase()) || allowedEmails.includes(user.email.toLowerCase())
}

export async function requireAdmin() {
  const user = await requireUser()
  const payload = user.provider === 'backend' ? await getBackendJwtPayloadFromCookie() : null
  if (user.provider === 'backend' && !hasPlatformStaffRole(payload)) redirect('/dashboard?error=Admin access required')
  if (user.provider !== 'backend' && !isAdminUser(user)) redirect('/dashboard?error=Admin access required')
  return user
}

export async function loginAction(formData: FormData) {
  'use server'
  const email = field(formData, 'email').toLowerCase()
  const password = field(formData, 'password')
  if (!email || !password) authError('/login', 'Enter your email and password.')

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) authError('/login', error.message)
    redirect('/dashboard')
  }

  try {
    const user = await loginLocalUser(email, password)
    await setDemoSession(user)
  } catch (error) {
    authError('/login', error instanceof Error ? error.message : 'Invalid login.')
  }
  redirect('/dashboard')
}

export async function registerAction(formData: FormData) {
  'use server'
  const name = field(formData, 'name')
  const email = field(formData, 'email').toLowerCase()
  const password = field(formData, 'password')
  const role = field(formData, 'role') || 'Buyer'

  if (!name || !email || !password) authError('/register', 'Complete all required fields.')
  if (password.length < 8) authError('/register', 'Password must be at least 8 characters.')

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    })
    if (error) authError('/register', error.message)
    if (!data.session) redirect('/login?notice=Check your email to confirm your account, then sign in.')
    redirect('/dashboard?welcome=1')
  }

  try {
    const user = await registerLocalUser({ name, email, password, role })
    await setDemoSession(user)
  } catch (error) {
    authError('/register', error instanceof Error ? error.message : 'Could not create account.')
  }
  redirect('/dashboard?welcome=1')
}

export async function logoutAction() {
  'use server'
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
  }
  await clearBackendSession()
  await clearDemoSession()
  redirect('/')
}
