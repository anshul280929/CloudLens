import {
  Service,
  Repository,
  Alert,
  CostEstimate,
  DashboardStats,
  User,
} from "./types";

// ============ Mock User ============
export const mockUser: User = {
  id: "1",
  username: "devuser",
  email: "dev@example.com",
  avatarUrl: "https://api.dicebear.com/8.x/avataaars/svg?seed=devuser",
  plan: "pro",
};

// ============ Mock Services ============
export const services: Service[] = [
  {
    id: "svc-1",
    name: "Supabase",
    slug: "supabase",
    category: "database",
    logoUrl: "https://cdn.simpleicons.org/supabase",
    websiteUrl: "https://supabase.com",
    dashboardUrl: "https://app.supabase.com",
    statusPageUrl: "https://status.supabase.com",
    color: "#3ECF8E",
    status: "operational",
    freeTierLimits: {
      "Database Size": "500 MB",
      "Bandwidth": "2 GB",
      "Inactivity Pause": "7 days",
    },
    pricingTiers: [
      { name: "Free", price: 0 },
      { name: "Pro", price: 25 },
      { name: "Team", price: 599 },
    ],
  },
  {
    id: "svc-2",
    name: "Vercel",
    slug: "vercel",
    category: "hosting",
    logoUrl: "https://cdn.simpleicons.org/vercel/white",
    websiteUrl: "https://vercel.com",
    dashboardUrl: "https://vercel.com/dashboard",
    statusPageUrl: "https://www.vercel-status.com",
    color: "#ffffff",
    status: "operational",
    freeTierLimits: {
      Bandwidth: "100 GB",
      "Build Minutes": "6000 min/mo",
      "Serverless Functions": "100 GB-hrs",
    },
    pricingTiers: [
      { name: "Hobby", price: 0 },
      { name: "Pro", price: 20 },
      { name: "Enterprise", price: 0 },
    ],
  },
  {
    id: "svc-3",
    name: "Firebase",
    slug: "firebase",
    category: "database",
    logoUrl: "https://cdn.simpleicons.org/firebase",
    websiteUrl: "https://firebase.google.com",
    dashboardUrl: "https://console.firebase.google.com",
    statusPageUrl: "https://status.firebase.google.com",
    color: "#FFCA28",
    status: "degraded",
    freeTierLimits: {
      "Firestore Reads": "50K/day",
      "Firestore Writes": "20K/day",
      Storage: "5 GB",
    },
    pricingTiers: [
      { name: "Spark (Free)", price: 0 },
      { name: "Blaze (Pay-as-you-go)", price: 0 },
    ],
  },
  {
    id: "svc-4",
    name: "Stripe",
    slug: "stripe",
    category: "payments",
    logoUrl: "https://cdn.simpleicons.org/stripe",
    websiteUrl: "https://stripe.com",
    dashboardUrl: "https://dashboard.stripe.com",
    statusPageUrl: "https://status.stripe.com",
    color: "#635BFF",
    status: "operational",
    freeTierLimits: {
      "Transaction Fee": "2.9% + 30¢",
    },
    pricingTiers: [
      { name: "Standard", price: 0 },
      { name: "Custom", price: 0 },
    ],
  },
  {
    id: "svc-5",
    name: "Neon",
    slug: "neon",
    category: "database",
    logoUrl: "https://cdn.simpleicons.org/neon/00E5FF",
    websiteUrl: "https://neon.tech",
    dashboardUrl: "https://console.neon.tech",
    statusPageUrl: "https://neonstatus.com",
    color: "#00E5FF",
    status: "operational",
    freeTierLimits: {
      Storage: "512 MB",
      "Compute Hours": "191 hrs/mo",
      Branches: "10",
    },
    pricingTiers: [
      { name: "Free", price: 0 },
      { name: "Launch", price: 19 },
      { name: "Scale", price: 69 },
    ],
  },
  {
    id: "svc-6",
    name: "Cloudflare",
    slug: "cloudflare",
    category: "cdn",
    logoUrl: "https://cdn.simpleicons.org/cloudflare",
    websiteUrl: "https://cloudflare.com",
    dashboardUrl: "https://dash.cloudflare.com",
    statusPageUrl: "https://www.cloudflarestatus.com",
    color: "#F38020",
    status: "operational",
    freeTierLimits: {
      "DNS Queries": "Unlimited",
      "Page Rules": "3",
      "Workers Requests": "100K/day",
    },
    pricingTiers: [
      { name: "Free", price: 0 },
      { name: "Pro", price: 20 },
      { name: "Business", price: 200 },
    ],
  },
  {
    id: "svc-7",
    name: "Resend",
    slug: "resend",
    category: "email",
    logoUrl: "https://cdn.simpleicons.org/resend/white",
    websiteUrl: "https://resend.com",
    dashboardUrl: "https://resend.com/overview",
    statusPageUrl: "https://resend-status.com",
    color: "#ffffff",
    status: "operational",
    freeTierLimits: {
      "Emails/day": "100",
      "Emails/month": "3,000",
    },
    pricingTiers: [
      { name: "Free", price: 0 },
      { name: "Pro", price: 20 },
    ],
  },
  {
    id: "svc-8",
    name: "Clerk",
    slug: "clerk",
    category: "auth",
    logoUrl: "https://cdn.simpleicons.org/clerk",
    websiteUrl: "https://clerk.com",
    dashboardUrl: "https://dashboard.clerk.com",
    statusPageUrl: "https://status.clerk.com",
    color: "#6C47FF",
    status: "operational",
    freeTierLimits: {
      MAUs: "10,000",
      "Social Logins": "Unlimited",
    },
    pricingTiers: [
      { name: "Free", price: 0 },
      { name: "Pro", price: 25 },
    ],
  },
  {
    id: "svc-9",
    name: "Sentry",
    slug: "sentry",
    category: "monitoring",
    logoUrl: "https://cdn.simpleicons.org/sentry",
    websiteUrl: "https://sentry.io",
    dashboardUrl: "https://sentry.io/organizations",
    statusPageUrl: "https://status.sentry.io",
    color: "#362D59",
    status: "operational",
    freeTierLimits: {
      Events: "5K/mo",
      "Data Retention": "30 days",
    },
    pricingTiers: [
      { name: "Developer (Free)", price: 0 },
      { name: "Team", price: 26 },
      { name: "Business", price: 80 },
    ],
  },
  {
    id: "svc-10",
    name: "OpenAI",
    slug: "openai",
    category: "ai",
    logoUrl: "https://cdn.simpleicons.org/openai/white",
    websiteUrl: "https://openai.com",
    dashboardUrl: "https://platform.openai.com",
    statusPageUrl: "https://status.openai.com",
    color: "#ffffff",
    status: "operational",
    freeTierLimits: {
      "Free Credits": "$5 (new accounts)",
    },
    pricingTiers: [
      { name: "Pay-as-you-go", price: 0 },
    ],
  },
];

