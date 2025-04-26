'use client';

import React, { useEffect } from 'react';
import { AlertCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // Log error for debugging
  useEffect(() => {
    if (error) {
      console.error(`[Auth Error] Type: ${error}`);
    }
  }, [error]);

  // Map error codes to user-friendly messages
  const getErrorMessage = () => {
    switch (error) {
      case 'OAuthCallback':
        return 'There was a problem with the Google sign-in process. This sometimes happens on mobile devices.';
      case 'OAuthSignin':
        return 'An error occurred while starting the Google sign-in process.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification link may have expired or already been used.';
      default:
        return 'An unexpected authentication error occurred.';
    }
  };

  // Get suggestions based on error type
  const getSuggestions = () => {
    if (error === 'OAuthCallback') {
      return (
        <ul className="text-amber-700 text-sm text-left list-disc list-inside space-y-2">
          <li>Try signing in again</li>
          <li>Clear your browser cookies and cache</li>
          <li>Try using a different browser or device</li>
          <li>Check if you have any browser extensions that might be blocking cookies</li>
        </ul>
      );
    }

    return (
      <ul className="text-amber-700 text-sm text-left list-disc list-inside space-y-2">
        <li>Try signing in again</li>
        <li>Make sure you're using a supported browser</li>
        <li>Contact support if the issue persists</li>
      </ul>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center border border-red-100">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Authentication Error</h1>
        
        <p className="text-gray-600 mb-6">
          {getErrorMessage()}
        </p>
        
        <div className="mb-6 p-4 bg-amber-50 rounded-md">
          <h2 className="font-semibold text-amber-800 mb-2">Try these steps:</h2>
          {getSuggestions()}
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild variant="default">
            <Link href="/">
              Return to Home Page
            </Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link href="/" onClick={() => {
              // Clear local storage to fix potential session issues
              if (typeof window !== 'undefined') {
                localStorage.removeItem('next-auth.session-token');
                sessionStorage.clear();
              }
            }}>
              Try Signing In Again
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 