/**
 * CloudLens Inngest Functions
 *
 * Durable background jobs powered by Inngest.
 * Each function is defined with explicit retry policies
 * and timeout handling.
 */

import { inngest } from "@/lib/inngest";
import { db } from "@/db";
import { repositories, scans, detectedServices, accounts, alerts, users } from "@/db/schema";
import { eq, and, lt, sql, ne, gte, desc } from "drizzle-orm";
import { scanRepository as runScan } from "@/lib/detection/scanner";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { render } from "react-email";
import { MonthlyDigest } from "@/emails/MonthlyDigest";

// ---------------------------------------------------------------------------
// repo.scan — Background repository scan
// ---------------------------------------------------------------------------

/**
 * Inngest function that scans a repository for cloud services.
 *
 * Triggered by: `repo/scan.requested`
 * Event data:   `{ repoId: string }`
 *
 * The scan logic is broken into durable steps so each phase is
 * independently retriable:
 *   1. set-scanning-status — mark repo as scanning, create scan record
 *   2. run-scan            — invoke the detection orchestrator
 *   3. persist-results     — save services to DB, update scan & repo status
 *
 * On unrecoverable failure the `onFailure` handler marks everything as failed.
 */
export const repoScanFunction = inngest.createFunction(
  {
    id: "repo-scan",
    name: "Repository Cloud Service Scan",
    retries: 3,
    triggers: [{ event: "repo/scan.requested" }],
    onFailure: async ({ event, error }) => {
      // Extract the original event data from the failure event
      const originalEvent = event.data.event;
      const repoId = originalEvent?.data?.repoId as string | undefined;

      if (!repoId) {
        console.error("[CloudLens] repo.scan onFailure: missing repoId");
        return;
      }

      console.error(
        `[CloudLens] repo.scan permanently failed for repo ${repoId}:`,
        error,
      );

      // Mark repo as failed
      await db
        .update(repositories)
        .set({ scanStatus: "failed", updatedAt: new Date() })
        .where(eq(repositories.id, repoId));
    },
  },
  async ({ event, step }) => {

    const { repoId } = event.data;

    // ------------------------------------------------------------------
    // Step 1 — Set scanning status + create scan record
    // ------------------------------------------------------------------
    const { scanId, accessToken, owner, repoName, defaultBranch } =
      await step.run("set-scanning-status", async () => {
        // Fetch the repo record
        const repo = await db.query.repositories.findFirst({
          where: eq(repositories.id, repoId),
        });

        if (!repo) {
          throw new Error(`Repository ${repoId} not found`);
        }

        // Get the GitHub access token from the accounts table
        const account = await db
          .select({ access_token: accounts.access_token })
          .from(accounts)
          .where(
            and(
              eq(accounts.userId, repo.userId),
              eq(accounts.provider, "github"),
            ),
          )
          .limit(1);

        const token = account[0]?.access_token;
        if (!token) {
          throw new Error(`No GitHub access token for user ${repo.userId}`);
        }

        // Update repo status
        await db
          .update(repositories)
          .set({ scanStatus: "scanning", updatedAt: new Date() })
          .where(eq(repositories.id, repoId));

        // Create scan record
        const [scanRecord] = await db
          .insert(scans)
          .values({
            repositoryId: repoId,
            status: "scanning",
            startedAt: new Date(),
          })
          .returning();

        return {
          scanId: scanRecord.id,
          accessToken: token,
          owner: repo.owner,
          repoName: repo.name,
          defaultBranch: repo.defaultBranch,
        };
      });

    // ------------------------------------------------------------------
    // Step 2 — Run the scan orchestrator
    // ------------------------------------------------------------------
    const scanResult = await step.run("run-scan", async () => {
      const result = await runScan(
        accessToken,
        owner,
        repoName,
        defaultBranch,
      );

      // Return a plain serializable object (Inngest step results must be JSON)
      return {
        services: result.services.map((svc) => ({
          serviceName: svc.serviceName,
          serviceCategory: svc.serviceCategory,
          provider: svc.provider,
          confidenceScore: svc.confidenceScore,
          detectionSource: svc.detectionSource,
          evidenceFile: svc.evidenceFile,
          evidenceLine: svc.evidenceLine,
          evidenceSnippet: svc.evidenceSnippet,
        })),
        filesScanned: result.filesScanned,
        servicesFound: result.servicesFound,
      };
    });

    // ------------------------------------------------------------------
    // Step 3 — Persist results to DB
    // ------------------------------------------------------------------
    await step.run("persist-results", async () => {
      // Delete previous detections for this repo
      await db
        .delete(detectedServices)
        .where(eq(detectedServices.repositoryId, repoId));

      // Insert new detections in chunks
      if (scanResult.services.length > 0) {
        const CHUNK_SIZE = 50;
        for (let i = 0; i < scanResult.services.length; i += CHUNK_SIZE) {
          const chunk = scanResult.services.slice(i, i + CHUNK_SIZE);
          await db.insert(detectedServices).values(
            chunk.map((svc) => ({
              scanId,
              repositoryId: repoId,
              serviceName: svc.serviceName,
              serviceCategory: svc.serviceCategory as any,
              provider: svc.provider,
              confidenceScore: svc.confidenceScore,
              detectionSource: svc.detectionSource as any,
              evidenceFile: svc.evidenceFile,
              evidenceLine: svc.evidenceLine,
              evidenceSnippet: svc.evidenceSnippet,
            })),
          );
        }
      }

      // Update the scan record
      await db
        .update(scans)
        .set({
          status: "complete",
          completedAt: new Date(),
          filesScanned: scanResult.filesScanned,
          servicesFound: scanResult.servicesFound,
        })
        .where(eq(scans.id, scanId));

      // Update the repo status
      await db
        .update(repositories)
        .set({
          scanStatus: "complete",
          lastScannedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(repositories.id, repoId));
    });

    return {
      success: true,
      repoId,
      filesScanned: scanResult.filesScanned,
      servicesFound: scanResult.servicesFound,
    };
  },
);

// ---------------------------------------------------------------------------
// alerts.check-inactivity — Daily inactivity check
// ---------------------------------------------------------------------------

/**
 * Checks for repositories with detected services that haven't had
 * a commit in > 30 days. Generates `inactivity` alerts.
 *
 * Runs daily at midnight UTC.
 */
export const alertsCheckInactivityFunction = inngest.createFunction(
  {
    id: "alerts-check-inactivity",
    name: "Check Repo Inactivity Alerts",
    retries: 2,
    triggers: [{ cron: "0 0 * * *" }], // Daily at midnight UTC
  },
  async ({ step }) => {
    const results = await step.run("check-inactive-repos", async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Find repos with detected services but no recent commits
      const inactiveRepos = await db
        .select({
          repoId: repositories.id,
          repoName: repositories.name,
          userId: repositories.userId,
          lastCommitAt: repositories.lastCommitAt,
          serviceCount: sql<number>`count(distinct ${detectedServices.id})`,
        })
        .from(repositories)
        .innerJoin(
          detectedServices,
          eq(detectedServices.repositoryId, repositories.id),
        )
        .where(
          and(
            lt(repositories.lastCommitAt, thirtyDaysAgo),
            eq(repositories.scanStatus, "complete"),
          ),
        )
        .groupBy(
          repositories.id,
          repositories.name,
          repositories.userId,
          repositories.lastCommitAt,
        );

      let created = 0;
      let skipped = 0;

      for (const repo of inactiveRepos) {
        // Check for existing active/snoozed inactivity alert on this repo
        const existing = await db
          .select({ id: alerts.id })
          .from(alerts)
          .where(
            and(
              eq(alerts.repositoryId, repo.repoId),
              eq(alerts.type, "inactivity"),
              sql`${alerts.status} IN ('active', 'snoozed')`,
            ),
          )
          .limit(1);

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        const daysSince = repo.lastCommitAt
          ? Math.floor(
              (Date.now() - repo.lastCommitAt.getTime()) / (1000 * 60 * 60 * 24),
            )
          : 999;

        await db.insert(alerts).values({
          userId: repo.userId,
          repositoryId: repo.repoId,
          type: "inactivity",
          severity: daysSince > 90 ? "critical" : "warning",
          title: `${repo.repoName} has been inactive for ${daysSince} days`,
          message: `This repository has ${Number(repo.serviceCount)} active cloud service${Number(repo.serviceCount) !== 1 ? "s" : ""} but hasn't received a commit in ${daysSince} days. Consider reviewing whether these services are still needed to avoid unnecessary costs.`,
          status: "active",
        });
        created++;
      }

      return { checked: inactiveRepos.length, created, skipped };
    });

    return results;
  },
);

