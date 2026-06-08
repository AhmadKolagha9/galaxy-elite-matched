import { forwardBackendJson } from '../../../_utils'

export const runtime = 'nodejs'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  return forwardBackendJson(`/api/admin/agent-applications/${encodeURIComponent(id)}/review`, {
    method: 'POST',
    body: JSON.stringify(body || {})
  })
}
