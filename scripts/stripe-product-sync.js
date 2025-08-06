#!/usr/bin/env node

/**
 * Stripe Product Sync Script
 * 
 * This script syncs products and prices in Stripe with your application's configuration.
 * It can create, update, or sync products based on your pricing tiers.
 * 
 * Usage:
 * 1. Set your STRIPE_SECRET_KEY environment variable
 * 2. Run: node scripts/stripe-product-sync.js
 */

const Stripe = require('stripe');

// Check for Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.error('Please set it with: export STRIPE_SECRET_KEY=sk_test_...');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Pricing configuration (matching your application logic)
const PRICING_CONFIG = {
  mvp: {
    name: 'Vexa AI Bots - MVP Plan',
    description: '1 concurrent meeting for MVP builders',
    unit_amount: 1200, // $12.00 in cents
    botCount: 1,
    tier: 'mvp'
  },
  startup: {
    name: 'Vexa AI Bots - Startup Plan',
    description: '5-29 concurrent bots for startups',
    botCount: 5,
    tier: 'startup'
  },
  growth: {
    name: 'Vexa AI Bots - Growth Plan', 
    description: '30-179 concurrent bots for growing businesses',
    botCount: 30,
    tier: 'growth'
  },
  scale: {
    name: 'Vexa AI Bots - Scale Plan',
    description: '180+ concurrent bots for enterprise',
    botCount: 180,
    tier: 'scale'
  }
};

// Pricing calculation function (same as your application)
function calculatePrice(bots) {
  const perBotCost = 10 + 14 * Math.exp(-bots / 100);
  let basePrice = Math.round(bots * Math.max(10, perBotCost));
  basePrice = Math.max(120, basePrice);
  
  if (bots >= 180) {
    basePrice = Math.round(basePrice * 0.85);
  } else if (bots >= 30) {
    basePrice = Math.round(basePrice * 0.90);
  } else if (bots >= 5) {
    basePrice = Math.round(basePrice * 0.95);
  }
  
  return Math.max(120, Math.max(bots * 10, basePrice));
}

async function syncProduct(tier) {
  const config = PRICING_CONFIG[tier];
  if (!config) {
    throw new Error(`Unknown tier: ${tier}`);
  }

  console.log(`🔄 Syncing ${tier} tier product...`);
  
  try {
    // Calculate price for this tier
    const price = calculatePrice(config.botCount);
    const unitAmount = tier === 'mvp' ? config.unit_amount : price * 100;
    
    console.log(`  Calculated price: $${(unitAmount / 100).toFixed(2)} for ${config.botCount} bots`);

    // Search for existing product
    const products = await stripe.products.search({
      query: `name:'${config.name}'`,
    });

    let product;
    if (products.data.length > 0) {
      product = products.data[0];
      console.log(`  Found existing product: ${product.id}`);
      
      // Try to update product if needed
      try {
        if (product.description !== config.description || !product.active) {
          await stripe.products.update(product.id, {
            description: config.description,
            active: true
          });
          console.log(`  ✅ Updated product ${product.id}`);
        }
      } catch (updateError) {
        if (updateError.message.includes('cannot be updated')) {
          console.log(`  ⚠️  Product cannot be updated (auto-created), creating new one...`);
          // Create new product instead
          product = await stripe.products.create({
            name: config.name,
            description: config.description,
            active: true
          });
          console.log(`  ✅ Created new product: ${product.id}`);
        } else {
          throw updateError;
        }
      }
    } else {
      // Create new product
      product = await stripe.products.create({
        name: config.name,
        description: config.description,
        active: true
      });
      console.log(`  ✅ Created new product: ${product.id}`);
    }

    // Check for existing prices
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      type: 'recurring',
    });

    let priceObj;
    const existingPrice = prices.data.find(p => p.unit_amount === unitAmount);
    
    if (existingPrice) {
      priceObj = existingPrice;
      console.log(`  Found existing price: ${priceObj.id}`);
    } else {
      // Create new price
      priceObj = await stripe.prices.create({
        currency: 'usd',
        unit_amount: unitAmount,
        recurring: {
          interval: 'month',
        },
        product: product.id,
        metadata: {
          botCount: config.botCount.toString(),
          tier: config.tier,
          pricePerBot: (unitAmount / 100 / config.botCount).toFixed(2)
        }
      });
      console.log(`  ✅ Created new price: ${priceObj.id}`);
    }

    // Set as default price if not already
    if (product.default_price !== priceObj.id) {
      await stripe.products.update(product.id, {
        default_price: priceObj.id
      });
      console.log(`  ✅ Set as default price`);
    }

    return {
      product: {
        id: product.id,
        name: product.name,
        active: product.active
      },
      price: {
        id: priceObj.id,
        unit_amount: priceObj.unit_amount,
        currency: priceObj.currency
      }
    };

  } catch (error) {
    console.error(`  ❌ Error syncing ${tier} tier:`, error.message);
    throw error;
  }
}

