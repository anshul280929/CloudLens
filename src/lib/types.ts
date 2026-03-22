// ============ Core Types ============

export type ServiceCategory =
  | "database"
  | "auth"
  | "hosting"
  | "storage"
  | "email"
  | "payments"
  | "analytics"
  | "cdn"
  | "monitoring"
  | "ai"
  | "other";

export type ServiceStatus = "operational" | "degraded" | "partial_outage" | "major_outage";
export type DetectionConfidence = "high" | "medium" | "low";
export type AlertSeverity = "info" | "warning" | "critical";
export type AlertType =
  | "expiry_warning"
  | "inactivity"
  | "quota_limit"
  | "cost_spike"
  | "outage"
  | "security"
  | "ai_suggestion";

export interface Service {
  id: string;
  name: string;
  slug: string;
  category: ServiceCategory;
  logoUrl: string;
  websiteUrl: string;
  dashboardUrl: string;
  statusPageUrl: string;
  color: string;
  status: ServiceStatus;
  freeTierLimits?: Record<string, string>;
  pricingTiers?: { name: string; price: number }[];
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  isPrivate: boolean;
  lastCommitAt: string;
  lastScannedAt: string | null;
  scanStatus: "pending" | "scanning" | "completed" | "failed";
  language: string;
  stars: number;
  detectedServices: DetectedService[];
}

export interface DetectedService {
  id: string;
  service: Service;
  confidence: number; // 0-1
  detectionDetails: DetectionDetail[];
  firstDetectedAt: string;
  lastSeenAt: string;
}

export interface DetectionDetail {
  rule: string;
  match: string;
  file: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  actionUrl: string;
  serviceName: string;
  serviceIcon: string;
  repoName?: string;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
}

export interface CostEstimate {
  serviceId: string;
  serviceName: string;
  serviceIcon: string;
  estimatedTier: string;
  estimatedMonthlyCost: number;
  repos: string[];
}

export interface DashboardStats {
  totalRepos: number;
  totalServices: number;
  activeAlerts: number;
  estimatedMonthlyCost: number;
  servicesPerCategory: Record<ServiceCategory, number>;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  plan: "free" | "pro" | "team";
}
