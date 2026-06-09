import { redirect } from 'next/navigation'

export default function InvestorPostRedirectPage() {
  redirect('/private-opportunities?mode=investor')
}
