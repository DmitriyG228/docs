// Test subscription quantity change simulation
// Run with: node test-subscription-quantity-change.js

require('dotenv').config();

async function testSubscriptionQuantityChange() {
  console.log('🧪 Testing subscription quantity change via webhook...');
  
  // Simulate a webhook call for subscription.updated with different quantity
  const webhookPayload = {
    id: 'evt_test_webhook',
    object: 'event',
    api_version: '2024-06-20',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'sub_1RqzYxFLC53EHCR62nO5pVeW', // Real subscription ID
        object: 'subscription',
        cancel_at_period_end: false,
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
        customer: 'cus_SmYg16SKEdIcgT',
        items: {
          object: 'list',
          data: [
            {
              id: 'si_test123',
              object: 'subscription_item',
              price: {
                id: 'price_startup',
                nickname: 'Startup',
                unit_amount: 5000
              },
              quantity: 500 // Changed from 1 to 500
            }
          ]
        },
        metadata: {},
        status: 'active'
      }
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_test123',
      idempotency_key: null
    },
    type: 'customer.subscription.updated'
  };
  
  console.log('📋 Simulating webhook with quantity change: 1 → 500 bots');
  
  try {
    // Create a proper Stripe signature for the webhook
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not found in environment');
    }
    
    const crypto = require('crypto');
    const payload = JSON.stringify(webhookPayload);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');
    
    const stripeSignature = `t=${timestamp},v1=${signature}`;
    
    console.log('🔐 Generated Stripe signature for webhook verification');
    
    // Send webhook to our endpoint
    const response = await fetch('http://localhost:3001/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': stripeSignature,
      },
      body: payload,
    });
    
    console.log('📊 Webhook response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Webhook failed:', errorText);
      return;
    }
    
    const result = await response.text();
    console.log('✅ Webhook response:', result);
    
    // Wait a moment then check the user's bot count
    console.log('\n⏳ Waiting 2 seconds then checking user bot count...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check updated bot count
    const adminApiUrl = process.env.ADMIN_API_URL;
    const adminApiToken = process.env.ADMIN_API_TOKEN;
    
    const userResponse = await fetch(`${adminApiUrl}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-API-Key': adminApiToken,
      },
      body: JSON.stringify({
        email: 'dmitry@vexa.ai',
        name: 'Dmitry',
      }),
    });
    
    if (userResponse.ok) {
      const user = await userResponse.json();
      console.log(`📊 Current bot count: ${user.max_concurrent_bots}`);
      
      if (user.max_concurrent_bots === 500) {
        console.log('🎉 SUCCESS: Bot count updated correctly from 1 to 500!');
      } else {
        console.log(`❌ FAILURE: Expected 500 bots, got ${user.max_concurrent_bots}`);
      }
      
      console.log('📋 Updated user data:', JSON.stringify(user.data, null, 2));
    } else {
      console.error('❌ Failed to retrieve user data');
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error.message);
    console.error('📋 Full error:', error);
  }
}

testSubscriptionQuantityChange();