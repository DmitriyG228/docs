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

    const { tokenId } = params;

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      );
    }

    // Note: This requires an endpoint for deleting tokens in the admin API
    // which may need to be implemented first
    const response = await fetch(`${ADMIN_API_URL}/admin/tokens/${tokenId}`, {
      method: 'DELETE',
      headers: {
        'X-Admin-API-Key': ADMIN_API_TOKEN,
      },
    });

    // For a DELETE operation, we might not get a JSON response
    if (response.status === 204) {
      // No content, standard for successful DELETE
      return new NextResponse(null, { status: 204 });
    }

    // Try to parse response as JSON
    try {
      const responseData = await response.json();
      
      // Return appropriate response based on status code
      if (!response.ok) {
        return NextResponse.json(
          responseData,
          { status: response.status }
        );
      }

      return NextResponse.json(responseData);
    } catch (e) {
      // If we can't parse JSON, just return the status
      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to revoke token. Status: ${response.status}` },
          { status: response.status }
        );
      }
      
      return new NextResponse(null, { status: response.status });
    }
  } catch (error) {
    console.error('Error revoking token via Admin API:', error);
    
    return NextResponse.json(
      { error: 'Failed to revoke API token. Please try again later.' },
      { status: 500 }
    );
  }
} 