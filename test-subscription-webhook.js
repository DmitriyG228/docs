// Quick test to debug subscription webhook processing
// Run this with: node test-subscription-webhook.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testSubscriptionProcessing() {
  try {
    console.log('🧪 Testing subscription webhook processing...');
    
    // Get the latest subscription to test with
    const subscriptions = await stripe.subscriptions.list({ limit: 1 });
    
    if (subscriptions.data.length === 0) {
      console.log('❌ No subscriptions found');
      return;
    }
    
    const subscription = subscriptions.data[0];
    console.log('📋 Testing with subscription:', subscription.id);
    console.log('📋 Customer:', subscription.customer);
    console.log('📋 Status:', subscription.status);
    console.log('📋 Items:', subscription.items.data.length);
    
    // Test customer retrieval
    const customer = await stripe.customers.retrieve(subscription.customer);
    console.log('✅ Customer retrieved:', customer.email);
    
    // Test subscription item analysis
    const item = subscription.items.data[0];
    if (item) {
      console.log('✅ First item found');
      console.log('  - Price ID:', item.price.id);
      console.log('  - Price nickname:', item.price.nickname);
      console.log('  - Quantity:', item.quantity);
    } else {
      console.log('❌ No subscription items found');
    }
    
    // Test metadata analysis
    console.log('📋 Subscription metadata:', subscription.metadata);
    
    // Test bot count calculation logic
    const botCountFromMetadata = subscription.metadata?.botCount ? 
      parseInt(subscription.metadata.botCount, 10) : null;
    const botCountFromItem = item?.quantity || 0;
    const isApiKeyTrial = subscription.metadata?.tier === 'api_key_trial' || 
      subscription.metadata?.trialType === '1_hour';
    
    console.log('🧮 Bot count calculation:');
    console.log('  - From metadata:', botCountFromMetadata);
    console.log('  - From item quantity:', botCountFromItem);
    console.log('  - Is API key trial:', isApiKeyTrial);
    
    let actualBotCount;
    if (isApiKeyTrial) {
      actualBotCount = 1;
    } else if (botCountFromMetadata) {
      actualBotCount = botCountFromMetadata;
    } else if (botCountFromItem > 0) {
      actualBotCount = botCountFromItem;
    } else {
      const priceNickname = item?.price.nickname?.toLowerCase();
      if (priceNickname?.includes('startup')) {
        actualBotCount = Math.max(botCountFromItem, 5);
      } else if (priceNickname?.includes('mvp')) {
        actualBotCount = 1;
      } else {
        actualBotCount = Math.max(botCountFromItem, 1);
      }
    }
    
    console.log('✅ Calculated bot count:', actualBotCount);
    
  } catch (error) {
    console.error('❌ Error in test:', error.message);
    console.error('📋 Full error:', error);
  }
}

testSubscriptionProcessing();