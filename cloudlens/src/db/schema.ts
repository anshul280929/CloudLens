import {
  pgTable,
  text,
  integer,
  timestamp,
  primaryKey,
  uuid,
  boolean,
  real,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ============================================================
// NextAuth.js Required Tables
// These tables follow the @auth/drizzle-adapter specification
// with custom extensions for CloudLens (e.g., githubId)
// ============================================================

/**
 * Users table — stores authenticated user profiles.
 * Extended with `githubId` for GitHub-specific identity tracking.
 */
export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  githubId: text("githubId").unique(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Accounts table — stores OAuth provider account links.
 * Each user can have multiple accounts (e.g., GitHub, Google).
 * Compound primary key on (provider, providerAccountId).
 */
export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

/**
 * Sessions table — stores active user sessions.
 * Used when NextAuth is configured with database session strategy.
 */
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

/**
 * Verification Tokens table — stores email verification and
 * magic-link tokens. Compound primary key on (identifier, token).
 */
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [
    primaryKey({
      columns: [vt.identifier, vt.token],
    }),
  ],
);

// ============================================================
// CloudLens Business Domain Tables
// ============================================================

/**
 * Repositories table — stores metadata about tracked GitHub repositories.
 * Synced from user's GitHub account.
 */
export const repositories = pgTable(
  "repository",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    githubId: text("githubId").notNull(),
    name: text("name").notNull(),
    fullName: text("fullName").notNull(),
    owner: text("owner").notNull(),
    isPrivate: boolean("isPrivate").notNull(),
    defaultBranch: text("defaultBranch").notNull(),
    lastCommitAt: timestamp("lastCommitAt", { mode: "date" }),
    htmlUrl: text("htmlUrl").notNull(),
    description: text("description"),
    language: text("language"),
    scanStatus: text("scanStatus")
      .$type<"pending" | "scanning" | "complete" | "failed">()
      .default("pending")
      .notNull(),
    lastScannedAt: timestamp("lastScannedAt", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_repo_github_idx").on(table.userId, table.githubId),
  ]
);

/**
 * Scans table — records history and status of each scanner invocation.
 */
export const scans = pgTable("scan", {
  id: uuid("id").defaultRandom().primaryKey(),
  repositoryId: uuid("repositoryId")
    .notNull()
    .references(() => repositories.id, { onDelete: "cascade" }),
  status: text("status")
    .$type<"pending" | "scanning" | "complete" | "failed">()
    .notNull(),
  startedAt: timestamp("startedAt", { mode: "date" }).defaultNow().notNull(),
  completedAt: timestamp("completedAt", { mode: "date" }),
  filesScanned: integer("filesScanned"),
  servicesFound: integer("servicesFound"),
  errorMessage: text("errorMessage"),
});

/**
 * Detected Services table — stores the specific cloud services detected
 * in a repository by our analysis parsers.
 */
export const detectedServices = pgTable("detectedService", {
  id: uuid("id").defaultRandom().primaryKey(),
  scanId: uuid("scanId")
    .references(() => scans.id, { onDelete: "cascade" }),
  repositoryId: uuid("repositoryId")
    .notNull()
    .references(() => repositories.id, { onDelete: "cascade" }),
  serviceName: text("serviceName").notNull(),
  serviceCategory: text("serviceCategory")
    .$type<
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
      | "other"
    >()
    .notNull(),
  provider: text("provider").notNull(),
  confidenceScore: real("confidenceScore").notNull(),
  detectionSource: text("detectionSource")
    .$type<"dependency" | "config" | "import" | "envVar" | "cicd">()
    .notNull(),
  evidenceFile: text("evidenceFile"),
  evidenceLine: integer("evidenceLine"),
  evidenceSnippet: text("evidenceSnippet"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

// ============================================================
// Alerts Table
// ============================================================

/**
 * Alerts table — stores smart notifications generated by
 * background jobs (inactivity, expiry, outage, security, cost).
 */
export const alerts = pgTable("alert", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  repositoryId: uuid("repositoryId")
    .references(() => repositories.id, { onDelete: "cascade" }),
  serviceId: uuid("serviceId")
    .references(() => detectedServices.id, { onDelete: "set null" }),
  type: text("type")
    .$type<"expiry" | "inactivity" | "outage" | "security" | "cost">()
    .notNull(),
  severity: text("severity")
    .$type<"info" | "warning" | "critical">()
    .notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  status: text("status")
    .$type<"active" | "dismissed" | "snoozed" | "resolved">()
    .default("active")
    .notNull(),
  snoozedUntil: timestamp("snoozedUntil", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});
