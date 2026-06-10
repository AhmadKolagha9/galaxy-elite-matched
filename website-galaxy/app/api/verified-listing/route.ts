import { NextResponse } from 'next/server'
import { addSubmission, makeSubmissionPayload } from '@/lib/admin-store'
import { getCurrentUser } from '@/lib/auth'
import { createSanityDocument } from '@/lib/sanity'
import { filesFromFormData, formDataToObject, verifiedListingSchema } from '@/lib/validation'
import { verificationDocumentTypes } from '@/lib/taxonomy'
import { privateClubReferenceCode } from '@/lib/private-club-store'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Login is required before creating a Private Club post.' }, { status: 401 })
  const formData = await request.formData()
  const raw = formDataToObject(formData)
  const parsed = verifiedListingSchema.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten(), error: 'Private Club post validation failed.' }, { status: 400 })

  const uploadedDocuments = filesFromFormData(formData)
  const base = makeSubmissionPayload('verifiedListing', {
    ...parsed.data,
    amenities: formData.getAll('amenities').filter((item): item is string => typeof item === 'string'),
    name: user.name,
    email: user.email,
    phone: '',
    ownerUserId: user.id,
    ownerEmail: user.email
  }, {
    status: 'Pending Strict Verification',
    publicStatus: 'Hidden',
    verificationLevel: 'Documents received - compliance review required',
    uploadedDocuments,
    documentChecklist: verificationDocumentTypes,
    publicVisibility: false,
    reviewRule: 'Private Club posts require document review, owner authority checks, permit checks where applicable, and admin approval before any member visibility.'
  })
  const payload = {
    ...base,
    referenceCode: privateClubReferenceCode(base.id),
    reference_code: privateClubReferenceCode(base.id)
  }
  await createSanityDocument('verifiedListingRequest', payload)
  await addSubmission(payload)
  return NextResponse.json({ ok: true, id: payload.id, referenceCode: payload.referenceCode, message: 'Private Club property post submitted for strict compliance review.' })
}
