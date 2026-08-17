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
// Summary
// -------------------------------------------------------------
console.log("\n==================================================");
console.log(`Test Results: ${passed}/${total} passed`);
if (passed === total) {
  console.log("🎉 All Task 4A parsers are functioning correctly!");
} else {
  console.log("⚠️ Some tests failed. Check the details above.");
}
console.log("==================================================");
