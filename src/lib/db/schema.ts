import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  decimal,
  jsonb,
  pgEnum,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============ ENUMS ============

export const planEnum = pgEnum("plan", ["free", "pro", "team"]);

export const scanStatusEnum = pgEnum("scan_status", [
  "pending",
  "scanning",
  "completed",
  "failed",
]);

export const serviceCategoryEnum = pgEnum("service_category", [
  "database",
  "auth",
  "hosting",
  "storage",
  "email",
  "payments",
  "analytics",
  "cdn",
  "monitoring",
  "ai",
  "other",
]);

export const ruleTypeEnum = pgEnum("rule_type", [
  "dependency",
  "config_file",
  "import_pattern",
  "sdk_pattern",
  "env_var",
  "ci_cd",
  "readme",
]);

export const serviceStatusEnum = pgEnum("service_status", [
  "operational",
  "degraded",
  "partial_outage",
  "major_outage",
]);

export const detectedServiceStatusEnum = pgEnum("detected_service_status", [
  "active",
  "inactive",
  "unconfirmed",
]);

export const alertTypeEnum = pgEnum("alert_type", [
  "expiry_warning",
  "inactivity",
  "quota_limit",
  "cost_spike",
  "outage",
  "security",
  "ai_suggestion",
]);

export const alertSeverityEnum = pgEnum("alert_severity", [
  "info",
  "warning",
  "critical",
]);

export const costSourceEnum = pgEnum("cost_source", [
  "estimated",
  "api",
  "manual",
]);

// ============ AUTH TABLES (NextAuth.js) ============

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  // Cloudlens-specific fields
  githubId: integer("github_id").unique(),
  username: varchar("username", { length: 255 }),
  githubAccessToken: text("github_access_token"),
  plan: planEnum("plan").default("free"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ============ CORE TABLES ============

export const repositories = pgTable("repositories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  githubRepoId: integer("github_repo_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 512 }).notNull(),
  isPrivate: boolean("is_private").default(false),
  defaultBranch: varchar("default_branch", { length: 100 }).default("main"),
  language: varchar("language", { length: 100 }),
  stars: integer("stars").default(0),
  lastCommitAt: timestamp("last_commit_at"),
  lastScannedAt: timestamp("last_scanned_at"),
  scanStatus: scanStatusEnum("scan_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  category: serviceCategoryEnum("category").notNull(),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  dashboardUrl: text("dashboard_url"),
  statusPageUrl: text("status_page_url"),
  docsUrl: text("docs_url"),
  color: varchar("color", { length: 20 }),
  freeTierLimits: jsonb("free_tier_limits"),
  pricingTiers: jsonb("pricing_tiers"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceDetectionRules = pgTable("service_detection_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  ruleType: ruleTypeEnum("rule_type").notNull(),
  pattern: text("pattern").notNull(),
  fileGlob: text("file_glob"),
  confidenceWeight: decimal("confidence_weight", {
    precision: 3,
    scale: 2,
  }).default("0.50"),
  language: varchar("language", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const detectedServices = pgTable(
  "detected_services",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    repoId: uuid("repo_id")
      .notNull()
      .references(() => repositories.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
    detectionDetails: jsonb("detection_details"),
    firstDetectedAt: timestamp("first_detected_at").defaultNow(),
    lastSeenAt: timestamp("last_seen_at").defaultNow(),
    status: detectedServiceStatusEnum("status").default("active"),
  },
  (table) => [
    uniqueIndex("detected_services_repo_service_idx").on(
      table.repoId,
      table.serviceId
    ),
  ]
);

// ============ MONITORING & ALERTS ============

export const alerts = pgTable("alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  repoId: uuid("repo_id").references(() => repositories.id, {
    onDelete: "set null",
  }),
  serviceId: uuid("service_id").references(() => services.id, {
    onDelete: "set null",
  }),
  type: alertTypeEnum("type").notNull(),
  severity: alertSeverityEnum("severity").default("info"),
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message").notNull(),
  actionUrl: text("action_url"),
  isRead: boolean("is_read").default(false),
  isDismissed: boolean("is_dismissed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ COST TRACKING ============

export const costEstimates = pgTable("cost_estimates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").references(() => services.id, {
    onDelete: "set null",
  }),
  repoId: uuid("repo_id").references(() => repositories.id, {
    onDelete: "set null",
  }),
  estimatedTier: varchar("estimated_tier", { length: 50 }),
  estimatedMonthlyCost: decimal("estimated_monthly_cost", {
    precision: 10,
    scale: 2,
  }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  source: costSourceEnum("source").default("estimated"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ RELATIONS ============

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  repositories: many(repositories),
  alerts: many(alerts),
  costEstimates: many(costEstimates),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const repositoriesRelations = relations(repositories, ({ one, many }) => ({
  user: one(users, { fields: [repositories.userId], references: [users.id] }),
  detectedServices: many(detectedServices),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  detectionRules: many(serviceDetectionRules),
  detectedServices: many(detectedServices),
}));

export const serviceDetectionRulesRelations = relations(
  serviceDetectionRules,
  ({ one }) => ({
    service: one(services, {
      fields: [serviceDetectionRules.serviceId],
      references: [services.id],
    }),
  })
);

export const detectedServicesRelations = relations(
  detectedServices,
  ({ one }) => ({
    repository: one(repositories, {
      fields: [detectedServices.repoId],
      references: [repositories.id],
    }),
    service: one(services, {
      fields: [detectedServices.serviceId],
      references: [services.id],
    }),
  })
);

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, { fields: [alerts.userId], references: [users.id] }),
  repository: one(repositories, {
    fields: [alerts.repoId],
    references: [repositories.id],
  }),
  service: one(services, {
    fields: [alerts.serviceId],
    references: [services.id],
  }),
}));

export const costEstimatesRelations = relations(costEstimates, ({ one }) => ({
  user: one(users, {
    fields: [costEstimates.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [costEstimates.serviceId],
    references: [services.id],
  }),
  repository: one(repositories, {
    fields: [costEstimates.repoId],
    references: [repositories.id],
  }),
}));