// ============ Mock Repositories ============
export const repositories: Repository[] = [
  {
    id: "repo-1",
    name: "saas-platform",
    fullName: "devuser/saas-platform",
    isPrivate: false,
    lastCommitAt: "2026-03-21T10:30:00Z",
    lastScannedAt: "2026-03-22T08:00:00Z",
    scanStatus: "completed",
    language: "TypeScript",
    stars: 128,
    detectedServices: [
      {
        id: "ds-1",
        service: services[0], // Supabase
        confidence: 0.95,
        detectionDetails: [
          { rule: "dependency", match: "@supabase/supabase-js", file: "package.json" },
          { rule: "config_file", match: "supabase/", file: "supabase/config.toml" },
          { rule: "import_pattern", match: "createClient", file: "src/lib/supabase.ts" },
        ],
        firstDetectedAt: "2026-01-15T00:00:00Z",
        lastSeenAt: "2026-03-22T08:00:00Z",
      },
      {
        id: "ds-2",
        service: services[1], // Vercel
        confidence: 0.9,
        detectionDetails: [
          { rule: "config_file", match: "vercel.json", file: "vercel.json" },
          { rule: "ci_cd", match: "vercel-action", file: ".github/workflows/deploy.yml" },
        ],
        firstDetectedAt: "2026-01-15T00:00:00Z",
        lastSeenAt: "2026-03-22T08:00:00Z",
      },
      {
        id: "ds-3",
        service: services[3], // Stripe
        confidence: 0.88,
        detectionDetails: [
          { rule: "dependency", match: "stripe", file: "package.json" },
          { rule: "import_pattern", match: "new Stripe(", file: "src/lib/stripe.ts" },
        ],
        firstDetectedAt: "2026-02-01T00:00:00Z",
        lastSeenAt: "2026-03-22T08:00:00Z",
      },
      {
        id: "ds-4",
        service: services[6], // Resend
        confidence: 0.85,
        detectionDetails: [
          { rule: "dependency", match: "resend", file: "package.json" },
          { rule: "import_pattern", match: "new Resend(", file: "src/lib/email.ts" },
        ],
        firstDetectedAt: "2026-02-10T00:00:00Z",
        lastSeenAt: "2026-03-22T08:00:00Z",
      },
      {
        id: "ds-15",
        service: services[7], // Clerk
        confidence: 0.92,
        detectionDetails: [
          { rule: "dependency", match: "@clerk/nextjs", file: "package.json" },
          { rule: "config_file", match: "middleware.ts", file: "src/middleware.ts" },
        ],
        firstDetectedAt: "2026-01-15T00:00:00Z",
        lastSeenAt: "2026-03-22T08:00:00Z",
      },
    ],
  },
  {
    id: "repo-2",
    name: "portfolio-v3",
    fullName: "devuser/portfolio-v3",
    isPrivate: false,
    lastCommitAt: "2025-09-15T14:20:00Z",
    lastScannedAt: "2026-03-22T08:00:00Z",
    scanStatus: "completed",
    language: "TypeScript",
    stars: 45,
    detectedServices: [
      {
        id: "ds-5",
        service: services[1], // Vercel
        confidence: 0.92,
        detectionDetails: [
          { rule: "config_file", match: "vercel.json", file: "vercel.json" },
        ],
        firstDetectedAt: "2025-06-01T00:00:00Z",
        lastSeenAt: "2026-03-22T08:00:00Z",
      },
      {
        id: "ds-6",
        service: services[2], // Firebase
        confidence: 0.78,
        detectionDetails: [
          { rule: "dependency", match: "firebase", file: "package.json" },
          { rule: "config_file", match: ".firebaserc", file: ".firebaserc" },
        ],
        firstDetectedAt: "2025-06-01T00:00:00Z",
        lastSeenAt: "2026-03-22T08:00:00Z",
      },
    ],
  },
  {
    id: "repo-3",
    name: "api-gateway",
    fullName: "devuser/api-gateway",
    isPrivate: true,
    lastCommitAt: "2026-03-20T18:45:00Z",
    lastScannedAt: "2026-03-22T08:00:00Z",
    scanStatus: "completed",
    language: "TypeScript",
    stars: 12,
    detectedServices: [
      {
        id: "ds-7",
        service: services[4], // Neon
        confidence: 0.93,
        detectionDetails: [
          { rule: "dependency", match: "@neondatabase/serverless", file: "package.json" },
          { rule: "import_pattern", match: "neon(", file: "src/db/index.ts" },
        ],
        firstDetectedAt: "2026-03-01T00:00:00Z",
        lastSeenAt: "2026-03-22T08:00:00Z",
      },
      {
        id: "ds-8",
        service: services[5], // Cloudflare
        confidence: 0.87,
        detectionDetails: [
          { rule: "config_file", match: "wrangler.toml", file: "wrangler.toml" },
        ],
        firstDetectedAt: "2026-03-01T00:00:00Z",
        lastSeenAt: "2026-03-22T08:00:00Z",
      },
      {
        id: "ds-9",
        service: services[8], // Sentry
        confidence: 0.91,
        detectionDetails: [
          { rule: "dependency", match: "@sentry/node", file: "package.json" },
          { rule: "import_pattern", match: "Sentry.init(", file: "src/instrument.ts" },
        ],
        firstDetectedAt: "2026-03-05T00:00:00Z",
        lastSeenAt: "2026-03-22T08:00:00Z",
      },
    ],
  },
  {
    id: "repo-4",
    name: "ai-chatbot",
    fullName: "devuser/ai-chatbot",
    isPrivate: false,
    lastCommitAt: "2026-03-22T09:00:00Z",
    lastScannedAt: "2026-03-22T09:30:00Z",
    scanStatus: "completed",
    language: "Python",
    stars: 312,
    detectedServices: [
      {
        id: "ds-10",
        service: services[9], // OpenAI
        confidence: 0.96,
        detectionDetails: [
          { rule: "dependency", match: "openai", file: "requirements.txt" },
          { rule: "import_pattern", match: "from openai import", file: "src/agent.py" },
        ],
        firstDetectedAt: "2026-02-20T00:00:00Z",
        lastSeenAt: "2026-03-22T09:30:00Z",
      },
      {
        id: "ds-11",
        service: services[0], // Supabase
        confidence: 0.82,
        detectionDetails: [
          { rule: "dependency", match: "supabase", file: "requirements.txt" },
        ],
        firstDetectedAt: "2026-02-20T00:00:00Z",
        lastSeenAt: "2026-03-22T09:30:00Z",
      },
      {
        id: "ds-16",
        service: services[1], // Vercel
        confidence: 0.7,
        detectionDetails: [
          { rule: "config_file", match: "vercel.json", file: "vercel.json" },
        ],
        firstDetectedAt: "2026-02-20T00:00:00Z",
        lastSeenAt: "2026-03-22T09:30:00Z",
      },
    ],
  },
  {
    id: "repo-5",
    name: "old-blog",
    fullName: "devuser/old-blog",
    isPrivate: false,
    lastCommitAt: "2025-04-10T12:00:00Z",
    lastScannedAt: "2026-03-22T08:00:00Z",
    scanStatus: "completed",
    language: "JavaScript",
    stars: 3,
    detectedServices: [
      {
        id: "ds-12",
        service: services[2], // Firebase
        confidence: 0.9,
        detectionDetails: [
          { rule: "dependency", match: "firebase", file: "package.json" },
          { rule: "config_file", match: ".firebaserc", file: ".firebaserc" },
          { rule: "import_pattern", match: "initializeApp", file: "src/firebase.js" },
        ],
        firstDetectedAt: "2025-01-01T00:00:00Z",
        lastSeenAt: "2026-03-22T08:00:00Z",
      },
    ],
  },
];

