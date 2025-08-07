// Debug webhook processing by calling the webhook directly with test data
// Run with: node debug-webhook-processing.js

require('dotenv').config();
const crypto = require('crypto');

async function debugWebhookProcessing() {
  console.log('🐛 Debugging webhook processing...');
  
  // Create a test customer.subscription.updated event
  const testEvent = {
    id: 'evt_test_debug',
    object: 'event',
    api_version: '2024-09-30',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'sub_1RtDhkFYKA8urbwFHTgidoId', // Real subscription ID
        object: 'subscription',
        cancel_at_period_end: false,
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        customer: 'cus_SorQmNrP7ruJko', // Real customer ID
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
              quantity: 15 // Test quantity
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
  
  console.log('📋 Test event data:', JSON.stringify(testEvent, null, 2));
  
  try {
    // Create proper Stripe signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }
    
    const payload = JSON.stringify(testEvent);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');
    
    const stripeSignature = `t=${timestamp},v1=${signature}`;
    
    console.log('🔐 Generated signature for webhook');
    console.log('📤 Sending to webhook endpoint...');
    
    // Send to webhook
    const response = await fetch('http://localhost:3001/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': stripeSignature,
      },
      body: payload,
    });
    
    console.log(`📊 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Webhook failed:');
      console.error(errorText);
      
      // Parse the error to understand what's failing
      try {
        const errorObj = JSON.parse(errorText);
        console.error('📋 Parsed error:', errorObj);
      } catch (e) {
        console.error('📋 Raw error text:', errorText);
      }
    } else {
      const result = await response.text();
      console.log('✅ Webhook succeeded:', result);
      
      // Check if user was updated
      console.log('\n🔍 Checking user bot count...');
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
        console.log(`📊 User bot count: ${user.max_concurrent_bots}`);
        console.log(`📊 Expected: 15`);
        
        if (user.max_concurrent_bots === 15) {
          console.log('🎉 SUCCESS: Webhook updated bot count correctly!');
        } else {
          console.log('❌ Bot count not updated as expected');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error in webhook debug:', error.message);
    console.error('📋 Full error:', error);
  }
}

debugWebhookProcessing();