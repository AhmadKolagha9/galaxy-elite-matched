#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const strict = process.argv.includes('--strict')
const root = process.cwd()
const checks = []

function add(name, ok, detail) {
  checks.push({ name, ok, detail })
}

function envPresent(name) {
  return Boolean(process.env[name] && !['change-me', 'change-me-webhook-secret', 'your-auth-jwt-secret'].includes(process.env[name]))
}

const requiredBackendEnv = ['MYSQL_DATABASE_URL', 'AUTH_JWT_SECRET', 'PRIVATE_DOCUMENT_BUCKET', 'CORS_ORIGIN']
const requiredDashboardEnv = ['BACKEND_API_URL', 'ADMIN_DASHBOARD_ORIGIN']

for (const name of requiredBackendEnv) add(`backend env ${name}`, envPresent(name), process.env[name] ? 'present' : 'missing')
for (const name of requiredDashboardEnv) add(`dashboard env ${name}`, envPresent(name), process.env[name] ? 'present' : 'missing')

const forbiddenDashboardRoutes = [
  'admin', 'dashboard', 'for-agents', 'for-developers', 'for-landlords', 'for-owners', 'india', 'interest-board', 'investor-post', 'market-pulse', 'post-interest', 'privacy', 'private-availability', 'private-match', 'register', 'terms', 'uae', 'uk', 'verified-listing'
]
for (const route of forbiddenDashboardRoutes) {
  add(`isolated dashboard route removed: /${route}`, !fs.existsSync(path.join(root, 'dashboard-galaxy', 'app', route)), 'route directory check')
}

const forbiddenDashboardApiRoutes = ['agent', 'availability', 'interest', 'investor-post', 'newsletter', 'verified-listing']
for (const route of forbiddenDashboardApiRoutes) {
  add(`isolated dashboard public api removed: /api/${route}`, !fs.existsSync(path.join(root, 'dashboard-galaxy', 'app', 'api', route)), 'api directory check')
}

const requiredDashboardRoutes = ['login', 'submissions', 'documents', 'matches', 'taxonomy', 'audit-log']
for (const route of requiredDashboardRoutes) {
  add(`isolated dashboard required route exists: /${route}`, fs.existsSync(path.join(root, 'dashboard-galaxy', 'app', route)), 'route directory check')
}

const packageChecks = [
  ['dashboard permission qa script', path.join(root, 'dashboard-galaxy', 'scripts', 'qa-permissions.mjs')],
  ['backend admin token helper', path.join(root, 'backend', 'scripts', 'create-admin-token.mjs')],
  ['qa report', path.join(root, 'dashboard-galaxy', 'docs', 'QA_ROLE_PERMISSION_REPORT.md')]
]
for (const [name, file] of packageChecks) add(name, fs.existsSync(file), file)

const failed = checks.filter((check) => !check.ok)
for (const check of checks) console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.name} - ${check.detail}`)
console.log(`\n${checks.length - failed.length}/${checks.length} readiness checks passed.`)

if (failed.length) {
  console.log('\nHard blockers remain:')
  for (const check of failed) console.log(`- ${check.name}`)
  if (strict) process.exit(1)
}
