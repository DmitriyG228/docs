import { getAllPostSlugs, getPostData, PostData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { formatDate, absoluteUrl } from '@/lib/utils'; // Import absoluteUrl
import { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image'; // Import next/image
import Link from 'next/link'; // Import Link
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components

export const dynamic = 'force-dynamic';

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
  // Await the entire params object before accessing properties
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  try {
    const post = await getPostData(slug);
    // Assume default OG image is at public/images/og-default.png
    const ogImage = post.heroImage ? absoluteUrl(post.heroImage) : absoluteUrl('/images/og-default.png');

    return {
      title: post.title,
      description: post.summary,
      openGraph: {
        title: post.title,
        description: post.summary,
        url: absoluteUrl(`/blog/${post.slug}`),
        siteName: 'Vexa Blog', // Replace with your actual site name if different
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        locale: 'en_US', 
        type: 'article',
        publishedTime: new Date(post.date).toISOString(),
        authors: [post.author], // Assuming author name is sufficient here
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.summary,
        images: [ogImage],
        // Add creator handle if desired: creator: '@YourTwitterHandle',
      },
    };
  } catch (error) {
    // Handle case where post is not found during metadata generation
    console.error(`Metadata generation failed for slug "${slug}":`, error);
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
  // Await the entire params object before accessing properties
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  let post: PostData;
  try {
    post = await getPostData(slug);
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

  // Define JSON-LD structure
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: post.heroImage ? absoluteUrl(post.heroImage) : undefined,
    author: {
      '@type': 'Person',
      name: post.author,
      url: post.authorLinkedIn, // Use LinkedIn URL if available
      image: post.authorImage, // Author image URL
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vexa', // Replace with your organization name
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logodark.svg'), // Replace with your logo URL
      },
    },
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(), // Consider adding an 'updatedDate' frontmatter field for this
    mainEntityOfPage: {
       '@type': 'WebPage',
       '@id': absoluteUrl(`/blog/${post.slug}`)
    }
  };

  return (
    <>
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
    </>
  );
}

// Add revalidate if needed for ISR
// export const revalidate = 60; // Revalidate every 60 seconds 