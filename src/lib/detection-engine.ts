import { Octokit } from "octokit";
import {
  fetchRepoTree,
  fetchFileContent,
  GitHubTreeItem,
} from "./github";
import { db } from "./db";
import { serviceDetectionRules, services } from "./db/schema";
import { eq } from "drizzle-orm";

export interface DetectionMatch {
  ruleId: string;
  serviceId: string;
  serviceName: string;
  ruleType: string;
  pattern: string;
  matchedIn: string; // file path
  matchedContent: string; // what was matched
  confidenceWeight: number;
}

export interface DetectionResult {
  serviceId: string;
  serviceName: string;
  confidence: number;
  matches: DetectionMatch[];
}

// Files to check for dependencies
const DEPENDENCY_FILES = [
  "package.json",
  "requirements.txt",
  "Pipfile",
  "pyproject.toml",
  "go.mod",
  "Gemfile",
  "Cargo.toml",
  "composer.json",
  "pom.xml",
  "build.gradle",
];

// Max file size to fetch (100KB)
const MAX_FILE_SIZE = 100 * 1024;

/**
 * Main scanning function: scans a repo and returns detected services
 */
export async function scanRepository(
  octokit: Octokit,
  owner: string,
  repoName: string,
  branch: string
): Promise<DetectionResult[]> {
  // 1. Fetch all detection rules from DB
  const rules = await db
    .select({
      id: serviceDetectionRules.id,
      serviceId: serviceDetectionRules.serviceId,
      ruleType: serviceDetectionRules.ruleType,
      pattern: serviceDetectionRules.pattern,
      fileGlob: serviceDetectionRules.fileGlob,
      confidenceWeight: serviceDetectionRules.confidenceWeight,
      language: serviceDetectionRules.language,
      serviceName: services.name,
    })
    .from(serviceDetectionRules)
    .innerJoin(services, eq(serviceDetectionRules.serviceId, services.id));

  if (rules.length === 0) {
    console.warn("No detection rules found in database. Run the seed script first.");
    return [];
  }

  // 2. Fetch file tree
  const tree = await fetchRepoTree(octokit, owner, repoName, branch);
  if (tree.length === 0) return [];

  // 3. Create a file path set for quick lookups
  const filePaths = new Set(tree.map((t) => t.path));
  const filesByName = new Map<string, GitHubTreeItem[]>();
  tree.forEach((item) => {
    const name = item.path.split("/").pop()!;
    if (!filesByName.has(name)) filesByName.set(name, []);
    filesByName.get(name)!.push(item);
  });

  // 4. Collect all matches
  const allMatches: DetectionMatch[] = [];

  // Group rules by type for efficient processing
  const configFileRules = rules.filter((r) => r.ruleType === "config_file");
  const dependencyRules = rules.filter((r) => r.ruleType === "dependency");
  const importPatternRules = rules.filter((r) => r.ruleType === "import_pattern");
  const envVarRules = rules.filter((r) => r.ruleType === "env_var");
  const ciCdRules = rules.filter((r) => r.ruleType === "ci_cd");

  // 4a. Check config file rules (just check if file exists)
  for (const rule of configFileRules) {
    const pattern = rule.pattern;
    // Check exact path match or glob-style
    if (filePaths.has(pattern)) {
      allMatches.push({
        ruleId: rule.id,
        serviceId: rule.serviceId,
        serviceName: rule.serviceName,
        ruleType: rule.ruleType,
        pattern: pattern,
        matchedIn: pattern,
        matchedContent: `Config file found: ${pattern}`,
        confidenceWeight: parseFloat(rule.confidenceWeight || "0.5"),
      });
    } else {
      // Check if any file path contains the pattern (for directory checks like "supabase/")
      for (const fp of filePaths) {
        if (fp.startsWith(pattern) || fp.includes(`/${pattern}`)) {
          allMatches.push({
            ruleId: rule.id,
            serviceId: rule.serviceId,
            serviceName: rule.serviceName,
            ruleType: rule.ruleType,
            pattern: pattern,
            matchedIn: fp,
            matchedContent: `Config path found: ${fp}`,
            confidenceWeight: parseFloat(rule.confidenceWeight || "0.5"),
          });
          break;
        }
      }
    }
  }

  // 4b. Check dependency file rules
  for (const depFile of DEPENDENCY_FILES) {
    const matchingItems = filesByName.get(depFile);
    if (!matchingItems) continue;

    for (const item of matchingItems) {
      if (item.size && item.size > MAX_FILE_SIZE) continue;

      const content = await fetchFileContent(octokit, owner, repoName, item.path, branch);
      if (!content) continue;

      for (const rule of dependencyRules) {
        // Check if the rule's fileGlob matches this dependency file
        if (rule.fileGlob && !matchesGlob(item.path, rule.fileGlob)) continue;

        if (content.includes(rule.pattern)) {
          allMatches.push({
            ruleId: rule.id,
            serviceId: rule.serviceId,
            serviceName: rule.serviceName,
            ruleType: rule.ruleType,
            pattern: rule.pattern,
            matchedIn: item.path,
            matchedContent: `Dependency found: ${rule.pattern}`,
            confidenceWeight: parseFloat(rule.confidenceWeight || "0.5"),
          });
        }
      }
    }
  }

  // 4c. Check import patterns in source files
  const sourceExtensions = [
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".py", ".go", ".rs", ".rb", ".java", ".kt",
  ];
  const sourceFiles = tree.filter((item) => {
    const ext = item.path.substring(item.path.lastIndexOf("."));
    return sourceExtensions.includes(ext) && (!item.size || item.size < MAX_FILE_SIZE);
  });

  // Limit source files to scan (max 50 to avoid rate limits)
  const filesToScan = sourceFiles.slice(0, 50);

  for (const file of filesToScan) {
    const content = await fetchFileContent(octokit, owner, repoName, file.path, branch);
    if (!content) continue;

    for (const rule of importPatternRules) {
      try {
        const regex = new RegExp(rule.pattern, "gm");
        if (regex.test(content)) {
          allMatches.push({
            ruleId: rule.id,
            serviceId: rule.serviceId,
            serviceName: rule.serviceName,
            ruleType: rule.ruleType,
            pattern: rule.pattern,
            matchedIn: file.path,
            matchedContent: `Import pattern matched: ${rule.pattern}`,
            confidenceWeight: parseFloat(rule.confidenceWeight || "0.5"),
          });
        }
      } catch {
        // Invalid regex, try string match
        if (content.includes(rule.pattern)) {
          allMatches.push({
            ruleId: rule.id,
            serviceId: rule.serviceId,
            serviceName: rule.serviceName,
            ruleType: rule.ruleType,
            pattern: rule.pattern,
            matchedIn: file.path,
            matchedContent: `Pattern matched: ${rule.pattern}`,
            confidenceWeight: parseFloat(rule.confidenceWeight || "0.5"),
          });
        }
      }
    }

    // Also check env var patterns in source files
    for (const rule of envVarRules) {
      if (content.includes(rule.pattern)) {
        allMatches.push({
          ruleId: rule.id,
          serviceId: rule.serviceId,
          serviceName: rule.serviceName,
          ruleType: rule.ruleType,
          pattern: rule.pattern,
          matchedIn: file.path,
          matchedContent: `Environment variable reference: ${rule.pattern}`,
          confidenceWeight: parseFloat(rule.confidenceWeight || "0.5"),
        });
      }
    }
  }

  // 4d. Check CI/CD files
  const ciFiles = tree.filter(
    (item) =>
      item.path.startsWith(".github/workflows/") ||
      item.path === ".gitlab-ci.yml" ||
      item.path === "Dockerfile" ||
      item.path === "docker-compose.yml" ||
      item.path === "docker-compose.yaml"
  );

  for (const file of ciFiles) {
    if (file.size && file.size > MAX_FILE_SIZE) continue;
    const content = await fetchFileContent(octokit, owner, repoName, file.path, branch);
    if (!content) continue;

    for (const rule of ciCdRules) {
      if (content.includes(rule.pattern)) {
        allMatches.push({
          ruleId: rule.id,
          serviceId: rule.serviceId,
          serviceName: rule.serviceName,
          ruleType: rule.ruleType,
          pattern: rule.pattern,
          matchedIn: file.path,
          matchedContent: `CI/CD reference: ${rule.pattern}`,
          confidenceWeight: parseFloat(rule.confidenceWeight || "0.5"),
        });
      }
    }
  }

  // 4e. Check .env.example files for env var rules
  const envExampleFiles = tree.filter(
    (item) =>
      item.path.endsWith(".env.example") ||
      item.path.endsWith(".env.sample") ||
      item.path.endsWith(".env.template")
  );

  for (const file of envExampleFiles) {
    if (file.size && file.size > MAX_FILE_SIZE) continue;
    const content = await fetchFileContent(octokit, owner, repoName, file.path, branch);
    if (!content) continue;

    for (const rule of envVarRules) {
      if (content.includes(rule.pattern)) {
        allMatches.push({
          ruleId: rule.id,
          serviceId: rule.serviceId,
          serviceName: rule.serviceName,
          ruleType: rule.ruleType,
          pattern: rule.pattern,
          matchedIn: file.path,
          matchedContent: `Environment variable: ${rule.pattern}`,
          confidenceWeight: parseFloat(rule.confidenceWeight || "0.5"),
        });
      }
    }
  }

  // 5. Aggregate matches by service and calculate confidence
  return aggregateResults(allMatches);
}

