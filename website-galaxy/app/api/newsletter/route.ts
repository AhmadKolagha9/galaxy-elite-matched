import { NextResponse } from 'next/server'
import { addSubmission, makeSubmissionPayload } from '@/lib/admin-store'
import { createSanityDocument } from '@/lib/sanity'
import { formDataToObject, newsletterSchema } from '@/lib/validation'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const formData = await request.formData()
  const parsed = newsletterSchema.safeParse(formDataToObject(formData))
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 })

  const payload = makeSubmissionPayload('newsletter', parsed.data, {
    status: 'Subscribed',
    approvalStatus: 'approved',
    publicStatus: 'Hidden',
    subscribedAt: new Date().toISOString()
  })
  await createSanityDocument('newsletterSubscriber', payload)
  await addSubmission(payload)
  return NextResponse.json({ ok: true })
}
