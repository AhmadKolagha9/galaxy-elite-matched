import { forwardBackendJson } from '@/app/api/admin/compliance/_utils'

export const runtime = 'nodejs'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = await request.text()
  return forwardBackendJson(`/api/admin/interest-match-requests/${encodeURIComponent(id)}`, { method: 'PATCH', body })
}
