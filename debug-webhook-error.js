#!/usr/bin/env node

const crypto = require('crypto');
require('dotenv').config();

const WEBHOOK_URL = 'http://localhost:3001/api/stripe/webhook';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Create a test event that should work
const testEvent = {
  id: 'evt_test_' + Date.now(),
  object: 'event',
  api_version: '2020-08-27',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: 'sub_test_' + Date.now(),
      object: 'subscription',
      status: 'active',
      customer: 'cus_test_' + Date.now(),
      items: {
        data: [{
          id: 'si_test_' + Date.now(),
          object: 'subscription_item',
          quantity: 5,
          price: {
            id: 'price_test_' + Date.now(),
            object: 'price',
            nickname: 'Startup Plan',
            unit_amount: 2000,
            currency: 'usd'
          }
        }]
      },
      metadata: {
        botCount: '5',
        tier: 'startup'
      },
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
      cancel_at_period_end: false
    }
  },
  type: 'customer.subscription.updated'
};

// Create proper Stripe signature
const payload = JSON.stringify(testEvent);
const timestamp = Math.floor(Date.now() / 1000);
const signature = crypto
  .createHmac('sha256', STRIPE_WEBHOOK_SECRET)
  .update(`${timestamp}.${payload}`)
  .digest('hex');

const stripeSignature = `t=${timestamp},v1=${signature}`;

console.log('🔐 Generated Stripe signature for webhook verification');
console.log(`📤 Sending subscription updated event to: ${WEBHOOK_URL}`);
console.log('📋 Event payload:');
console.log(JSON.stringify(testEvent, null, 2));

// Send the request
const https = require('https');
const url = require('url');

const parsedUrl = url.parse(WEBHOOK_URL);
const postData = payload;

const options = {
  hostname: parsedUrl.hostname,
  port: parsedUrl.port,
  path: parsedUrl.path,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': stripeSignature,
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`📊 Response status: ${res.statusCode}`);
  console.log(`📊 Response headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📋 Response body:');
    console.log(data);
    
    if (res.statusCode === 200) {
      console.log('✅ Webhook processed successfully');
    } else {
      console.log('❌ Webhook failed');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(postData);
req.end(); 