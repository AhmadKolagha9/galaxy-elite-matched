export default {
  name: 'newsletterSubscriber',
  title: 'Newsletter Subscriber',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string' },
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'segment', title: 'Segment', type: 'string' },
    { name: 'subscribedAt', title: 'Subscribed At', type: 'datetime' }
  ]
}
