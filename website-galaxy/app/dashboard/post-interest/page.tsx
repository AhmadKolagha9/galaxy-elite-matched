import { redirect } from 'next/navigation'

export default function DashboardPostInterestPage() {
  redirect('/submit?mode=interest')
}
