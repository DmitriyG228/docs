import Link from 'next/link';
import { getSortedPostsData, PostData } from '@/lib/posts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"; // Assuming shadcn card component
import { formatDate } from '@/lib/utils'; // Assuming a date formatting utility exists

export default function BlogIndex() {
  const allPostsData = getSortedPostsData();

  return (
    <section className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Blog</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allPostsData.map(({ slug, date, title, summary }: PostData) => (
          <Link href={`/blog/${slug}`} key={slug} legacyBehavior passHref>
            <a className="block hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
              <Card className="h-full transition-shadow duration-200 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl leading-tight">{title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {formatDate(date)} {/* Use formatDate utility */}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{summary}</p>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
      {allPostsData.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">No blog posts yet. Check back soon!</p>
      )}
    </section>
  );
}

// Add revalidate if needed for Incremental Static Regeneration (ISR)
// export const revalidate = 60; // Revalidate every 60 seconds 