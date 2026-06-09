import { redirect } from 'next/navigation'

export default function PostInterestPage() {
  redirect('/interest-board?add=1')
}
