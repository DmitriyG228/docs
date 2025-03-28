'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

/**
 * Component that tracks page views in Google Analytics
 * Can be included on any page to ensure tracking works correctly
 */
export function PageViewTracker({ title }: { title?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    // Skip if the path hasn't changed
    if (pathname === prevPathname.current) return;
    
    // Track the page view
    const fullPath = searchParams?.toString() 
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
      
    console.log(`📊 PageViewTracker: Tracking page view for ${fullPath}`);
    trackPageView(fullPath, title);
    
    // Update the previous pathname
    prevPathname.current = pathname;
  }, [pathname, searchParams, title]);

  // This component doesn't render anything
  return null;
}

export default PageViewTracker; 