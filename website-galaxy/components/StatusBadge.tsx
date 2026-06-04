import type { InterestStatus } from '@/lib/content'

export function StatusBadge({ status }: { status: InterestStatus | string }) {
  return <span className={`status status-${String(status).toLowerCase()}`}>{status}</span>
}