async function syncAllProducts() {
  console.log('🚀 Starting product sync...\n');
  
  const results = {
    synced: 0,
    errors: []
  };

  try {
    for (const tier of Object.keys(PRICING_CONFIG)) {
      try {
        await syncProduct(tier);
        results.synced++;
        console.log(`  ✅ ${tier} tier synced successfully\n`);
      } catch (error) {
        results.errors.push(`${tier}: ${error.message}`);
        console.log(`  ❌ ${tier} tier failed\n`);
      }
    }

    console.log('📊 Sync Summary:');
    console.log(`✅ Products synced: ${results.synced}`);
    
    if (results.errors.length > 0) {
      console.log(`❌ Errors: ${results.errors.length}`);
      results.errors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('🎉 All products synced successfully!');
    }

  } catch (error) {
    console.error('❌ Fatal error during sync:', error.message);
    process.exit(1);
  }
}

async function testProduct(tier) {
  console.log(`🧪 Testing ${tier} tier product...\n`);
  
  try {
    const result = await syncProduct(tier);
    
    console.log('✅ Test Results:');
    console.log(`  Product: ${result.product.name} (${result.product.id})`);
    console.log(`  Price: $${(result.price.unit_amount / 100).toFixed(2)} ${result.price.currency}`);
    console.log(`  Price ID: ${result.price.id}`);
    
    return result;
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    throw error;
  }
}

async function listProducts() {
  console.log('📋 Current products in Stripe:\n');
  
  try {
    const products = await stripe.products.list({ limit: 100 });
    
    if (products.data.length === 0) {
      console.log('No products found');
      return;
    }

    for (const product of products.data) {
      console.log(`📦 ${product.name} (${product.id})`);
      console.log(`   Active: ${product.active}`);
      console.log(`   Description: ${product.description || 'N/A'}`);
      
      if (product.default_price) {
        console.log(`   Default Price: ${product.default_price}`);
      }
      
      // Get prices for this product
      const prices = await stripe.prices.list({ product: product.id });
      console.log(`   Prices: ${prices.data.length}`);
      prices.data.forEach(price => {
        console.log(`     - ${price.id}: $${(price.unit_amount / 100).toFixed(2)} ${price.currency} (${price.active ? 'active' : 'inactive'})`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error listing products:', error.message);
  }
}

// Command line interface
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'sync':
      await syncAllProducts();
      break;
      
    case 'test':
      const tier = process.argv[3] || 'mvp';
      if (!PRICING_CONFIG[tier]) {
        console.error(`❌ Unknown tier: ${tier}`);
        console.error(`Available tiers: ${Object.keys(PRICING_CONFIG).join(', ')}`);
        process.exit(1);
      }
      await testProduct(tier);
      break;
      
    case 'list':
      await listProducts();
      break;
      
    default:
      console.log('Stripe Product Sync Tool');
      console.log('');
      console.log('Usage:');
      console.log('  node scripts/stripe-product-sync.js sync     # Sync all products');
      console.log('  node scripts/stripe-product-sync.js test     # Test MVP tier');
      console.log('  node scripts/stripe-product-sync.js test mvp # Test specific tier');
      console.log('  node scripts/stripe-product-sync.js list     # List current products');
      console.log('');
      console.log('Available tiers:', Object.keys(PRICING_CONFIG).join(', '));
      break;
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n❌ Sync interrupted.');
  process.exit(0);
});

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
}); 