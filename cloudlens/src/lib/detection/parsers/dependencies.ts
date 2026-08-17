/**
 * Dependency File Parser (Task 4.2)
 *
 * Parses dependency manifests from multiple ecosystems and matches
 * declared packages against the CloudLens service registry.
 *
 * Supported manifests:
 *   - package.json       (Node.js / npm / yarn / pnpm)
 *   - requirements.txt   (Python / pip)
 *   - go.mod             (Go modules)
 *   - Gemfile            (Ruby / Bundler)
 *   - pom.xml            (Java / Maven)
 *   - build.gradle       (Java / Kotlin / Gradle)
 */

import { packageToService } from "../registry";
import type { DetectionResult } from "../types";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Analyse a dependency manifest file and return detections.
 *
 * @param filePath  - Relative path of the file within the repo
 * @param content   - UTF-8 text content of the file
 * @returns An array of detection results (may be empty)
 */
export function parseDependencyFile(
  filePath: string,
  content: string,
): DetectionResult[] {
  const filename = filePath.split("/").pop()?.toLowerCase() ?? "";

  if (filename === "package.json") return parsePackageJson(filePath, content);
  if (filename === "requirements.txt") return parseRequirementsTxt(filePath, content);
  if (filename === "go.mod") return parseGoMod(filePath, content);
  if (filename === "gemfile") return parseGemfile(filePath, content);
  if (filename === "pom.xml") return parsePomXml(filePath, content);
  if (filename === "build.gradle" || filename === "build.gradle.kts")
    return parseBuildGradle(filePath, content);

  return [];
}

/**
 * Check whether a file path corresponds to a known dependency manifest.
 */
export function isDependencyFile(filePath: string): boolean {
  const filename = filePath.split("/").pop()?.toLowerCase() ?? "";
  return DEPENDENCY_FILENAMES.has(filename);
}

// ---------------------------------------------------------------------------
// Manifest filenames
// ---------------------------------------------------------------------------

const DEPENDENCY_FILENAMES = new Set([
  "package.json",
  "requirements.txt",
  "go.mod",
  "gemfile",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
]);

// ---------------------------------------------------------------------------
// Per-ecosystem parsers
// ---------------------------------------------------------------------------

/**
 * Parse `package.json` — inspects both `dependencies` and `devDependencies`.
 */
function parsePackageJson(
  filePath: string,
  content: string,
): DetectionResult[] {
  const results: DetectionResult[] = [];

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    return results;
  }

  const deps: Record<string, string> = {
    ...(typeof parsed.dependencies === "object" ? (parsed.dependencies as Record<string, string>) : {}),
    ...(typeof parsed.devDependencies === "object" ? (parsed.devDependencies as Record<string, string>) : {}),
  };

  for (const [pkgName, version] of Object.entries(deps)) {
    const svc = packageToService.get(pkgName.toLowerCase());
    if (svc) {
      results.push({
        serviceName: svc.name,
        provider: svc.provider,
        serviceCategory: svc.category,
        detectionSource: "dependency",
        evidenceFile: filePath,
        evidenceSnippet: `"${pkgName}": "${version}"`,
      });
    }
  }

  return results;
}

/**
 * Parse Python `requirements.txt` (one package per line, optional version spec).
 * Supports lines like:
 *   boto3==1.26.0
 *   stripe>=3.0
 *   sentry-sdk[flask]
 */
