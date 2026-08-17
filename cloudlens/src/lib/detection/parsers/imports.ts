/**
 * Import Statement Parser (Task 4.4)
 *
 * Regex-scans source files for SDK import / require statements and
 * matches them against the `importPatterns` in the service registry.
 *
 * Supported languages:
 *   - TypeScript / JavaScript  — `import … from "…"` and `require("…")`
 *   - Python                   — `import …` and `from … import …`
 *   - Go                       — `import "…"` and `import ( "…" )`
 *   - Java                     — `import …;`
 */

import { SERVICE_REGISTRY } from "../registry";
import type { DetectionResult } from "../types";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Analyse a source file for import statements that reference
 * cloud service SDKs.
 *
 * @param filePath  - Relative path of the file within the repo
 * @param content   - UTF-8 text content of the file
 * @returns An array of detection results (may be empty)
 */
export function parseImports(
  filePath: string,
  content: string,
): DetectionResult[] {
  const results: DetectionResult[] = [];
  const lines = content.split("\n");

  // Collect all import module paths from the file
  const importedModules = extractImportPaths(filePath, lines);

  // Match each imported module against registry import patterns
  for (const { modulePath, line, lineNumber } of importedModules) {
    for (const svc of SERVICE_REGISTRY) {
      for (const pattern of svc.importPatterns) {
        // Match if the imported path starts with or equals the pattern
        if (
          modulePath === pattern ||
          modulePath.startsWith(pattern + "/") ||
          modulePath.startsWith(pattern)
        ) {
          results.push({
            serviceName: svc.name,
            provider: svc.provider,
            serviceCategory: svc.category,
            detectionSource: "import",
            evidenceFile: filePath,
            evidenceLine: lineNumber,
            evidenceSnippet: line.trim().substring(0, 200),
          });
          break; // One detection per import per service
        }
      }
    }
  }

  return results;
}

/**
 * Check whether a file path corresponds to a source file we scan for imports.
 */
export function isImportableFile(filePath: string): boolean {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  return IMPORTABLE_EXTENSIONS.has(ext);
}

// ---------------------------------------------------------------------------
// Supported extensions
// ---------------------------------------------------------------------------

const IMPORTABLE_EXTENSIONS = new Set([
  "ts",
  "tsx",
  "js",
  "jsx",
  "mjs",
  "cjs",
  "mts",
  "cts",
  "py",
  "go",
  "java",
]);

// ---------------------------------------------------------------------------
// Import path extraction per language
// ---------------------------------------------------------------------------

interface ImportMatch {
  modulePath: string;
  line: string;
  lineNumber: number;
}

/**
 * Extract all import module paths from a file, dispatching to the
 * correct language-specific extractor based on file extension.
 */
function extractImportPaths(
  filePath: string,
  lines: string[],
): ImportMatch[] {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";

  switch (ext) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
    case "mts":
    case "cts":
      return extractJsTsImports(lines);

    case "py":
      return extractPythonImports(lines);

    case "go":
      return extractGoImports(lines);

    case "java":
      return extractJavaImports(lines);

    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// JS / TS
// ---------------------------------------------------------------------------

/**
 * Extract module paths from JS / TS files.
 *
 * Patterns:
 *   import X from "module"
 *   import { X } from "module"
 *   import * as X from "module"
 *   import "module"                     (side-effect import)
 *   export { X } from "module"
 *   const X = require("module")
 *   require("module")
 *   await import("module")              (dynamic import)
 */
const JS_IMPORT_RE = /(?:import\s.*?from\s+|import\s+|export\s.*?from\s+)['"]([^'"]+)['"]/;
const JS_REQUIRE_RE = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/;
const JS_DYNAMIC_IMPORT_RE = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/;

function extractJsTsImports(lines: string[]): ImportMatch[] {
  const matches: ImportMatch[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    let m = line.match(JS_IMPORT_RE);
    if (m) {
      matches.push({ modulePath: m[1], line, lineNumber: i + 1 });
      continue; // One match per line is enough
    }

    m = line.match(JS_REQUIRE_RE);
    if (m) {
      matches.push({ modulePath: m[1], line, lineNumber: i + 1 });
      continue;
    }

    m = line.match(JS_DYNAMIC_IMPORT_RE);
    if (m) {
      matches.push({ modulePath: m[1], line, lineNumber: i + 1 });
    }
  }

  return matches;
}

// ---------------------------------------------------------------------------
// Python
// ---------------------------------------------------------------------------

/**
 * Extract module paths from Python files.
 *
 * Patterns:
 *   import boto3
 *   import stripe
 *   from sentry_sdk import init
 *   from firebase_admin import credentials
 */
const PY_IMPORT_RE = /^\s*import\s+([\w.]+)/;
const PY_FROM_IMPORT_RE = /^\s*from\s+([\w.]+)\s+import/;

function extractPythonImports(lines: string[]): ImportMatch[] {
  const matches: ImportMatch[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    let m = line.match(PY_FROM_IMPORT_RE);
    if (m) {
      matches.push({ modulePath: m[1], line, lineNumber: i + 1 });
      continue;
    }

    m = line.match(PY_IMPORT_RE);
    if (m) {
      // Handle `import a, b` — split by comma
      const modules = m[1].split(",").map((s) => s.trim());
      for (const mod of modules) {
        if (mod) matches.push({ modulePath: mod, line, lineNumber: i + 1 });
      }
    }
  }

  return matches;
}

// ---------------------------------------------------------------------------
// Go
// ---------------------------------------------------------------------------

/**
 * Extract module paths from Go files.
 *
 * Patterns:
 *   import "github.com/aws/aws-sdk-go/service/s3"
 *   import (
 *       "github.com/aws/aws-sdk-go/service/s3"
 *       _ "github.com/lib/pq"
 *   )
 */
const GO_SINGLE_IMPORT_RE = /^\s*import\s+"([^"]+)"/;
const GO_GROUPED_IMPORT_RE = /^\s*(?:_\s+)?"([^"]+)"/;

function extractGoImports(lines: string[]): ImportMatch[] {
  const matches: ImportMatch[] = [];
  let inImportBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect start of import block
    if (line === "import (") {
      inImportBlock = true;
      continue;
    }
    if (inImportBlock && line === ")") {
      inImportBlock = false;
      continue;
    }

    if (inImportBlock) {
      const m = line.match(GO_GROUPED_IMPORT_RE);
      if (m) {
        matches.push({ modulePath: m[1], line: lines[i], lineNumber: i + 1 });
      }
    } else {
      const m = line.match(GO_SINGLE_IMPORT_RE);
      if (m) {
        matches.push({ modulePath: m[1], line: lines[i], lineNumber: i + 1 });
      }
    }
  }

  return matches;
}

// ---------------------------------------------------------------------------
// Java
// ---------------------------------------------------------------------------

/**
 * Extract module paths from Java files.
 *
 * Pattern: `import com.stripe.Stripe;`
 */
const JAVA_IMPORT_RE = /^\s*import\s+([\w.]+);/;

function extractJavaImports(lines: string[]): ImportMatch[] {
  const matches: ImportMatch[] = [];

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(JAVA_IMPORT_RE);
    if (m) {
      matches.push({ modulePath: m[1], line: lines[i], lineNumber: i + 1 });
    }
  }

  return matches;
}
