import { redirect } from 'next/navigation'

export default function DashboardVerifiedListingRedirectPage() {
  redirect('/private-club?add=1')
}
