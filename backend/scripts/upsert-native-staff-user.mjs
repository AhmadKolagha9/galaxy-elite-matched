#!/usr/bin/env node
import process from 'node:process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendRoot = path.resolve(__dirname, '..')
dotenv.config({ path: path.join(backendRoot, '.env') })

const [emailRaw, password, role = 'super_admin', fullName = 'Galaxy Elite Admin'] = process.argv.slice(2)
const email = String(emailRaw || '').trim().toLowerCase()
const allowedRoles = new Set(['admin', 'compliance', 'super_admin'])

if (!email || !password || !allowedRoles.has(role)) {
  console.error('Usage: node scripts/upsert-native-staff-user.mjs <email> <password> <admin|compliance|super_admin> [full-name]')
  process.exit(1)
}

const databaseUrl = process.env.MYSQL_DATABASE_URL || process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('MYSQL_DATABASE_URL or DATABASE_URL is required.')
  process.exit(1)
}

const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12)
const passwordHash = await bcrypt.hash(password, saltRounds)
const connection = await mysql.createConnection({ uri: databaseUrl })

try {
  await connection.beginTransaction()
  await connection.execute(
    `insert into users (email, password_hash, full_name, primary_role, verification_status, email_verification_status, email_verified_at, is_profile_locked)
     values (?, ?, ?, ?, 'verified', 'verified', current_timestamp, false)
     on duplicate key update
       password_hash = values(password_hash),
       full_name = values(full_name),
       primary_role = values(primary_role),
       verification_status = 'verified',
       email_verification_status = 'verified',
       email_verified_at = coalesce(email_verified_at, current_timestamp),
       is_profile_locked = false`,
    [email, passwordHash, fullName, role]
  )
  const [rows] = await connection.execute('select id from users where email = ? limit 1', [email])
  const userId = rows?.[0]?.id
  if (!userId) throw new Error('Could not resolve staff user id after upsert.')

  const roles = role === 'super_admin' ? ['user', 'admin', 'compliance', 'super_admin'] : ['user', role]
  for (const assignedRole of [...new Set(roles)]) {
    await connection.execute(
      `insert into user_roles (user_id, role, assigned_by)
       values (?, ?, ?)
       on duplicate key update role = values(role)`,
      [userId, assignedRole, userId]
    )
  }

  await connection.execute(
    `insert into profiles (user_id, full_name, email, primary_role, verification_level)
     values (?, ?, ?, ?, 'verified')
     on duplicate key update
       full_name = values(full_name),
       email = values(email),
       primary_role = values(primary_role),
       verification_level = 'verified'`,
    [userId, fullName, email, role]
  )

  await connection.commit()
  console.log(`Upserted ${role} staff user ${email}`)
} catch (error) {
  await connection.rollback()
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await connection.end()
}
