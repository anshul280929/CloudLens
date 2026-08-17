/**
 * Config File Parser (Task 4.3)
 *
 * Scans common configuration files for service references by
 * matching file contents against the `configFilePatterns` defined
 * in the service registry.
 *
 * Targeted config files:
 *   - .env, .env.local, .env.production, .env.development, etc.
 *   - docker-compose.yml / docker-compose.yaml
 *   - vercel.json
 *   - netlify.toml
 *   - firebase.json / .firebaserc
 *   - serverless.yml / serverless.yaml
 *   - wrangler.toml / wrangler.json
 *   - Any file that matches a known config pattern filename
 */

import { SERVICE_REGISTRY } from "../registry";
import type { DetectionResult } from "../types";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Analyse a configuration file and return service detections.
 *
 * @param filePath  - Relative path of the file within the repo
 * @param content   - UTF-8 text content of the file
 * @returns An array of detection results (may be empty)
 */
export function parseConfigFile(
  filePath: string,
  content: string,
): DetectionResult[] {
  const results: DetectionResult[] = [];
  const contentLower = content.toLowerCase();
  const lines = content.split("\n");

  for (const svc of SERVICE_REGISTRY) {
    for (const pattern of svc.configFilePatterns) {
      const patternLower = pattern.toLowerCase();

      // Skip patterns that ARE filenames (they identify the file, not
      // content within it) — unless the file IS that filename.
      if (isFilenamePattern(pattern)) {
        const basename = filePath.split("/").pop()?.toLowerCase() ?? "";
        if (basename === patternLower || filePath.toLowerCase().endsWith(patternLower)) {
          results.push({
            serviceName: svc.name,
            provider: svc.provider,
            serviceCategory: svc.category,
            detectionSource: "config",
            evidenceFile: filePath,
            evidenceSnippet: `Config file detected: ${filePath}`,
          });
        }
        continue;
      }

      // For content-based patterns: search line-by-line for precise line numbers
      if (contentLower.includes(patternLower)) {
        // Find the first matching line for evidence
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(patternLower)) {
            results.push({
              serviceName: svc.name,
              provider: svc.provider,
              serviceCategory: svc.category,
              detectionSource: "config",
              evidenceFile: filePath,
              evidenceLine: i + 1,
              evidenceSnippet: lines[i].trim().substring(0, 200),
            });
            break; // One match per pattern per service is sufficient
          }
        }
      }
    }
  }

  return results;
}

/**
 * Check whether a file path corresponds to a scannable config file.
 */
export function isConfigFile(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  const basename = lower.split("/").pop() ?? "";

  // Exact config file basenames
  if (CONFIG_BASENAMES.has(basename)) return true;

  // .env variants (.env, .env.local, .env.production, .env.development, ...)
  if (/\.env(\.\w+)*$/.test(basename)) return true;

  // Docker compose variants
  if (/docker-compose[\w.-]*\.ya?ml$/.test(basename)) return true;

  return false;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Well-known config file basenames we actively scan. */
const CONFIG_BASENAMES = new Set([
  "vercel.json",
  "netlify.toml",
  "firebase.json",
  ".firebaserc",
  "firestore.rules",
  "firestore.indexes.json",
  "serverless.yml",
  "serverless.yaml",
  "wrangler.toml",
  "wrangler.json",
  "docker-compose.yml",
  "docker-compose.yaml",
  "sam.yaml",
  "template.yaml",
  "datadog.yaml",
  ".sentryclirc",
  "sentry.properties",
  "supabase/config.toml",
  "_redirects",
  "_headers",
]);

/**
 * Heuristic: a config-file pattern that looks like a filename rather than
 * a content substring.  These typically have an extension.
 */
function isFilenamePattern(pattern: string): boolean {
  // Patterns with file extensions or that start with a dot
  return /\.\w{2,5}$/.test(pattern) || pattern.startsWith(".");
}
