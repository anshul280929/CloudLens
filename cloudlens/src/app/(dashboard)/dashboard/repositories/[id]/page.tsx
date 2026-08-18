import { auth } from "@/lib/auth";
import { db } from "@/db";
import { repositories, detectedServices, scans, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceEvidenceRow } from "@/components/ServiceEvidenceRow";
import { RescanButton } from "@/components/RescanButton";

export const dynamic = "force-dynamic";

/* ── Helper: relative timestamp ── */
function timeAgo(date: Date | string | null): string {
  if (!date) return "Never";
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
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ── Formatted date ── */
function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Scan-status badge mapper ── */
function scanStatusBadge(status: string) {
  const map: Record<string, { variant: "complete" | "scanning" | "failed" | "never-scanned"; label: string }> = {
    complete: { variant: "complete", label: "Scanned" },
    scanning: { variant: "scanning", label: "Scanning" },
    failed: { variant: "failed", label: "Failed" },
    pending: { variant: "never-scanned", label: "Never Scanned" },
  };
  const entry = map[status] ?? { variant: "never-scanned" as const, label: status };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

/* ── Info row helper ── */
function InfoItem({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-ink-subtle uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-body-sm text-ink ${mono ? "font-mono text-[13px]" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default async function RepositoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: repoId } = await params;
  const session = await auth();

  // Resolve user ID
  let dbUserId: string | undefined = (session?.user as any)?.id;
  if (!dbUserId && session?.user?.email) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    dbUserId = dbUser?.id;
  }

  // Fetch the repository
  const repo = await db.query.repositories.findFirst({
    where: eq(repositories.id, repoId),
  });

  if (!repo || repo.userId !== dbUserId) {
    notFound();
  }

  // Fetch detected services for this repo
  const services = await db
    .select()
    .from(detectedServices)
    .where(eq(detectedServices.repositoryId, repoId))
    .orderBy(desc(detectedServices.confidenceScore));

  // Fetch last scan info
  const lastScan = await db
    .select()
    .from(scans)
    .where(eq(scans.repositoryId, repoId))
    .orderBy(desc(scans.startedAt))
    .limit(1);

  const scanInfo = lastScan[0] ?? null;

  // Aggregate unique providers count
  const providerSet = new Set(services.map((s) => s.provider));

  // Aggregate service categories for cost placeholder
  const categoryMap = new Map<string, number>();
  for (const svc of services) {
    categoryMap.set(svc.serviceCategory, (categoryMap.get(svc.serviceCategory) ?? 0) + 1);
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* ── Repository Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-headline text-ink font-mono">{repo.name}</h1>
            <Badge
              variant={repo.isPrivate ? "default" : "info"}
              size="sm"
              showDot={false}
            >
              {repo.isPrivate ? "Private" : "Public"}
            </Badge>
            {scanStatusBadge(repo.scanStatus)}
          </div>
          <p className="text-body-sm text-ink-muted">
            {repo.owner}/{repo.name}
            {repo.description && (
              <span className="text-ink-subtle"> — {repo.description}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <RescanButton repoId={repo.id} />
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-caption text-ink-muted hover:text-ink transition-colors duration-150 border border-hairline rounded-md px-3 py-2"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 1C4.13 1 1 4.13 1 8c0 3.1 2.01 5.73 4.79 6.65.35.06.48-.15.48-.34 0-.17-.01-.71-.01-1.29-1.75.32-2.2-.43-2.34-.82-.08-.2-.42-.82-.71-.98-.24-.13-.59-.46-.01-.47.55-.01.94.51 1.07.71.63 1.05 1.63.76 2.03.58.06-.46.24-.76.44-.93-1.55-.18-3.17-.78-3.17-3.46 0-.76.27-1.39.71-1.88-.07-.18-.31-.89.07-1.85 0 0 .58-.19 1.9.71a6.5 6.5 0 013.44 0c1.32-.9 1.9-.71 1.9-.71.38.96.14 1.67.07 1.85.44.49.71 1.11.71 1.88 0 2.69-1.63 3.28-3.18 3.45.25.22.47.64.47 1.29 0 .93-.01 1.68-.01 1.91 0 .19.13.41.48.34A7.01 7.01 0 0015 8c0-3.87-3.13-7-7-7z"
                fill="currentColor"
              />
            </svg>
            GitHub
          </a>
        </div>
      </div>

      {/* ── Repo Info Grid ── */}
      <Card className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <InfoItem label="Language" value={repo.language ?? "—"} />
          <InfoItem label="Default Branch" value={repo.defaultBranch} mono />
          <InfoItem label="Last Commit" value={timeAgo(repo.lastCommitAt)} />
          <InfoItem label="Last Scanned" value={timeAgo(repo.lastScannedAt)} />
        </div>
        {scanInfo && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-5 pt-5 border-t border-[rgba(178,182,189,0.08)]">
            <InfoItem label="Files Scanned" value={scanInfo.filesScanned ?? "—"} />
            <InfoItem label="Services Found" value={scanInfo.servicesFound ?? 0} />
            <InfoItem label="Scan Started" value={formatDate(scanInfo.startedAt)} />
            <InfoItem
              label="Scan Duration"
              value={
                scanInfo.completedAt && scanInfo.startedAt
                  ? `${Math.round((new Date(scanInfo.completedAt).getTime() - new Date(scanInfo.startedAt).getTime()) / 1000)}s`
                  : "—"
              }
            />
          </div>
        )}
      </Card>

      {/* ── Detected Services ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-subhead text-ink">
            Detected Services
            <span className="text-ink-subtle font-normal ml-2 text-[16px]">
              ({services.length})
            </span>
          </h2>
          <div className="flex items-center gap-2 text-caption text-ink-subtle">
            <span>{providerSet.size} provider{providerSet.size !== 1 ? "s" : ""}</span>
            <span className="text-hairline">·</span>
            <span>{categoryMap.size} categor{categoryMap.size !== 1 ? "ies" : "y"}</span>
          </div>
        </div>

        {services.length > 0 ? (
          <div className="space-y-3">
            {services.map((svc) => (
              <ServiceEvidenceRow
                key={svc.id}
                serviceName={svc.serviceName}
                provider={svc.provider}
                category={svc.serviceCategory}
                confidenceScore={svc.confidenceScore}
                detectionSource={svc.detectionSource}
                evidenceFile={svc.evidenceFile}
                evidenceLine={svc.evidenceLine}
                evidenceSnippet={svc.evidenceSnippet}
              />
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-surface-2 border border-[rgba(178,182,189,0.1)] flex items-center justify-center mb-3 text-ink-subtle">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M4 12a3 3 0 01-.5-5.96A4.5 4.5 0 018 2.5a4.5 4.5 0 014.5 4 3 3 0 01-.5 5.96"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-body-sm text-ink-subtle">
              No services detected yet. Click &quot;Re-scan&quot; to analyze this repository.
            </p>
          </Card>
        )}
      </div>

      {/* ── Cost Summary Placeholder ── */}
      <div className="space-y-4">
        <h2 className="text-subhead text-ink">Cost Summary</h2>
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-body-sm text-ink-muted">
                Estimated monthly cost based on detected services.
              </p>
              <p className="text-caption text-ink-subtle">
                Real billing data will be available once you connect provider accounts (Phase 8).
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-display-md text-ink-subtle">—</span>
              <p className="text-caption text-ink-subtle mt-1">per month</p>
            </div>
          </div>

          {/* Service category breakdown placeholder */}
          {categoryMap.size > 0 && (
            <div className="mt-5 pt-5 border-t border-[rgba(178,182,189,0.08)]">
              <p className="text-[11px] font-medium text-ink-subtle uppercase tracking-wider mb-3">
                Services by Category
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.from(categoryMap.entries())
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, count]) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-muted bg-surface-2 px-2.5 py-1 rounded-full"
                    >
                      {cat}
                      <span className="text-ink-subtle">×{count}</span>
                    </span>
                  ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
