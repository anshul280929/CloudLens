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
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as Record<string, unknown>;
        try {
          // Update user with GitHub-specific data
          await db
            .update(users)
            .set({
              githubId: githubProfile.id as number,
              username: githubProfile.login as string,
              image: githubProfile.avatar_url as string,
              githubAccessToken: account.access_token,
              lastLoginAt: new Date(),
            })
            .where(eq(users.email, user.email!));
        } catch {
          // First sign-in — user may not exist yet, adapter will create it
        }
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch extra fields
        const dbUser = await db
          .select({
            username: users.username,
            plan: users.plan,
            githubId: users.githubId,
          })
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);

        if (dbUser.length > 0) {
          (session.user as Record<string, unknown>).username = dbUser[0].username;
          (session.user as Record<string, unknown>).plan = dbUser[0].plan;
          (session.user as Record<string, unknown>).githubId = dbUser[0].githubId;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "database",
  },
});
