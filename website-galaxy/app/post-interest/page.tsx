import { redirect } from 'next/navigation'

export default function PostInterestPage() {
  redirect('/submit?mode=interest')
}
