import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHero } from '@/components/PageHero'
import { SubmitClient } from '@/components/SubmitClient'
import { getCurrentUser } from '@/lib/auth'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: 'Submit',
  description: 'Submit Interest Board and Private Club property posts for Galaxy Elite review.',
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
      <PageHero eyebrow="Submit" title="Create a reviewed private match record.">
        <p>Submit Interest Board demand or a Private Club property post through one member workspace.</p>
      </PageHero>
      <section className="section">
        <SubmitClient initialMode={mode} />
      </section>
    </>
  )
}
