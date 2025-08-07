import NextAuth, { AuthOptions, User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// Define a type for our user object that includes the id from our database
interface DbUser {
  id: number;
  email: string;
  name?: string | null;
  image_url?: string | null;
  created_at: string;
  isNewUser?: boolean;
}

// Internal API call to find or create user in our database
async function findOrCreateUser(email: string, name?: string | null, image?: string | null): Promise<DbUser | null> {
  const adminApiUrl = process.env.ADMIN_API_URL || 'http://localhost:8000';
  const adminApiToken = process.env.ADMIN_API_TOKEN;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 500; // ms
  const FETCH_TIMEOUT = 5000; // 5 seconds timeout

  if (!adminApiToken) {
    console.error('[NextAuth] ADMIN_API_TOKEN is not configured or empty. Cannot sync user.');
    return null;
  }
  // Log the token and URL to ensure they are correctly loaded from env
  console.log(`[NextAuth] findOrCreateUser: adminApiUrl: ${adminApiUrl}`);
  console.log(`[NextAuth] findOrCreateUser: adminApiToken (first 5 chars): ${adminApiToken ? adminApiToken.substring(0, 5) : 'UNDEFINED_OR_EMPTY'}`);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`[NextAuth] Trying to find or create user: ${email} (attempt ${attempt + 1}/${MAX_RETRIES})`);
      
      // Setup abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
      
      const response = await fetch(`${adminApiUrl}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-API-Key': adminApiToken,
        },
        body: JSON.stringify({ email, name, image_url: image }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Try to get text first for robust error reporting, then try JSON if response.ok
      let responseText = await response.text();

      if (response.ok) {
        try {
          const responseData = JSON.parse(responseText); // Parse the text as JSON
          const statusLog = response.status === 201 ? 'created' : 'found';
          console.log(`[NextAuth] User ${statusLog}: ${email}, Status: ${response.status}, ID: ${responseData.id}`);
          
          if (responseData && typeof responseData.id === 'number') {
            // If this is a new user (status 201), we'll handle trial creation in the frontend
            if (response.status === 201) {
              console.log(`[NextAuth] New user created: ${email}, will redirect to trial checkout`);
              // Store a flag in the user object to indicate this is a new user
              responseData.isNewUser = true;
            }
            
            return responseData as DbUser;
          } else {
            console.error('[NextAuth] User created/found but response format unexpected:', responseData);
          }
        } catch (jsonError) {
          console.error(`[NextAuth] Successfully fetched but failed to parse JSON response (Status: ${response.status}): ${responseText}`, jsonError);
        }
      } else {
        // Log the responseText directly as it might not be JSON
        console.error(`[NextAuth] Failed to find or create user. Status: ${response.status}, Response: ${responseText}`);
      }
    } catch (error) {
      console.error(`[NextAuth] Error calling internal user API (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
      
      if (attempt < MAX_RETRIES - 1) {
        console.log(`[NextAuth] Retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  
  // Only return null after all retries have failed
  console.error(`[NextAuth] All ${MAX_RETRIES} attempts to find/create user failed for ${email}`);
  return null;
}

// Function to create a trial subscription for new users
async function createTrialSubscription(email: string, userId: number) {
  try {
    console.log(`[Trial Subscription] Creating trial subscription for ${email} (user ID: ${userId})`);
    
    // Find existing product and price
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    })
    
    const botProduct = products.data.find(p => p.name === "Bot subscription")
    if (!botProduct) {
      throw new Error("Bot subscription product not found. Please run the stripe_sync.py script first.")
    }

    const prices = await stripe.prices.list({
      product: botProduct.id,
      active: true,
      limit: 100,
    })

    const startupPrice = prices.data.find(p => p.nickname === "Startup")
    if (!startupPrice) {
      throw new Error("Startup price not found. Please run the stripe_sync.py script first.")
    }

    // Create or get customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log(`[Trial Subscription] Found existing customer: ${customer.id}`);
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId.toString(),
        },
      });
      console.log(`[Trial Subscription] Created new customer: ${customer.id}`);
    }

    // Create subscription with trial
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: startupPrice.id,
          quantity: 1, // 1 bot for trial
        },
      ],
      trial_period_days: 7,
      trial_settings: {
        end_behavior: {
          missing_payment_method: 'cancel',
        },
      },
      metadata: {
        userId: userId.toString(),
        botCount: '1',
        tier: 'trial',
        userEmail: email,
      },
    });

    console.log(`[Trial Subscription] Created trial subscription: ${subscription.id}`);
    
    // Update user in admin API with subscription info
    const adminApiUrl = process.env.ADMIN_API_URL || 'http://localhost:8000';
    const adminApiToken = process.env.ADMIN_API_TOKEN;
    
    if (adminApiToken) {
      try {
        await fetch(`${adminApiUrl}/admin/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-API-Key': adminApiToken,
          },
          body: JSON.stringify({
            stripe_customer_id: customer.id,
            stripe_subscription_id: subscription.id,
            max_concurrent_bots: 1,
            subscription_status: 'trialing',
            subscription_tier: 'trial',
          }),
        });
        console.log(`[Trial Subscription] Updated user ${userId} with subscription info`);
      } catch (updateError) {
        console.error(`[Trial Subscription] Failed to update user ${userId}:`, updateError);
      }
    }

    return subscription;
  } catch (error) {
    console.error(`[Trial Subscription] Error creating trial subscription for ${email}:`, error);
    throw error;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      checks: ['pkce', 'state'],
    }),
  ],
  session: {
    strategy: "jwt", // Use JWT for session management
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[NextAuth] signIn callback triggered');
      if (account?.provider === "google" && user.email) {
        console.log(`[NextAuth] Google sign in attempt for: ${user.email}`);
        const dbUser = await findOrCreateUser(user.email, user.name, user.image);
        
        if (!dbUser) {
          console.error(`[NextAuth] Failed to find or create user in DB for ${user.email}. Denying sign in.`);
          return false; // Prevent sign-in if user couldn't be synced with DB
        }
        
        // Add the database user ID to the user object for the JWT callback
        user.id = String(dbUser.id); 
        
        // Add isNewUser flag if this is a new user
        if (dbUser.isNewUser) {
          (user as any).isNewUser = true;
          console.log(`[NextAuth] New user ${user.email} synced with DB ID: ${user.id}. Will redirect to trial checkout.`);
        } else {
          console.log(`[NextAuth] Existing user ${user.email} synced with DB ID: ${user.id}. Allowing sign in.`);
        }
        
        return true; // Allow sign-in
      } 
      console.log('[NextAuth] signIn condition not met or email missing.');
      return false; // Deny sign-in for other providers or if email is missing
    },
    async jwt({ token, user }) {
      // Persist the user ID from the user object (added in signIn) to the JWT
      if (user?.id) {
        token.id = user.id;
        console.log(`[NextAuth] JWT callback: Added id ${user.id} to token for email ${token.email}`);
      }
      
      // Persist the isNewUser flag if present
      if ((user as any)?.isNewUser) {
        token.isNewUser = (user as any).isNewUser;
        console.log(`[NextAuth] JWT callback: Added isNewUser flag to token for email ${token.email}`);
      }
      
      return token;
    },
    async session({ session, token }) {
      // Add the user ID from the JWT to the session object
      if (token?.id && session.user) {
        // Important: Ensure you extend the Session and User types if using TypeScript
        // to avoid type errors here.
        (session.user as any).id = token.id;
        console.log(`[NextAuth] Session callback: Added id ${token.id} to session for user ${session.user.email}`);
      }
      
      // Add isNewUser flag if present in token
      if (token?.isNewUser && session.user) {
        (session.user as any).isNewUser = token.isNewUser;
        console.log(`[NextAuth] Session callback: Added isNewUser flag for user ${session.user.email}`);
      }
      
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for signing JWTs
  // pages: { // Optional: Define custom pages if needed
  //   signIn: '/login',
  //   // error: '/auth/error', // Error code passed in query string as ?error=
  // }
  useSecureCookies: process.env.NODE_ENV === 'production',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 