/**
 * Test harness to verify all Task 4A parsers against sample code snippets.
 */
import {
  parseDependencyFile,
  parseConfigFile,
  parseImports,
  parseEnvVars,
  parseCicdFile,
  SERVICE_REGISTRY,
} from "./index";

console.log("==================================================");
console.log(`CloudLens Service Registry: ${SERVICE_REGISTRY.length} services loaded.`);
console.log("==================================================\n");

let passed = 0;
let total = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  total++;
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
  }
}

// -------------------------------------------------------------
// 1. Test Dependency Parser (Task 4.2)
// -------------------------------------------------------------
console.log("🔍 1. Testing Dependency Parser (Task 4.2)...");

const samplePackageJson = JSON.stringify({
  name: "demo-app",
  dependencies: {
    "stripe": "^14.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "@sentry/nextjs": "^7.100.0",
  },
  devDependencies: {
    "wrangler": "^3.0.0",
  },
});
const pkgResults = parseDependencyFile("package.json", samplePackageJson);
const pkgServices = pkgResults.map((r) => r.serviceName);
assert(pkgServices.includes("Stripe"), "package.json detects Stripe");
assert(pkgServices.includes("Supabase"), "package.json detects Supabase");
assert(pkgServices.includes("Sentry"), "package.json detects Sentry");
assert(pkgServices.includes("Cloudflare Workers"), "package.json devDeps detects Cloudflare Workers (wrangler)");

const sampleRequirements = `
# Core requirements
boto3==1.28.0
google-cloud-bigquery>=3.11.0
resend>=0.6.0
`;
const reqResults = parseDependencyFile("requirements.txt", sampleRequirements);
const reqServices = reqResults.map((r) => r.serviceName);
assert(reqServices.includes("Amazon S3"), "requirements.txt detects Amazon S3 (boto3)");
assert(reqServices.includes("Google BigQuery"), "requirements.txt detects Google BigQuery");
assert(reqServices.includes("Resend"), "requirements.txt detects Resend");

// -------------------------------------------------------------
// 2. Test Config File Parser (Task 4.3)
// -------------------------------------------------------------
console.log("\n🔍 2. Testing Config File Parser (Task 4.3)...");

const sampleVercelJson = JSON.stringify({
  framework: "nextjs",
  buildCommand: "next build",
});
const vercelResults = parseConfigFile("vercel.json", sampleVercelJson);
assert(
  vercelResults.some((r) => r.serviceName === "Vercel"),
  "vercel.json filename triggers Vercel detection"
);

const sampleServerless = `
service: my-service
provider:
  name: aws
  runtime: nodejs18.x
functions:
  hello:
    handler: handler.hello
`;
const slsResults = parseConfigFile("serverless.yml", sampleServerless);
assert(
  slsResults.some((r) => r.serviceName === "AWS Lambda"),
  "serverless.yml detects AWS Lambda"
);

// -------------------------------------------------------------
// 3. Test Import Statement Parser (Task 4.4)
// -------------------------------------------------------------
console.log("\n🔍 3. Testing Import Statement Parser (Task 4.4)...");

const sampleTypeScript = `
import { S3Client } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
const clerk = require("@clerk/nextjs");
`;
const tsResults = parseImports("src/lib/clients.ts", sampleTypeScript);
const tsServices = tsResults.map((r) => r.serviceName);
assert(tsServices.includes("Amazon S3"), "TS imports detect Amazon S3 (@aws-sdk/client-s3)");
assert(tsServices.includes("Supabase"), "TS imports detect Supabase");
assert(tsServices.includes("Stripe"), "TS imports detect Stripe");
assert(tsServices.includes("Clerk"), "TS imports detect Clerk (require)");

const samplePython = `
import boto3
from sentry_sdk import init
from firebase_admin import initialize_app
`;
const pyResults = parseImports("backend/main.py", samplePython);
const pyServices = pyResults.map((r) => r.serviceName);
assert(pyServices.includes("Amazon S3"), "Python imports detect Amazon S3 (boto3)");
assert(pyServices.includes("Sentry"), "Python imports detect Sentry");
assert(pyServices.includes("Firebase"), "Python imports detect Firebase");