// ============ Mock Alerts ============
export const alerts: Alert[] = [
  {
    id: "alert-1",
    type: "inactivity",
    severity: "warning",
    title: "Supabase project may pause soon",
    message:
      "Your repo 'old-blog' hasn't been updated in 11 months. Supabase free tier pauses databases after 7 days of inactivity. If this project has a Supabase DB, it may already be paused.",
    actionUrl: "https://app.supabase.com",
    serviceName: "Firebase",
    serviceIcon: "https://cdn.simpleicons.org/firebase",
    repoName: "old-blog",
    isRead: false,
    isDismissed: false,
    createdAt: "2026-03-22T06:00:00Z",
  },
  {
    id: "alert-2",
    type: "outage",
    severity: "critical",
    title: "Firebase experiencing degraded performance",
    message:
      "Firebase is currently experiencing degraded performance. Your projects 'portfolio-v3' and 'old-blog' use Firebase. Check the status page for updates.",
    actionUrl: "https://status.firebase.google.com",
    serviceName: "Firebase",
    serviceIcon: "https://cdn.simpleicons.org/firebase",
    isRead: false,
    isDismissed: false,
    createdAt: "2026-03-22T07:30:00Z",
  },
  {
    id: "alert-3",
    type: "quota_limit",
    severity: "warning",
    title: "Vercel bandwidth at 82%",
    message:
      "You've used 82 GB of your 100 GB monthly bandwidth on Vercel's hobby plan. Consider upgrading to Pro ($20/mo) or optimizing asset delivery.",
    actionUrl: "https://vercel.com/dashboard",
    serviceName: "Vercel",
    serviceIcon: "https://cdn.simpleicons.org/vercel/white",
    isRead: false,
    isDismissed: false,
    createdAt: "2026-03-21T12:00:00Z",
  },
  {
    id: "alert-4",
    type: "ai_suggestion",
    severity: "info",
    title: "Consolidate database services",
    message:
      "You're using Supabase (2 projects), Firebase (2 projects), and Neon (1 project) for databases. Consider consolidating to one provider to simplify management and potentially reduce costs.",
    actionUrl: "#",
    serviceName: "Cloudlens AI",
    serviceIcon: "",
    isRead: true,
    isDismissed: false,
    createdAt: "2026-03-20T09:00:00Z",
  },
  {
    id: "alert-5",
    type: "inactivity",
    severity: "warning",
    title: "Unused Firebase project detected",
    message:
      "Your repo 'portfolio-v3' hasn't been updated since September 2025 (6 months ago) and uses Firebase. You may be incurring costs on an unused project.",
    actionUrl: "https://console.firebase.google.com",
    serviceName: "Firebase",
    serviceIcon: "https://cdn.simpleicons.org/firebase",
    repoName: "portfolio-v3",
    isRead: false,
    isDismissed: false,
    createdAt: "2026-03-22T06:00:00Z",
  },
  {
    id: "alert-6",
    type: "security",
    severity: "critical",
    title: "Potential API key exposure",
    message:
      "A pattern matching a Stripe API key was detected in 'src/config.ts' of your 'saas-platform' repo. Move this to environment variables immediately.",
    actionUrl: "https://github.com/devuser/saas-platform",
    serviceName: "Stripe",
    serviceIcon: "https://cdn.simpleicons.org/stripe",
    repoName: "saas-platform",
    isRead: false,
    isDismissed: false,
    createdAt: "2026-03-22T08:15:00Z",
  },
];

