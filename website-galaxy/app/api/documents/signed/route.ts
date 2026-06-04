import crypto from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function signingSecret() {
  return process.env.AUTH_JWT_SECRET || process.env.INTERNAL_API_KEY || ''
}

function signPath(storagePath: string, expiresAt: string) {
  return crypto.createHmac('sha256', signingSecret()).update(`${storagePath}.${expiresAt}`).digest('base64url')
}

function safeStoragePath(value: string) {
  if (!value.startsWith('private/') || value.includes('..') || value.startsWith('/')) return null
  return value.replace(/[^a-zA-Z0-9._/-]/g, '_')
}

export async function PUT(request: Request) {
  const url = new URL(request.url)
  const storagePath = safeStoragePath(url.searchParams.get('path') || '')
  const operation = url.searchParams.get('operation')
  const expiresAt = url.searchParams.get('expiresAt') || ''
  const token = url.searchParams.get('token') || ''

  if (!signingSecret()) return NextResponse.json({ ok: false, error: 'Signed document storage is not configured.' }, { status: 503 })
  if (!storagePath || operation !== 'upload') return NextResponse.json({ ok: false, error: 'Invalid signed upload target.' }, { status: 400 })
  if (!expiresAt || Number(expiresAt) * 1000 < Date.now()) return NextResponse.json({ ok: false, error: 'Signed upload URL expired.' }, { status: 410 })

  const expected = signPath(storagePath, expiresAt)
  const left = Buffer.from(expected)
  const right = Buffer.from(token)
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    return NextResponse.json({ ok: false, error: 'Invalid signed upload token.' }, { status: 403 })
  }

  const file = Buffer.from(await request.arrayBuffer())
  if (file.length > 10 * 1024 * 1024) return NextResponse.json({ ok: false, error: 'File exceeds 10MB.' }, { status: 400 })

  const target = path.join(process.cwd(), '.private-documents', storagePath)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, file)

  return NextResponse.json({ ok: true })
}


export async function GET(request: Request) {
  const url = new URL(request.url)
  const storagePath = safeStoragePath(url.searchParams.get('path') || '')
  const operation = url.searchParams.get('operation')
  const expiresAt = url.searchParams.get('expiresAt') || ''
  const token = url.searchParams.get('token') || ''

  if (!signingSecret()) return NextResponse.json({ ok: false, error: 'Signed document storage is not configured.' }, { status: 503 })
  if (!storagePath || operation !== 'view') return NextResponse.json({ ok: false, error: 'Invalid signed view target.' }, { status: 400 })
  if (!expiresAt || Number(expiresAt) * 1000 < Date.now()) return NextResponse.json({ ok: false, error: 'Signed view URL expired.' }, { status: 410 })

  const expected = signPath(storagePath, expiresAt)
  const left = Buffer.from(expected)
  const right = Buffer.from(token)
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    return NextResponse.json({ ok: false, error: 'Invalid signed view token.' }, { status: 403 })
  }

  const { readFile } = await import('fs/promises')
  const target = path.join(process.cwd(), '.private-documents', storagePath)
  const file = await readFile(target).catch(() => null)
  if (!file) return NextResponse.json({ ok: false, error: 'Document file is not available.' }, { status: 404 })

  const extension = storagePath.split('.').pop()?.toLowerCase()
  const contentType = extension === 'pdf' ? 'application/pdf' : extension === 'png' ? 'image/png' : 'image/jpeg'
  return new NextResponse(file, {
    headers: {
      'content-type': contentType,
      'cache-control': 'private, no-store',
      'x-robots-tag': 'noindex, nofollow'
    }
  })
}
