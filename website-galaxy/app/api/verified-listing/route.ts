import { NextResponse } from 'next/server'
import { addSubmission, makeSubmissionPayload } from '@/lib/admin-store'
import { createSanityDocument } from '@/lib/sanity'
import { filesFromFormData, formDataToObject, verifiedListingSchema } from '@/lib/validation'
import { verificationDocumentTypes } from '@/lib/taxonomy'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const formData = await request.formData()
  const parsed = verifiedListingSchema.safeParse(formDataToObject(formData))
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 })

  const uploadedDocuments = filesFromFormData(formData)
  const payload = makeSubmissionPayload('verifiedListing', parsed.data, {
    status: 'Pending Strict Verification',
    publicStatus: 'Hidden',
    verificationLevel: 'Documents received - compliance review required',
    uploadedDocuments,
    documentChecklist: verificationDocumentTypes,
    publicVisibility: false,
    reviewRule: 'Verified listings require document review, owner authority checks, permit checks where applicable, and admin approval before any public visibility.'
  })
  await createSanityDocument('verifiedListingRequest', payload)
  await addSubmission(payload)
  return NextResponse.json({ ok: true, id: payload.id, message: 'Verified listing request submitted for strict compliance review.' })
}
