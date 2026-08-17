/**
 * Environment Variable Parser (Task 4.5)
 *
 * Scans files for environment variable naming conventions that indicate
 * cloud service usage.  Matches against the `envVarPrefixes` defined
 * in the service registry.
 *
 * Detection targets:
 *   - `.env` files (direct variable declarations)
 *   - Source files referencing `process.env.*`, `os.environ[*]`,
 *     `os.Getenv(*)`, `System.getenv(*)`, etc.
 *   - Docker-compose and CI files using `${VAR}` or `$VAR` syntax
 */

import { SERVICE_REGISTRY } from "../registry";
import type { DetectionResult } from "../types";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Analyse a file for environment variable references that match
 * known cloud service prefixes.
 *
 * @param filePath  - Relative path of the file within the repo
 * @param content   - UTF-8 text content of the file
 * @returns An array of detection results (may be empty)
 */
export function parseEnvVars(
  filePath: string,
  content: string,
): DetectionResult[] {
  const results: DetectionResult[] = [];
  const lines = content.split("\n");
  const basename = filePath.split("/").pop()?.toLowerCase() ?? "";

  // Determine whether this is a .env file (key=value pairs) or a source file
  const isEnvFile = /^\.env(\.\w+)*$/.test(basename);

  // Track services already matched to avoid duplicate detections per file
  const matched = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Extract candidate variable names from this line
    const varNames = isEnvFile
      ? extractEnvFileVarNames(line)
      : extractSourceVarNames(line);

    for (const varName of varNames) {
      const upperVar = varName.toUpperCase();

      for (const svc of SERVICE_REGISTRY) {
        if (matched.has(svc.name)) continue;

        for (const prefix of svc.envVarPrefixes) {
          const upperPrefix = prefix.toUpperCase();

          // Match: exact prefix, or prefix followed by underscore
          if (
            upperVar === upperPrefix ||
            upperVar.startsWith(upperPrefix + "_") ||
            upperVar.startsWith(upperPrefix)
          ) {
            matched.add(svc.name);
            results.push({
              serviceName: svc.name,
              provider: svc.provider,
              serviceCategory: svc.category,
              detectionSource: "envVar",
              evidenceFile: filePath,
              evidenceLine: i + 1,
              evidenceSnippet: line.trim().substring(0, 200),
            });
            break; // No need to check other prefixes for this service
          }
        }
      }
    }
  }

  return results;
}

/**
 * Check whether a file path should be scanned for env variable patterns.
 */
export function isEnvVarRelevantFile(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  const basename = lower.split("/").pop() ?? "";

  // .env variants
  if (/^\.env(\.\w+)*$/.test(basename)) return true;

  // Source files that commonly reference env vars
  const ext = lower.split(".").pop() ?? "";
  if (SOURCE_EXTENSIONS.has(ext)) return true;

  // Docker/compose/CI files
  if (
    basename.includes("docker-compose") ||
    basename === "dockerfile" ||
    basename.endsWith(".yml") ||
    basename.endsWith(".yaml")
  )
    return true;

  return false;
}

// ---------------------------------------------------------------------------
// Source extensions that reference env vars
// ---------------------------------------------------------------------------

const SOURCE_EXTENSIONS = new Set([
  "ts",
  "tsx",
  "js",
  "jsx",
  "mjs",
  "cjs",
  "mts",
  "py",
  "go",
  "java",
]);

// ---------------------------------------------------------------------------
// Extraction helpers
// ---------------------------------------------------------------------------

/**
 * Extract variable names from a `.env` file line.
 * Format: `VAR_NAME=value` or `export VAR_NAME=value`
 */
function extractEnvFileVarNames(line: string): string[] {
  const trimmed = line.trim();

  // Skip blanks and comments
  if (!trimmed || trimmed.startsWith("#")) return [];

  // Strip optional `export` prefix
  const stripped = trimmed.startsWith("export ")
    ? trimmed.slice(7).trim()
    : trimmed;

  // Extract key from `KEY=value`
  const eqIdx = stripped.indexOf("=");
  if (eqIdx <= 0) return [];

  const key = stripped.substring(0, eqIdx).trim();
  return key ? [key] : [];
}

/**
 * Extract environment variable names referenced in source code.
 *
 * Supported patterns:
 *   process.env.VAR_NAME        (JS/TS)
 *   process.env["VAR_NAME"]     (JS/TS)
 *   process.env['VAR_NAME']     (JS/TS)
 *   os.environ["VAR_NAME"]      (Python)
 *   os.environ.get("VAR_NAME")  (Python)
 *   os.Getenv("VAR_NAME")       (Go)
 *   System.getenv("VAR_NAME")   (Java)
 *   ${VAR_NAME}                 (YAML / Docker)
 *   $VAR_NAME                   (YAML / Docker / Shell)
 *   env.VAR_NAME                (GitHub Actions)
 */
function extractSourceVarNames(line: string): string[] {
  const results: string[] = [];

  // process.env.VAR
  const dotEnvMatches = line.matchAll(/process\.env\.([A-Z_][A-Z0-9_]*)/gi);
  for (const m of dotEnvMatches) results.push(m[1]);

  // process.env["VAR"] or process.env['VAR']
  const bracketEnvMatches = line.matchAll(
    /process\.env\[['"]([A-Z_][A-Z0-9_]*)['"]\]/gi,
  );
  for (const m of bracketEnvMatches) results.push(m[1]);

  // os.environ["VAR"] or os.environ.get("VAR")
  const pyEnvMatches = line.matchAll(
    /os\.environ(?:\.get)?\s*\(\s*['"]([A-Z_][A-Z0-9_]*)['"]|os\.environ\[['"]([A-Z_][A-Z0-9_]*)['"]\]/gi,
  );
  for (const m of pyEnvMatches) results.push(m[1] || m[2]);

  // os.Getenv("VAR")
  const goEnvMatches = line.matchAll(
    /os\.Getenv\s*\(\s*['"]([A-Z_][A-Z0-9_]*)['"]\s*\)/gi,
  );
  for (const m of goEnvMatches) results.push(m[1]);

  // System.getenv("VAR")
  const javaEnvMatches = line.matchAll(
    /System\.getenv\s*\(\s*['"]([A-Z_][A-Z0-9_]*)['"]\s*\)/gi,
  );
  for (const m of javaEnvMatches) results.push(m[1]);

  // ${VAR_NAME} in YAML / Docker / shell
  const templateMatches = line.matchAll(/\$\{([A-Z_][A-Z0-9_]*)\}/g);
  for (const m of templateMatches) results.push(m[1]);

  // $VAR_NAME in YAML / Docker / shell (not inside ${})
  const plainVarMatches = line.matchAll(
    /(?<!\$\{)\$([A-Z_][A-Z0-9_]*)(?![}\w])/g,
  );
  for (const m of plainVarMatches) results.push(m[1]);

  // env.VAR_NAME (GitHub Actions syntax)
  const envDotMatches = line.matchAll(/\benv\.([A-Z_][A-Z0-9_]*)/gi);
  for (const m of envDotMatches) results.push(m[1]);

  return results;
}
