# Stripe Cleanup Tools

This directory contains tools to clean up all products and prices from your Stripe account.

## ⚠️ Warning

**These tools are destructive and will permanently delete products and deactivate prices from your Stripe account. This action cannot be undone.**

## Tools Available

### 1. Inventory Check Script
**File:** `scripts/stripe-inventory.js`

Check what products and prices exist in your Stripe account before cleanup.

```bash
# Set your Stripe secret key
export STRIPE_SECRET_KEY=sk_test_your_key_here

# Check inventory
node scripts/stripe-inventory.js
```

### 2. Cleanup Script
**File:** `scripts/stripe-cleanup.js`

Remove all products and deactivate all prices from your Stripe account.

```bash
# Set your Stripe secret key
export STRIPE_SECRET_KEY=sk_test_your_key_here

# Run cleanup (will prompt for confirmation)
node scripts/stripe-cleanup.js
```

### 3. API Endpoint
**File:** `app/api/stripe/cleanup/route.ts`

REST API endpoint for cleanup operations.

#### Check Inventory (GET)
```bash
curl -X GET http://localhost:3001/api/stripe/cleanup \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

#### Run Cleanup (POST)
```bash
curl -X POST http://localhost:3001/api/stripe/cleanup \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Usage Instructions

### Step 1: Check Current Inventory
First, see what's in your Stripe account:

```bash
cd docs
node scripts/stripe-inventory.js
```

This will show you:
- All products with their names, IDs, and status
- All prices with their amounts and status
- Summary of active vs inactive items
- Orphaned prices (prices without products)

### Step 2: Run Cleanup (if needed)
If you want to proceed with cleanup:

```bash
node scripts/stripe-cleanup.js
```

The script will:
1. Ask for confirmation before proceeding
2. List all products and prices found
3. Deactivate all prices (set `active: false`)
4. Delete all products
5. Handle orphaned prices
6. Provide a summary of what was cleaned up

### Step 3: Verify Cleanup
After cleanup, verify that everything was removed:

```bash
node scripts/stripe-inventory.js
```

You should see "No products found" and "No prices found".

## What Gets Cleaned Up

### Products
- All products in your Stripe account will be **permanently deleted**
- This includes products created by your application and any test products

### Prices
- All prices will be **deactivated** (set to `active: false`)
- This includes both recurring and one-time prices
- Orphaned prices (prices without products) are also deactivated

### What's NOT Affected
- Customers
- Subscriptions
- Payment methods
- Invoices
- Charges
- Webhooks
- API keys

## Environment Variables

Make sure you have your Stripe secret key set:

```bash
export STRIPE_SECRET_KEY=sk_test_your_key_here
```

**Important:** Use your test key (`sk_test_...`) for testing and your live key (`sk_live_...`) only when you're sure you want to clean up production data.

## API Endpoint Details

The API endpoint at `/api/stripe/cleanup` provides the same functionality as the scripts but through a REST API:

### GET `/api/stripe/cleanup`
Returns a summary of all products and prices:
```json
{
  "totalProducts": 5,
  "totalPrices": 12,
  "activeProducts": 3,
  "activePrices": 8,
  "products": [...],
  "prices": [...]
}
```

### POST `/api/stripe/cleanup`
Performs the cleanup and returns results:
```json
{
  "success": true,
  "message": "Stripe cleanup completed",
  "results": {
    "productsDeleted": 5,
    "pricesDeleted": 12,
    "errors": []
  }
}
```

## Security Notes

- The API endpoint requires authentication (user must be logged in)
- In production, you should add admin role checking to restrict cleanup to authorized users only
- The scripts require the Stripe secret key to be set as an environment variable

## Troubleshooting

### Common Issues

1. **"STRIPE_SECRET_KEY environment variable is required"**
   - Set your Stripe secret key: `export STRIPE_SECRET_KEY=sk_test_...`

2. **"Failed to delete product"**
   - Some products may have active subscriptions
   - Check the Stripe dashboard for any active subscriptions
   - Cancel subscriptions before running cleanup

3. **"Failed to deactivate price"**
   - Some prices may be in use by active subscriptions
   - The script will continue and report errors

### Getting Help

- Check the Stripe dashboard for active subscriptions
- Review the error messages in the console output
- Contact Stripe support if you need to recover deleted data

## Recovery

**Important:** Deleted products and deactivated prices cannot be recovered through the API. If you need to restore them:

1. Check your Stripe dashboard for any backup data
2. Contact Stripe support for assistance
3. Recreate products and prices manually if needed

## Best Practices

1. **Always check inventory first** before running cleanup
2. **Use test keys** for development and testing
3. **Backup important data** before running cleanup in production
4. **Test the cleanup process** in a test environment first
5. **Document your products and prices** before cleanup for easy recreation 