import { redirect } from 'next/navigation'

export default function PrivateAvailabilityPage() {
  redirect('/submit?mode=property')
}
