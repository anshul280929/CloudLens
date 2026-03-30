import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  services,
  detectedServices,
  repositories,
} from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * GET /api/services — Get all detected services for the user (aggregated)
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get all repos for this user
  const userRepos = await db.query.repositories.findMany({
    where: eq(repositories.userId, userId),
    columns: { id: true, name: true },
  });

  if (userRepos.length === 0) {
    return NextResponse.json([]);
  }

  const repoIds = userRepos.map((r: { id: string; name: string }) => r.id);
  const repoNameMap = new Map(userRepos.map((r: { id: string; name: string }) => [r.id, r.name]));

  // Get all detected services across user's repos
  const detected = await db
    .select({
      serviceId: detectedServices.serviceId,
      repoId: detectedServices.repoId,
      confidence: detectedServices.confidence,
      detectionDetails: detectedServices.detectionDetails,
      service: {
        id: services.id,
        name: services.name,
        slug: services.slug,
        category: services.category,
        logoUrl: services.logoUrl,
        websiteUrl: services.websiteUrl,
        dashboardUrl: services.dashboardUrl,
        statusPageUrl: services.statusPageUrl,
        color: services.color,
        freeTierLimits: services.freeTierLimits,
        pricingTiers: services.pricingTiers,
      },
    })
    .from(detectedServices)
    .innerJoin(services, eq(detectedServices.serviceId, services.id))
    .where(sql`${detectedServices.repoId} = ANY(${repoIds})`);

  // Aggregate by service
  const serviceMap = new Map<
    string,
    {
      service: (typeof detected)[0]["service"];
      repos: { id: string; name: string; confidence: string }[];
    }
  >();

  for (const d of detected) {
    if (!serviceMap.has(d.serviceId)) {
      serviceMap.set(d.serviceId, {
        service: d.service,
        repos: [],
      });
    }
    serviceMap.get(d.serviceId)!.repos.push({
      id: d.repoId,
      name: repoNameMap.get(d.repoId) || "Unknown",
      confidence: String(d.confidence),
    });
  }

  const result = Array.from(serviceMap.values()).map((entry) => ({
    ...entry.service,
    status: "operational", // Default status — will be real in Phase 2
    repoCount: entry.repos.length,
    repos: entry.repos,
  }));

  return NextResponse.json(result);
}
