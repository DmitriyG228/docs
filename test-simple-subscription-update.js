// Simple subscription update test
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testSimpleUpdate() {
  console.log('🧪 Testing simple subscription update...');
  
  // Update subscription and monitor webhook
  const subscriptionId = 'sub_1RtDhkFYKA8urbwFHTgidoId';
  
  console.log(`🔄 Updating subscription ${subscriptionId}...`);
  console.log('👀 WATCH YOUR NEXT.JS CONSOLE FOR WEBHOOK LOGS!');
  
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentItem = subscription.items.data[0];
    const currentQuantity = currentItem.quantity;
    const newQuantity = currentQuantity + 1;
    
    console.log(`📈 Changing quantity: ${currentQuantity} → ${newQuantity}`);
    
    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: currentItem.id,
        quantity: newQuantity
      }]
    });
    
    console.log('✅ Subscription updated!');
    console.log('📝 Check your Next.js console - you should see:');
    console.log('   🔔 [Webhook] === WEBHOOK CALL RECEIVED ===');
    console.log('   🎯 [Webhook] === SUBSCRIPTION UPDATED EVENT ===');
    console.log('   🚀 [Webhook] About to call updateUserInAdminApi');
    
    // Wait and revert
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: currentItem.id,
        quantity: currentQuantity
      }]
    });
    
    console.log(`↩️ Reverted back to ${currentQuantity}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSimpleUpdate();