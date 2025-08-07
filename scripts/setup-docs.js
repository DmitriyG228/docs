#!/usr/bin/env node

/**
 * Setup script for docs project
 * This script runs before the Next.js dev server starts
 */

// Load environment variables from .env file
require('dotenv').config();

console.log('📋 Setting up docs project...');

// Check if required environment variables are present
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID', 
  'GOOGLE_CLIENT_SECRET',
  'ADMIN_API_URL',
  'ADMIN_API_TOKEN'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️  Warning: Missing environment variables:', missingVars.join(', '));
  console.log('💡 Make sure to configure these in your .env file');
} else {
  console.log('✅ All required environment variables are configured');
}

// Check if Stripe is configured
const stripeVars = ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET'];
const missingStripeVars = stripeVars.filter(varName => !process.env[varName]);

if (missingStripeVars.length === 0) {
  console.log('✅ Stripe configuration complete');
} else {
  console.log('💳 Stripe variables missing:', missingStripeVars.join(', '));
}

console.log('🚀 Setup complete - starting Next.js dev server...\n');

process.exit(0);