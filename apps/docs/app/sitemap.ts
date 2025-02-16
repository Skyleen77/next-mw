import { source } from '@/lib/source';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return source.getPages().map((page) => ({
    url: `https://next-mw-docs.vercel.app${page.url}`,
    lastModified: new Date().toISOString(),
  }));
}
