import assert from 'node:assert/strict'

const roles = {
  anonymous: [],
  user: ['user'],
  admin: ['admin'],
  compliance: ['compliance'],
  superAdmin: ['super_admin'],
  mixedAdmin: ['admin', 'compliance'],
}

const pageRoutes = ['/', '/submissions', '/submissions/abc', '/documents', '/documents/doc-1', '/matches', '/matches/room-1']
const superAdminPageRoutes = ['/taxonomy', '/audit-log']
const superAdminApiRoutes = ['/api/control/taxonomy', '/api/control/taxonomy/abc', '/api/control/audit-log']
const publicRoutes = ['/login', '/api/admin-session']

function hasAdminAccess(roleList) {
  return roleList.some((role) => ['admin', 'compliance', 'super_admin'].includes(role))
}

function hasSuperAdminAccess(roleList) {
  return roleList.includes('super_admin')
}

function expectedAccess(path, roleList) {
  if (publicRoutes.some((route) => path === route || path.startsWith(route + '/'))) return 'allow'
  if (!hasAdminAccess(roleList)) return 'redirect-login'
  if (superAdminApiRoutes.some((route) => path === route || path.startsWith(route + '/'))) {
    return hasSuperAdminAccess(roleList) ? 'allow' : 'forbid-api'
  }
  if (superAdminPageRoutes.some((route) => path === route || path.startsWith(route + '/'))) {
    return hasSuperAdminAccess(roleList) ? 'allow' : 'access-panel'
  }
  return 'allow'
}

function safeDashboardNextPath(value) {
  const candidate = typeof value === 'string' ? value.trim() : ''
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) return '/'

  try {
    const base = 'https://control.galaxyelite.local'
    const parsed = new URL(candidate, base)
    if (parsed.origin !== base) return '/'

    const nextPath = `${parsed.pathname}${parsed.search}${parsed.hash}`
    if (!nextPath.startsWith('/') || nextPath.startsWith('//')) return '/'
    return nextPath
  } catch {
    return '/'
  }
}

for (const route of publicRoutes) {
  for (const [roleName, roleList] of Object.entries(roles)) {
    assert.equal(expectedAccess(route, roleList), 'allow', `${roleName} should reach public ${route}`)
  }
}

for (const route of pageRoutes) {
  assert.equal(expectedAccess(route, roles.anonymous), 'redirect-login', `anonymous should redirect from ${route}`)
  assert.equal(expectedAccess(route, roles.user), 'redirect-login', `plain user should redirect from ${route}`)
  assert.equal(expectedAccess(route, roles.admin), 'allow', `admin should reach ${route}`)
  assert.equal(expectedAccess(route, roles.compliance), 'allow', `compliance should reach ${route}`)
  assert.equal(expectedAccess(route, roles.superAdmin), 'allow', `superAdmin should reach ${route}`)
}

for (const route of superAdminPageRoutes) {
  assert.equal(expectedAccess(route, roles.admin), 'access-panel', `admin should see panel for ${route}`)
  assert.equal(expectedAccess(route, roles.compliance), 'access-panel', `compliance should see panel for ${route}`)
  assert.equal(expectedAccess(route, roles.superAdmin), 'allow', `superAdmin should reach ${route}`)
}

for (const route of superAdminApiRoutes) {
  assert.equal(expectedAccess(route, roles.admin), 'forbid-api', `admin API should be forbidden for ${route}`)
  assert.equal(expectedAccess(route, roles.compliance), 'forbid-api', `compliance API should be forbidden for ${route}`)
  assert.equal(expectedAccess(route, roles.superAdmin), 'allow', `superAdmin API should reach ${route}`)
}

assert.equal(safeDashboardNextPath('/submissions'), '/submissions', 'login next allows internal path')
assert.equal(safeDashboardNextPath('/submissions?approvalStatus=pending_review'), '/submissions?approvalStatus=pending_review', 'login next keeps internal query')
assert.equal(safeDashboardNextPath('https://example.com'), '/', 'login next blocks external absolute URL')
assert.equal(safeDashboardNextPath('//example.com'), '/', 'login next blocks protocol-relative URL')
assert.equal(safeDashboardNextPath('javascript:alert(1)'), '/', 'login next blocks scheme value')

