import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { services, serviceDetectionRules } from "../src/lib/db/schema";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log("🌱 Seeding services and detection rules...\n");

  // ============ 20 SERVICES ============
  const serviceData = [
    {
      name: "Supabase",
      slug: "supabase",
      category: "database" as const,
      logoUrl: "https://cdn.simpleicons.org/supabase",
      websiteUrl: "https://supabase.com",
      dashboardUrl: "https://app.supabase.com",
      statusPageUrl: "https://status.supabase.com",
      docsUrl: "https://supabase.com/docs",
      color: "#3ECF8E",
      freeTierLimits: { "Database Size": "500 MB", Bandwidth: "2 GB", "Inactivity Pause": "7 days" },
      pricingTiers: [{ name: "Free", price: 0 }, { name: "Pro", price: 25 }, { name: "Team", price: 599 }],
    },
    {
      name: "Vercel",
      slug: "vercel",
      category: "hosting" as const,
      logoUrl: "https://cdn.simpleicons.org/vercel/white",
      websiteUrl: "https://vercel.com",
      dashboardUrl: "https://vercel.com/dashboard",
      statusPageUrl: "https://www.vercel-status.com",
      docsUrl: "https://vercel.com/docs",
      color: "#000000",
      freeTierLimits: { Bandwidth: "100 GB", "Build Minutes": "6000 min/mo", "Serverless Functions": "100 GB-hrs" },
      pricingTiers: [{ name: "Hobby", price: 0 }, { name: "Pro", price: 20 }],
    },
    {
      name: "Firebase",
      slug: "firebase",
      category: "database" as const,
      logoUrl: "https://cdn.simpleicons.org/firebase",
      websiteUrl: "https://firebase.google.com",
      dashboardUrl: "https://console.firebase.google.com",
      statusPageUrl: "https://status.firebase.google.com",
      docsUrl: "https://firebase.google.com/docs",
      color: "#FFCA28",
      freeTierLimits: { "Firestore Reads": "50K/day", "Firestore Writes": "20K/day", Storage: "5 GB" },
      pricingTiers: [{ name: "Spark (Free)", price: 0 }, { name: "Blaze", price: 0 }],
    },
    {
      name: "Stripe",
      slug: "stripe",
      category: "payments" as const,
      logoUrl: "https://cdn.simpleicons.org/stripe",
      websiteUrl: "https://stripe.com",
      dashboardUrl: "https://dashboard.stripe.com",
      statusPageUrl: "https://status.stripe.com",
      docsUrl: "https://stripe.com/docs",
      color: "#635BFF",
      freeTierLimits: { "Transaction Fee": "2.9% + 30¢" },
      pricingTiers: [{ name: "Standard", price: 0 }],
    },
    {
      name: "Neon",
      slug: "neon",
      category: "database" as const,
      logoUrl: "https://cdn.simpleicons.org/neon/00E5FF",
      websiteUrl: "https://neon.tech",
      dashboardUrl: "https://console.neon.tech",
      statusPageUrl: "https://neonstatus.com",
      docsUrl: "https://neon.tech/docs",
      color: "#00E5FF",
      freeTierLimits: { Storage: "512 MB", "Compute Hours": "191 hrs/mo", Branches: "10" },
      pricingTiers: [{ name: "Free", price: 0 }, { name: "Launch", price: 19 }, { name: "Scale", price: 69 }],
    },
    {
      name: "Cloudflare",
      slug: "cloudflare",
      category: "cdn" as const,
      logoUrl: "https://cdn.simpleicons.org/cloudflare",
      websiteUrl: "https://cloudflare.com",
      dashboardUrl: "https://dash.cloudflare.com",
      statusPageUrl: "https://www.cloudflarestatus.com",
      docsUrl: "https://developers.cloudflare.com",
      color: "#F38020",
      freeTierLimits: { "DNS Queries": "Unlimited", "Page Rules": "3", "Workers Requests": "100K/day" },
      pricingTiers: [{ name: "Free", price: 0 }, { name: "Pro", price: 20 }, { name: "Business", price: 200 }],
    },
    {
      name: "Resend",
      slug: "resend",
      category: "email" as const,
      logoUrl: "https://cdn.simpleicons.org/resend/white",
      websiteUrl: "https://resend.com",
      dashboardUrl: "https://resend.com/overview",
      statusPageUrl: "https://resend-status.com",
      docsUrl: "https://resend.com/docs",
      color: "#000000",
      freeTierLimits: { "Emails/day": "100", "Emails/month": "3,000" },
      pricingTiers: [{ name: "Free", price: 0 }, { name: "Pro", price: 20 }],
    },
    {
      name: "Clerk",
      slug: "clerk",
      category: "auth" as const,
      logoUrl: "https://cdn.simpleicons.org/clerk",
      websiteUrl: "https://clerk.com",
      dashboardUrl: "https://dashboard.clerk.com",
      statusPageUrl: "https://status.clerk.com",
      docsUrl: "https://clerk.com/docs",
      color: "#6C47FF",
      freeTierLimits: { MAUs: "10,000", "Social Logins": "Unlimited" },
      pricingTiers: [{ name: "Free", price: 0 }, { name: "Pro", price: 25 }],
    },
    {
      name: "Sentry",
      slug: "sentry",
      category: "monitoring" as const,
      logoUrl: "https://cdn.simpleicons.org/sentry",
      websiteUrl: "https://sentry.io",
      dashboardUrl: "https://sentry.io/organizations",
      statusPageUrl: "https://status.sentry.io",
      docsUrl: "https://docs.sentry.io",
      color: "#362D59",
      freeTierLimits: { Events: "5K/mo", "Data Retention": "30 days" },
      pricingTiers: [{ name: "Developer", price: 0 }, { name: "Team", price: 26 }, { name: "Business", price: 80 }],
    },
    {
      name: "OpenAI",
      slug: "openai",
      category: "ai" as const,
      logoUrl: "https://cdn.simpleicons.org/openai/white",
      websiteUrl: "https://openai.com",
      dashboardUrl: "https://platform.openai.com",
      statusPageUrl: "https://status.openai.com",
      docsUrl: "https://platform.openai.com/docs",
      color: "#412991",
      freeTierLimits: { "Free Credits": "$5 (new accounts)" },
      pricingTiers: [{ name: "Pay-as-you-go", price: 0 }],
    },
    {
      name: "AWS S3",
      slug: "aws-s3",
      category: "storage" as const,
      logoUrl: "https://cdn.simpleicons.org/amazons3",
      websiteUrl: "https://aws.amazon.com/s3",
      dashboardUrl: "https://console.aws.amazon.com/s3",
      statusPageUrl: "https://health.aws.amazon.com",
      docsUrl: "https://docs.aws.amazon.com/s3",
      color: "#569A31",
      freeTierLimits: { Storage: "5 GB", Requests: "20K GET, 2K PUT" },
      pricingTiers: [{ name: "Free Tier", price: 0 }, { name: "Pay-as-you-go", price: 0 }],
    },
    {
      name: "Prisma",
      slug: "prisma",
      category: "database" as const,
      logoUrl: "https://cdn.simpleicons.org/prisma/white",
      websiteUrl: "https://prisma.io",
      dashboardUrl: "https://cloud.prisma.io",
      statusPageUrl: "https://www.prisma-status.com",
      docsUrl: "https://www.prisma.io/docs",
      color: "#2D3748",
      freeTierLimits: {},
      pricingTiers: [{ name: "Free", price: 0 }, { name: "Pro", price: 29 }],
    },
    {
      name: "PlanetScale",
      slug: "planetscale",
      category: "database" as const,
      logoUrl: "https://cdn.simpleicons.org/planetscale/white",
      websiteUrl: "https://planetscale.com",
      dashboardUrl: "https://app.planetscale.com",
      statusPageUrl: "https://www.planetscalestatus.com",
      docsUrl: "https://planetscale.com/docs",
      color: "#000000",
      freeTierLimits: { "Row reads": "1B/mo", "Row writes": "10M/mo", Storage: "5 GB" },
      pricingTiers: [{ name: "Hobby", price: 0 }, { name: "Scaler", price: 29 }],
    },
    {
      name: "Railway",
      slug: "railway",
      category: "hosting" as const,
      logoUrl: "https://cdn.simpleicons.org/railway/white",
      websiteUrl: "https://railway.app",
      dashboardUrl: "https://railway.app/dashboard",
      statusPageUrl: "https://status.railway.app",
      docsUrl: "https://docs.railway.app",
      color: "#0B0D0E",
      freeTierLimits: { "Execution Hours": "500 hrs/mo", Memory: "512 MB" },
      pricingTiers: [{ name: "Trial", price: 0 }, { name: "Hobby", price: 5 }, { name: "Pro", price: 20 }],
    },
    {
      name: "Netlify",
      slug: "netlify",
      category: "hosting" as const,
      logoUrl: "https://cdn.simpleicons.org/netlify",
      websiteUrl: "https://netlify.com",
      dashboardUrl: "https://app.netlify.com",
      statusPageUrl: "https://www.netlifystatus.com",
      docsUrl: "https://docs.netlify.com",
      color: "#00C7B7",
      freeTierLimits: { Bandwidth: "100 GB/mo", "Build Minutes": "300 min/mo" },
      pricingTiers: [{ name: "Starter", price: 0 }, { name: "Pro", price: 19 }],
    },
    {
      name: "Auth0",
      slug: "auth0",
      category: "auth" as const,
      logoUrl: "https://cdn.simpleicons.org/auth0",
      websiteUrl: "https://auth0.com",
      dashboardUrl: "https://manage.auth0.com",
      statusPageUrl: "https://status.auth0.com",
      docsUrl: "https://auth0.com/docs",
      color: "#EB5424",
      freeTierLimits: { MAUs: "7,500", "Social Connections": "2" },
      pricingTiers: [{ name: "Free", price: 0 }, { name: "Essential", price: 35 }],
    },
    {
      name: "Twilio",
      slug: "twilio",
      category: "email" as const,
      logoUrl: "https://cdn.simpleicons.org/twilio",
      websiteUrl: "https://twilio.com",
      dashboardUrl: "https://console.twilio.com",
      statusPageUrl: "https://status.twilio.com",
      docsUrl: "https://www.twilio.com/docs",
      color: "#F22F46",
      freeTierLimits: { "Trial Credit": "$15.50" },
      pricingTiers: [{ name: "Pay-as-you-go", price: 0 }],
    },
    {
      name: "SendGrid",
      slug: "sendgrid",
      category: "email" as const,
      logoUrl: "https://cdn.simpleicons.org/twilio",
      websiteUrl: "https://sendgrid.com",
      dashboardUrl: "https://app.sendgrid.com",
      statusPageUrl: "https://status.sendgrid.com",
      docsUrl: "https://docs.sendgrid.com",
      color: "#1A82E2",
      freeTierLimits: { "Emails/day": "100" },
      pricingTiers: [{ name: "Free", price: 0 }, { name: "Essentials", price: 19.95 }],
    },
    {
      name: "Datadog",
      slug: "datadog",
      category: "monitoring" as const,
      logoUrl: "https://cdn.simpleicons.org/datadog",
      websiteUrl: "https://datadoghq.com",
      dashboardUrl: "https://app.datadoghq.com",
      statusPageUrl: "https://status.datadoghq.com",
      docsUrl: "https://docs.datadoghq.com",
      color: "#632CA6",
      freeTierLimits: { Hosts: "5", "Metrics Retention": "1 day" },
      pricingTiers: [{ name: "Free", price: 0 }, { name: "Pro", price: 15 }],
    },
    {
      name: "MongoDB Atlas",
      slug: "mongodb",
      category: "database" as const,
      logoUrl: "https://cdn.simpleicons.org/mongodb",
      websiteUrl: "https://mongodb.com",
      dashboardUrl: "https://cloud.mongodb.com",
      statusPageUrl: "https://status.cloud.mongodb.com",
      docsUrl: "https://www.mongodb.com/docs/atlas",
      color: "#47A248",
      freeTierLimits: { Storage: "512 MB", "Shared RAM": "Shared" },
      pricingTiers: [{ name: "Free", price: 0 }, { name: "Serverless", price: 0 }, { name: "Dedicated", price: 57 }],
    },
  ];

  // Insert services
  const insertedServices = await db
    .insert(services)
    .values(serviceData)
    .onConflictDoNothing({ target: services.slug })
    .returning({ id: services.id, slug: services.slug });

  // Build slug->id map (handle both fresh inserts and existing)
  const slugToId: Record<string, string> = {};
  for (const s of insertedServices) {
    slugToId[s.slug] = s.id;
  }

  // If some were already inserted, query them
  if (insertedServices.length < serviceData.length) {
    const { eq: eqOp } = await import("drizzle-orm");
    for (const sd of serviceData) {
      if (!slugToId[sd.slug]) {
        const [existing] = await db
          .select({ id: services.id })
          .from(services)
          .where(eqOp(services.slug, sd.slug))
          .limit(1);
        if (existing) slugToId[sd.slug] = existing.id;
      }
    }
  }

  console.log(`✅ Inserted/verified ${Object.keys(slugToId).length} services\n`);

  // ============ DETECTION RULES ============
  const rules = [
    // -- Supabase --
    { slug: "supabase", type: "dependency" as const, pattern: "@supabase/supabase-js", fileGlob: "package.json", weight: "0.70" },
    { slug: "supabase", type: "dependency" as const, pattern: "supabase", fileGlob: "requirements.txt", weight: "0.70" },
    { slug: "supabase", type: "config_file" as const, pattern: "supabase/config.toml", fileGlob: null, weight: "0.80" },
    { slug: "supabase", type: "import_pattern" as const, pattern: "createClient.*supabase", fileGlob: null, weight: "0.60" },
    { slug: "supabase", type: "env_var" as const, pattern: "SUPABASE_URL", fileGlob: null, weight: "0.65" },
    { slug: "supabase", type: "env_var" as const, pattern: "NEXT_PUBLIC_SUPABASE", fileGlob: null, weight: "0.65" },

    // -- Vercel --
    { slug: "vercel", type: "config_file" as const, pattern: "vercel.json", fileGlob: null, weight: "0.80" },
    { slug: "vercel", type: "config_file" as const, pattern: ".vercel", fileGlob: null, weight: "0.60" },
    { slug: "vercel", type: "dependency" as const, pattern: "@vercel/analytics", fileGlob: "package.json", weight: "0.70" },
    { slug: "vercel", type: "dependency" as const, pattern: "@vercel/og", fileGlob: "package.json", weight: "0.50" },
    { slug: "vercel", type: "ci_cd" as const, pattern: "vercel", fileGlob: null, weight: "0.50" },
    { slug: "vercel", type: "env_var" as const, pattern: "VERCEL_URL", fileGlob: null, weight: "0.50" },

    // -- Firebase --
    { slug: "firebase", type: "dependency" as const, pattern: "firebase", fileGlob: "package.json", weight: "0.70" },
    { slug: "firebase", type: "dependency" as const, pattern: "firebase-admin", fileGlob: "package.json", weight: "0.75" },
    { slug: "firebase", type: "config_file" as const, pattern: ".firebaserc", fileGlob: null, weight: "0.85" },
    { slug: "firebase", type: "config_file" as const, pattern: "firebase.json", fileGlob: null, weight: "0.80" },
    { slug: "firebase", type: "import_pattern" as const, pattern: "initializeApp", fileGlob: null, weight: "0.40" },
    { slug: "firebase", type: "env_var" as const, pattern: "FIREBASE_", fileGlob: null, weight: "0.60" },

    // -- Stripe --
    { slug: "stripe", type: "dependency" as const, pattern: "stripe", fileGlob: "package.json", weight: "0.75" },
    { slug: "stripe", type: "dependency" as const, pattern: "@stripe/stripe-js", fileGlob: "package.json", weight: "0.80" },
    { slug: "stripe", type: "import_pattern" as const, pattern: "new Stripe\\(", fileGlob: null, weight: "0.70" },
    { slug: "stripe", type: "env_var" as const, pattern: "STRIPE_SECRET_KEY", fileGlob: null, weight: "0.80" },
    { slug: "stripe", type: "env_var" as const, pattern: "STRIPE_PUBLISHABLE_KEY", fileGlob: null, weight: "0.70" },

    // -- Neon --
    { slug: "neon", type: "dependency" as const, pattern: "@neondatabase/serverless", fileGlob: "package.json", weight: "0.85" },
    { slug: "neon", type: "import_pattern" as const, pattern: "neon\\(", fileGlob: null, weight: "0.60" },
    { slug: "neon", type: "env_var" as const, pattern: "DATABASE_URL.*neon", fileGlob: null, weight: "0.50" },

    // -- Cloudflare --
    { slug: "cloudflare", type: "config_file" as const, pattern: "wrangler.toml", fileGlob: null, weight: "0.85" },
    { slug: "cloudflare", type: "config_file" as const, pattern: "wrangler.json", fileGlob: null, weight: "0.85" },
    { slug: "cloudflare", type: "dependency" as const, pattern: "@cloudflare/workers-types", fileGlob: "package.json", weight: "0.75" },
    { slug: "cloudflare", type: "dependency" as const, pattern: "wrangler", fileGlob: "package.json", weight: "0.70" },

    // -- Resend --
    { slug: "resend", type: "dependency" as const, pattern: "resend", fileGlob: "package.json", weight: "0.80" },
    { slug: "resend", type: "import_pattern" as const, pattern: "new Resend\\(", fileGlob: null, weight: "0.70" },
    { slug: "resend", type: "env_var" as const, pattern: "RESEND_API_KEY", fileGlob: null, weight: "0.75" },

    // -- Clerk --
    { slug: "clerk", type: "dependency" as const, pattern: "@clerk/nextjs", fileGlob: "package.json", weight: "0.85" },
    { slug: "clerk", type: "dependency" as const, pattern: "@clerk/clerk-react", fileGlob: "package.json", weight: "0.85" },
    { slug: "clerk", type: "env_var" as const, pattern: "CLERK_SECRET_KEY", fileGlob: null, weight: "0.75" },
    { slug: "clerk", type: "env_var" as const, pattern: "NEXT_PUBLIC_CLERK", fileGlob: null, weight: "0.70" },

    // -- Sentry --
    { slug: "sentry", type: "dependency" as const, pattern: "@sentry/nextjs", fileGlob: "package.json", weight: "0.85" },
    { slug: "sentry", type: "dependency" as const, pattern: "@sentry/node", fileGlob: "package.json", weight: "0.80" },
    { slug: "sentry", type: "dependency" as const, pattern: "@sentry/react", fileGlob: "package.json", weight: "0.80" },
    { slug: "sentry", type: "config_file" as const, pattern: "sentry.client.config.ts", fileGlob: null, weight: "0.85" },
    { slug: "sentry", type: "import_pattern" as const, pattern: "Sentry\\.init\\(", fileGlob: null, weight: "0.70" },

    // -- OpenAI --
    { slug: "openai", type: "dependency" as const, pattern: "openai", fileGlob: "package.json", weight: "0.75" },
    { slug: "openai", type: "dependency" as const, pattern: "openai", fileGlob: "requirements.txt", weight: "0.75" },
    { slug: "openai", type: "import_pattern" as const, pattern: "from openai import", fileGlob: null, weight: "0.80" },
    { slug: "openai", type: "import_pattern" as const, pattern: "new OpenAI\\(", fileGlob: null, weight: "0.70" },
    { slug: "openai", type: "env_var" as const, pattern: "OPENAI_API_KEY", fileGlob: null, weight: "0.75" },

    // -- AWS S3 --
    { slug: "aws-s3", type: "dependency" as const, pattern: "@aws-sdk/client-s3", fileGlob: "package.json", weight: "0.85" },
    { slug: "aws-s3", type: "dependency" as const, pattern: "aws-sdk", fileGlob: "package.json", weight: "0.60" },
    { slug: "aws-s3", type: "dependency" as const, pattern: "boto3", fileGlob: "requirements.txt", weight: "0.50" },
    { slug: "aws-s3", type: "env_var" as const, pattern: "AWS_ACCESS_KEY_ID", fileGlob: null, weight: "0.60" },
    { slug: "aws-s3", type: "env_var" as const, pattern: "AWS_S3_BUCKET", fileGlob: null, weight: "0.70" },

    // -- Prisma --
    { slug: "prisma", type: "dependency" as const, pattern: "prisma", fileGlob: "package.json", weight: "0.70" },
    { slug: "prisma", type: "dependency" as const, pattern: "@prisma/client", fileGlob: "package.json", weight: "0.85" },
    { slug: "prisma", type: "config_file" as const, pattern: "prisma/schema.prisma", fileGlob: null, weight: "0.90" },

    // -- PlanetScale --
    { slug: "planetscale", type: "dependency" as const, pattern: "@planetscale/database", fileGlob: "package.json", weight: "0.85" },
    { slug: "planetscale", type: "config_file" as const, pattern: ".pscale", fileGlob: null, weight: "0.80" },

    // -- Railway --
    { slug: "railway", type: "config_file" as const, pattern: "railway.json", fileGlob: null, weight: "0.85" },
    { slug: "railway", type: "config_file" as const, pattern: "railway.toml", fileGlob: null, weight: "0.85" },
    { slug: "railway", type: "env_var" as const, pattern: "RAILWAY_", fileGlob: null, weight: "0.70" },

    // -- Netlify --
    { slug: "netlify", type: "config_file" as const, pattern: "netlify.toml", fileGlob: null, weight: "0.85" },
    { slug: "netlify", type: "dependency" as const, pattern: "netlify-cli", fileGlob: "package.json", weight: "0.70" },
    { slug: "netlify", type: "dependency" as const, pattern: "@netlify/functions", fileGlob: "package.json", weight: "0.80" },

    // -- Auth0 --
    { slug: "auth0", type: "dependency" as const, pattern: "@auth0/nextjs-auth0", fileGlob: "package.json", weight: "0.85" },
    { slug: "auth0", type: "dependency" as const, pattern: "auth0", fileGlob: "package.json", weight: "0.60" },
    { slug: "auth0", type: "env_var" as const, pattern: "AUTH0_SECRET", fileGlob: null, weight: "0.75" },
    { slug: "auth0", type: "env_var" as const, pattern: "AUTH0_DOMAIN", fileGlob: null, weight: "0.75" },

    // -- Twilio --
    { slug: "twilio", type: "dependency" as const, pattern: "twilio", fileGlob: "package.json", weight: "0.80" },
    { slug: "twilio", type: "dependency" as const, pattern: "twilio", fileGlob: "requirements.txt", weight: "0.80" },
    { slug: "twilio", type: "env_var" as const, pattern: "TWILIO_ACCOUNT_SID", fileGlob: null, weight: "0.80" },

    // -- SendGrid --
    { slug: "sendgrid", type: "dependency" as const, pattern: "@sendgrid/mail", fileGlob: "package.json", weight: "0.85" },
    { slug: "sendgrid", type: "dependency" as const, pattern: "sendgrid", fileGlob: "requirements.txt", weight: "0.80" },
    { slug: "sendgrid", type: "env_var" as const, pattern: "SENDGRID_API_KEY", fileGlob: null, weight: "0.80" },

    // -- Datadog --
    { slug: "datadog", type: "dependency" as const, pattern: "dd-trace", fileGlob: "package.json", weight: "0.85" },
    { slug: "datadog", type: "dependency" as const, pattern: "datadog", fileGlob: "requirements.txt", weight: "0.70" },
    { slug: "datadog", type: "env_var" as const, pattern: "DD_API_KEY", fileGlob: null, weight: "0.80" },

    // -- MongoDB --
    { slug: "mongodb", type: "dependency" as const, pattern: "mongodb", fileGlob: "package.json", weight: "0.70" },
    { slug: "mongodb", type: "dependency" as const, pattern: "mongoose", fileGlob: "package.json", weight: "0.80" },
    { slug: "mongodb", type: "dependency" as const, pattern: "pymongo", fileGlob: "requirements.txt", weight: "0.80" },
    { slug: "mongodb", type: "env_var" as const, pattern: "MONGODB_URI", fileGlob: null, weight: "0.80" },
    { slug: "mongodb", type: "env_var" as const, pattern: "MONGO_URL", fileGlob: null, weight: "0.70" },
  ];

  // Insert detection rules
  let ruleCount = 0;
  for (const rule of rules) {
    const serviceId = slugToId[rule.slug];
    if (!serviceId) {
      console.warn(`⚠️  Service not found for slug: ${rule.slug}`);
      continue;
    }

    await db
      .insert(serviceDetectionRules)
      .values({
        serviceId,
        ruleType: rule.type,
        pattern: rule.pattern,
        fileGlob: rule.fileGlob,
        confidenceWeight: rule.weight,
      });
    ruleCount++;
  }

  console.log(`✅ Inserted ${ruleCount} detection rules\n`);
  console.log("🎉 Seed complete!");
}

seed().catch(console.error);
