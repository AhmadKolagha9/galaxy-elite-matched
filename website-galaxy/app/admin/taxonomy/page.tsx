import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { areaCityOptions, countryOptions, marketSegmentOptions, propertyTypeOptions, purposeOptions, verificationDocumentTypes } from '@/lib/taxonomy'

export const metadata: Metadata = pageMetadata({ title: 'Dropdown Taxonomy', description: 'Galaxy Elite dropdown and property type taxonomy.', path: '/admin/taxonomy', noindex: true })

function TaxonomyList({ title, items }: { title: string; items: string[] }) {
  return <article className="admin-card"><h3>{title}</h3><div className="document-checklist compact-list">{items.map((item) => <span key={item}>{item}</span>)}</div></article>
}

export default function AdminTaxonomyPage() {
  return (
    <>
      <div className="dashboard-hero admin-hero"><p className="eyebrow">Dropdown control</p><h1>Property type, country, area, project and compliance options.</h1><p>These options are centralized in <code>lib/taxonomy.ts</code>. Later, move this into Sanity or Supabase so admins can edit dropdowns without code.</p></div>
      <div className="admin-card-grid">
        <TaxonomyList title="Market segments" items={marketSegmentOptions} />
        <TaxonomyList title="Property types" items={propertyTypeOptions} />
        <TaxonomyList title="Countries" items={countryOptions} />
        <TaxonomyList title="Area / city presets" items={areaCityOptions} />
        <TaxonomyList title="Purpose" items={purposeOptions} />
        <TaxonomyList title="Verification documents" items={verificationDocumentTypes} />
      </div>
    </>
  )
}
