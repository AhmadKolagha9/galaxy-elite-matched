import { NextResponse } from 'next/server'
import { addSubmission, makeSubmissionPayload } from '@/lib/admin-store'
import { createSanityDocument } from '@/lib/sanity'
import { agentSchema, formDataToObject } from '@/lib/validation'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const formData = await request.formData()
  const parsed = agentSchema.safeParse(formDataToObject(formData))
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 })

  const payload = makeSubmissionPayload('agent', parsed.data, {
    status: 'Agent Pending Review',
    publicStatus: 'Hidden',
    verificationLevel: 'Licence review required',
    noHiddenAgentRule: true
  })
  await createSanityDocument('agentProfile', payload)
  await addSubmission(payload)
  return NextResponse.json({ ok: true, id: payload.id, message: 'Agent profile submitted for compliance review.' })
}
