export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

// Admin API endpoint
const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:8000';
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN;

// Check if Admin API token is configured
if (!ADMIN_API_TOKEN) {
  console.error('ADMIN_API_TOKEN environment variable is not set. Admin API operations will fail.');
}

/**
 * Handler for POST /api/admin/tokens
 * Creates a new API token for a user via the Admin API
 */
export async function POST(request: NextRequest) {
  try {
    // Check if admin token is configured
    if (!ADMIN_API_TOKEN) {
      return NextResponse.json(
        { error: 'Admin API is not properly configured on the server.' },
        { status: 500 }
      );
    }

    // Parse request body
    const data = await request.json();
    const userId = data.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Forward the request to the Admin API
    const response = await fetch(`${ADMIN_API_URL}/admin/users/${userId}/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-API-Key': ADMIN_API_TOKEN,
      },
    });

    // Get the response data
    const responseData = await response.json();

    // Return appropriate response based on status code
    if (!response.ok) {
      return NextResponse.json(
        responseData,
        { status: response.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error creating token via Admin API:', error);
    
    return NextResponse.json(
      { error: 'Failed to create API token. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * Handler for GET /api/admin/tokens
 * Lists all users with their tokens via the Admin API
 */
export async function GET(request: NextRequest) {
  try {
    // Check if admin token is configured
    if (!ADMIN_API_TOKEN) {
      return NextResponse.json(
        { error: 'Admin API is not properly configured on the server.' },
        { status: 500 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // If userId is provided, get specific user with tokens
    if (userId) {
      // This is a placeholder - the actual endpoint for getting a user with tokens 
      // may need to be implemented in the admin API first
      const response = await fetch(`${ADMIN_API_URL}/admin/users/${userId}`, {
        headers: {
          'X-Admin-API-Key': ADMIN_API_TOKEN,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          responseData,
          { status: response.status }
        );
      }

      return NextResponse.json(responseData);
    }

    // Otherwise, get all users (which may not include tokens in the response)
    const response = await fetch(`${ADMIN_API_URL}/admin/users`, {
      headers: {
        'X-Admin-API-Key': ADMIN_API_TOKEN,
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        responseData,
        { status: response.status }
      );
    }

    return NextResponse.json({ users: responseData });
  } catch (error) {
    console.error('Error fetching users/tokens via Admin API:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve users or tokens. Please try again later.' },
      { status: 500 }
    );
  }
} 