import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  repositories,
  detectedServices,
  services,
} from "@/lib/db/schema";
import { eq, sql, desc, count } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * GET /api/dashboard — Get dashboard overview stats
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Total repos
  const userRepos = await db.query.repositories.findMany({
    where: eq(repositories.userId, userId),
    columns: { id: true, name: true, scanStatus: true, lastCommitAt: true },
  });

  const totalRepos = userRepos.length;
  type RepoRow = { id: string; name: string; scanStatus: string | null; lastCommitAt: Date | null };
  const repoIds = userRepos.map((r: RepoRow) => r.id);

  if (totalRepos === 0) {
    return NextResponse.json({
      totalRepos: 0,
      totalServices: 0,
      activeAlerts: 0,
      estimatedMonthlyCost: 0,
      servicesPerCategory: {},
      scanProgress: { completed: 0, pending: 0, scanning: 0, failed: 0 },
    });
  }

  // Count unique services detected
  const detectedServicesList = await db
    .selectDistinct({
      serviceId: detectedServices.serviceId,
      category: services.category,
    })
    .from(detectedServices)
    .innerJoin(services, eq(detectedServices.serviceId, services.id))
    .where(sql`${detectedServices.repoId} = ANY(${repoIds})`);

  const totalServices = detectedServicesList.length;

  // Count services per category
  const servicesPerCategory: Record<string, number> = {};
  for (const ds of detectedServicesList) {
    const cat = ds.category || "other";
    servicesPerCategory[cat] = (servicesPerCategory[cat] || 0) + 1;
  }

  // Scan progress
  const scanProgress = {
    completed: userRepos.filter((r: RepoRow) => r.scanStatus === "completed").length,
    pending: userRepos.filter((r: RepoRow) => r.scanStatus === "pending").length,
    scanning: userRepos.filter((r: RepoRow) => r.scanStatus === "scanning").length,
    failed: userRepos.filter((r: RepoRow) => r.scanStatus === "failed").length,
  };

  return NextResponse.json({
    totalRepos,
    totalServices,
    activeAlerts: 0, // Phase 2 - for now 0
    estimatedMonthlyCost: 0, // Phase 2 - will calculate from cost_estimates
    servicesPerCategory,
    scanProgress,
  });
}
