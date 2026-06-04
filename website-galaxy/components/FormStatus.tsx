export function FormStatus({
  status,
  successMessage = 'Submitted. Galaxy Elite will review and prepare the next match step.',
  errorMessage = 'Something went wrong. Check the required fields and try again.'
}: {
  status: 'idle' | 'loading' | 'success' | 'error'
  successMessage?: string
  errorMessage?: string
}) {
  if (status === 'idle') return null
  if (status === 'loading') return <p className="form-note">Submitting securely...</p>
  if (status === 'success') return <p className="form-success">{successMessage}</p>
  return <p className="form-error">{errorMessage}</p>
}
