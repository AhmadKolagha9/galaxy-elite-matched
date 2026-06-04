export function AuthNotice({ searchParams }: { searchParams?: { error?: string; notice?: string } }) {
  if (searchParams?.error) return <p className="form-error auth-message">{searchParams.error}</p>
  if (searchParams?.notice) return <p className="form-success auth-message">{searchParams.notice}</p>
  return null
}
