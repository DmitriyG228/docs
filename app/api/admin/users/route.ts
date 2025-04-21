import { NextRequest, NextResponse } from 'next/server';

interface UserCreateRequest {
  email: string;
  name?: string;
  image_url?: string;
}

// Admin API endpoint
const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:8000';
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN;

// Check if Admin API token is configured
if (!ADMIN_API_TOKEN) {
  console.error('ADMIN_API_TOKEN environment variable is not set. Admin API operations will fail.');
}

/**
 * Handler for POST /api/admin/users
 * Creates a new user via the Admin API
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
    const userData: UserCreateRequest = await request.json();

    // Basic validation
    if (!userData.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Forward the request to the Admin API
    const response = await fetch(`${ADMIN_API_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-API-Key': ADMIN_API_TOKEN,
      },
      body: JSON.stringify(userData),
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
    console.error('Error creating user via Admin API:', error);
    
    return NextResponse.json(
      { error: 'Failed to create user. Please try again later.' },
      { status: 500 }
    );
  }
} 