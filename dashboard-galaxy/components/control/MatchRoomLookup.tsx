"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function MatchRoomLookup() {
  const router = useRouter()
  const [roomId, setRoomId] = useState('')
  const [loading, setLoading] = useState(false)

  function openRoom() {
    const cleanId = roomId.trim()
    if (!cleanId) return
    setLoading(true)
    router.push(`/matches/${encodeURIComponent(cleanId)}`)
  }

  return (
    <article className="admin-card">
      <h3>Open match room controller</h3>
      <p>Paste a match-room ID to load the 11-stage administrative override panel.</p>
      <label>
        Match room ID
        <input value={roomId} onChange={(event) => setRoomId(event.target.value)} placeholder="match-room-id" disabled={loading} />
      </label>
      <button className="button button-gold" type="button" disabled={loading || !roomId.trim()} onClick={openRoom}>
        {loading ? 'Opening...' : 'Open Stage Controller'}
      </button>
    </article>
  )
}
