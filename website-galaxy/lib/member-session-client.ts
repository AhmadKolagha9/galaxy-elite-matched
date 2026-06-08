'use client'

import { useEffect, useState } from 'react'

export type MemberSessionUser = {
  id: string
  email: string
  name: string
  role: string
  verificationStatus?: string
}

export function useMemberSession() {
  const [user, setUser] = useState<MemberSessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/member-session', { cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json().catch(() => null) as { ok?: boolean; user?: MemberSessionUser } | null
        if (active) setUser(response.ok && body?.user ? body.user : null)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { user, loading, authenticated: Boolean(user) }
}

