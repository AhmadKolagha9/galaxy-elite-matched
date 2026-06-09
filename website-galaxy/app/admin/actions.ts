'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { updateSubmissionDecision, type CollectionKey } from '@/lib/admin-store'

function value(formData: FormData, name: string) {
  return String(formData.get(name) || '').trim()
}

export async function adminDecisionAction(formData: FormData) {
  await requireAdmin()
  const collection = value(formData, 'collection') as CollectionKey
  const id = value(formData, 'id')
  const approvalStatus = value(formData, 'approvalStatus') || 'pending'
  const publicStatus = value(formData, 'publicStatus') || 'Hidden'
  const verificationLevel = value(formData, 'verificationLevel') || 'Not started'
  const complianceNotes = value(formData, 'complianceNotes')
  await updateSubmissionDecision({ collection, id, approvalStatus, publicStatus, verificationLevel, complianceNotes })
  revalidatePath('/admin')
  revalidatePath('/admin/approvals')
  revalidatePath('/admin/private-opportunities')
  revalidatePath('/admin/compliance')
  revalidatePath('/interest-board')
}
