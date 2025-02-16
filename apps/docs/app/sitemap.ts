import { source } from '@/lib/source';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: 'https://next-mw-docs.vercel.app',
      lastModified: new Date().toISOString(),
    },
    ...source.getPages().map((page) => ({
      url: `https://next-mw-docs.vercel.app${page.url}`,
      lastModified: new Date().toISOString(),
    })),
  ];
}
