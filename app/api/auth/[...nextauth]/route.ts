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

  console.log(`[NextAuth] findOrCreateUser: Read ADMIN_API_TOKEN value: '${adminApiToken}'`);

  if (!adminApiToken) {
    console.error('[NextAuth] ADMIN_API_TOKEN is not configured. Cannot sync user.');
    return null;
  }

  try {
    console.log(`[NextAuth] Trying to find or create user: ${email}`);
    const response = await fetch(`${adminApiUrl}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-API-Key': adminApiToken,
      },
      body: JSON.stringify({ email, name, image_url: image }),
    });

    const responseData = await response.json();

    // User created (201) or already exists (409)
    if (response.ok || response.status === 409) {
      console.log(`[NextAuth] User found or created: ${email}, ID: ${responseData.id}`);
      // Ensure the response data matches our DbUser structure
      if (responseData && typeof responseData.id === 'number') {
        return responseData as DbUser;
      } else {
         console.error('[NextAuth] User created/found but response format unexpected:', responseData);
         // If user exists (409) but ID is missing, we have a problem. Maybe try fetching?
         // For now, return null to prevent login if data is inconsistent.
         return null;
      }
    } else {
      console.error(`[NextAuth] Failed to find or create user. Status: ${response.status}`, responseData);
      return null;
    }
  } catch (error) {
    console.error('[NextAuth] Error calling internal user API:', error);
    return null;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 