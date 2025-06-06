import NextAuth, { AuthOptions, User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

// Define a type for our user object that includes the id from our database
interface DbUser {
  id: number;
  email: string;
  name?: string | null;
  image_url?: string | null;
  created_at: string;
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
        console.log(`[NextAuth] User ${user.email} synced with DB ID: ${user.id}. Allowing sign in.`);
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