// -------------------------------------------------------------
// 4. Test Environment Variable Parser (Task 4.5)
// -------------------------------------------------------------
console.log("\n🔍 4. Testing Environment Variable Parser (Task 4.5)...");

const sampleEnvFile = `
DATABASE_URL="postgres://neondb_owner:xyz@ep-cool-frost.neon.tech/neondb"
STRIPE_SECRET_KEY="sk_test_12345"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_abcdef"
AUTH0_SECRET="mysecret"
`;
const envResults = parseEnvVars(".env.local", sampleEnvFile);
const envServices = envResults.map((r) => r.serviceName);
assert(envServices.includes("Neon"), ".env.local detects Neon (DATABASE_URL)");
assert(envServices.includes("Stripe"), ".env.local detects Stripe");
assert(envServices.includes("Clerk"), ".env.local detects Clerk");
assert(envServices.includes("Auth0"), ".env.local detects Auth0");

const sampleCodeWithEnv = `
const key = process.env.AWS_ACCESS_KEY_ID;
const ddApiKey = process.env.DD_API_KEY;
`;
const codeEnvResults = parseEnvVars("src/config.ts", sampleCodeWithEnv);
const codeEnvServices = codeEnvResults.map((r) => r.serviceName);
assert(codeEnvServices.includes("Amazon S3"), "Source code process.env detects AWS");
assert(codeEnvServices.includes("Datadog"), "Source code process.env detects Datadog (DD_)");

// -------------------------------------------------------------
// 5. Test CI/CD Pipeline Parser (Task 4.6)
// -------------------------------------------------------------
console.log("\n🔍 5. Testing CI/CD Pipeline Parser (Task 4.6)...");

const sampleGithubWorkflow = `
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-region: us-east-1
      - run: aws s3 sync ./build s3://my-bucket
      - uses: cloudflare/wrangler-action@v3
`;
const cicdResults = parseCicdFile(".github/workflows/deploy.yml", sampleGithubWorkflow);
const cicdServices = cicdResults.map((r) => r.serviceName);
assert(cicdServices.includes("Amazon S3"), "GitHub Action detects Amazon S3");
assert(cicdServices.includes("Cloudflare Workers"), "GitHub Action detects Cloudflare Workers (wrangler-action)");

// -------------------------------------------------------------
// 6. Test Confidence Scoring (Task 4.7)
// -------------------------------------------------------------
console.log("\n🔍 6. Testing Confidence Scoring (Task 4.7)...");

import { getBaseScore, scoreAndDeduplicate } from "./scoring";
import type { DetectionResult } from "./types";

assert(getBaseScore("import") === 0.9, "Base score: import → 0.9");
assert(getBaseScore("dependency") === 0.85, "Base score: dependency → 0.85");
assert(getBaseScore("config") === 0.8, "Base score: config → 0.8");
assert(getBaseScore("cicd") === 0.7, "Base score: cicd → 0.7");
assert(getBaseScore("envVar") === 0.5, "Base score: envVar → 0.5");

// Single source — no boost
const singleSource: DetectionResult[] = [
  {
    serviceName: "Stripe",
    provider: "Stripe",
    serviceCategory: "payments",
    detectionSource: "import",
    evidenceFile: "src/pay.ts",
    evidenceSnippet: 'import Stripe from "stripe"',
  },
];
const singleResult = scoreAndDeduplicate(singleSource);
assert(singleResult.length === 1, "Single detection → 1 scored result");
assert(singleResult[0].confidenceScore === 0.9, "Single import source → 0.9 score");
assert(singleResult[0].allSources.length === 1, "Single source array length 1");

