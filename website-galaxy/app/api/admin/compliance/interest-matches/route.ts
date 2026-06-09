import { forwardBackendJson } from '@/app/api/admin/compliance/_utils'

export const runtime = 'nodejs'

export async function GET() {
  return forwardBackendJson('/api/admin/interest-match-requests')
}
