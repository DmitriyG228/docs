import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import Stripe from 'stripe';

// Admin API endpoint
const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:8000';
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// Check if Admin API token is configured
if (!ADMIN_API_TOKEN) {
  console.error('ADMIN_API_TOKEN environment variable is not set. Admin API operations will fail.');
}

/**
 * Check if user has ANY subscriptions (active, trialing, past_due, etc.)
 * Returns true if user has ANY subscription to prevent duplicate trial creation
 */
async function hasAnySubscription(email: string): Promise<{hasSubscription: boolean, subscriptionDetails?: any[]}> {
  try {
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      console.log(`[Subscription Check] No customer found for ${email}`);
      return { hasSubscription: false };
    }

    const customer = customers.data[0];
    console.log(`[Subscription Check] Found customer ${customer.id} for ${email}`);

    // Check for ALL subscriptions regardless of status
    const allSubscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 50, // Increased limit to catch all subscriptions
    });

    const subscriptionDetails = allSubscriptions.data.map(sub => ({
      id: sub.id,
      status: sub.status,
      trial_end: sub.trial_end,
      // current_period_end: available on paid subscriptions
      created: sub.created,
      metadata: sub.metadata
    }));

    console.log(`[Subscription Check] Found ${allSubscriptions.data.length} total subscriptions for ${email}:`, 
      subscriptionDetails.map(s => `${s.id} (${s.status})`).join(', '));

    // Return true if user has ANY subscription (regardless of status)
    // This prevents creating multiple trials/subscriptions
    const hasAnySubscription = allSubscriptions.data.length > 0;

    return { 
      hasSubscription: hasAnySubscription, 
      subscriptionDetails: subscriptionDetails 
    };
  } catch (error) {
    console.error('[Subscription Check] Error checking subscriptions:', error);
    // On error, assume no subscription to allow trial creation (safer default)
    return { hasSubscription: false };
  }
}

/**
 * Create a 1-hour trial subscription for the user
 */
async function create1HourTrial(email: string, userId: number): Promise<void> {
  try {
    console.log(`[API Key Trial] Creating 1-hour trial for ${email} (user ID: ${userId})`);
    
    // Find existing product and price
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    });
    
    const botProduct = products.data.find(p => p.name === "Bot subscription");
    if (!botProduct) {
      throw new Error("Bot subscription product not found. Please run the stripe_sync.py script first.");
    }

    const prices = await stripe.prices.list({
      product: botProduct.id,
      active: true,
      limit: 100,
    });

    const startupPrice = prices.data.find(p => p.nickname === "Startup");
    if (!startupPrice) {
      throw new Error("Startup price not found. Please run the stripe_sync.py script first.");
    }

    // Create or get customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log(`[API Key Trial] Found existing customer: ${customer.id}`);
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId.toString(),
        },
      });
      console.log(`[API Key Trial] Created new customer: ${customer.id}`);
    }

    // Calculate trial end time (1 hour from now)
    const trialEndTime = Math.floor(Date.now() / 1000) + (60 * 60); // 1 hour in seconds

    // Create subscription with 1-hour trial
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: startupPrice.id,
          quantity: 1, // 1 bot for trial
        },
      ],
      trial_end: trialEndTime, // 1 hour from now
      trial_settings: {
        end_behavior: {
          missing_payment_method: 'cancel',
        },
      },
      metadata: {
        userId: userId.toString(),
        botCount: '1',
        tier: 'api_key_trial',
        userEmail: email,
        trialType: '1_hour',
        createdVia: 'api_key_creation',
      },
    });

    console.log(`[API Key Trial] Created 1-hour trial subscription: ${subscription.id}, expires at: ${new Date(trialEndTime * 1000).toISOString()}`);

    // Update user in admin API with subscription info
    if (ADMIN_API_TOKEN) {
      try {
        await fetch(`${ADMIN_API_URL}/admin/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-API-Key': ADMIN_API_TOKEN,
          },
          body: JSON.stringify({
            stripe_customer_id: customer.id,
            stripe_subscription_id: subscription.id,
            max_concurrent_bots: 1,
            subscription_status: 'trialing',
            subscription_tier: 'api_key_trial',
          }),
        });
        console.log(`[API Key Trial] Updated user ${userId} with trial subscription info`);
      } catch (updateError) {
        console.error(`[API Key Trial] Failed to update user ${userId}:`, updateError);
      }
    }

  } catch (error) {
    console.error(`[API Key Trial] Error creating 1-hour trial for ${email}:`, error);
    throw error;
  }
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

    // Get user session to access email
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
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

    console.log(`[API Key Creation] Creating API key for user ${userId} (${session.user.email})`);

    // Check if user has ANY subscription before creating the API key
    const subscriptionCheck = await hasAnySubscription(session.user.email);
    console.log(`[API Key Creation] User ${session.user.email} has any subscription: ${subscriptionCheck.hasSubscription}`);

    // Create the API token first via Admin API
    const response = await fetch(`${ADMIN_API_URL}/admin/users/${userId}/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-API-Key': ADMIN_API_TOKEN,
      },
    });

    // Get the response data
    const responseData = await response.json();

    // Return error if API key creation failed
    if (!response.ok) {
      return NextResponse.json(
        responseData,
        { status: response.status }
      );
    }

    console.log(`[API Key Creation] Successfully created API key for user ${userId}`);

    // If no subscription exists at all, create a 1-hour trial
    if (!subscriptionCheck.hasSubscription) {
      try {
        console.log(`[API Key Creation] No subscription found, creating 1-hour trial for ${session.user.email}`);
        await create1HourTrial(session.user.email, userId);
        console.log(`[API Key Creation] Successfully created 1-hour trial for ${session.user.email}`);
        
        // Add trial info to the response with clear 1-hour messaging
        responseData.trialCreated = true;
        responseData.trialDuration = '1 hour';
        responseData.trialExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now
        responseData.message = '🎉 API key created with 1-hour FREE trial! Your API key will work for exactly 1 hour with access to 1 bot. Start using it immediately!';
        responseData.importantNote = 'This API key will stop working after 1 hour unless you add a payment method.';
      } catch (trialError) {
        console.error(`[API Key Creation] Failed to create trial for ${session.user.email}:`, trialError);
        // Don't fail the API key creation if trial creation fails
        responseData.trialCreated = false;
        responseData.trialError = 'Failed to create trial, but API key was created successfully.';
        responseData.message = 'API key created successfully, but trial creation failed. Please contact support.';
      }
    } else {
      console.log(`[API Key Creation] User ${session.user.email} already has subscription(s), skipping trial creation`);
      console.log(`[API Key Creation] Existing subscriptions:`, subscriptionCheck.subscriptionDetails?.map(s => `${s.id} (${s.status})`));
      responseData.trialCreated = false;
      responseData.existingSubscriptions = subscriptionCheck.subscriptionDetails;
      responseData.message = 'API key created successfully. You already have an existing subscription - no trial needed!';
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