import crypto from 'crypto'
import { cookies } from 'next/headers'
import { DEMO_COOKIE } from '@/lib/auth-constants'
import { readJson, writeJson } from '@/lib/local-store'

export type AppUser = {
  id: string
  email: string
  name: string
  role: string
  provider: 'demo' | 'supabase' | 'backend'
}

type StoredUser = AppUser & {
  passwordHash: string
  salt: string
  createdAt: string
}

function secret() {
  return process.env.AUTH_SECRET || 'development-only-change-this-secret'
}

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url')
}

function signPayload(payload: string) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
}

function makeId(email: string) {
  return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 20)
}

function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex')
  return { hash, salt }
}

function verifyPassword(password: string, salt: string, hash: string) {
  const attempt = hashPassword(password, salt).hash
  return crypto.timingSafeEqual(Buffer.from(attempt, 'hex'), Buffer.from(hash, 'hex'))
}

export async function registerLocalUser({
  name,
  email,
  password,
  role
}: {
  name: string
  email: string
  password: string
  role: string
}): Promise<AppUser> {
  const normalizedEmail = email.toLowerCase().trim()
  const users = await readJson<StoredUser[]>('users.json', [])
  const existing = users.find((user) => user.email === normalizedEmail)
  if (existing) throw new Error('An account already exists with this email.')

  const { hash, salt } = hashPassword(password)
  const user: StoredUser = {
    id: makeId(normalizedEmail),
    email: normalizedEmail,
    name,
    role,
    provider: 'demo',
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString()
  }
  users.unshift(user)
  await writeJson('users.json', users as unknown as never)
  return { id: user.id, email: user.email, name: user.name, role: user.role, provider: 'demo' }
}

export async function loginLocalUser(email: string, password: string): Promise<AppUser> {
  const normalizedEmail = email.toLowerCase().trim()
  const users = await readJson<StoredUser[]>('users.json', [])
  const user = users.find((item) => item.email === normalizedEmail)
  if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
    throw new Error('Invalid email or password.')
  }
  return { id: user.id, email: user.email, name: user.name, role: user.role, provider: 'demo' }
}

export async function setDemoSession(user: AppUser) {
  const cookieStore = await cookies()
  const payload = base64url(JSON.stringify({ ...user, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 }))
  const signature = signPayload(payload)
  cookieStore.set(DEMO_COOKIE, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })
}

export async function clearDemoSession() {
  const cookieStore = await cookies()
  cookieStore.set(DEMO_COOKIE, '', { path: '/', maxAge: 0 })
}

export async function getDemoUser(): Promise<AppUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(DEMO_COOKIE)?.value
  if (!token) return null

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  if (signPayload(payload) !== signature) return null

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AppUser & { exp: number }
    if (decoded.exp < Date.now()) return null
    return { id: decoded.id, email: decoded.email, name: decoded.name, role: decoded.role, provider: 'demo' }
  } catch {
    return null
  }
}
