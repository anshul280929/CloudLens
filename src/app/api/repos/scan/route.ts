import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  repositories,
  detectedServices,
  services,
} from "@/lib/db/schema";
import { createGitHubClient } from "@/lib/github";
import { scanRepository } from "@/lib/detection-engine";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/repos/scan — Scan a single repo or all repos
 * Body: { repoId?: string } — if omitted, scans all pending/completed repos
 */
export async function POST(request: NextRequest) {
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

  let body: { repoId?: string } = {};
  try {
    body = await request.json();
  } catch {
    // No body = scan all repos
  }

  const octokit = createGitHubClient(accessToken);

  // Determine which repos to scan
  let reposToScan;
  if (body.repoId) {
    const repo = await db.query.repositories.findFirst({
      where: and(
        eq(repositories.id, body.repoId),
        eq(repositories.userId, userId)
      ),
    });
    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }
    reposToScan = [repo];
  } else {
    reposToScan = await db.query.repositories.findMany({
      where: eq(repositories.userId, userId),
    });
  }

  const results = [];

  for (const repo of reposToScan) {
    try {
      // Mark as scanning
      await db
        .update(repositories)
        .set({ scanStatus: "scanning" })
        .where(eq(repositories.id, repo.id));

      const [owner, repoName] = repo.fullName.split("/");

      // Run detection engine
      const detections = await scanRepository(
        octokit,
        owner,
        repoName,
        repo.defaultBranch || "main"
      );

      // Store results
      for (const detection of detections) {
        // Upsert detected service
        const existing = await db.query.detectedServices.findFirst({
          where: and(
            eq(detectedServices.repoId, repo.id),
            eq(detectedServices.serviceId, detection.serviceId)
          ),
        });

        const detailsJson = detection.matches.map((m) => ({
          rule: m.ruleType,
          match: m.matchedContent,
          file: m.matchedIn,
        }));

        if (existing) {
          await db
            .update(detectedServices)
            .set({
              confidence: detection.confidence.toString(),
              detectionDetails: detailsJson,
              lastSeenAt: new Date(),
              status: "active",
            })
            .where(eq(detectedServices.id, existing.id));
        } else {
          await db.insert(detectedServices).values({
            repoId: repo.id,
            serviceId: detection.serviceId,
            confidence: detection.confidence.toString(),
            detectionDetails: detailsJson,
            status: "active",
          });
        }
      }

      // Mark as completed
      await db
        .update(repositories)
        .set({
          scanStatus: "completed",
          lastScannedAt: new Date(),
        })
        .where(eq(repositories.id, repo.id));

      results.push({
        repoId: repo.id,
        repoName: repo.fullName,
        servicesFound: detections.length,
        services: detections.map((d) => ({
          name: d.serviceName,
          confidence: d.confidence,
        })),
      });
    } catch (error: any) {
      console.error(`Error scanning ${repo.fullName}:`, error);

      // Mark as failed
      await db
        .update(repositories)
        .set({ scanStatus: "failed" })
        .where(eq(repositories.id, repo.id));

      results.push({
        repoId: repo.id,
        repoName: repo.fullName,
        error: error.message,
      });
    }
  }

  return NextResponse.json({
    message: `Scanned ${results.length} repositories`,
    results,
  });
}
