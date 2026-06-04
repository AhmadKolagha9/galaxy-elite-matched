import type { Metadata } from 'next'
import { InvestorPostForm } from '@/components/InvestorPostForm'
import { PageHero } from '@/components/PageHero'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Investor Post',
  description: 'Post investor demand for residential, commercial, off-plan, secondary, land and private property opportunities after Galaxy Elite approval.',
  path: '/investor-post'
})

export default function InvestorPostPage() {
  return (
    <>
      <PageHero eyebrow="Investor demand" title="Post investor interest without exposing identity publicly.">
        <p>Investors can submit demand for residential, commercial, off-plan, secondary, land, yield, capital growth or development opportunities. Galaxy Elite reviews every post before visibility.</p>
      </PageHero>
      <section className="section two-col">
        <div>
          <p className="eyebrow">Private capital signals</p>
          <h2>Show demand. Keep sensitive details private.</h2>
          <p className="lead">Investor posts can be used to attract verified owners, developers and licensed agents while keeping budget, identity and exact strategy controlled until a private Match Room opens.</p>
          <div className="feature-list">
            <span>Residential</span><span>Commercial</span><span>Off-plan</span><span>Secondary</span><span>Land</span><span>Development / JV</span>
          </div>
        </div>
        <InvestorPostForm />
      </section>
    </>
  )
}
