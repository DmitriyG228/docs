import { getAllPostSlugs, getPostData, PostData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { formatDate } from '@/lib/utils'; // Assuming a date formatting utility exists
import { Metadata, ResolvingMetadata } from 'next';

interface PostProps {
  params: {
    slug: string;
  };
}

// Generate metadata for the page (title, description)
export async function generateMetadata(
  { params }: PostProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const post = await getPostData(params.slug);
    return {
      title: post.title,
      description: post.summary,
      // Add other metadata like openGraph images if needed
    };
  } catch (error) {
    // Handle case where post is not found during metadata generation
    return {
      title: 'Post Not Found',
      description: 'This blog post could not be found.'
    }
  }
}

// Generate static paths for all posts at build time
export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths;
}

export default async function Post({ params }: PostProps) {
  let post: PostData;
  try {
    post = await getPostData(params.slug);
  } catch (error) {
    // If getPostData throws (e.g., file not found), trigger a 404 page
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold leading-tight mb-2">{post.title}</h1>
        <div className="text-muted-foreground text-sm">
          <span>By {post.author}</span> | <span>Published on {formatDate(post.date)}</span>
        </div>
      </header>

      {/* Render the HTML content */}
      {/* Add prose styles for better readability (e.g., using @tailwindcss/typography) */}
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml! }}
      />

      {/* Consider adding components for sharing, comments, related posts etc. */}
    </article>
  );
}

// Add revalidate if needed for ISR
// export const revalidate = 60; // Revalidate every 60 seconds 