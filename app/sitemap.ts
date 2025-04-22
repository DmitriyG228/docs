// app/sitemap.ts
import { MetadataRoute } from 'next';
import { getSortedPostsData } from '@/lib/posts';
import { absoluteUrl } from '@/lib/utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getSortedPostsData();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.date).toISOString(),
    changeFrequency: 'monthly', 
    priority: 0.8,
  }));

  // Add other static pages (adjust paths and priorities as needed)
  const staticPages = [
    '/',
    '/docs',
    '/public-beta',
    '/blog',
    '/terms',
    // Add paths to other important pages like /contact, /terms, /privacy etc.
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
     url: absoluteUrl(path),
     lastModified: new Date().toISOString(), // Use current date for simplicity
     changeFrequency: path === '/' || path === '/blog' || path === '/docs' ? 'weekly' : 'monthly',
     priority: path === '/' ? 1.0 : (path === '/blog' || path === '/docs' ? 0.9 : 0.7),
  }));


  return [...staticEntries, ...postEntries];
} 