function parseRequirementsTxt(
  filePath: string,
  content: string,
): DetectionResult[] {
  const results: DetectionResult[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();

    // Skip blanks, comments, -r/-c includes, and option flags
    if (!raw || raw.startsWith("#") || raw.startsWith("-")) continue;

    // Extract bare package name (strip version specifiers and extras)
    const pkgName = raw
      .split(/[>=<!~;\[]/)[0]
      .trim()
      .toLowerCase();

    if (!pkgName) continue;

    const svc = packageToService.get(pkgName);
    if (svc) {
      results.push({
        serviceName: svc.name,
        provider: svc.provider,
        serviceCategory: svc.category,
        detectionSource: "dependency",
        evidenceFile: filePath,
        evidenceLine: i + 1,
        evidenceSnippet: raw,
      });
    }
  }

  return results;
}

/**
 * Parse Go `go.mod` — matches `require` directives.
 * Example line: `require github.com/aws/aws-sdk-go v1.44.0`
 */
function parseGoMod(
  filePath: string,
  content: string,
): DetectionResult[] {
  const results: DetectionResult[] = [];
  const lines = content.split("\n");

  // Collect all module paths from require blocks and single-line requires
  let inRequireBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === "require (") {
      inRequireBlock = true;
      continue;
    }
    if (inRequireBlock && line === ")") {
      inRequireBlock = false;
      continue;
    }

    let modulePath: string | null = null;

    if (inRequireBlock) {
      // Inside a require block: "module/path v1.2.3"
      const parts = line.split(/\s+/);
      if (parts.length >= 1 && parts[0]) modulePath = parts[0];
    } else if (line.startsWith("require ")) {
      // Single-line require: "require module/path v1.2.3"
      const parts = line.replace("require ", "").trim().split(/\s+/);
      if (parts.length >= 1 && parts[0]) modulePath = parts[0];
    }

    if (!modulePath) continue;

    // Match against registry packageNames (Go uses full module paths)
    const svc = packageToService.get(modulePath.toLowerCase());
    if (svc) {
      results.push({
        serviceName: svc.name,
        provider: svc.provider,
        serviceCategory: svc.category,
        detectionSource: "dependency",
        evidenceFile: filePath,
        evidenceLine: i + 1,
        evidenceSnippet: line,
      });
    }
  }

  return results;
}

/**
 * Parse Ruby `Gemfile` — matches `gem "name"` declarations.
 */
function parseGemfile(
  filePath: string,
  content: string,
): DetectionResult[] {
  const results: DetectionResult[] = [];
  const lines = content.split("\n");
  const gemRegex = /^\s*gem\s+['"]([^'"]+)['"]/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(gemRegex);
    if (!match) continue;

    const gemName = match[1].toLowerCase();
    const svc = packageToService.get(gemName);
    if (svc) {
      results.push({
        serviceName: svc.name,
        provider: svc.provider,
        serviceCategory: svc.category,
        detectionSource: "dependency",
        evidenceFile: filePath,
        evidenceLine: i + 1,
        evidenceSnippet: lines[i].trim(),
      });
    }
  }

  return results;
}

/**
 * Parse Maven `pom.xml` — matches `<artifactId>` values inside `<dependency>`.
 * This is a simple substring/regex scan, not a full XML parser.
 */
function parsePomXml(
  filePath: string,
  content: string,
): DetectionResult[] {
  const results: DetectionResult[] = [];
  const lines = content.split("\n");
  const artifactRegex = /<artifactId>([^<]+)<\/artifactId>/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(artifactRegex);
    if (!match) continue;

    const artifactId = match[1].trim().toLowerCase();
    const svc = packageToService.get(artifactId);
    if (svc) {
      results.push({
        serviceName: svc.name,
        provider: svc.provider,
        serviceCategory: svc.category,
        detectionSource: "dependency",
        evidenceFile: filePath,
        evidenceLine: i + 1,
        evidenceSnippet: lines[i].trim(),
      });
    }
  }

  return results;
}

/**
 * Parse Gradle `build.gradle` / `build.gradle.kts` —
 * matches `implementation`, `api`, `compileOnly`, etc. declarations.
 * Example: `implementation "com.stripe:stripe-java:20.0.0"`
 */
function parseBuildGradle(
  filePath: string,
  content: string,
): DetectionResult[] {
  const results: DetectionResult[] = [];
  const lines = content.split("\n");
  // Matches: implementation("group:artifact:version") or implementation 'group:artifact:version'
  const depRegex =
    /(?:implementation|api|compileOnly|runtimeOnly|testImplementation)\s*[("']([^"')]+)['")\s]/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(depRegex);
    if (!match) continue;

    // Extract artifact name from "group:artifact:version"
    const parts = match[1].split(":");
    const artifactId = (parts.length >= 2 ? parts[1] : parts[0])
      .trim()
      .toLowerCase();

    const svc = packageToService.get(artifactId);
    if (svc) {
      results.push({
        serviceName: svc.name,
        provider: svc.provider,
        serviceCategory: svc.category,
        detectionSource: "dependency",
        evidenceFile: filePath,
        evidenceLine: i + 1,
        evidenceSnippet: lines[i].trim(),
      });
    }
  }

  return results;
}
