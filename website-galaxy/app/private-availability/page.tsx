import { redirect } from 'next/navigation'

export default function PrivateAvailabilityRedirectPage() {
  redirect('/private-club?add=1')
}
