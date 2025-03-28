import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define a matcher for our API routes
export const config = {
  matcher: [
    '/api/:path*',
  ],
};

/**
 * Middleware to handle CORS and preflight requests for API routes
 */
export function middleware(request: NextRequest) {
  console.log(`Middleware processing: ${request.method} ${request.nextUrl.pathname}`);
  
  // Handle OPTIONS request (preflight)
  if (request.method === 'OPTIONS') {
    console.log('Handling OPTIONS request (preflight)');
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // For actual requests, add CORS headers to the response
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
} 