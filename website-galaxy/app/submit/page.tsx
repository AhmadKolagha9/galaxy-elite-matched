import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHero } from '@/components/PageHero'
import { SubmitClient } from '@/components/SubmitClient'
import { getCurrentUser } from '@/lib/auth'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: 'Submit',
  description: 'Submit once, stay private and get matched through Galaxy Elite review.',
  path: '/submit',
  noindex: true
})

type SubmitPageProps = {
  searchParams?: Promise<{ mode?: string }>
}

function submitMode(value?: string): 'interest' | 'property' {
  return value === 'property' ? 'property' : 'interest'
}

export default async function SubmitPage({ searchParams }: SubmitPageProps) {
  const params = (await searchParams) || {}
  const mode = submitMode(params.mode)
  const target = mode === 'property' ? '/submit?mode=property' : '/submit?mode=interest'
  const user = await getCurrentUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(target)}`)

  return (
    <>
      <PageHero eyebrow="Submit Interest" title="Submit once. Stay private. Get matched.">
        <p>Create your property request or property opportunity with preferred location, area, budget, payment readiness, privacy level and requirements. Galaxy Elite reviews every request before confidential details are shared.</p>
      </PageHero>
      <section className="section">
        <SubmitClient initialMode={mode} />
      </section>
    </>
  )
}
