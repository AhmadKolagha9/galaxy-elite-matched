import { redirect } from 'next/navigation'

export default function DashboardVerifiedListingPage() {
  redirect('/submit?mode=property')
}
