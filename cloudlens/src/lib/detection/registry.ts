/**
 * CloudLens Service Registry
 *
 * A structured catalog of the 20 launch-target cloud services.
 * Each entry carries metadata for display (name, provider, category, icon,
 * dashboard URL, free-tier limits) **and** detection patterns consumed by
 * every parser in the detection pipeline:
 *
 *   - packageNames     → dependency parser
 *   - importPatterns    → import-statement parser
 *   - envVarPrefixes    → environment variable parser
 *   - configFilePatterns → config-file parser
 *   - cicdReferences    → CI/CD pipeline parser
 *
 * Adding a new service is a one-step operation: drop an entry here and
 * every parser picks it up automatically.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Cloud-service category used throughout the app (mirrors DB enum). */
export type ServiceCategory =
  | "database"
  | "auth"
  | "hosting"
  | "payments"
  | "monitoring"
  | "email"
  | "storage"
  | "compute"
  | "cdn"
  | "ci-cd"
  | "other";

/** Source that triggered a detection (mirrors DB enum). */
export type DetectionSource =
  | "dependency"
  | "config"
  | "import"
  | "envVar"
  | "cicd";

/** A single entry in the service registry. */
export interface ServiceDefinition {
  /** Canonical display name, e.g. "Amazon S3" */
  name: string;

  /** Top-level cloud provider, e.g. "AWS", "GCP", "Vercel" */
  provider: string;

  /** Functional category */
  category: ServiceCategory;

  /** URL-safe slug for icons (e.g. "aws-s3") */
  iconSlug: string;

  /** Direct link to the service's management console */
  dashboardUrl: string;

  /** Human-readable free-tier / trial description */
  freeTierLimits: string;

  // ----- Detection patterns --------------------------------------------------

  /**
   * Package / module names as they appear in dependency manifests.
   * Works across ecosystems: npm, pip, go modules, gems, Maven, Gradle.
   */
  packageNames: string[];

  /**
   * Import path prefixes to match in source files.
   * A match is confirmed when a source file imports a module whose path
   * **starts with** one of these strings.
   */
  importPatterns: string[];

  /**
   * Environment variable prefixes.  An env-var parser flags the service
   * when it sees `<prefix>_*` or the prefix itself as a standalone var.
   */
  envVarPrefixes: string[];

  /**
   * Config-file patterns — partial strings / keys expected inside config
   * files such as `.env`, `docker-compose.yml`, `vercel.json`, etc.
   */
  configFilePatterns: string[];

