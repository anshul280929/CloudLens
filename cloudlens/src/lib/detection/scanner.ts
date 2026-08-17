/**
 * Scan Orchestrator (Task 4.9)
 *
 * The central coordinator that:
 *   1. Fetches the repository file tree via GitHub API
 *   2. Identifies scannable files (filters by relevant extensions/filenames)
 *   3. Fetches file contents for scannable files (batched to respect rate limits)
 *   4. Runs each parser on appropriate files
 *   5. Aggregates results, applies confidence scoring, deduplicates
 *   6. Returns the final list of detected services
 */

import {
  getRepoTree,
  getRepoContents,
  type GitHubTreeEntry,
  type GitHubContent,
} from "@/lib/github";

import {
  parseDependencyFile,
  isDependencyFile,
  parseConfigFile,
  isConfigFile,
  parseImports,
  isImportableFile,
  parseEnvVars,
  isEnvVarRelevantFile,
  parseCicdFile,
  isCicdFile,
} from "./parsers";

import { scoreAndDeduplicate } from "./scoring";
import type { DetectionResult, ScoredDetection } from "./types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Result returned by the scan orchestrator. */
export interface ScanResult {
  /** Deduplicated, scored service detections. */
  services: ScoredDetection[];

  /** Total number of files scanned (had content fetched). */
  filesScanned: number;

  /** Total number of services detected after deduplication. */
  servicesFound: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Maximum number of files to fetch in parallel per batch.
 * Keeps us well under GitHub's secondary rate limit.
 */
const BATCH_SIZE = 10;

/**
 * Maximum file size (in bytes) we'll fetch.  Larger files are
 * unlikely to contain useful detection signals and would waste
 * API quota.
 */
const MAX_FILE_SIZE = 512_000; // 512 KB

/**
 * Pause (ms) between batches to be gentle on GitHub's rate limiter.
 */
const BATCH_DELAY_MS = 200;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run a full cloud-service detection scan on a repository.
 *
 * @param accessToken - GitHub OAuth access token
 * @param owner       - Repository owner
 * @param repo        - Repository name
 * @param ref         - Branch / tag / SHA (default "HEAD")
 * @returns Aggregated, scored, and deduplicated scan results
 */
export async function scanRepository(
  accessToken: string,
  owner: string,
  repo: string,
  ref = "HEAD",
): Promise<ScanResult> {
  // ------------------------------------------------------------------
  // Step 1 — Fetch the full file tree
  // ------------------------------------------------------------------
  const tree = await getRepoTree(accessToken, owner, repo, ref);

  // ------------------------------------------------------------------
  // Step 2 — Filter to scannable files
  // ------------------------------------------------------------------
  const scannableEntries = tree.tree.filter(
    (entry) =>
      entry.type === "blob" &&
      isScannable(entry.path) &&
      (entry.size === undefined || entry.size <= MAX_FILE_SIZE),
  );

  // ------------------------------------------------------------------
  // Step 3 — Fetch file contents in batches
  // ------------------------------------------------------------------
  const allDetections: DetectionResult[] = [];
  let filesScanned = 0;

  for (let i = 0; i < scannableEntries.length; i += BATCH_SIZE) {
    const batch = scannableEntries.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(async (entry) => {
        const content = await fetchFileContent(
          accessToken,
          owner,
          repo,
          entry.path,
          ref,
        );
        if (content === null) return;

        filesScanned++;

        // ----------------------------------------------------------------
        // Step 4 — Run each applicable parser
        // ----------------------------------------------------------------
        const detections = runParsers(entry.path, content);
        allDetections.push(...detections);
      }),
    );

    // Log any unexpected fetch failures (but don't abort the scan)
    for (const result of batchResults) {
      if (result.status === "rejected") {
        console.warn(
          `[CloudLens scanner] Failed to process file: ${result.reason}`,
        );
      }
    }

    // Rate-limit courtesy pause between batches
    if (i + BATCH_SIZE < scannableEntries.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  // ------------------------------------------------------------------
  // Step 5 — Aggregate, score, and deduplicate
  // ------------------------------------------------------------------
  const services = scoreAndDeduplicate(allDetections);

  // ------------------------------------------------------------------
  // Step 6 — Return the final result
  // ------------------------------------------------------------------
  return {
    services,
    filesScanned,
    servicesFound: services.length,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determine whether a file path should be scanned by at least one parser.
 */
function isScannable(filePath: string): boolean {
  return (
    isDependencyFile(filePath) ||
    isConfigFile(filePath) ||
    isImportableFile(filePath) ||
    isEnvVarRelevantFile(filePath) ||
    isCicdFile(filePath)
  );
}

/**
 * Run all applicable parsers on a file and collect raw detections.
 */
function runParsers(filePath: string, content: string): DetectionResult[] {
  const results: DetectionResult[] = [];

  if (isDependencyFile(filePath)) {
    results.push(...parseDependencyFile(filePath, content));
  }
  if (isConfigFile(filePath)) {
    results.push(...parseConfigFile(filePath, content));
  }
  if (isImportableFile(filePath)) {
    results.push(...parseImports(filePath, content));
  }
  if (isEnvVarRelevantFile(filePath)) {
    results.push(...parseEnvVars(filePath, content));
  }
  if (isCicdFile(filePath)) {
    results.push(...parseCicdFile(filePath, content));
  }

  return results;
}

/**
 * Fetch the UTF-8 text content of a single file via the GitHub Contents API.
 * Returns `null` when the file can't be decoded (binary, too large, etc.).
 */
async function fetchFileContent(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  ref: string,
): Promise<string | null> {
  try {
    const response = await getRepoContents(accessToken, owner, repo, path, ref);

    // getRepoContents returns an array for directories
    if (Array.isArray(response)) return null;

    const file = response as GitHubContent;
    if (file.type !== "file" || !file.content) return null;

    // GitHub returns base64-encoded content
    return decodeBase64(file.content);
  } catch {
    // File may be too large for the Contents API (>1 MB) or otherwise
    // inaccessible — skip it gracefully.
    return null;
  }
}

/**
 * Decode a base64-encoded string (handles line-wrapped GitHub responses).
 */
function decodeBase64(encoded: string): string {
  // GitHub base64 includes line breaks; strip them before decoding
  const cleaned = encoded.replace(/\n/g, "");

  // Node.js environment
  if (typeof Buffer !== "undefined") {
    return Buffer.from(cleaned, "base64").toString("utf-8");
  }

  // Edge runtime fallback
  return new TextDecoder().decode(
    Uint8Array.from(atob(cleaned), (c) => c.charCodeAt(0)),
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
