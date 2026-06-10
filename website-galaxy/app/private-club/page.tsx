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
  description: 'Private access to carefully selected property opportunities in a secure Galaxy Elite environment.',
  path: '/private-club',
  noindex: true
})

type PrivateClubPageProps = {
  searchParams?: Promise<{ add?: string }>
}

export default async function PrivateClubPage({ searchParams }: PrivateClubPageProps) {
  const params = (await searchParams) || {}
  const user = await getCurrentUser()
  if (params.add === '1') {
    const target = '/submit?mode=property'
    if (!user) redirect(`/login?next=${encodeURIComponent(target)}`)
    redirect(target)
  }
  if (!user) redirect('/login?next=/private-club')
  const posts = await getPrivateClubPosts()
  return (
    <>
      <PageHero eyebrow="Private Club" title="Private access to better property opportunities.">
        <p>Join a secure environment for serious buyers, motivated sellers, investors, landlords, tenants and transparent agents who value discretion, quality and trusted connections.</p>
      </PageHero>
      <section className="section"><PrivateClubClient posts={posts} /></section>
    </>
  )
}
