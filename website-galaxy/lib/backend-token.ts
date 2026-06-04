import crypto from 'crypto'
import type { AppUser } from '@/lib/demo-auth'

const roleMap: Record<string, string> = {
  buyer: 'buyer',
  tenant: 'tenant',
  investor: 'investor',
  owner: 'owner',
  landlord: 'landlord',
  developer: 'developer',
  agent: 'agent',
  'property manager': 'property_manager',
  representative: 'representative',
  admin: 'admin'
}

function backendJwtSecret() {
  return process.env.AUTH_JWT_SECRET || process.env.BACKEND_AUTH_JWT_SECRET || ''
}

function encode(value: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

export function createBackendUserToken(user: AppUser) {
  const secret = backendJwtSecret()
  if (!secret) throw new Error('AUTH_JWT_SECRET is required to sign backend user tokens.')

  const now = Math.floor(Date.now() / 1000)
  const normalizedRole = roleMap[user.role.toLowerCase()] || 'user'
  const header = encode({ alg: 'HS256', typ: 'JWT' })
  const payload = encode({
    sub: user.id,
    email: user.email,
    roles: [normalizedRole],
    role: normalizedRole,
    name: user.name,
    provider: user.provider,
    verification_level: 'unverified',
    iat: now,
    exp: now + 60 * 30
  })
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url')
  return `${header}.${payload}.${signature}`
}

