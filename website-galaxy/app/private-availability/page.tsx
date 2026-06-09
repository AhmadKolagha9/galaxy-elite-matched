import { redirect } from 'next/navigation'

export default function PrivateAvailabilityRedirectPage() {
  redirect('/private-opportunities?mode=availability')
}
