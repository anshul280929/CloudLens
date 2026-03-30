import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          // Request read-only access to repos
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        // Store GitHub-specific data
        const githubProfile = profile as unknown as {
          id: number;
          login: string;
          avatar_url: string;
        };

        try {
          await db
            .update(users)
            .set({
              githubId: githubProfile.id,
              username: githubProfile.login,
              image: githubProfile.avatar_url,
              githubAccessToken: account.access_token,
              lastLoginAt: new Date(),
            })
            .where(eq(users.email, user.email!));
        } catch {
          // User might not exist yet on first sign-in, adapter will create them
        }
      }
      return true;
    },
    async session({ session, user }) {
      // Fetch full user data including GitHub token
      const [dbUser] = await db
        .select({
          id: users.id,
          username: users.username,
          plan: users.plan,
          githubAccessToken: users.githubAccessToken,
          githubId: users.githubId,
        })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      if (dbUser) {
        session.user.id = dbUser.id;
        (session as any).username = dbUser.username;
        (session as any).plan = dbUser.plan;
        (session as any).githubAccessToken = dbUser.githubAccessToken;
        (session as any).githubId = dbUser.githubId;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
  },
});
