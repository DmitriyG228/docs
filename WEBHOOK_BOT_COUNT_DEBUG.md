# 🐛 Webhook Bot Count Update Debug Guide

## Issue Summary
The webhook is not successfully updating the `max_concurrent_bots` field in the admin API database when Stripe subscription events occur.

## ✅ Fixes Applied

### 1. **Enhanced Logging and Error Handling**
- Added comprehensive debug logging to `updateUserInAdminApi` function
- Added error details for failed API calls
- Added payload logging for troubleshooting

### 2. **Fixed Critical Bugs** 
- **FIXED**: Missing user variable declaration in webhook
- **FIXED**: Improved error handling with detailed error messages
- **FIXED**: Added admin API configuration validation

### 3. **Created Debug Tools**
- **NEW**: `/api/stripe/test-admin` endpoint for testing admin API integration
- **NEW**: Enhanced test script with admin API testing
- **NEW**: Comprehensive debug logging

---

## 🧪 Testing the Fix

### **Step 1: Check Environment Configuration**
```bash
./test-webhook.sh environment
```
**Expected**: All environment variables should be configured

### **Step 2: Test Admin API Connectivity**
```bash
# Basic connectivity test
curl -s http://localhost:18056/admin/users

# Full admin API integration test (requires authentication)
./test-webhook.sh admin
```

### **Step 3: Test Bot Count Update Flow**
```bash
# Use the dedicated admin test endpoint
curl -X POST http://localhost:3001/api/stripe/test-admin \
  -H "Content-Type: application/json" \
  -d '{"testType": "test_update_bot_count", "botCount": 5}'
```

### **Step 4: Trigger Real Webhook Test**
```bash
# Create API key (triggers 1-hour trial)
# Monitor logs for webhook processing
# Check database for bot count update
```

---

## 🔍 Debug Process

### **1. Monitor Webhook Logs**
When a subscription event occurs, watch for these log entries:

```bash
# Expected successful flow:
[Webhook] DEBUG: Updating user in admin API: {...}
[Webhook] Found/created user: user@example.com (ID: 123)
[Webhook] DEBUG: Update payload: {...}
[Webhook] DEBUG: Will update max_concurrent_bots to: 1
[Webhook] DEBUG: Admin API update response status: 200
[Webhook] ✅ User user@example.com updated successfully. Current bot limit: 1
```

### **2. Common Error Patterns**

#### **Error: "Admin API URL or Token is not configured"**
```bash
# Fix: Check environment variables
echo $ADMIN_API_URL
echo $ADMIN_API_TOKEN
```

#### **Error: "Failed to find/create user: 404"**
```bash
# Fix: Admin API not running or wrong endpoint
curl -s http://localhost:18056/admin/users
```

#### **Error: "Failed to update user: 401"** 
```bash
# Fix: Wrong admin API token
# Check token in admin API logs
```

#### **Error: "Failed to update user: 422"**
```bash
# Fix: Invalid payload format
# Check update payload in logs
```

### **3. Database Verification**

After webhook triggers, verify bot count was updated:

```sql
-- Check user's current bot limit
SELECT id, email, max_concurrent_bots, data->>'subscription_status' 
FROM users 
WHERE email = 'user@example.com';
```

---

## 🎯 Expected Webhook Flow

### **1-Hour Trial Creation (API Key)**
1. **User creates API key** → triggers `POST /api/admin/tokens`
2. **API endpoint calls** → `create1HourTrial()` function  
3. **Stripe subscription created** → webhook `customer.subscription.created`
4. **Webhook calls admin API** → updates `max_concurrent_bots = 1`
5. **Database updated** → user gets 1 bot limit

### **Customer Portal Changes**
1. **User adds payment method** → webhook `payment_method.attached`
2. **User upgrades plan** → webhook `customer.subscription.updated`
3. **Webhook calculates new bot count** → calls admin API
4. **Database updated** → user gets new bot limit

---

## 🔧 Manual Testing Commands

### **Test 1: Direct Admin API Call**
```bash
# Load environment
source .env

# Test user creation
curl -X POST "$ADMIN_API_URL/admin/users" \
  -H "Content-Type: application/json" \
  -H "X-Admin-API-Key: $ADMIN_API_TOKEN" \
  -d '{"email": "test@example.com", "name": "Test User"}'

# Test bot count update (replace USER_ID)
curl -X PATCH "$ADMIN_API_URL/admin/users/1" \
  -H "Content-Type: application/json" \
  -H "X-Admin-API-Key: $ADMIN_API_TOKEN" \
  -d '{"max_concurrent_bots": 5}'
```

### **Test 2: Webhook Function Test**
```bash
# Test webhook admin integration
curl -X POST http://localhost:3001/api/stripe/test-admin \
  -H "Content-Type: application/json" \
  -d '{
    "testType": "test_full_webhook_simulation", 
    "botCount": 3
  }'
```

### **Test 3: Real API Key Creation**
```bash
# Create API key via dashboard → check logs → verify database
# Should trigger webhook and update bot count to 1
```

---

## 🚨 Troubleshooting Checklist

### ✅ **Environment Configuration**
- [ ] `ADMIN_API_URL=http://localhost:18056` (correct port)
- [ ] `ADMIN_API_TOKEN` matches admin API configuration
- [ ] `STRIPE_WEBHOOK_SECRET` configured correctly

### ✅ **Admin API Status**
- [ ] Admin API service is running
- [ ] Admin API accessible on port 18056  
- [ ] Admin API authentication working
- [ ] Database connection healthy

### ✅ **Webhook Processing**
- [ ] Webhook endpoint receives Stripe events
- [ ] Webhook signature verification passes
- [ ] `updateUserInAdminApi` function executes
- [ ] Admin API calls succeed (status 200)

### ✅ **Database Updates**
- [ ] User record exists in database
- [ ] `max_concurrent_bots` field updates correctly
- [ ] Subscription data saves to `data` JSONB field
- [ ] Changes persist after webhook completes

---

## 🎉 Success Indicators

### **When Working Correctly:**
1. **API Key Creation** → Database shows `max_concurrent_bots: 1`
2. **Trial Conversion** → Database shows `max_concurrent_bots: 5` (or plan amount)
3. **Plan Upgrades** → Database reflects new bot count immediately
4. **Plan Cancellation** → Database shows `max_concurrent_bots: 0`

### **Webhook Logs Show:**
```
[Webhook] ✅ User user@example.com updated successfully. Current bot limit: 1, Status: trialing
[Webhook] DEBUG: Updated user data: {"id":123,"email":"user@example.com","max_concurrent_bots":1}
```

### **Database Query Shows:**
```sql
email               | max_concurrent_bots | subscription_status
user@example.com    | 1                   | trialing
```

---

## 📞 Next Steps

1. **Run Tests**: Use the debug tools to identify specific failure points
2. **Check Admin API**: Verify admin API is running and accessible
3. **Monitor Logs**: Watch webhook logs during API key creation
4. **Verify Database**: Confirm bot count updates are persisting
5. **Test Portal**: Verify Customer Portal changes trigger webhooks

The enhanced webhook with comprehensive logging should now provide clear visibility into where the bot count update is failing! 🚀