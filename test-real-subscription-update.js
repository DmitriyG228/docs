// Test Customer Portal behavior with real subscription update
// Run with: node test-real-subscription-update.js

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testRealSubscriptionUpdate() {
  console.log('🧪 Testing real subscription update (simulates Customer Portal)...');
  
  try {
    // Get real subscription with items
    const subscription = await stripe.subscriptions.retrieve('sub_1RtDhkFYKA8urbwFHTgidoId', {
      expand: ['items']
    });
    
    console.log('📊 Current subscription:');
    console.log(`  - ID: ${subscription.id}`);
    console.log(`  - Customer: ${subscription.customer}`);
    console.log(`  - Status: ${subscription.status}`);
    
    const currentItem = subscription.items.data[0];
    console.log(`  - Current quantity: ${currentItem.quantity}`);
    console.log(`  - Price: ${currentItem.price.nickname}`);
    
    // Update quantity (like Customer Portal would)
    const newQuantity = currentItem.quantity + 5;
    console.log(`\n🔄 Updating quantity: ${currentItem.quantity} → ${newQuantity}`);
    
    await stripe.subscriptions.update(subscription.id, {
      items: [{
        id: currentItem.id,
        quantity: newQuantity
      }]
    });
    
    console.log('✅ Subscription updated successfully!');
    console.log('👀 Check your webhook logs for processing...');
    
    // Wait for webhook processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check user bot count
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
      console.log(`\n📊 User bot count: ${user.max_concurrent_bots}`);
      console.log(`📊 Expected: ${newQuantity}`);
      
      if (user.max_concurrent_bots === newQuantity) {
        console.log('🎉 SUCCESS: Customer Portal simulation worked!');
        console.log('✅ Webhook correctly updated bot count from subscription change');
      } else {
        console.log('❌ Bot count not updated - webhook may have failed');
      }
    }
    
    // Revert change
    console.log(`\n↩️ Reverting to original quantity: ${currentItem.quantity}`);
    await stripe.subscriptions.update(subscription.id, {
      items: [{
        id: currentItem.id,
        quantity: currentItem.quantity
      }]
    });
    console.log('✅ Reverted successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRealSubscriptionUpdate();