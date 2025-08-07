import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

/**
 * Test endpoint to debug admin API integration specifically for webhook bot count updates
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

    const { testType, botCount = 5, subscriptionId = 'test_sub_' + Date.now() } = await request.json()

    const adminApiUrl = process.env.ADMIN_API_URL
    const adminApiToken = process.env.ADMIN_API_TOKEN

    console.log(`[Test Admin] Testing admin API integration`)
    console.log(`[Test Admin] Admin API URL: ${adminApiUrl}`)
    console.log(`[Test Admin] User email: ${session.user.email}`)

    if (!adminApiUrl || !adminApiToken) {
      return NextResponse.json({
        success: false,
        error: 'Admin API configuration missing',
        config: {
          adminApiUrl: !!adminApiUrl,
          adminApiToken: !!adminApiToken
        }
      }, { status: 500 })
    }

    switch (testType) {
      case 'test_admin_connectivity':
        // Test if admin API is reachable
        try {
          const healthResponse = await fetch(`${adminApiUrl}/health`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          })
          
          return NextResponse.json({
            success: true,
            message: 'Admin API connectivity test',
            adminApiUrl,
            healthStatus: healthResponse.status,
            healthOk: healthResponse.ok
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Admin API unreachable',
            adminApiUrl,
            details: error instanceof Error ? error.message : 'Unknown error'
          })
        }

      case 'test_find_create_user':
        // Test user find/create functionality
        try {
          const userResponse = await fetch(`${adminApiUrl}/admin/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Admin-API-Key': adminApiToken,
            },
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.email.split('@')[0],
            }),
          })

          if (!userResponse.ok) {
            const errorBody = await userResponse.text()
            return NextResponse.json({
              success: false,
              error: 'Failed to find/create user',
              status: userResponse.status,
              body: errorBody
            })
          }

          const user = await userResponse.json()
          return NextResponse.json({
            success: true,
            message: 'User find/create test successful',
            user: {
              id: user.id,
              email: user.email,
              currentBotLimit: user.max_concurrent_bots,
              subscriptionStatus: user.data?.subscription_status || 'none'
            }
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'User find/create failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          })
        }

      case 'test_update_bot_count':
        // Test bot count update functionality
        try {
          // First, find/create user
          const userResponse = await fetch(`${adminApiUrl}/admin/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Admin-API-Key': adminApiToken,
            },
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.email.split('@')[0],
            }),
          })

          if (!userResponse.ok) {
            const errorBody = await userResponse.text()
            return NextResponse.json({
              success: false,
              error: 'Failed to find/create user for bot count test',
              status: userResponse.status,
              body: errorBody
            })
          }

          const user = await userResponse.json()
          const originalBotCount = user.max_concurrent_bots

          // Now update bot count
          const updatePayload = {
            max_concurrent_bots: botCount,
            data: {
              stripe_subscription_id: subscriptionId,
              subscription_tier: 'api_key_trial',
              subscription_status: 'trialing',
              subscription_end_date: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
              updated_by_webhook: new Date().toISOString(),
              test_update: true
            }
          }

          const updateResponse = await fetch(`${adminApiUrl}/admin/users/${user.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-Admin-API-Key': adminApiToken,
            },
            body: JSON.stringify(updatePayload),
          })

          if (!updateResponse.ok) {
            const errorBody = await updateResponse.text()
            return NextResponse.json({
              success: false,
              error: 'Failed to update bot count',
              status: updateResponse.status,
              body: errorBody,
              payload: updatePayload
            })
          }

          const updatedUser = await updateResponse.json()
          return NextResponse.json({
            success: true,
            message: 'Bot count update test successful',
            results: {
              userId: user.id,
              email: user.email,
              originalBotCount,
              newBotCount: updatedUser.max_concurrent_bots,
              updateSuccessful: updatedUser.max_concurrent_bots === botCount,
              subscriptionData: updatedUser.data
            }
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Bot count update test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          })
        }

      case 'test_full_webhook_simulation':
        // Simulate complete webhook flow
        try {
          // Import the webhook function to test it directly
          const { updateUserInAdminApi } = await import('../webhook/route')
          
          await updateUserInAdminApi({
            email: session.user.email,
            botCount: botCount,
            subscriptionId: subscriptionId,
            tier: 'api_key_trial',
            status: 'trialing',
            nextPaymentDate: new Date(Date.now() + 60 * 60 * 1000).toISOString()
          })

          return NextResponse.json({
            success: true,
            message: 'Full webhook simulation successful',
            simulationData: {
              email: session.user.email,
              botCount,
              subscriptionId,
              tier: 'api_key_trial',
              status: 'trialing'
            }
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Webhook simulation failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          })
        }

      default:
        return NextResponse.json({
          error: 'Unknown test type',
          availableTests: [
            'test_admin_connectivity',
            'test_find_create_user',
            'test_update_bot_count',
            'test_full_webhook_simulation'
          ]
        }, { status: 400 })
    }

  } catch (error) {
    console.error('[Test Admin] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}