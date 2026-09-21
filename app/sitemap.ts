import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const now = new Date()
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/snippets`, lastModified: now, changeFrequency: 'daily', priority: 0.5 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/register`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
