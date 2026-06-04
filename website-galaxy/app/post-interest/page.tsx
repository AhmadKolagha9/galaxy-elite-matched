import type { Metadata } from 'next'
import { InterestForm } from '@/components/InterestForm'
import { PageHero } from '@/components/PageHero'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Post Property Interest',
  description: 'Post what you want to buy, rent, invest in or lease. Budget can be hidden publicly and verified privately.',
  path: '/post-interest'
})

export default function PostInterestPage() {
  return (
    <>
      <PageHero eyebrow="Public demand" title="Post your interest. Stay private. Match verified.">
        <p>Use this form for buyers, tenants, investors, companies and land seekers. Property owners and landlords respond privately through Galaxy Elite.</p>
      </PageHero>
      <section className="section"><InterestForm /></section>
    </>
  )
}
