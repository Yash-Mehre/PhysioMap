import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://physiomap.example.com'
  const now = new Date()
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/explore`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/health`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
  ]
}
