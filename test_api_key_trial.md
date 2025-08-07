# API Key Trial Creation Test Guide

## Overview
This document explains how to test the new automatic 1-hour trial creation when users create API keys.

## New Features Implemented

### 1. Automatic Trial Creation
- **When**: Every time a new API key is created 
- **Condition**: Only if the user has NO subscription whatsoever (any status: active, trialing, past_due, canceled, etc.)
- **Duration**: Exactly 1 hour (3600 seconds) from creation time
- **Access**: 1 concurrent bot
- **Clear Messaging**: User is explicitly told "API key will work for exactly 1 hour"

### 2. Enhanced Subscription Prevention Logic
- Checks for ALL subscriptions regardless of status (active, trialing, past_due, canceled, incomplete, etc.)
- Prevents ANY duplicate subscription creation
- Detailed logging of all existing subscriptions
- Returns subscription details for transparency

### 3. Enhanced UI Feedback
- API key creation shows trial information in success toast
- TrialStatus component now displays hours/minutes for short trials
- Clear messaging about trial duration and bot access

## Testing Steps

### Prerequisites
1. User must be authenticated (signed in with Google)
2. Stripe integration must be configured
3. `stripe_sync.py` must have been run to create products/prices

### Manual Testing

#### Test Case 1: New User Creates First API Key
1. Sign in with a new Google account that has never used the platform
2. Navigate to `/dashboard/api-keys`
3. Click "Create New API Key"
4. **Expected Result**: 
   - API key created successfully
   - Toast message: "🎉 API Key + 1-Hour FREE Trial Created! Your API key will work for exactly 1 hour with 1 bot access. This API key will stop working after 1 hour unless you add a payment method."
   - New Stripe subscription created with 1-hour trial (trial_end timestamp)
   - Visual trial indicator shown on the API key for 5 minutes after creation
   - User can immediately use API for bot requests

#### Test Case 2: User with Existing Subscription Creates API Key
1. Sign in with account that already has active Stripe subscription
2. Navigate to `/dashboard/api-keys`
3. Click "Create New API Key"
4. **Expected Result**:
   - API key created successfully
   - Toast message: "API key created" (no trial mention)
   - No new Stripe subscription created
   - User continues using existing subscription

#### Test Case 3: User with Existing Trial Creates API Key
1. Sign in with account that already has active trial
2. Navigate to `/dashboard/api-keys`  
3. Click "Create New API Key"
4. **Expected Result**:
   - API key created successfully
   - No new trial created (prevents duplicates)
   - Uses existing trial subscription

### Automated Testing Endpoint

#### Test Endpoint: `/api/stripe/test-api-key-trial`
```bash
# Test the API key trial creation flow
curl -X POST http://localhost:3001/api/stripe/test-api-key-trial \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "API key creation test completed successfully!",
  "tokenData": {
    "id": 123,
    "token": "generated-api-key",
    "trialCreated": true,
    "trialDuration": "1 hour",
    "trialExpiresAt": "2024-01-01T15:00:00.000Z",
    "message": "🎉 API key created with 1-hour FREE trial! Your API key will work for exactly 1 hour with access to 1 bot. Start using it immediately!",
    "importantNote": "This API key will stop working after 1 hour unless you add a payment method."
  },
  "userEmail": "user@example.com",
  "userId": "456"
}
```

## Verification Points

### 1. Database/Admin API Verification
- Check that API token was created in the database
- Verify user's `max_concurrent_bots` set to 1
- Confirm `subscription_status` is "trialing"
- Validate `subscription_tier` is "api_key_trial"

### 2. Stripe Verification
- New customer created (if first-time user)
- Subscription created with `trial_end` timestamp 1 hour from creation
- Subscription metadata includes:
  ```json
  {
    "userId": "123",
    "botCount": "1", 
    "tier": "api_key_trial",
    "userEmail": "user@example.com",
    "trialType": "1_hour",
    "createdVia": "api_key_creation"
  }
  ```

### 3. UI Verification
- Trial status component shows "X hours remaining" or "X minutes remaining"
- Dashboard displays trial information correctly
- API key creation success message includes trial information

## Key Implementation Details

### Files Modified
1. **`docs/app/api/admin/tokens/route.ts`**
   - Added Stripe integration
   - Added `hasActiveSubscription()` check
   - Added `create1HourTrial()` function
   - Modified POST handler to create trials

2. **`docs/app/dashboard/api-keys/page.tsx`**
   - Enhanced success toast to show trial information
   - Displays appropriate messages based on trial creation

3. **`docs/app/dashboard/components/TrialStatus.tsx`**
   - Updated time display for hour/minute granularity
   - Dynamic messaging based on time remaining

### Security Features
- Session validation ensures only authenticated users can create trials
- Duplicate trial prevention via Stripe subscription checking
- Error handling doesn't break API key creation if trial creation fails
- Detailed logging for troubleshooting

### Performance Considerations
- Trial checking happens in parallel with API key creation
- Non-blocking trial creation (API key still created if trial fails)
- Efficient Stripe API calls with proper pagination

## Troubleshooting

### Common Issues
1. **"Bot subscription product not found"**: Run `stripe_sync.py` script
2. **"Authentication required"**: User session expired, re-login needed  
3. **"Admin API not configured"**: Check `ADMIN_API_TOKEN` environment variable
4. **Trial creation fails but API key succeeds**: Check Stripe API key permissions

### Log Messages to Watch For
- `[API Key Creation] Creating API key for user X`
- `[API Key Creation] User X has active subscription: true/false`  
- `[API Key Trial] Creating 1-hour trial for user@example.com`
- `[API Key Trial] Created 1-hour trial subscription: sub_xxxxx, expires at: 2024-01-01T15:00:00Z`

## Next Steps
1. Test with real Stripe account in test mode
2. Verify bot usage enforcement respects 1-hour trial limits
3. Test trial expiration behavior  
4. Add monitoring/analytics for trial conversion rates