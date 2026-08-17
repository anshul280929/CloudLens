/**
 * CI/CD Pipeline Parser (Task 4.6)
 *
 * Scans CI/CD configuration files for references to cloud services —
 * GitHub Actions workflow steps, GitLab CI job definitions,
 * Jenkinsfile stages, and Dockerfile instructions.
 *
 * Targeted files:
 *   - .github/workflows/*.yml
 *   - .gitlab-ci.yml
 *   - Jenkinsfile
 *   - Dockerfile / Dockerfile.*
 *   - bitbucket-pipelines.yml
 *   - .circleci/config.yml
 */

import { SERVICE_REGISTRY } from "../registry";
import type { DetectionResult } from "../types";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Analyse a CI/CD pipeline file and return service detections.
 *
 * @param filePath  - Relative path of the file within the repo
 * @param content   - UTF-8 text content of the file
 * @returns An array of detection results (may be empty)
 */
export function parseCicdFile(
  filePath: string,
  content: string,
): DetectionResult[] {
  const results: DetectionResult[] = [];
  const contentLower = content.toLowerCase();
  const lines = content.split("\n");

  // Track services already matched to avoid duplicates per file
  const matched = new Set<string>();

  for (const svc of SERVICE_REGISTRY) {
    if (matched.has(svc.name)) continue;

    for (const ref of svc.cicdReferences) {
      if (matched.has(svc.name)) break;
      const refLower = ref.toLowerCase();

      if (contentLower.includes(refLower)) {
        // Find the first matching line for evidence
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(refLower)) {
            matched.add(svc.name);
            results.push({
              serviceName: svc.name,
              provider: svc.provider,
              serviceCategory: svc.category,
              detectionSource: "cicd",
              evidenceFile: filePath,
              evidenceLine: i + 1,
              evidenceSnippet: lines[i].trim().substring(0, 200),
            });
            break;
          }
        }
      }
    }
  }

  return results;
}

/**
 * Check whether a file path corresponds to a CI/CD pipeline file.
 */
export function isCicdFile(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  const basename = lower.split("/").pop() ?? "";

  // GitHub Actions
  if (lower.includes(".github/workflows/") && (basename.endsWith(".yml") || basename.endsWith(".yaml"))) {
    return true;
  }

  // GitLab CI
  if (basename === ".gitlab-ci.yml" || basename === ".gitlab-ci.yaml") return true;

  // Jenkinsfile
  if (basename === "jenkinsfile") return true;

  // Dockerfile variants (Dockerfile, Dockerfile.dev, Dockerfile.prod, etc.)
  if (basename === "dockerfile" || basename.startsWith("dockerfile.")) return true;

  // Bitbucket Pipelines
  if (basename === "bitbucket-pipelines.yml") return true;

  // CircleCI
  if (lower.includes(".circleci/") && (basename === "config.yml" || basename === "config.yaml")) {
    return true;
  }

  // Travis CI
  if (basename === ".travis.yml") return true;

  // Azure Pipelines
  if (basename === "azure-pipelines.yml" || basename === "azure-pipelines.yaml") return true;

  return false;
}
