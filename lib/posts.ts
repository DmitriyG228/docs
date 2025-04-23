import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';

// Define Edge compatibility
export const runtime = 'edge';

export interface PostData {
  slug: string;
  title: string;
  date: string;
  author: string;
  authorImage?: string; // Optional author image URL
  authorLinkedIn?: string; // Optional author LinkedIn URL
  heroImage?: string; // Optional hero image URL
  summary: string;
  contentHtml?: string; // Optional for list view
  [key: string]: any; // Allow other frontmatter fields
}

// Mock data for blog posts
const blogPosts: PostData[] = [
  {
    slug: 'welcome-to-vexa',
    title: 'Welcome to Vexa',
    date: '2023-04-01',
    author: 'Vexa Team',
    authorImage: '/images/team/avatar.png',
    authorLinkedIn: 'https://linkedin.com/company/vexa',
    heroImage: '/images/blog/welcome-hero.jpg',
    summary: 'Introduction to Vexa and our mission',
    contentHtml: '<p>Welcome to Vexa! We are excited to introduce our platform and share our vision for the future.</p><p>This is our first blog post, and we look forward to sharing more updates with you soon.</p>'
  },
  {
    slug: 'product-updates-q2',
    title: 'Product Updates: Q2 2023',
    date: '2023-06-15',
    author: 'Product Team',
    authorImage: '/images/team/product.png',
    authorLinkedIn: 'https://linkedin.com/company/vexa',
    heroImage: '/images/blog/product-updates.jpg',
    summary: 'Latest product updates and feature releases for Q2 2023',
    contentHtml: '<p>In Q2 2023, we've launched several new features to improve your experience with Vexa.</p><p>Here's a summary of what's new and what's coming next.</p>'
  }
];

export async function getSortedPostsData(): Promise<PostData[]> {
  // In a real implementation, you would fetch from an API here
  // For now, we'll return the mock data
  return Promise.resolve([...blogPosts].sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  }));
}

export async function getAllPostSlugs() {
  // In a real implementation, you would fetch from an API here
  const posts = await getSortedPostsData();
  return posts.map(post => ({
    params: {
      slug: post.slug,
    },
  }));
}

export async function getPostData(slug: string): Promise<PostData> {
  // In a real implementation, you would fetch from an API here
  const post = blogPosts.find(p => p.slug === slug);
  
  if (!post) {
    throw new Error(`Post with slug "${slug}" not found.`);
  }
  
  return Promise.resolve(post);
} 