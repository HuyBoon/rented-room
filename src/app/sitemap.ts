import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rentedroom.vn'

  // Define public routes
  const routes = [
    '',
    '/pricing',
    '/contact',
    '/view-room',
    '/login',
    '/register',
    '/tenants/login',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }))
}
