import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { repositories, detectedServices, services } from "@/lib/db/schema";
import { createGitHubClient, fetchUserRepos } from "@/lib/github";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * GET /api/repos — Fetch user's repos from DB (synced from GitHub)
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch repos with their detected services
  const userRepos = await db.query.repositories.findMany({
    where: eq(repositories.userId, userId),
    orderBy: [desc(repositories.lastCommitAt)],
    with: {
      detectedServices: {
        with: {
          service: true,
        },
      },
    },
  });

  return NextResponse.json(userRepos);
}

/**
 * POST /api/repos — Sync repos from GitHub
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const accessToken = (session as any).githubAccessToken;

  if (!accessToken) {
    return NextResponse.json(
      { error: "GitHub access token not found. Please re-login." },
      { status: 400 }
    );
  }

  try {
    const octokit = createGitHubClient(accessToken);
    const ghRepos = await fetchUserRepos(octokit);

    let synced = 0;

    for (const repo of ghRepos) {
      // Upsert repo
      const existing = await db.query.repositories.findFirst({
        where: eq(repositories.githubRepoId, repo.id),
      });

      if (existing) {
        await db
          .update(repositories)
          .set({
            name: repo.name,
            fullName: repo.full_name,
            isPrivate: repo.private,
            defaultBranch: repo.default_branch,
            language: repo.language,
            stars: repo.stargazers_count,
            lastCommitAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
          })
          .where(eq(repositories.id, existing.id));
      } else {
        await db.insert(repositories).values({
          userId,
          githubRepoId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          isPrivate: repo.private,
          defaultBranch: repo.default_branch,
          language: repo.language,
          stars: repo.stargazers_count,
          lastCommitAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
          scanStatus: "pending",
        });
      }
      synced++;
    }

    return NextResponse.json({
      message: `Synced ${synced} repositories from GitHub`,
      count: synced,
    });
  } catch (error: any) {
    console.error("Error syncing repos:", error);
    return NextResponse.json(
      { error: "Failed to sync repos from GitHub" },
      { status: 500 }
    );
  }
}
