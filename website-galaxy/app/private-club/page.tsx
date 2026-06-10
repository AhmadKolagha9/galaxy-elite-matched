import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHero } from '@/components/PageHero'
import { PrivateClubClient } from '@/components/PrivateClubClient'
import { getCurrentUser } from '@/lib/auth'
import { getPrivateClubPosts } from '@/lib/private-club-store'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({
  title: 'Private Club',
  description: 'Member-only verified property posts and matched requests reviewed by Galaxy Elite.',
  path: '/private-club',
  noindex: true
})

export default async function PrivateClubPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/private-club')
  const posts = await getPrivateClubPosts()
  return (
    <>
      <PageHero eyebrow="Private Club" title="Verified private property posts for members only.">
        <p>Browse approved Private Club property posts, filter by matching criteria, or submit a property matched post for Galaxy Elite compliance review.</p>
      </PageHero>
      <section className="section"><PrivateClubClient posts={posts} /></section>
    </>
  )
}
