import type { MetadataRoute } from 'next'
import { getPublicNewProjects } from '@/lib/new-projects'
import { absoluteUrl } from '@/lib/seo'

const routes = ['/', '/interest-board', '/private-opportunities', '/new-projects', '/for-agents', '/for-owners', '/for-landlords', '/for-developers', '/market-pulse', '/uae', '/uk', '/india']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublicNewProjects()
  const staticRoutes = routes.map((route) => ({ url: absoluteUrl(route), lastModified: new Date(), changeFrequency: route === '/' ? 'weekly' as const : 'monthly' as const, priority: route === '/' ? 1 : 0.75 }))
  const projectRoutes = projects.map((project) => ({ url: absoluteUrl(`/new-projects/${project.reference}`), lastModified: new Date(project.updatedAt), changeFrequency: 'weekly' as const, priority: 0.7 }))
  return [...staticRoutes, ...projectRoutes]
}
