import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { connectToDatabase, User } from "@/backend/db";

/**
 * NextAuth Configuration
 * Handles user authentication with Google OAuth
 * Creates/updates user in MongoDB on successful login
 */
const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  /**
   * Pages configuration
   * Customize where users are redirected during auth flow
   */
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  /**
   * Callbacks - these functions run at key points in the auth flow
   */
  callbacks: {
    /**
     * signIn callback - runs when user successfully authenticates
     * We use this to create or update the user in MongoDB
     */
    async signIn({ user, account }) {
      // Only allow Google OAuth
      if (account?.provider !== "google") {
        return false;
      }

      if (!user.email) {
        return false;
      }

      try {
        // Connect to database
        await connectToDatabase();

        // Check if user already exists
        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          // Create new user if they don't exist
          dbUser = await User.create({
            email: user.email,
            name: user.name || "User",
            image: user.image,
          });
        } else {
          // Update existing user with latest info from Google
          dbUser.name = user.name || dbUser.name;
          dbUser.image = user.image || dbUser.image;
          dbUser.lastLoginAt = new Date();
          await dbUser.save();
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },

    /**
     * jwt callback - runs when JWT is created or updated
     * Add custom data to the token
     */
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }

      // Always fetch latest subscription info from DB to keep token fresh
      if (token.email) {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.subscriptionTier = dbUser.subscriptionTier;
          }
        } catch (error) {
          console.error("Error fetching subscription in JWT callback:", error);
        }
      }

      return token;
    },

    /**
     * session callback - runs when session is requested
     * Add custom data to the session object
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        (session.user as any).subscriptionTier = token.subscriptionTier ?? "free";
      }

      return session;
    },
  },

  /**
   * Session configuration
   */
  session: {
    // Use JWT for sessions (stateless, good for serverless)
    strategy: "jwt",
    // Session expires after 30 days
    maxAge: 30 * 24 * 60 * 60,
    // Update session every day
    updateAge: 24 * 60 * 60,
  },

  /**
   * JWT configuration
   */
  jwt: {
    // JWT expires after 30 days
    maxAge: 30 * 24 * 60 * 60,
  },

  /**
   * Security settings
   */
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === "production",
};

// Export auth handlers for Next.js
export const { handlers, auth } = NextAuth(authConfig);
export const { GET, POST } = handlers;
