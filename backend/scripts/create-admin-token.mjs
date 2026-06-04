import crypto from 'node:crypto'
import process from 'node:process'

import dotenv from 'dotenv'

dotenv.config()

const [subject, email, role = 'admin'] = process.argv.slice(2)
const secret = process.env.AUTH_JWT_SECRET

if (!secret) {
  console.error('AUTH_JWT_SECRET is required to sign backend admin tokens.')
  process.exit(1)
}

if (!subject || !email) {
  console.error('Usage: npm run auth:token -- <user-id> <email> <admin|compliance|super_admin>')
  process.exit(1)
}

const allowedRoles = new Set(['admin', 'compliance', 'super_admin'])
if (!allowedRoles.has(role)) {
  console.error('role must be one of: admin, compliance, super_admin')
  process.exit(1)
}

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
const now = Math.floor(Date.now() / 1000)
const header = encode({ alg: 'HS256', typ: 'JWT' })
const payload = encode({ sub: subject, email, roles: [role], role, iat: now, exp: now + 60 * 60 * 8, verification_level: 'verified' })
const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url')
console.log(`${header}.${payload}.${signature}`)
