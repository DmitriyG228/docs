import { NextRequest, NextResponse } from 'next/server';

// Admin API endpoint
const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:8000';
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN;

// Check if Admin API token is configured
if (!ADMIN_API_TOKEN) {
  console.error('ADMIN_API_TOKEN environment variable is not set. Admin API operations will fail.');
}

/**
 * Handler for DELETE /api/admin/tokens/[tokenId]
 * Revokes/deletes an API token via the Admin API
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  try {
    // Check if admin token is configured
    if (!ADMIN_API_TOKEN) {
      return NextResponse.json(
        { error: 'Admin API is not properly configured on the server.' },
        { status: 500 }
      );
    }

    const tokenId = params.tokenId;

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      );
    }

    console.log(`Attempting to delete token ID: ${tokenId}`);

    const response = await fetch(`${ADMIN_API_URL}/admin/tokens/${tokenId}`, {
      method: 'DELETE',
      headers: {
        'X-Admin-API-Key': ADMIN_API_TOKEN,
      },
    });

    console.log(`Admin API DELETE /admin/tokens/${tokenId} status: ${response.status}`);

    // For a DELETE operation, we might not get a JSON response
    if (response.status === 204) {
      // No content, standard for successful DELETE
      return new NextResponse(null, { status: 204 });
    }

    // Try to parse response as JSON if not 204
    let responseData = {};
    try {
      // Check if response has content before parsing
      if (response.headers.get('content-length') !== '0') {
        responseData = await response.json();
      }
    } catch (e) {
      console.error("Error parsing JSON response on DELETE:", e);
      // If parsing fails but status was ok somehow, treat as success?
      // Or maybe return the non-JSON error from backend?
      // For now, we rely on the status code check below.
    }
      
    // Return appropriate response based on status code
    if (!response.ok) {
      console.error(`Admin API Error: ${response.status}`, responseData);
      return NextResponse.json(
        responseData, // Forward the error details from admin-api if available
        { status: response.status }
      );
    }

    // If response.ok but not 204 (unlikely for DELETE, but handle it)
    return NextResponse.json(responseData, { status: response.status });

  } catch (error) {
    console.error('Error in DELETE /api/admin/tokens/[tokenId]:', error);
    
    return NextResponse.json(
      { error: 'Failed to revoke API token. Please try again later.' },
      { status: 500 }
    );
  }
} 