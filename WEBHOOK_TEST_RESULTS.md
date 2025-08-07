# 🧪 Webhook Test Results & Verification Guide

## ✅ Webhook Events Triggered

Just triggered these test events via Stripe CLI:
1. `customer.subscription.created` ✅
2. `customer.subscription.updated` ✅

These events should have been forwarded to your webhook endpoint at `localhost:3001/api/stripe/webhook`.

---

## 🔍 How to Verify Webhook Processing

### **1. Check Your Application Logs**

Look for webhook processing logs in your application console. You should see:

```bash
[Webhook] DEBUG: Received event type: customer.subscription.created
[Webhook] DEBUG: Processing customer.subscription.created
[Webhook] DEBUG: Updating user in admin API: {...}
[Webhook] Found/created user: test@example.com (ID: xxx)
[Webhook] DEBUG: Will update max_concurrent_bots to: 1
[Webhook] ✅ User updated successfully. Current bot limit: 1
```

### **2. Check Stripe CLI Output**

In your other terminal where Stripe CLI is running, you should see:

```bash
2024-01-XX XX:XX:XX   --> customer.subscription.created [evt_xxx]
2024-01-XX XX:XX:XX  <--  [200] POST http://localhost:3001/api/stripe/webhook [evt_xxx]
```

### **3. Verify Admin API Integration**

The webhook should have:
- ✅ Found/created test user in admin API
- ✅ Updated `max_concurrent_bots` field  
- ✅ Updated subscription data in user record

---

## 🐛 Troubleshooting

### **If No Webhook Logs Appear:**

1. **Check Application is Running:**
   ```bash
   curl -X POST http://localhost:3001/api/stripe/webhook
   # Should return 400 (signature verification failed - this is expected)
   ```

2. **Check Stripe CLI Connection:**
   - Verify Stripe CLI shows "Ready!" status
   - Check webhook secret matches your `.env` file

### **If Webhook Receives Events But Admin API Fails:**

1. **Check Admin API is Running:**
   ```bash
   curl -s http://localhost:18056/admin/users
   # Should return some response (not connection refused)
   ```

2. **Check Environment Variables:**
   ```bash
   echo $ADMIN_API_URL
   echo $ADMIN_API_TOKEN
   ```

3. **Look for Error Messages:**
   ```bash
   [Webhook] Failed to find/create user: 401 Unauthorized
   [Webhook] Failed to update user: 422 Unprocessable Entity
   ```

### **If Admin API Works But Bot Count Doesn't Update:**

1. **Check Webhook Logs for:**
   ```bash
   [Webhook] DEBUG: Will update max_concurrent_bots to: [PRESERVED]
   # This means preserveBotCount=true, count won't update
   ```

2. **Verify Payload:**
   ```bash
   [Webhook] DEBUG: Update payload: {"max_concurrent_bots": 1, "data": {...}}
   # Should include max_concurrent_bots field
   ```

---

## 🎯 Next Steps

### **1. Real API Key Test**
Now test with a real API key creation:
1. Go to your dashboard → API Keys page
2. Click "Create New API Key"  
3. Monitor webhook logs for bot count update
4. Verify user can create 1 bot during trial

### **2. Customer Portal Test**
Test with Customer Portal changes:
1. Add payment method via portal
2. Change subscription plan via portal
3. Monitor webhook logs for updates
4. Verify bot count reflects plan changes

### **3. Database Verification**
Check that bot counts are persisting:
```sql
SELECT email, max_concurrent_bots, data->>'subscription_status' 
FROM users 
WHERE email = 'your-test-email@example.com';
```

---

## 🚀 Expected Behavior

When everything is working correctly:

### **API Key Creation (1-Hour Trial):**
1. User creates API key → `create1HourTrial()` called
2. Stripe subscription created → webhook `customer.subscription.created`
3. Webhook updates admin API → `max_concurrent_bots = 1`
4. User can run 1 bot during trial

### **Customer Portal Changes:**
1. User upgrades plan → webhook `customer.subscription.updated`
2. Webhook calculates new bot count → calls admin API
3. Admin API updates → `max_concurrent_bots = 5` (or plan amount)
4. User can run more bots immediately

### **Success Indicators:**
- ✅ Webhook logs show successful admin API calls
- ✅ Database shows updated bot counts
- ✅ Users can create bots up to their limit
- ✅ Portal changes reflect immediately in bot limits

Your webhook system should now correctly update bot counts in the admin API! 🎉