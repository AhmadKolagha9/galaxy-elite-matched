import { redirect } from 'next/navigation'

export default function DashboardInvestorPostRedirectPage() {
  redirect('/private-opportunities?mode=investor')
}