// ============ Mock Cost Estimates ============
export const costEstimates: CostEstimate[] = [
  {
    serviceId: "svc-1",
    serviceName: "Supabase",
    serviceIcon: "https://cdn.simpleicons.org/supabase",
    estimatedTier: "Pro",
    estimatedMonthlyCost: 25,
    repos: ["saas-platform", "ai-chatbot"],
  },
  {
    serviceId: "svc-2",
    serviceName: "Vercel",
    serviceIcon: "https://cdn.simpleicons.org/vercel/white",
    estimatedTier: "Hobby",
    estimatedMonthlyCost: 0,
    repos: ["saas-platform", "portfolio-v3", "ai-chatbot"],
  },
  {
    serviceId: "svc-3",
    serviceName: "Firebase",
    serviceIcon: "https://cdn.simpleicons.org/firebase",
    estimatedTier: "Blaze",
    estimatedMonthlyCost: 8,
    repos: ["portfolio-v3", "old-blog"],
  },
  {
    serviceId: "svc-4",
    serviceName: "Stripe",
    serviceIcon: "https://cdn.simpleicons.org/stripe",
    estimatedTier: "Standard",
    estimatedMonthlyCost: 0,
    repos: ["saas-platform"],
  },
  {
    serviceId: "svc-5",
    serviceName: "Neon",
    serviceIcon: "https://cdn.simpleicons.org/neon/00E5FF",
    estimatedTier: "Free",
    estimatedMonthlyCost: 0,
    repos: ["api-gateway"],
  },
  {
    serviceId: "svc-6",
    serviceName: "Cloudflare",
    serviceIcon: "https://cdn.simpleicons.org/cloudflare",
    estimatedTier: "Free",
    estimatedMonthlyCost: 0,
    repos: ["api-gateway"],
  },
  {
    serviceId: "svc-7",
    serviceName: "Resend",
    serviceIcon: "https://cdn.simpleicons.org/resend/white",
    estimatedTier: "Pro",
    estimatedMonthlyCost: 20,
    repos: ["saas-platform"],
  },
  {
    serviceId: "svc-8",
    serviceName: "Clerk",
    serviceIcon: "https://cdn.simpleicons.org/clerk",
    estimatedTier: "Free",
    estimatedMonthlyCost: 0,
    repos: ["saas-platform"],
  },
  {
    serviceId: "svc-9",
    serviceName: "Sentry",
    serviceIcon: "https://cdn.simpleicons.org/sentry",
    estimatedTier: "Developer",
    estimatedMonthlyCost: 0,
    repos: ["api-gateway"],
  },
  {
    serviceId: "svc-10",
    serviceName: "OpenAI",
    serviceIcon: "https://cdn.simpleicons.org/openai/white",
    estimatedTier: "Pay-as-you-go",
    estimatedMonthlyCost: 15,
    repos: ["ai-chatbot"],
  },
];

// ============ Dashboard Stats ============
export const dashboardStats: DashboardStats = {
  totalRepos: repositories.length,
  totalServices: 10,
  activeAlerts: alerts.filter((a) => !a.isRead && !a.isDismissed).length,
  estimatedMonthlyCost: costEstimates.reduce((sum, c) => sum + c.estimatedMonthlyCost, 0),
  servicesPerCategory: {
    database: 3,
    auth: 1,
    hosting: 1,
    storage: 0,
    email: 1,
    payments: 1,
    analytics: 0,
    cdn: 1,
    monitoring: 1,
    ai: 1,
    other: 0,
  },
};