/**
 * Aggregate detection matches into per-service results with confidence scores
 */
function aggregateResults(matches: DetectionMatch[]): DetectionResult[] {
  const serviceMap = new Map<
    string,
    { serviceName: string; matches: DetectionMatch[] }
  >();

  for (const match of matches) {
    if (!serviceMap.has(match.serviceId)) {
      serviceMap.set(match.serviceId, {
        serviceName: match.serviceName,
        matches: [],
      });
    }
    serviceMap.get(match.serviceId)!.matches.push(match);
  }

  const results: DetectionResult[] = [];

  for (const [serviceId, data] of serviceMap) {
    // Deduplicate matches by ruleId (same rule matching in multiple files counts once)
    const uniqueRules = new Map<string, DetectionMatch>();
    for (const match of data.matches) {
      if (
        !uniqueRules.has(match.ruleId) ||
        match.confidenceWeight > uniqueRules.get(match.ruleId)!.confidenceWeight
      ) {
        uniqueRules.set(match.ruleId, match);
      }
    }

    // Calculate confidence: use a weighted combination
    // More rule types matched = higher confidence
    const weights = Array.from(uniqueRules.values()).map(
      (m) => m.confidenceWeight
    );
    
    // Combined confidence: 1 - product of (1 - weight) for each signal
    // This gives diminishing returns for additional signals
    const confidence = Math.min(
      0.99,
      1 - weights.reduce((product, w) => product * (1 - w), 1)
    );

    results.push({
      serviceId,
      serviceName: data.serviceName,
      confidence: Math.round(confidence * 100) / 100,
      matches: data.matches,
    });
  }

  // Sort by confidence descending
  return results.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Simple glob matching for file patterns
 */
function matchesGlob(path: string, glob: string): boolean {
  // Simple matching: exact name, or wildcard
  if (glob === "*") return true;
  const fileName = path.split("/").pop()!;
  if (glob === fileName) return true;
  if (glob.startsWith("*") && fileName.endsWith(glob.slice(1))) return true;
  if (glob.endsWith("*") && fileName.startsWith(glob.slice(0, -1))) return true;
  if (path.includes(glob)) return true;
  return false;
}
