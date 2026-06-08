import { forwardBackendJson } from '../_utils'

export const runtime = 'nodejs'

export async function GET() {
  return forwardBackendJson('/api/admin/agent-applications')
}
