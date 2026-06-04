import { forwardBackendJson } from '../../../_utils'

export const runtime = 'nodejs'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  return forwardBackendJson(`/api/admin/users/${encodeURIComponent(id)}/verify-identity`, {
    method: 'POST',
    body: JSON.stringify(body || {})
  })
}
