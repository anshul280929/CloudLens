"use server";

import { db } from "@/db";
import { repositories, users, alerts } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getUserRepos } from "@/lib/github";
import { revalidatePath } from "next/cache";
import { inngest } from "@/lib/inngest";

export async function syncRepositories() {
  const session = await auth();
  if (!session?.user || !session.accessToken) {
    throw new Error("Unauthorized");
  }

  let dbUserId = (session.user as any).id;
  if (!dbUserId && session.user.email) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    dbUserId = dbUser?.id;
  }

  if (!dbUserId) {
    throw new Error("User not found in database");
  }

  try {
    // Fetch from GitHub API
    const githubRepos = await getUserRepos(session.accessToken);

    if (githubRepos.length === 0) {
      return { success: true, count: 0 };
    }

    // Insert or update in chunks to avoid parameter count limit
    const CHUNK_SIZE = 100;
    for (let i = 0; i < githubRepos.length; i += CHUNK_SIZE) {
      const chunk = githubRepos.slice(i, i + CHUNK_SIZE);
      
      const values = chunk.map((repo) => ({
        userId: dbUserId,
        githubId: String(repo.id),
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        isPrivate: repo.private,
        defaultBranch: repo.default_branch,
        lastCommitAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
        htmlUrl: repo.html_url,
        description: repo.description,
        language: repo.language,
        scanStatus: "pending" as const,
      }));

      await db.insert(repositories).values(values).onConflictDoUpdate({
        target: [repositories.userId, repositories.githubId],
        set: {
          name: sql`excluded.name`,
          fullName: sql`excluded."fullName"`,
          owner: sql`excluded.owner`,
          isPrivate: sql`excluded."isPrivate"`,
          defaultBranch: sql`excluded."defaultBranch"`,
          lastCommitAt: sql`excluded."lastCommitAt"`,
          htmlUrl: sql`excluded."htmlUrl"`,
          description: sql`excluded.description`,
          language: sql`excluded.language`,
          updatedAt: sql`now()`,
        },
      });
    }

    revalidatePath("/dashboard/repositories");
    return { success: true, count: githubRepos.length };
  } catch (error) {
    console.error("Error syncing repositories:", error);
    throw new Error("Failed to sync repositories");
  }
}

// ---------------------------------------------------------------------------
// Task 6A — scanRepositoryAction (Inngest-powered)
// ---------------------------------------------------------------------------

/**
 * Server action that triggers a background scan of a single repository.
 *
 * Instead of running the scan inline (which can take 30+ seconds and
 * block the server action), we now:
 *   1. Optimistically set the repo status to "scanning" (so the UI
 *      responds immediately)
 *   2. Fire an Inngest event (`repo/scan.requested`) that triggers
 *      the durable `repo-scan` function in the background
 *   3. Return immediately
 *
 * The actual scan runs asynchronously with automatic retries and
 * failure handling managed by Inngest.
 */
export async function scanRepositoryAction(repoId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify the repo exists
  const repo = await db.query.repositories.findFirst({
    where: eq(repositories.id, repoId),
  });

  if (!repo) {
    throw new Error("Repository not found");
  }

  // Optimistically set status to "scanning" so the UI updates instantly
  await db
    .update(repositories)
    .set({ scanStatus: "scanning", updatedAt: new Date() })
    .where(eq(repositories.id, repoId));

  // Fire the Inngest event — the background function handles everything
  await inngest.send({
    name: "repo/scan.requested",
    data: { repoId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/repositories");

  return { success: true, queued: true };
}

// ---------------------------------------------------------------------------
// Task 6A — scanAllRepositories (Inngest-powered)
// ---------------------------------------------------------------------------

/**
 * Server action that triggers background scans for ALL of the current
 * user's repositories that are not already in a "scanning" state.
 *
 * Fires an Inngest event for each repo — Inngest manages concurrency,
 * retries, and rate limiting automatically.
 */
export async function scanAllRepositories() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  let dbUserId = (session.user as any).id;
  if (!dbUserId && session.user.email) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    dbUserId = dbUser?.id;
  }

  if (!dbUserId) {
    throw new Error("User not found in database");
  }

  // Fetch all repos for this user that are NOT currently scanning
  const userRepos = await db
    .select({ id: repositories.id })
    .from(repositories)
    .where(
      sql`${repositories.userId} = ${dbUserId} AND ${repositories.scanStatus} != 'scanning'`,
    );

  if (userRepos.length === 0) {
    return { success: true, total: 0, queued: 0 };
  }

  // Optimistically mark all repos as scanning
  await db
    .update(repositories)
    .set({ scanStatus: "scanning", updatedAt: new Date() })
    .where(
      sql`${repositories.userId} = ${dbUserId} AND ${repositories.scanStatus} != 'scanning'`,
    );

  // Fire Inngest events for all repos
  await inngest.send(
    userRepos.map((repo) => ({
      name: "repo/scan.requested" as const,
      data: { repoId: repo.id },
    })),
  );

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/repositories");

  return { success: true, total: userRepos.length, queued: userRepos.length };
}

// ---------------------------------------------------------------------------
// Task 6.9 — Alert Actions
// ---------------------------------------------------------------------------

/** Verify that the alert belongs to the current user before mutating. */
async function getAuthenticatedAlert(alertId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  let dbUserId = (session.user as any).id;
  if (!dbUserId && session.user.email) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    dbUserId = dbUser?.id;
  }
  if (!dbUserId) throw new Error("User not found");

  const alert = await db.query.alerts.findFirst({
    where: and(eq(alerts.id, alertId), eq(alerts.userId, dbUserId)),
  });
  if (!alert) throw new Error("Alert not found");

  return alert;
}

/** Dismiss an alert (status → dismissed). */
export async function dismissAlert(alertId: string) {
  await getAuthenticatedAlert(alertId);
  await db
    .update(alerts)
    .set({ status: "dismissed", updatedAt: new Date() })
    .where(eq(alerts.id, alertId));
  revalidatePath("/dashboard/alerts");
  revalidatePath("/dashboard");
  return { success: true };
}

/** Snooze an alert for 7 days (status → snoozed). */
export async function snoozeAlert(alertId: string) {
  await getAuthenticatedAlert(alertId);
  const snoozedUntil = new Date();
  snoozedUntil.setDate(snoozedUntil.getDate() + 7);
  await db
    .update(alerts)
    .set({ status: "snoozed", snoozedUntil, updatedAt: new Date() })
    .where(eq(alerts.id, alertId));
  revalidatePath("/dashboard/alerts");
  revalidatePath("/dashboard");
  return { success: true };
}

/** Mark an alert as resolved. */
export async function resolveAlert(alertId: string) {
  await getAuthenticatedAlert(alertId);
  await db
    .update(alerts)
    .set({ status: "resolved", updatedAt: new Date() })
    .where(eq(alerts.id, alertId));
  revalidatePath("/dashboard/alerts");
  revalidatePath("/dashboard");
  return { success: true };
}

/** "I cancelled this service" — resolves the alert with a cancelled note. */
export async function cancelServiceAlert(alertId: string) {
  await getAuthenticatedAlert(alertId);
  await db
    .update(alerts)
    .set({ status: "resolved", updatedAt: new Date() })
    .where(eq(alerts.id, alertId));
  revalidatePath("/dashboard/alerts");
  revalidatePath("/dashboard");
  return { success: true };
}
