import { createClient } from '@sanity/client'
import { isSanityConfigured, isSanityWritable } from '@/lib/env'

export const sanityApiVersion = process.env.SANITY_API_VERSION || '2026-05-26'

export function getSanityClient({ write = false }: { write?: boolean } = {}) {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  if (!projectId || !dataset) return null

  return createClient({
    projectId,
    dataset,
    apiVersion: sanityApiVersion,
    useCdn: !write,
    token: write ? process.env.SANITY_WRITE_TOKEN : undefined
  })
}

export async function createSanityDocument(type: string, payload: Record<string, unknown>) {
  if (!isSanityWritable()) return null
  const client = getSanityClient({ write: true })
  if (!client) return null
  return client.create({ _type: type, ...payload })
}

export async function fetchSanityDocuments<T>(query: string, fallback: T): Promise<T> {
  if (!isSanityConfigured()) return fallback
  const client = getSanityClient()
  if (!client) return fallback
  try {
    return await client.fetch<T>(query)
  } catch {
    return fallback
  }
}