  /**
   * Strings expected in CI/CD manifests (GitHub Actions, GitLab CI,
   * Jenkinsfile, Dockerfile, etc.).
   */
  cicdReferences: string[];
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const SERVICE_REGISTRY: ServiceDefinition[] = [
  // ==========================================================================
  // 1. AWS — S3
  // ==========================================================================
  {
    name: "Amazon S3",
    provider: "AWS",
    category: "storage",
    iconSlug: "aws-s3",
    dashboardUrl: "https://s3.console.aws.amazon.com/s3",
    freeTierLimits: "5 GB standard storage, 20k GET, 2k PUT/month for 12 months",
    packageNames: [
      "@aws-sdk/client-s3",
      "@aws-sdk/s3-request-presigner",
      "aws-sdk",
      "boto3",
      "s3",
      "aws-sdk-s3",
    ],
    importPatterns: [
      "@aws-sdk/client-s3",
      "@aws-sdk/s3-request-presigner",
      "aws-sdk",
      "boto3",
      "github.com/aws/aws-sdk-go/service/s3",
    ],
    envVarPrefixes: ["AWS_ACCESS_KEY", "AWS_SECRET", "AWS_S3", "AWS_BUCKET", "S3_BUCKET"],
    configFilePatterns: ["s3://", "AmazonS3", "aws_s3", "s3.amazonaws.com"],
    cicdReferences: [
      "aws-actions/configure-aws-credentials",
      "s3 sync",
      "s3 cp",
      "aws s3",
      "s3deploy",
    ],
  },

  // ==========================================================================
  // 2. AWS — Lambda
  // ==========================================================================
  {
    name: "AWS Lambda",
    provider: "AWS",
    category: "compute",
    iconSlug: "aws-lambda",
    dashboardUrl: "https://console.aws.amazon.com/lambda",
    freeTierLimits: "1M free requests + 400,000 GB-seconds/month (always free)",
    packageNames: [
      "@aws-sdk/client-lambda",
      "serverless",
      "aws-cdk-lib",
      "aws-lambda",
      "@types/aws-lambda",
    ],
    importPatterns: [
      "@aws-sdk/client-lambda",
      "aws-lambda",
      "github.com/aws/aws-lambda-go",
    ],
    envVarPrefixes: ["AWS_LAMBDA", "LAMBDA_FUNCTION", "LAMBDA_TASK_ROOT"],
    configFilePatterns: [
      "serverless.yml",
      "serverless.yaml",
      "sam.yaml",
      "template.yaml",
      "AWSTemplateFormatVersion",
      "AWS::Lambda",
      "AWS::Serverless",
    ],
    cicdReferences: [
      "serverless deploy",
      "sam deploy",
      "aws lambda",
      "aws-actions/configure-aws-credentials",
      "lambda-action",
    ],
  },

  // ==========================================================================
  // 3. AWS — DynamoDB
  // ==========================================================================
  {
    name: "Amazon DynamoDB",
    provider: "AWS",
    category: "database",
    iconSlug: "aws-dynamodb",
    dashboardUrl: "https://console.aws.amazon.com/dynamodbv2",
    freeTierLimits: "25 GB storage, 25 RCU/WCU (always free)",
    packageNames: [
      "@aws-sdk/client-dynamodb",
      "@aws-sdk/lib-dynamodb",
      "dynamodb-toolbox",
      "dynamoose",
    ],
    importPatterns: [
      "@aws-sdk/client-dynamodb",
      "@aws-sdk/lib-dynamodb",
      "dynamoose",
      "github.com/aws/aws-sdk-go/service/dynamodb",
    ],
    envVarPrefixes: ["DYNAMODB", "AWS_DYNAMODB"],
    configFilePatterns: ["DynamoDB", "dynamodb", "AWS::DynamoDB"],
    cicdReferences: ["dynamodb", "aws dynamodb"],
  },

  // ==========================================================================
  // 4. AWS — SES (Email)
  // ==========================================================================
  {
    name: "Amazon SES",
    provider: "AWS",
    category: "email",
    iconSlug: "aws-ses",
    dashboardUrl: "https://console.aws.amazon.com/ses",
    freeTierLimits: "62,000 outbound emails/month from EC2 (always free)",
    packageNames: [
      "@aws-sdk/client-ses",
      "@aws-sdk/client-sesv2",
    ],
    importPatterns: [
      "@aws-sdk/client-ses",
      "@aws-sdk/client-sesv2",
      "github.com/aws/aws-sdk-go/service/ses",
    ],
    envVarPrefixes: ["AWS_SES", "SES_"],
    configFilePatterns: ["ses.amazonaws.com", "AWS::SES"],
    cicdReferences: ["aws ses"],
  },

  // ==========================================================================
  // 5. AWS — CloudFront (CDN)
  // ==========================================================================
  {
    name: "Amazon CloudFront",
    provider: "AWS",
    category: "cdn",
    iconSlug: "aws-cloudfront",
    dashboardUrl: "https://console.aws.amazon.com/cloudfront",
    freeTierLimits: "1 TB data transfer out, 10M HTTP requests/month for 12 months",
    packageNames: [
      "@aws-sdk/client-cloudfront",
    ],
    importPatterns: [
      "@aws-sdk/client-cloudfront",
      "github.com/aws/aws-sdk-go/service/cloudfront",
    ],
    envVarPrefixes: ["CLOUDFRONT", "AWS_CLOUDFRONT", "CF_DISTRIBUTION"],
    configFilePatterns: ["cloudfront.net", "CloudFront", "AWS::CloudFront"],
    cicdReferences: ["aws cloudfront", "cloudfront invalidation"],
  },

  // ==========================================================================
  // 6. GCP — Firebase
  // ==========================================================================
  {
    name: "Firebase",
    provider: "GCP",
    category: "hosting",
    iconSlug: "firebase",
    dashboardUrl: "https://console.firebase.google.com",
    freeTierLimits: "Spark plan: 1 GB storage, 10 GB/month transfer, 50k reads/day",
    packageNames: [
      "firebase",
      "firebase-admin",
      "firebase-functions",
      "@firebase/app",
      "@firebase/auth",
      "@firebase/firestore",
      "@firebase/storage",
      "angularfire",
      "react-firebase-hooks",
      "firebase_core",
    ],
    importPatterns: [
      "firebase/",
      "firebase-admin",
      "firebase_admin",
      "firebase-functions",
      "@firebase/",
      "cloud.google.com/go/firestore",
    ],
    envVarPrefixes: [
      "FIREBASE",
      "NEXT_PUBLIC_FIREBASE",
      "REACT_APP_FIREBASE",
      "VITE_FIREBASE",
    ],
    configFilePatterns: [
      "firebase.json",
      ".firebaserc",
      "firebaseConfig",
      "firebase.initializeApp",
      "firestore.rules",
      "firestore.indexes.json",
    ],
    cicdReferences: [
      "firebase deploy",
      "firebase-tools",
      "w9jds/firebase-action",
      "FirebaseExtended/action-hosting-deploy",
    ],
  },

  // ==========================================================================
  // 7. GCP — Cloud Run
  // ==========================================================================
  {
    name: "Google Cloud Run",
    provider: "GCP",
    category: "compute",
    iconSlug: "gcp-cloud-run",
    dashboardUrl: "https://console.cloud.google.com/run",
    freeTierLimits: "2M requests/month, 360k vCPU-seconds, 180k GiB-seconds",
    packageNames: [
      "@google-cloud/run",
    ],
    importPatterns: [
      "@google-cloud/run",
      "cloud.google.com/go/run",
    ],
    envVarPrefixes: ["CLOUD_RUN", "GCP_", "GOOGLE_CLOUD", "K_SERVICE", "K_REVISION"],
    configFilePatterns: ["cloud run", "gcr.io", "run.googleapis.com"],
    cicdReferences: [
      "google-github-actions/deploy-cloudrun",
      "gcloud run deploy",
      "gcr.io",
    ],
  },

  // ==========================================================================
  // 8. GCP — BigQuery
  // ==========================================================================
  {
    name: "Google BigQuery",
    provider: "GCP",
    category: "database",
    iconSlug: "gcp-bigquery",
    dashboardUrl: "https://console.cloud.google.com/bigquery",
    freeTierLimits: "1 TB queried/month, 10 GB storage/month (always free)",
    packageNames: [
      "@google-cloud/bigquery",
      "google-cloud-bigquery",
    ],
    importPatterns: [
      "@google-cloud/bigquery",
      "cloud.google.com/go/bigquery",
      "google.cloud.bigquery",
    ],
    envVarPrefixes: ["BIGQUERY", "BQ_"],
    configFilePatterns: ["bigquery", "BigQuery"],
    cicdReferences: ["bq query", "bigquery", "google-github-actions/"],
  },

  // ==========================================================================
  // 9. Vercel
  // ==========================================================================
  {
    name: "Vercel",
    provider: "Vercel",
    category: "hosting",
    iconSlug: "vercel",
    dashboardUrl: "https://vercel.com/dashboard",
    freeTierLimits: "Hobby: 100 GB bandwidth, 100 GB-hours serverless, unlimited sites",
    packageNames: [
      "vercel",
      "@vercel/analytics",
      "@vercel/speed-insights",
      "@vercel/og",
      "@vercel/postgres",
      "@vercel/blob",
      "@vercel/kv",
      "@vercel/edge-config",
    ],
    importPatterns: [
      "@vercel/analytics",
      "@vercel/speed-insights",
      "@vercel/og",
      "@vercel/postgres",
      "@vercel/blob",
      "@vercel/kv",
      "@vercel/edge-config",
    ],
    envVarPrefixes: ["VERCEL", "NEXT_PUBLIC_VERCEL"],
    configFilePatterns: [
      "vercel.json",
      "vercel.com",
      "vercel deploy",
    ],
    cicdReferences: [
      "amondnet/vercel-action",
      "vercel deploy",
      "vercel --prod",
      "npx vercel",
    ],
  },

  // ==========================================================================
  // 10. Netlify
  // ==========================================================================
  {
    name: "Netlify",
    provider: "Netlify",
    category: "hosting",
    iconSlug: "netlify",
    dashboardUrl: "https://app.netlify.com",
    freeTierLimits: "100 GB bandwidth/month, 300 build minutes/month, 125k serverless function invocations",
    packageNames: [
      "netlify-cli",
      "@netlify/functions",
      "netlify-lambda",
      "netlify-plugin-nextjs",
    ],
    importPatterns: [
      "@netlify/functions",
      "netlify-lambda",
    ],
    envVarPrefixes: ["NETLIFY"],
    configFilePatterns: [
      "netlify.toml",
      "netlify.com",
      "_redirects",
      "_headers",
    ],
    cicdReferences: [
      "nwtgck/actions-netlify",
      "netlify deploy",
      "netlify-cli",
    ],
  },

  // ==========================================================================
  // 11. Supabase
  // ==========================================================================
  {
    name: "Supabase",
    provider: "Supabase",
    category: "database",
    iconSlug: "supabase",
    dashboardUrl: "https://supabase.com/dashboard",
    freeTierLimits: "500 MB database, 1 GB file storage, 2 GB bandwidth, 50k monthly active users",
    packageNames: [
      "@supabase/supabase-js",
      "@supabase/auth-helpers-nextjs",
      "@supabase/auth-helpers-react",
      "@supabase/ssr",
      "@supabase/auth-ui-react",
      "supabase",
    ],
    importPatterns: [
      "@supabase/supabase-js",
      "@supabase/auth-helpers",
      "@supabase/ssr",
      "@supabase/auth-ui",
    ],
    envVarPrefixes: [
      "SUPABASE",
      "NEXT_PUBLIC_SUPABASE",
      "REACT_APP_SUPABASE",
      "VITE_SUPABASE",
    ],
    configFilePatterns: [
      "supabase.co",
      "supabase.com",
      "supabase/config.toml",
      "createClient",
    ],
    cicdReferences: [
      "supabase db push",
      "supabase deploy",
      "supabase/setup-cli",
    ],
  },

  // ==========================================================================
  // 12. Stripe
  // ==========================================================================
  {
    name: "Stripe",
    provider: "Stripe",
    category: "payments",
    iconSlug: "stripe",
    dashboardUrl: "https://dashboard.stripe.com",
    freeTierLimits: "No monthly fees; 2.9% + 30¢ per successful card charge",
    packageNames: [
      "stripe",
      "@stripe/stripe-js",
      "@stripe/react-stripe-js",
      "stripe-python",
    ],
    importPatterns: [
      "stripe",
      "@stripe/stripe-js",
      "@stripe/react-stripe-js",
    ],
    envVarPrefixes: [
      "STRIPE",
      "NEXT_PUBLIC_STRIPE",
      "REACT_APP_STRIPE",
      "VITE_STRIPE",
    ],
    configFilePatterns: [
      "stripe.com",
      "api.stripe.com",
      "sk_live_",
      "sk_test_",
      "pk_live_",
      "pk_test_",
      "whsec_",
    ],
    cicdReferences: [
      "stripe/stripe-cli-action",
      "stripe listen",
      "stripe trigger",
    ],
  },

  // ==========================================================================
  // 13. Auth0
  // ==========================================================================
  {
    name: "Auth0",
    provider: "Auth0",
    category: "auth",
    iconSlug: "auth0",
    dashboardUrl: "https://manage.auth0.com",
    freeTierLimits: "7,500 monthly active users, unlimited logins",
    packageNames: [
      "@auth0/nextjs-auth0",
      "@auth0/auth0-react",
      "@auth0/auth0-spa-js",
      "auth0",
      "passport-auth0",
    ],
    importPatterns: [
      "@auth0/nextjs-auth0",
      "@auth0/auth0-react",
      "@auth0/auth0-spa-js",
    ],
    envVarPrefixes: ["AUTH0"],
    configFilePatterns: [
      "auth0.com",
      "auth0Domain",
      "auth0ClientId",
    ],
    cicdReferences: ["auth0"],
  },

  // ==========================================================================
  // 14. Clerk
  // ==========================================================================
  {
    name: "Clerk",
    provider: "Clerk",
    category: "auth",
    iconSlug: "clerk",
    dashboardUrl: "https://dashboard.clerk.com",
    freeTierLimits: "10,000 monthly active users, unlimited logins",
    packageNames: [
      "@clerk/nextjs",
      "@clerk/clerk-react",
      "@clerk/themes",
      "@clerk/backend",
      "@clerk/clerk-sdk-node",
    ],
    importPatterns: [
      "@clerk/nextjs",
      "@clerk/clerk-react",
      "@clerk/backend",
      "@clerk/themes",
    ],
    envVarPrefixes: [
      "CLERK",
      "NEXT_PUBLIC_CLERK",
    ],
    configFilePatterns: [
      "clerk.com",
      "clerkMiddleware",
      "ClerkProvider",
    ],
    cicdReferences: ["clerk"],
  },

  // ==========================================================================
  // 15. Neon (Serverless Postgres)
  // ==========================================================================
  {
    name: "Neon",
    provider: "Neon",
    category: "database",
    iconSlug: "neon",
    dashboardUrl: "https://console.neon.tech",
    freeTierLimits: "0.5 GiB storage, 190 compute hours/month, unlimited projects",
    packageNames: [
      "@neondatabase/serverless",
      "neon-http",
    ],
    importPatterns: [
      "@neondatabase/serverless",
    ],
    envVarPrefixes: ["NEON", "DATABASE_URL"],
    configFilePatterns: [
      "neon.tech",
      "neondb",
      "@neondatabase",
    ],
    cicdReferences: ["neondatabase", "neon"],
  },

  // ==========================================================================
  // 16. PlanetScale
  // ==========================================================================
  {
    name: "PlanetScale",
    provider: "PlanetScale",
    category: "database",
    iconSlug: "planetscale",
    dashboardUrl: "https://app.planetscale.com",
    freeTierLimits: "5 GB storage, 1B row reads, 10M row writes/month (Scaler plan trial)",
    packageNames: [
      "@planetscale/database",
      "planetscale-node",
    ],
    importPatterns: [
      "@planetscale/database",
    ],
    envVarPrefixes: ["PLANETSCALE", "DATABASE_URL"],
    configFilePatterns: [
      "planetscale",
      "psdb.cloud",
      "connect.psdb.cloud",
    ],
    cicdReferences: [
      "planetscale/create-branch-action",
      "pscale",
    ],
  },

  // ==========================================================================
  // 17. Resend (Email)
  // ==========================================================================
  {
    name: "Resend",
    provider: "Resend",
    category: "email",
    iconSlug: "resend",
    dashboardUrl: "https://resend.com/overview",
    freeTierLimits: "3,000 emails/month, 100 emails/day",
    packageNames: [
      "resend",
      "@react-email/components",
    ],
    importPatterns: [
      "resend",
      "@react-email/",
    ],
    envVarPrefixes: ["RESEND"],
    configFilePatterns: [
      "resend.com",
      "api.resend.com",
    ],
    cicdReferences: ["resend"],
  },

  // ==========================================================================
  // 18. Sentry (Monitoring)
  // ==========================================================================
  {
    name: "Sentry",
    provider: "Sentry",
    category: "monitoring",
    iconSlug: "sentry",
    dashboardUrl: "https://sentry.io",
    freeTierLimits: "5,000 errors/month, 10,000 performance units, 500 replays",
    packageNames: [
      "@sentry/nextjs",
      "@sentry/react",
      "@sentry/node",
      "@sentry/browser",
      "@sentry/vue",
      "@sentry/angular",
      "sentry-sdk",
      "sentry_sdk",
    ],
    importPatterns: [
      "@sentry/nextjs",
      "@sentry/react",
      "@sentry/node",
      "@sentry/browser",
      "sentry_sdk",
    ],
    envVarPrefixes: ["SENTRY", "NEXT_PUBLIC_SENTRY"],
    configFilePatterns: [
      "sentry.properties",
      "sentry.io",
      ".sentryclirc",
      "sentry.client.config",
      "sentry.server.config",
      "sentry.edge.config",
    ],
    cicdReferences: [
      "getsentry/action-release",
      "sentry-cli",
      "@sentry/webpack-plugin",
    ],
  },

  // ==========================================================================
  // 19. Datadog (Monitoring)
  // ==========================================================================
  {
    name: "Datadog",
    provider: "Datadog",
    category: "monitoring",
    iconSlug: "datadog",
    dashboardUrl: "https://app.datadoghq.com",
    freeTierLimits: "14-day free trial; Free tier: 5 hosts infra monitoring",
    packageNames: [
      "dd-trace",
      "datadog-metrics",
      "datadog-lambda-js",
      "ddtrace",
    ],
    importPatterns: [
      "dd-trace",
      "datadog-metrics",
      "ddtrace",
    ],
    envVarPrefixes: ["DD_", "DATADOG"],
    configFilePatterns: [
      "datadoghq.com",
      "datadog.yaml",
      "datadog-agent",
    ],
    cicdReferences: [
      "DataDog/agent-github-action",
      "datadog-ci",
      "dd-agent",
    ],
  },

  // ==========================================================================
  // 20. Cloudflare Workers
  // ==========================================================================
  {
    name: "Cloudflare Workers",
    provider: "Cloudflare",
    category: "compute",
    iconSlug: "cloudflare-workers",
    dashboardUrl: "https://dash.cloudflare.com",
    freeTierLimits: "100,000 requests/day, 10ms CPU time per invocation",
    packageNames: [
      "wrangler",
      "@cloudflare/workers-types",
      "@cloudflare/kv-asset-handler",
      "miniflare",
    ],
    importPatterns: [
      "@cloudflare/workers-types",
      "@cloudflare/kv-asset-handler",
      "miniflare",
    ],
    envVarPrefixes: ["CLOUDFLARE", "CF_"],
    configFilePatterns: [
      "wrangler.toml",
      "wrangler.json",
      "workers.dev",
    ],
    cicdReferences: [
      "cloudflare/wrangler-action",
      "wrangler deploy",
      "wrangler publish",
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper look-ups
// ---------------------------------------------------------------------------

/** Map from package name → service definition for fast dependency matching. */
export const packageToService = new Map<string, ServiceDefinition>();
for (const svc of SERVICE_REGISTRY) {
  for (const pkg of svc.packageNames) {
    packageToService.set(pkg.toLowerCase(), svc);
  }
}

/** Get all registered env-var prefixes mapped to their service. */
export const envPrefixToService = new Map<string, ServiceDefinition>();
for (const svc of SERVICE_REGISTRY) {
  for (const prefix of svc.envVarPrefixes) {
    envPrefixToService.set(prefix.toUpperCase(), svc);
  }
}

/** Get all registered config-file patterns mapped to their service. */
export const configPatternToService = new Map<string, ServiceDefinition>();
for (const svc of SERVICE_REGISTRY) {
  for (const pattern of svc.configFilePatterns) {
    configPatternToService.set(pattern.toLowerCase(), svc);
  }
}

/** Get all registered CI/CD references mapped to their service. */
export const cicdReferenceToService = new Map<string, ServiceDefinition>();
for (const svc of SERVICE_REGISTRY) {
  for (const ref of svc.cicdReferences) {
    cicdReferenceToService.set(ref.toLowerCase(), svc);
  }
}