// ---------------------------------------------------------------------------
// alerts.check-expiry — Daily free-tier expiration check
// ---------------------------------------------------------------------------

/**
 * Known trial / free-tier durations (in days) for services we track.
 * These are approximate values — real billing data comes in Phase 8.
 */
const TRIAL_DURATIONS: Record<string, number> = {
  "Amazon S3": 365,
  "AWS Lambda": 365,
  "Amazon DynamoDB": 365,
  "Amazon SES": 365,
  "Amazon CloudFront": 365,
  "Google Cloud Run": 90,
  "Google BigQuery": 365,
  Firebase: 365,
  Neon: 365,
  PlanetScale: 14,
  Vercel: 365,
  Netlify: 365,
  Supabase: 365,
  Stripe: 365,
  Auth0: 365,
  Clerk: 365,
  Resend: 365,
  Sentry: 365,
  Datadog: 14,
  "Cloudflare Workers": 365,
};

/**
 * Checks for services approaching free-tier expiration and generates
 * alerts at 7-day, 3-day, and 1-day thresholds with escalating severity.
 *
 * Uses `repo.createdAt` as a proxy for "when the user started using the service".
 *
 * Runs daily at 06:00 UTC.
 */
export const alertsCheckExpiryFunction = inngest.createFunction(
  {
    id: "alerts-check-expiry",
    name: "Check Service Expiry Alerts",
    retries: 2,
    triggers: [{ cron: "0 6 * * *" }], // Daily at 06:00 UTC
  },
  async ({ step }) => {
    const results = await step.run("check-service-expiry", async () => {
      // Get all detected services with their repo's createdAt
      const servicesWithRepoAge = await db
        .select({
          serviceId: detectedServices.id,
          serviceName: detectedServices.serviceName,
          repoId: detectedServices.repositoryId,
          repoName: repositories.name,
          userId: repositories.userId,
          repoCreatedAt: repositories.createdAt,
        })
        .from(detectedServices)
        .innerJoin(
          repositories,
          eq(detectedServices.repositoryId, repositories.id),
        );

      let created = 0;
      let skipped = 0;

      for (const svc of servicesWithRepoAge) {
        const trialDays = TRIAL_DURATIONS[svc.serviceName];
        if (!trialDays) continue; // No known trial duration

        const expiryDate = new Date(svc.repoCreatedAt);
        expiryDate.setDate(expiryDate.getDate() + trialDays);

        const now = new Date();
        const daysUntilExpiry = Math.floor(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Only alert at 7, 3, or 1 day thresholds
        let severity: "info" | "warning" | "critical" | null = null;
        if (daysUntilExpiry <= 1 && daysUntilExpiry >= 0) {
          severity = "critical";
        } else if (daysUntilExpiry <= 3 && daysUntilExpiry > 1) {
          severity = "warning";
        } else if (daysUntilExpiry <= 7 && daysUntilExpiry > 3) {
          severity = "info";
        }

        if (!severity) continue;

        // Check for existing active/snoozed expiry alert for this service+repo
        const existing = await db
          .select({ id: alerts.id })
          .from(alerts)
          .where(
            and(
              eq(alerts.serviceId, svc.serviceId),
              eq(alerts.repositoryId, svc.repoId),
              eq(alerts.type, "expiry"),
              sql`${alerts.status} IN ('active', 'snoozed')`,
            ),
          )
          .limit(1);

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        await db.insert(alerts).values({
          userId: svc.userId,
          repositoryId: svc.repoId,
          serviceId: svc.serviceId,
          type: "expiry",
          severity,
          title: `${svc.serviceName} free tier expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}`,
          message: `The free tier for ${svc.serviceName} in ${svc.repoName} is estimated to expire in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}. Review your usage and consider upgrading or removing the service.`,
          status: "active",
        });
        created++;
      }

      return { checked: servicesWithRepoAge.length, created, skipped };
    });

    return results;
  },
);

// ---------------------------------------------------------------------------
// alerts.check-outages — Poll Statuspage APIs every 5 minutes
// ---------------------------------------------------------------------------

/**
 * Statuspage API endpoints for major cloud providers.
 * Most follow the Atlassian Statuspage v2 JSON API format.
 */
const STATUSPAGE_ENDPOINTS: Array<{
  provider: string;
  url: string;
  format: "statuspage" | "aws";
}> = [
  {
    provider: "Vercel",
    url: "https://www.vercel-status.com/api/v2/status.json",
    format: "statuspage",
  },
  {
    provider: "Stripe",
    url: "https://status.stripe.com/api/v2/status.json",
    format: "statuspage",
  },
  {
    provider: "Cloudflare",
    url: "https://www.cloudflarestatus.com/api/v2/status.json",
    format: "statuspage",
  },
  {
    provider: "GitHub",
    url: "https://www.githubstatus.com/api/v2/status.json",
    format: "statuspage",
  },
];

/**
 * Polls Statuspage APIs for major providers and generates/resolves
 * outage alerts.
 *
 * Runs every 5 minutes.
 */
export const alertsCheckOutagesFunction = inngest.createFunction(
  {
    id: "alerts-check-outages",
    name: "Check Service Outage Alerts",
    retries: 1,
    triggers: [{ cron: "*/5 * * * *" }], // Every 5 minutes
  },
  async ({ step }) => {
    const results = await step.run("poll-statuspages", async () => {
      let created = 0;
      let resolved = 0;
      let errors = 0;

      for (const endpoint of STATUSPAGE_ENDPOINTS) {
        try {
          const response = await fetch(endpoint.url, {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(10_000), // 10s timeout
          });

          if (!response.ok) {
            errors++;
            continue;
          }

          const data = await response.json();

          // Atlassian Statuspage v2 format: status.indicator = "none" | "minor" | "major" | "critical"
          const indicator: string = data?.status?.indicator ?? "none";
          const isOperational = indicator === "none";
          const description: string =
            data?.status?.description ?? "Unknown status";

          if (!isOperational) {
            // Check for an existing active outage alert for this provider
            const existing = await db
              .select({ id: alerts.id })
              .from(alerts)
              .where(
                and(
                  eq(alerts.type, "outage"),
                  eq(alerts.title, `${endpoint.provider} service disruption`),
                  eq(alerts.status, "active"),
                ),
              )
              .limit(1);

            if (existing.length === 0) {
              // Find all users who have detected services from this provider
              const affectedUsers = await db
                .select({
                  userId: repositories.userId,
                })
                .from(detectedServices)
                .innerJoin(
                  repositories,
                  eq(detectedServices.repositoryId, repositories.id),
                )
                .where(eq(detectedServices.provider, endpoint.provider))
                .groupBy(repositories.userId);

              // Create an outage alert for each affected user
              for (const user of affectedUsers) {
                await db.insert(alerts).values({
                  userId: user.userId,
                  type: "outage",
                  severity:
                    indicator === "critical"
                      ? "critical"
                      : indicator === "major"
                        ? "critical"
                        : "warning",
                  title: `${endpoint.provider} service disruption`,
                  message: `${endpoint.provider} is currently reporting: "${description}". This may affect your applications using ${endpoint.provider} services.`,
                  status: "active",
                });
                created++;
              }
            }
          } else {
            // Provider is operational — auto-resolve any active outage alerts
            const resolvedRows = await db
              .update(alerts)
              .set({
                status: "resolved",
                updatedAt: new Date(),
              })
              .where(
                and(
                  eq(alerts.type, "outage"),
                  eq(alerts.title, `${endpoint.provider} service disruption`),
                  eq(alerts.status, "active"),
                ),
              )
              .returning({ id: alerts.id });

            resolved += resolvedRows.length;
          }
        } catch (err) {
          console.warn(
            `[CloudLens] Failed to poll ${endpoint.provider} status:`,
            err,
          );
          errors++;
        }
      }

      return { providers: STATUSPAGE_ENDPOINTS.length, created, resolved, errors };
    });

    return results;
  },
);

// ---------------------------------------------------------------------------
// email.monthly-digest — Monthly email digest on the 1st of each month
// ---------------------------------------------------------------------------

/**
 * Sends a personalized monthly cloud service digest email to every user
 * who has at least one successfully scanned repository.
 *
 * Runs at 08:00 UTC on the 1st of every month.
 */
export const emailMonthlyDigestFunction = inngest.createFunction(
  {
    id: "email-monthly-digest",
    name: "Monthly Email Digest",
    retries: 2,
    triggers: [{ cron: "0 8 1 * *" }], // 08:00 UTC on 1st of month
  },
  async ({ step }) => {
    const results = await step.run("send-digests", async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const monthLabel = now.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      // Get all users with at least one scanned repo
      const eligibleUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(users)
        .innerJoin(repositories, eq(repositories.userId, users.id))
        .where(eq(repositories.scanStatus, "complete"))
        .groupBy(users.id, users.name, users.email);

      let sent = 0;
      let skipped = 0;
      let errors = 0;

      for (const user of eligibleUsers) {
        if (!user.email) { skipped++; continue; }

        try {
          // Fetch total services + repos for this user
          const [serviceRows, repoRows] = await Promise.all([
            db
              .select({ id: detectedServices.id })
              .from(detectedServices)
              .innerJoin(repositories, eq(detectedServices.repositoryId, repositories.id))
              .where(eq(repositories.userId, user.id)),
            db
              .select({ id: repositories.id })
              .from(repositories)
              .where(and(eq(repositories.userId, user.id), eq(repositories.scanStatus, "complete"))),
          ]);

          if (serviceRows.length === 0) { skipped++; continue; }

          // Active alerts for this user
          const activeAlertRows = await db
            .select({
              id: alerts.id,
              title: alerts.title,
              severity: alerts.severity,
              type: alerts.type,
            })
            .from(alerts)
            .where(and(eq(alerts.userId, user.id), eq(alerts.status, "active")))
            .orderBy(desc(alerts.createdAt))
            .limit(10);

          // New detections in the last 30 days
          const newDetectionRows = await db
            .select({
              serviceName: detectedServices.serviceName,
              provider: detectedServices.provider,
              serviceCategory: detectedServices.serviceCategory,
              confidenceScore: detectedServices.confidenceScore,
            })
            .from(detectedServices)
            .innerJoin(repositories, eq(detectedServices.repositoryId, repositories.id))
            .where(
              and(
                eq(repositories.userId, user.id),
                gte(detectedServices.createdAt, thirtyDaysAgo),
              ),
            )
            .orderBy(desc(detectedServices.confidenceScore))
            .limit(10);

          // Services needing attention (active warning/critical alerts)
          const servicesNeedingAttention = activeAlertRows
            .filter((a) => a.severity === "warning" || a.severity === "critical")
            .map((a) => ({
              title: a.title,
              severity: a.severity as "warning" | "critical",
              type: a.type,
            }));

          const html = await render(
            MonthlyDigest({
              userName: user.name ?? "there",
              userEmail: user.email,
              monthLabel,
              totalServices: serviceRows.length,
              totalRepositories: repoRows.length,
              activeAlerts: activeAlertRows.length,
              newDetections: newDetectionRows.map((d) => ({
                serviceName: d.serviceName,
                provider: d.provider,
                category: d.serviceCategory,
                confidenceScore: d.confidenceScore,
              })),
              servicesNeedingAttention,
            }),
          );

          const { error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: user.email,
            subject: `Your CloudLens Digest · ${monthLabel}`,
            html,
          });

          if (error) {
            console.error(`[CloudLens] Failed to send digest to ${user.email}:`, error);
            errors++;
          } else {
            sent++;
          }
        } catch (err) {
          console.error(`[CloudLens] Error sending digest to ${user.email}:`, err);
          errors++;
        }
      }

      return { total: eligibleUsers.length, sent, skipped, errors };
    });

    return results;
  },
);
