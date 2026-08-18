import { auth } from "@/lib/auth";
import { db } from "@/db";
import { repositories, scans, detectedServices, users } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DashboardQuickActions } from "@/components/DashboardQuickActions";

export const dynamic = "force-dynamic";

/* ── Helper: relative timestamp ── */
function timeAgo(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

/* ── Stat-card icon SVGs ── */
function RepoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 2h10a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zM5 6h6M5 9h4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 12a3 3 0 01-.5-5.96A4.5 4.5 0 018 2.5a4.5 4.5 0 014.5 4 3 3 0 01-.5 5.96"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M1 8h3l2-5 3 10 2-5h4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="12" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="9" width="12" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="5" cy="4.5" r="0.5" fill="currentColor" />
      <circle cx="5" cy="11.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

/* ── Scan-status badge mapper ── */
function scanStatusBadge(status: string) {
  const map: Record<string, { variant: "complete" | "scanning" | "failed" | "never-scanned"; label: string }> = {
    complete: { variant: "complete", label: "Complete" },
    scanning: { variant: "scanning", label: "Scanning" },
    failed: { variant: "failed", label: "Failed" },
    pending: { variant: "never-scanned", label: "Pending" },
  };
  const entry = map[status] ?? { variant: "never-scanned" as const, label: status };
  return <Badge variant={entry.variant} size="sm">{entry.label}</Badge>;
}

export default async function DashboardPage() {
  const session = await auth();

  // Resolve the database user ID
  let dbUserId: string | undefined = (session?.user as any)?.id;
  if (!dbUserId && session?.user?.email) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    dbUserId = dbUser?.id;
  }

  // ── Queries ──
  // All run in parallel for speed
  const [
    totalReposResult,
    totalServicesResult,
    statusBreakdownResult,
    uniqueProvidersResult,
    recentScansResult,
  ] = await Promise.all([
    // 1. Total repos for user
    dbUserId
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(repositories)
          .where(eq(repositories.userId, dbUserId))
      : Promise.resolve([{ count: 0 }]),

    // 2. Total detected services across user's repos
    dbUserId
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(detectedServices)
          .innerJoin(repositories, eq(detectedServices.repositoryId, repositories.id))
          .where(eq(repositories.userId, dbUserId))
      : Promise.resolve([{ count: 0 }]),

    // 3. Scan status breakdown
    dbUserId
      ? db
          .select({
            scanStatus: repositories.scanStatus,
            count: sql<number>`count(*)`,
          })
          .from(repositories)
          .where(eq(repositories.userId, dbUserId))
          .groupBy(repositories.scanStatus)
      : Promise.resolve([]),

    // 4. Unique providers
    dbUserId
      ? db
          .select({ count: sql<number>`count(distinct ${detectedServices.provider})` })
          .from(detectedServices)
          .innerJoin(repositories, eq(detectedServices.repositoryId, repositories.id))
          .where(eq(repositories.userId, dbUserId))
      : Promise.resolve([{ count: 0 }]),

    // 5. Recent scans (last 5)
    dbUserId
      ? db
          .select({
            scanId: scans.id,
            status: scans.status,
            servicesFound: scans.servicesFound,
            filesScanned: scans.filesScanned,
            startedAt: scans.startedAt,
            completedAt: scans.completedAt,
            repoName: repositories.name,
            repoOwner: repositories.owner,
          })
          .from(scans)
          .innerJoin(repositories, eq(scans.repositoryId, repositories.id))
          .where(eq(repositories.userId, dbUserId))
          .orderBy(desc(scans.startedAt))
          .limit(5)
      : Promise.resolve([]),
  ]);

  const totalRepos = Number(totalReposResult[0]?.count ?? 0);
  const totalServices = Number(totalServicesResult[0]?.count ?? 0);
  const uniqueProviders = Number(uniqueProvidersResult[0]?.count ?? 0);

  // Parse status breakdown into a map
  const statusMap: Record<string, number> = {};
  for (const row of statusBreakdownResult) {
    statusMap[(row as any).scanStatus] = Number((row as any).count);
  }
  const scannedCount = statusMap["complete"] ?? 0;
  const failedCount = statusMap["failed"] ?? 0;
  const pendingCount = (statusMap["pending"] ?? 0) + (statusMap["scanning"] ?? 0);

  // Build a status summary string: "12 ✓ · 2 ✗ · 5 ◌"
  const statusSummary = `${scannedCount} ✓  ·  ${failedCount} ✗  ·  ${pendingCount} ◌`;

  return (
    <div className="space-y-8">
      {/* ── Welcome + Quick Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline text-ink">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
          </h1>
          <p className="text-body-sm text-ink-muted mt-1">
            Here&apos;s a snapshot of your cloud service inventory.
          </p>
        </div>
        <DashboardQuickActions />
      </div>

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<RepoIcon />}
          label="Total Repositories"
          value={totalRepos}
          iconColor="var(--accent-blue)"
        />
        <StatCard
          icon={<CloudIcon />}
          label="Services Detected"
          value={totalServices}
          iconColor="var(--product-nomad)"
        />
        <StatCard
          icon={<ActivityIcon />}
          label="Scan Status"
          value={statusSummary}
          iconColor="var(--semantic-warning)"
        />
        <StatCard
          icon={<ServerIcon />}
          label="Unique Providers"
          value={uniqueProviders}
          iconColor="var(--product-terraform)"
        />
      </div>

      {/* ── Recent Scans ── */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(178,182,189,0.1)]">
          <h2 className="text-subhead text-ink">Recent Scans</h2>
          <span className="text-caption text-ink-subtle">Last 5</span>
        </div>

        {(recentScansResult as any[]).length > 0 ? (
          <div className="divide-y divide-[rgba(178,182,189,0.06)]">
            {(recentScansResult as any[]).map((scan: any) => (
              <div
                key={scan.scanId}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-1/60 transition-colors duration-150"
              >
                {/* Left: repo info */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Tiny repo icon */}
                  <div className="w-8 h-8 rounded-md bg-surface-2 flex items-center justify-center text-ink-subtle shrink-0">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M3 2h10a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-body-sm text-ink font-medium truncate">
                      {scan.repoOwner}/{scan.repoName}
                    </p>
                    <p className="text-caption text-ink-subtle">
                      {scan.filesScanned != null ? `${scan.filesScanned} files scanned` : "—"}
                    </p>
                  </div>
                </div>

                {/* Centre: status badge */}
                <div className="hidden sm:flex items-center gap-3">
                  {scanStatusBadge(scan.status)}
                  <span className="text-caption text-ink-muted font-medium tabular-nums">
                    {scan.servicesFound ?? 0} service{(scan.servicesFound ?? 0) !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Right: timestamp */}
                <span className="text-caption text-ink-subtle whitespace-nowrap ml-4">
                  {timeAgo(scan.completedAt ?? scan.startedAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-surface-2 border border-[rgba(178,182,189,0.1)] flex items-center justify-center mb-3 text-ink-subtle">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M1 8h3l2-5 3 10 2-5h4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-body-sm text-ink-subtle">
              No scans yet. Sync your repos and run your first scan!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
