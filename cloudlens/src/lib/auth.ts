import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { accounts } from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          // Request read access to public + private repos and user profile
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    /**
     * Runs after sign-in; persists the GitHub access_token into the JWT.
     * On subsequent requests `token.accessToken` is already set so we
     * skip the DB query.
     */
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
        token.providerAccountId = account.providerAccountId;
      }
      return token;
    },

    /**
     * Exposes accessToken on the client-visible session object so
     * Server Components / Server Actions can call `auth()` and obtain
     * the token for GitHub API requests.
     */
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },

    /**
     * Controls where users are redirected after sign-in / sign-out.
     * Ensures the user lands on /dashboard after successful GitHub auth.
     */
    async redirect({ url, baseUrl }) {
      // If redirecting from root or sign-in pages, send to dashboard
      if (url === "/" || url === `${baseUrl}/` || url.includes("/api/auth")) {
        return `${baseUrl}/dashboard`;
      }
      // If the url is relative, prefix with baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // If the url is on the same origin, allow it
      if (new URL(url).origin === baseUrl) return url;
      // Default: send to dashboard
      return `${baseUrl}/dashboard`;
    },
  },
});

/**
 * Retrieve the stored GitHub access_token for a user directly from
 * the database.  Use this in background jobs / Inngest functions that
 * don't have a live session context.
 */
export async function getGitHubAccessToken(userId: string): Promise<string | null> {
  const result = await db
    .select({ access_token: accounts.access_token })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, "github")))
    .limit(1);

  return result[0]?.access_token ?? null;
}
