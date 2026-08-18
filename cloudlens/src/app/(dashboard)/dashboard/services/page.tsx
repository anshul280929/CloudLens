import { auth } from "@/lib/auth";
import { db } from "@/db";
import { repositories, detectedServices, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ServiceList } from "@/components/ServiceList";
import type { AggregatedService } from "@/components/ServiceList";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const session = await auth();

  // Resolve the database user ID
  let dbUserId: string | undefined = (session?.user as any)?.id;
  if (!dbUserId && session?.user?.email) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    dbUserId = dbUser?.id;
  }

  // ── Aggregate services across all user repos ──
  // Groups by (serviceName, provider, category) and computes:
  //   - max confidence score (for filtering / display)
  //   - avg confidence score
  //   - distinct repo count
  let aggregatedServices: AggregatedService[] = [];

  if (dbUserId) {
    const rows = await db
      .select({
        serviceName: detectedServices.serviceName,
        provider: detectedServices.provider,
        category: detectedServices.serviceCategory,
        avgConfidence: sql<number>`avg(${detectedServices.confidenceScore})`,
        maxConfidence: sql<number>`max(${detectedServices.confidenceScore})`,
        repoCount: sql<number>`count(distinct ${detectedServices.repositoryId})`,
      })
      .from(detectedServices)
      .innerJoin(
        repositories,
        eq(detectedServices.repositoryId, repositories.id),
      )
      .where(eq(repositories.userId, dbUserId))
      .groupBy(
        detectedServices.serviceName,
        detectedServices.provider,
        detectedServices.serviceCategory,
      );

    aggregatedServices = rows.map((row) => ({
      serviceName: row.serviceName,
      provider: row.provider,
      category: row.category,
      avgConfidence: Number(row.avgConfidence),
      maxConfidence: Number(row.maxConfidence),
      repoCount: Number(row.repoCount),
    }));
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-headline text-ink">All Services</h1>
        <p className="text-body-sm text-ink-muted mt-1">
          Cloud services detected across all your repositories.
        </p>
      </div>

      {/* Client-side filter + grid */}
      <ServiceList services={aggregatedServices} />
    </div>
  );
}
