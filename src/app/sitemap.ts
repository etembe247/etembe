import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://etembe.io'; // Update this to your actual production domain

  const staticRoutes = [
    '',
    '/blog',
    '/course',
    '/shorts',
    '/chat',
    '/notifications',
    '/profile',
    '/settings',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return [...staticRoutes];
}
