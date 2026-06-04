export function isSanityConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_DATASET)
}

export function isSanityWritable() {
  return Boolean(isSanityConfigured() && process.env.SANITY_WRITE_TOKEN)
}
