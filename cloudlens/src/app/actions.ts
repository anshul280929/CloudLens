"use server";

import { db } from "@/db";
import { repositories, users, scans, detectedServices } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getUserRepos } from "@/lib/github";
import { revalidatePath } from "next/cache";
import { scanRepository as runScan } from "@/lib/detection/scanner";

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
// Task 4.10 — scanRepositoryAction
// ---------------------------------------------------------------------------

/**
 * Server action that scans a single repository for cloud services.
 *
 * Workflow:
 *   1. Sets repo `scanStatus` to "scanning"
 *   2. Creates a new `scans` record
 *   3. Invokes the scan orchestrator
 *   4. Persists `detectedServices` results to the database
 *   5. Updates the scan record with completion status and counts
 *   6. Sets repo `scanStatus` to "complete" (or "failed" on error)
 */
export async function scanRepositoryAction(repoId: string) {
  // ---- Auth ----
  const session = await auth();
  if (!session?.user || !session.accessToken) {
    throw new Error("Unauthorized");
  }

  // ---- Fetch the repository record ----
  const repo = await db.query.repositories.findFirst({
    where: eq(repositories.id, repoId),
  });

  if (!repo) {
    throw new Error("Repository not found");
  }

  // ---- Step 1: Set status to "scanning" ----
  await db
    .update(repositories)
    .set({ scanStatus: "scanning", updatedAt: new Date() })
    .where(eq(repositories.id, repoId));

  // ---- Step 2: Create a new scan record ----
  const [scanRecord] = await db
    .insert(scans)
    .values({
      repositoryId: repoId,
      status: "scanning",
      startedAt: new Date(),
    })
    .returning();

  try {
    // ---- Step 3: Invoke the scan orchestrator ----
    const result = await runScan(
      session.accessToken,
      repo.owner,
      repo.name,
      repo.defaultBranch,
    );

    // ---- Step 4: Persist detected services ----
    if (result.services.length > 0) {
      // Delete previous detections for this repo before inserting new ones
      await db
        .delete(detectedServices)
        .where(eq(detectedServices.repositoryId, repoId));

      // Insert in chunks (some repos may detect many services)
      const CHUNK_SIZE = 50;
      for (let i = 0; i < result.services.length; i += CHUNK_SIZE) {
        const chunk = result.services.slice(i, i + CHUNK_SIZE);
        await db.insert(detectedServices).values(
          chunk.map((svc) => ({
            scanId: scanRecord.id,
            repositoryId: repoId,
            serviceName: svc.serviceName,
            serviceCategory: svc.serviceCategory,
            provider: svc.provider,
            confidenceScore: svc.confidenceScore,
            detectionSource: svc.detectionSource,
            evidenceFile: svc.evidenceFile,
            evidenceLine: svc.evidenceLine,
            evidenceSnippet: svc.evidenceSnippet,
          })),
        );
      }
    }

    // ---- Step 5: Update the scan record ----
    await db
      .update(scans)
      .set({
        status: "complete",
        completedAt: new Date(),
        filesScanned: result.filesScanned,
        servicesFound: result.servicesFound,
      })
      .where(eq(scans.id, scanRecord.id));

    // ---- Step 6: Set repo status to "complete" ----
    await db
      .update(repositories)
      .set({
        scanStatus: "complete",
        lastScannedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(repositories.id, repoId));

    revalidatePath("/dashboard/repositories");

    return {
      success: true,
      filesScanned: result.filesScanned,
      servicesFound: result.servicesFound,
    };
  } catch (error) {
    console.error(`[CloudLens] Scan failed for repo ${repoId}:`, error);

    // ---- On failure: update scan & repo status ----
    await db
      .update(scans)
      .set({
        status: "failed",
        completedAt: new Date(),
        errorMessage:
          error instanceof Error ? error.message : "Unknown scan error",
      })
      .where(eq(scans.id, scanRecord.id));

    await db
      .update(repositories)
      .set({
        scanStatus: "failed",
        updatedAt: new Date(),
      })
      .where(eq(repositories.id, repoId));

    revalidatePath("/dashboard/repositories");

    throw new Error("Scan failed. Please try again.");
  }
}
