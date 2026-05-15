import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/auth/', '/profile/', '/settings/', '/api/'],
    },
    sitemap: 'https://etembe.io/sitemap.xml',
  };
}
