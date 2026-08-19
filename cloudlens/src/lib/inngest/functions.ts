/**
 * CloudLens Inngest Functions
 *
 * Durable background jobs powered by Inngest.
 * Each function is defined with explicit retry policies
 * and timeout handling.
 */

import { inngest } from "@/lib/inngest";
import { db } from "@/db";
import { repositories, scans, detectedServices, accounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { scanRepository as runScan } from "@/lib/detection/scanner";

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
