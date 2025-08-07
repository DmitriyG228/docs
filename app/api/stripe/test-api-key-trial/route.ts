import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

/**
 * Test endpoint to simulate the API key creation trial flow
 * This endpoint calls the actual token creation endpoint to test the trial creation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log(`[Test API Key Trial] Testing API key creation trial flow for ${session.user.email}`)
    
    // Get user ID from session 
    const userId = (session as any).user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      )
    }

    // Call the actual token creation endpoint
    const tokenResponse = await fetch(`${request.headers.get('origin') || 'http://localhost:3001'}/api/admin/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '', // Forward session cookies
      },
      body: JSON.stringify({
        userId: parseInt(userId)
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { 
          success: false,
          error: tokenData.error || 'Failed to create API key',
          ...tokenData 
        },
        { status: tokenResponse.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'API key creation test completed successfully!',
      tokenData: tokenData,
      userEmail: session.user.email,
      userId: userId,
    })

  } catch (error) {
    console.error('[Test API Key Trial] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Test failed'
    }, { status: 500 })
  }
}