// Multi-source boost — import + dependency + envVar = 0.9 + 0.05 + 0.05 = 1.0
const multiSource: DetectionResult[] = [
  {
    serviceName: "Stripe",
    provider: "Stripe",
    serviceCategory: "payments",
    detectionSource: "import",
    evidenceFile: "src/pay.ts",
    evidenceSnippet: 'import Stripe from "stripe"',
  },
  {
    serviceName: "Stripe",
    provider: "Stripe",
    serviceCategory: "payments",
    detectionSource: "dependency",
    evidenceFile: "package.json",
    evidenceSnippet: '"stripe": "^14.0.0"',
  },
  {
    serviceName: "Stripe",
    provider: "Stripe",
    serviceCategory: "payments",
    detectionSource: "envVar",
    evidenceFile: ".env",
    evidenceSnippet: 'STRIPE_SECRET_KEY="sk_test_123"',
  },
];
const multiResult = scoreAndDeduplicate(multiSource);
assert(multiResult.length === 1, "3 detections of same service → 1 result");
assert(multiResult[0].confidenceScore === 1.0, "import(0.9) + 2 extra sources(+0.1) = 1.0 (capped)");
assert(multiResult[0].allSources.length === 3, "All 3 sources recorded");
assert(multiResult[0].detectionSource === "import", "Best source is import (highest base)");
assert(multiResult[0].rawDetectionCount === 3, "Raw detection count = 3");

// -------------------------------------------------------------
// 7. Test Deduplication (Task 4.8)
// -------------------------------------------------------------
console.log("\n🔍 7. Testing Deduplication (Task 4.8)...");

const mixedDetections: DetectionResult[] = [
  // 2x Stripe (import + dependency)
  {
    serviceName: "Stripe",
    provider: "Stripe",
    serviceCategory: "payments",
    detectionSource: "import",
    evidenceFile: "src/pay.ts",
    evidenceSnippet: 'import Stripe from "stripe"',
  },
  {
    serviceName: "Stripe",
    provider: "Stripe",
    serviceCategory: "payments",
    detectionSource: "dependency",
    evidenceFile: "package.json",
    evidenceSnippet: '"stripe": "^14.0.0"',
  },
  // 1x Sentry (envVar only)
  {
    serviceName: "Sentry",
    provider: "Sentry",
    serviceCategory: "monitoring",
    detectionSource: "envVar",
    evidenceFile: ".env",
    evidenceSnippet: "SENTRY_DSN=https://abc@sentry.io/123",
  },
  // 1x Vercel (config only)
  {
    serviceName: "Vercel",
    provider: "Vercel",
    serviceCategory: "hosting",
    detectionSource: "config",
    evidenceFile: "vercel.json",
    evidenceSnippet: "Config file detected: vercel.json",
  },
];
const dedupResults = scoreAndDeduplicate(mixedDetections);
assert(dedupResults.length === 3, "4 raw detections across 3 services → 3 results");

// Sorted by confidence descending
const [first, second, third] = dedupResults;
assert(
  first.confidenceScore >= second.confidenceScore &&
    second.confidenceScore >= third.confidenceScore,
  "Results sorted by confidence descending"
);

// Stripe should be highest: import(0.9) + dependency boost(+0.05) = 0.95
const stripeResult = dedupResults.find((r) => r.serviceName === "Stripe")!;
assert(stripeResult.confidenceScore === 0.95, "Stripe: 0.9 import + 0.05 boost = 0.95");

// Sentry should be envVar only = 0.5
const sentryResult = dedupResults.find((r) => r.serviceName === "Sentry")!;
assert(sentryResult.confidenceScore === 0.5, "Sentry: envVar only = 0.5");

// Vercel should be config only = 0.8
const vercelResult = dedupResults.find((r) => r.serviceName === "Vercel")!;
assert(vercelResult.confidenceScore === 0.8, "Vercel: config only = 0.8");

// Cap at 1.0 test: 5 distinct sources → 0.9 + 4×0.05 = 1.1 → capped at 1.0
const fiveSourceDetections: DetectionResult[] = (
  ["import", "dependency", "config", "cicd", "envVar"] as const
).map((src) => ({
  serviceName: "Amazon S3",
  provider: "AWS",
  serviceCategory: "storage" as const,
  detectionSource: src,
  evidenceFile: `file-${src}`,
  evidenceSnippet: `evidence from ${src}`,
}));
const cappedResult = scoreAndDeduplicate(fiveSourceDetections);
assert(cappedResult[0].confidenceScore === 1.0, "5 sources → capped at 1.0 (not 1.1)");

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log("\n==================================================");
console.log(`Test Results: ${passed}/${total} passed`);
if (passed === total) {
  console.log("🎉 All Task 4A + 4B tests are passing!");
} else {
  console.log("⚠️ Some tests failed. Check the details above.");
}
console.log("==================================================");

