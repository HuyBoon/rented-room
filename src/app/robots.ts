import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/pricing',
        '/contact',
        '/view-room',
        '/login',
        '/register',
        '/tenants/login',
      ],
      disallow: [
        '/dashboard/', 
        '/api/',
        '/(dashboard)/', // Next.js specific group folder protection
      ],
    },
    sitemap: 'https://rentedroom.vn/sitemap.xml',
  }
}