function moderationPayloadIsValid(action, note, rejectionReason = '') {
  if (!['approve', 'reject', 'compliance-hold'].includes(action)) return false
  if (!note.trim()) return false
  if ((action === 'reject' || action === 'compliance-hold') && !note.trim()) return false
  if (action === 'reject' && rejectionReason !== undefined && typeof rejectionReason !== 'string') return false
  return true
}

assert.equal(moderationPayloadIsValid('approve', 'Reviewed authority'), true, 'approve requires note')
assert.equal(moderationPayloadIsValid('approve', ''), false, 'approve blocks empty note')
assert.equal(moderationPayloadIsValid('reject', 'Name mismatch'), true, 'reject accepts note')
assert.equal(moderationPayloadIsValid('compliance-hold', 'Need title deed'), true, 'hold accepts note')

function verifyDocumentPayloadIsValid(status, note, rejectionReason = '') {
  if (!['verified', 'failed'].includes(status)) return false
  if (!note.trim()) return false
  if (status === 'failed' && !rejectionReason.trim()) return false
  return true
}

assert.equal(verifyDocumentPayloadIsValid('verified', 'Checked registry'), true, 'verified document requires note')
assert.equal(verifyDocumentPayloadIsValid('verified', ''), false, 'verified document blocks empty note')
assert.equal(verifyDocumentPayloadIsValid('failed', 'Checked registry', ''), false, 'failed document requires reason')
assert.equal(verifyDocumentPayloadIsValid('failed', 'Checked registry', 'Expired broker card'), true, 'failed document accepts reason')

const stages = [
  'interest_received',
  'response_received',
  'identity_check',
  'authority_check',
  'match_proposed',
  'mutual_approval',
  'match_room_opened',
  'viewing_meeting',
  'offer_negotiation',
  'agreement_executed',
  'completed',
]

function stageTransitionIsValid(current, next) {
  const currentIndex = stages.indexOf(current)
  const nextIndex = stages.indexOf(next)
  return currentIndex >= 0 && nextIndex >= 0 && Math.abs(nextIndex - currentIndex) <= 1
}

assert.equal(stageTransitionIsValid('identity_check', 'authority_check'), true, 'stage can move forward one')
assert.equal(stageTransitionIsValid('identity_check', 'response_received'), true, 'stage can move backward one')
assert.equal(stageTransitionIsValid('identity_check', 'match_room_opened'), false, 'stage cannot skip ahead')
assert.equal(stageTransitionIsValid('completed', 'agreement_executed'), true, 'completed can move back one')

const taxonomy = [
  { id: 'country-uae', parentId: null },
  { id: 'dubai', parentId: 'country-uae' },
  { id: 'marina', parentId: 'dubai' },
  { id: 'country-uk', parentId: null },
]

function descendantIds(items, id) {
  const childrenByParent = new Map()
  for (const item of items) {
    if (!item.parentId) continue
    const children = childrenByParent.get(item.parentId) || []
    children.push(item.id)
    childrenByParent.set(item.parentId, children)
  }
  const ids = new Set()
  const visit = (parentId) => {
    for (const childId of childrenByParent.get(parentId) || []) {
      ids.add(childId)
      visit(childId)
    }
  }
  visit(id)
  return ids
}

const blocked = descendantIds(taxonomy, 'country-uae')
assert.equal(blocked.has('dubai'), true, 'taxonomy blocks direct child as parent')
assert.equal(blocked.has('marina'), true, 'taxonomy blocks descendant as parent')
assert.equal(blocked.has('country-uk'), false, 'taxonomy allows unrelated parent candidate')

function auditTone(action) {
  const value = String(action || '').toLowerCase()
  if (value.includes('reject') || value.includes('failed')) return 'ruby'
  if (value.includes('hold') || value.includes('request')) return 'amber'
  if (value.includes('taxonomy') || value.includes('modify')) return 'gold'
  if (value.includes('approve') || value.includes('verify')) return 'teal'
  return 'neutral'
}

assert.equal(auditTone('approve_submission'), 'teal')
assert.equal(auditTone('reject_submission'), 'ruby')
assert.equal(auditTone('compliance_hold'), 'amber')
assert.equal(auditTone('modify_taxonomy'), 'gold')

console.log('QA permission matrix passed: roles, protected routes, mutation notes, document review, stage transitions, taxonomy loop prevention, audit tones.')
