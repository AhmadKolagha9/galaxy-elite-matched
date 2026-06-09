import { redirect } from 'next/navigation'

export default function DashboardPostInterestPage() {
  redirect('/interest-board?add=1')
}
