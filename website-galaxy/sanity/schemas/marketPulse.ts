export default {
  name: 'marketPulse',
  title: 'Market Pulse Article',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
    { name: 'excerpt', title: 'Excerpt', type: 'text' },
    { name: 'country', title: 'Country', type: 'string' },
    { name: 'publishedAt', title: 'Published At', type: 'datetime' },
    { name: 'content', title: 'Content', type: 'array', of: [{ type: 'block' }] }
  ]
}
