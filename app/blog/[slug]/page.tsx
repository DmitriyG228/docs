import { getAllPostSlugs, getPostData, PostData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { formatDate } from '@/lib/utils'; // Assuming a date formatting utility exists
import { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image'; // Import next/image
import Link from 'next/link'; // Import Link
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components

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

  // Helper to get initials for Avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <article className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Hero Image */} 
      {post.heroImage && (
        <div className="mb-8 overflow-hidden rounded-lg shadow-lg">
          <Image
            src={post.heroImage} 
            alt={`${post.title} hero image`}
            width={1200} // Adjust width as needed
            height={630} // Adjust height for aspect ratio (e.g., 1.91:1 for Open Graph)
            className="w-full h-auto object-cover"
            priority // Load hero image eagerly
          />
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-4xl font-bold leading-tight mb-4">{post.title}</h1>
        <div className="flex items-center space-x-4 text-muted-foreground text-sm">
          {/* Author Avatar and Link */} 
          {post.authorLinkedIn ? (
            <Link href={post.authorLinkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-foreground transition-colors">
              <Avatar className="h-8 w-8">
                {post.authorImage && <AvatarImage src={post.authorImage} alt={post.author} />}
                <AvatarFallback>{getInitials(post.author)}</AvatarFallback>
              </Avatar>
              <span>{post.author}</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                {post.authorImage && <AvatarImage src={post.authorImage} alt={post.author} />}
                <AvatarFallback>{getInitials(post.author)}</AvatarFallback>
              </Avatar>
              <span>{post.author}</span>
            </div>
          )}
          
          <span>|</span>
          <span>Published on {formatDate(post.date)}</span>
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