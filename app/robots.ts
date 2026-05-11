import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/'], // Privacy focus: don't index private dashboard or internal APIs
    },
    sitemap: 'https://sheetflow.ai/sitemap.xml',
  }
}
