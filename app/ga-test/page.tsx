'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import PageViewTracker from '@/components/analytics/PageViewTracker';

export default function GoogleAnalyticsTestPage() {
  const [gaStatus, setGaStatus] = useState<'loading' | 'detected' | 'not-detected'>('loading');
  const [gtagFunction, setGtagFunction] = useState<boolean>(false);
  const [measurementId, setMeasurementId] = useState<string>('');

  useEffect(() => {
    // Check if Google Analytics is loaded
    setTimeout(() => {
      const hasGtag = typeof window !== 'undefined' && 'gtag' in window;
      const hasDataLayer = typeof window !== 'undefined' && 'dataLayer' in window;
      const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      
      setMeasurementId(gaId || 'Not set');
      setGtagFunction(hasGtag);
      setGaStatus(hasGtag && hasDataLayer ? 'detected' : 'not-detected');
      
      // Log diagnostics info
      console.log('GA Diagnostics:', {
        hasGtag,
        hasDataLayer,
        gaId,
        dataLayer: hasDataLayer ? window.dataLayer : undefined
      });
    }, 1000);
  }, []);

  // Send a test event
  const handleTestEvent = () => {
    trackEvent('ga_test_event', { test_value: 'test123' });
    alert('Test event sent! Check the network tab for a request to Google Analytics');
  };

  return (
    <div className="container mx-auto py-10">
      {/* Track page view for this test page */}
      <PageViewTracker title="Google Analytics Test" />
      
      <h1 className="text-3xl font-bold mb-6">Google Analytics Test Page</h1>
      
      <div className="p-4 mb-8 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">GA Status</h2>
        
        <div className="grid gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            {gaStatus === 'loading' ? (
              <span>Checking...</span>
            ) : gaStatus === 'detected' ? (
              <span className="text-green-600 font-semibold">Detected ✓</span>
            ) : (
              <span className="text-red-600 font-semibold">Not Detected ✗</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-medium">gtag() function:</span>
            {gtagFunction ? (
              <span className="text-green-600 font-semibold">Available ✓</span>
            ) : (
              <span className="text-red-600 font-semibold">Not Available ✗</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-medium">Measurement ID:</span>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{measurementId}</code>
          </div>
        </div>
      </div>
      
      <div className="p-4 mb-8 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Test Events</h2>
        <p className="mb-4">Click the button below to send a test event to Google Analytics</p>
        
        <Button onClick={handleTestEvent}>
          Send Test Event
        </Button>
      </div>
      
      <div className="p-4 mb-8 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
        
        <ul className="list-disc pl-5 space-y-2">
          <li>Make sure <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">NEXT_PUBLIC_GA_MEASUREMENT_ID</code> is set in your .env file</li>
          <li>Ensure your Google Analytics property is set up correctly</li>
          <li>Check if any ad blockers are preventing Google Analytics from loading</li>
          <li>Open browser devtools and check the network tab for requests to <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">google-analytics.com</code></li>
          <li>Ensure the site is being loaded over HTTPS</li>
        </ul>
      </div>
      
      <div className="text-center mt-8">
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
} 