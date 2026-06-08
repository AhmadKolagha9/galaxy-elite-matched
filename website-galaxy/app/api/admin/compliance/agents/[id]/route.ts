import { forwardBackendJson } from '../../_utils'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return forwardBackendJson(`/api/admin/agent-applications/${encodeURIComponent(id)}`)
}
