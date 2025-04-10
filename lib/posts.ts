import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';

const postsDirectory = path.join(process.cwd(), 'content/blog');

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

export function getSortedPostsData(): PostData[] {
  // Get file names under /content/blog
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx')) // Filter only markdown files
    .map((fileName) => {
      // Remove ".md" or ".mdx" from file name to get slug
      const slug = fileName.replace(/\.mdx?$/, '');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Combine the data with the slug
      return {
        slug,
        ...(matterResult.data as { title: string; date: string; author: string; summary: string; }),
      };
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  // Returns an array that looks like: [{ params: { slug: 'ssg-ssr' } }, ... ]
  return fileNames
    .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map((fileName) => {
    return {
      params: {
        slug: fileName.replace(/\.mdx?$/, ''),
      },
    };
  });
}

export async function getPostData(slug: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  let fileContents = '';
  try {
     fileContents = fs.readFileSync(fullPath, 'utf8');
  } catch (err) {
    // Try .mdx if .md fails
    const mdxPath = path.join(postsDirectory, `${slug}.mdx`);
    try {
        fileContents = fs.readFileSync(mdxPath, 'utf8');
    } catch (mdxErr) {
        console.error(`Error reading post file: ${slug}.md or ${slug}.mdx`);
        throw new Error(`Post with slug "${slug}" not found.`);
    }
  }

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use unified, remark-parse, remark-rehype, rehype-pretty-code, and rehype-stringify to process markdown
  const processedContent = await unified()
    .use(remarkParse) // Parse markdown
    .use(remarkRehype) // Convert markdown to rehype (HTML AST)
    .use(rehypePrettyCode, { // Apply syntax highlighting
      theme: 'github-dark', // Choose a theme (e.g., github-dark, github-light, one-dark-pro)
      // Optional: keep background color for code blocks
      // keepBackground: true,
    })
    .use(rehypeStringify) // Convert rehype AST to HTML string
    .process(matterResult.content);

  const contentHtml = processedContent.toString();

  // Combine the data with the slug and contentHtml
  return {
    slug,
    contentHtml,
    ...(matterResult.data as { title: string; date: string; author: string; summary: string; }),
  };
} 