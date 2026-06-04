#!/usr/bin/env node
import process from 'node:process'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const [, , uidOrEmail, role] = process.argv
const allowed = new Set(['admin', 'compliance', 'superAdmin'])

if (!uidOrEmail || !allowed.has(role)) {
  console.error('Usage: node scripts/set-firebase-admin-claims.mjs <uid-or-email> <admin|compliance|superAdmin>')
  process.exit(1)
}

function serviceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) return undefined
  try {
    return JSON.parse(raw)
  } catch (error) {
    console.error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.')
    process.exit(1)
  }
}

if (!getApps().length) {
  const account = serviceAccount()
  initializeApp(account ? { credential: cert(account), projectId: process.env.FIREBASE_PROJECT_ID } : { projectId: process.env.FIREBASE_PROJECT_ID })
}

const auth = getAuth()
const user = uidOrEmail.includes('@') ? await auth.getUserByEmail(uidOrEmail) : await auth.getUser(uidOrEmail)
const claims = {
  admin: role === 'admin',
  compliance: role === 'compliance',
  superAdmin: role === 'superAdmin',
  super_admin: role === 'superAdmin',
  roles: role === 'superAdmin' ? ['super_admin'] : [role]
}

await auth.setCustomUserClaims(user.uid, claims)
console.log(`Set ${role} claims for ${user.email || user.uid}`)
console.log('Ask the user to sign out/in or refresh their ID token before testing.')
