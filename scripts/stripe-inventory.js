#!/usr/bin/env node

/**
 * Stripe Inventory Check Script
 * 
 * This script will list all products and prices in your Stripe account.
 * Use this to see what will be cleaned up before running the cleanup script.
 * 
 * Usage:
 * 1. Set your STRIPE_SECRET_KEY environment variable
 * 2. Run: node scripts/stripe-inventory.js
 */

const Stripe = require('stripe');

// Check for Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.error('Please set it with: export STRIPE_SECRET_KEY=sk_test_...');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkInventory() {
  console.log('📋 Checking Stripe inventory...\n');
  
  try {
    // Get all products
    const products = await stripe.products.list({ limit: 100 });
    console.log(`📦 Products (${products.data.length}):`);
    
    if (products.data.length === 0) {
      console.log('  No products found');
    } else {
      products.data.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} (${product.id})`);
        console.log(`     Active: ${product.active}`);
        console.log(`     Created: ${new Date(product.created * 1000).toISOString()}`);
        if (product.description) {
          console.log(`     Description: ${product.description}`);
        }
        console.log('');
      });
    }

    // Get all prices
    const prices = await stripe.prices.list({ limit: 100 });
    console.log(`💰 Prices (${prices.data.length}):`);
    
    if (prices.data.length === 0) {
      console.log('  No prices found');
    } else {
      prices.data.forEach((price, index) => {
        console.log(`  ${index + 1}. ${price.id}`);
        console.log(`     Product: ${price.product || 'Orphaned'}`);
        console.log(`     Active: ${price.active}`);
        console.log(`     Type: ${price.type}`);
        console.log(`     Amount: ${price.unit_amount} ${price.currency}`);
        if (price.recurring) {
          console.log(`     Recurring: ${price.recurring.interval}`);
        }
        console.log('');
      });
    }

    // Summary
    const activeProducts = products.data.filter(p => p.active).length;
    const activePrices = prices.data.filter(p => p.active).length;
    const orphanedPrices = prices.data.filter(p => !p.product).length;

    console.log('📊 Summary:');
    console.log(`  Total Products: ${products.data.length} (${activeProducts} active)`);
    console.log(`  Total Prices: ${prices.data.length} (${activePrices} active)`);
    console.log(`  Orphaned Prices: ${orphanedPrices}`);
    
    if (products.data.length > 0 || prices.data.length > 0) {
      console.log('\n💡 To clean up all products and prices, run:');
      console.log('   node scripts/stripe-cleanup.js');
    } else {
      console.log('\n✅ No products or prices to clean up!');
    }

  } catch (error) {
    console.error('❌ Error checking inventory:', error.message);
    process.exit(1);
  }
}

checkInventory(); 