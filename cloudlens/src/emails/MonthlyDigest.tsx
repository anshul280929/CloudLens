import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Hr,
  Button,
  Link,
  Preview,
  Tailwind,
} from "react-email";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ServiceDigestItem {
  serviceName: string;
  provider: string;
  category: string;
  confidenceScore: number;
}

export interface AlertDigestItem {
  title: string;
  severity: "info" | "warning" | "critical";
  type: string;
}

export interface MonthlyDigestProps {
  /** User's display name */
  userName: string;
  /** User's email */
  userEmail: string;
  /** Month label, e.g. "August 2026" */
  monthLabel: string;
  /** Total active detected services */
  totalServices: number;
  /** Total repositories scanned */
  totalRepositories: number;
  /** Active alerts count */
  activeAlerts: number;
  /** Services detected in the last 30 days (new detections) */
  newDetections: ServiceDigestItem[];
  /** Services with active warning/critical alerts */
  servicesNeedingAttention: AlertDigestItem[];
  /** Base URL for links */
  baseUrl?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEVERITY_COLOR: Record<"info" | "warning" | "critical", string> = {
  critical: "#e62b1e",
  warning: "#eab308",
  info: "#2563eb",
};

const SEVERITY_BG: Record<"info" | "warning" | "critical", string> = {
  critical: "#fef2f1",
  warning: "#fefce8",
  info: "#eff6ff",
};

// ---------------------------------------------------------------------------
// Email template
// ---------------------------------------------------------------------------

export function MonthlyDigest({
  userName,
  userEmail,
  monthLabel,
  totalServices,
  totalRepositories,
  activeAlerts,
  newDetections,
  servicesNeedingAttention,
  baseUrl = "https://cloudlens.dev",
}: MonthlyDigestProps) {
  const previewText = `Your CloudLens digest for ${monthLabel} — ${totalServices} active services across ${totalRepositories} repositories.`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#0e1117] font-sans m-0 p-0">
          <Container className="max-w-[600px] mx-auto py-10 px-4">

            {/* ── Header ── */}
            <Section className="mb-8">
              <Row>
                <Column>
                  <Heading
                    as="h1"
                    className="text-[24px] font-bold text-white m-0 leading-tight"
                  >
                    ☁️ CloudLens
                  </Heading>
                  <Text className="text-[14px] text-[#8b949e] m-0 mt-1">
                    Monthly Digest · {monthLabel}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Hr className="border-[#21262d] my-6" />

            {/* ── Greeting ── */}
            <Section className="mb-6">
              <Text className="text-[16px] text-[#c9d1d9] m-0 leading-relaxed">
                Hi {userName || "there"},
              </Text>
              <Text className="text-[16px] text-[#c9d1d9] m-0 mt-3 leading-relaxed">
                Here's your cloud infrastructure summary for{" "}
                <strong className="text-white">{monthLabel}</strong>.
              </Text>
            </Section>

            {/* ── Stats cards ── */}
            <Section className="mb-8">
              <Row>
                <Column className="w-[33%] pr-2">
                  <div
                    style={{
                      background: "#161b22",
                      border: "1px solid #21262d",
                      borderRadius: "8px",
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        color: "#2563eb",
                        margin: "0",
                        lineHeight: "1",
                      }}
                    >
                      {totalServices}
                    </Text>
                    <Text
                      style={{
                        fontSize: "12px",
                        color: "#8b949e",
                        margin: "4px 0 0",
                      }}
                    >
                      Active Services
                    </Text>
                  </div>
                </Column>
                <Column className="w-[33%] px-1">
                  <div
                    style={{
                      background: "#161b22",
                      border: "1px solid #21262d",
                      borderRadius: "8px",
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        color: "#e6edf3",
                        margin: "0",
                        lineHeight: "1",
                      }}
                    >
                      {totalRepositories}
                    </Text>
                    <Text
                      style={{
                        fontSize: "12px",
                        color: "#8b949e",
                        margin: "4px 0 0",
                      }}
                    >
                      Repositories
                    </Text>
                  </div>
                </Column>
                <Column className="w-[33%] pl-2">
                  <div
                    style={{
                      background: "#161b22",
                      border: activeAlerts > 0 ? "1px solid #e62b1e40" : "1px solid #21262d",
                      borderRadius: "8px",
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        color: activeAlerts > 0 ? "#e62b1e" : "#e6edf3",
                        margin: "0",
                        lineHeight: "1",
                      }}
                    >
                      {activeAlerts}
                    </Text>
                    <Text
                      style={{
                        fontSize: "12px",
                        color: "#8b949e",
                        margin: "4px 0 0",
                      }}
                    >
                      Active Alerts
                    </Text>
                  </div>
                </Column>
              </Row>
            </Section>

            {/* ── Services Needing Attention ── */}
            {servicesNeedingAttention.length > 0 && (
              <Section className="mb-8">
                <Heading
                  as="h2"
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#e6edf3",
                    margin: "0 0 12px",
                    borderBottom: "1px solid #21262d",
                    paddingBottom: "8px",
                  }}
                >
                  ⚠️ Needs Attention
                </Heading>
                {servicesNeedingAttention.slice(0, 5).map((alert, i) => (
                  <div
                    key={i}
                    style={{
                      background: SEVERITY_BG[alert.severity],
                      border: `1px solid ${SEVERITY_COLOR[alert.severity]}33`,
                      borderLeft: `3px solid ${SEVERITY_COLOR[alert.severity]}`,
                      borderRadius: "6px",
                      padding: "10px 14px",
                      marginBottom: "8px",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1c2026",
                        margin: "0",
                      }}
                    >
                      {alert.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: "11px",
                        color: SEVERITY_COLOR[alert.severity],
                        margin: "2px 0 0",
                        textTransform: "uppercase",
                        fontWeight: "600",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {alert.severity} · {alert.type}
                    </Text>
                  </div>
                ))}
                {servicesNeedingAttention.length > 5 && (
                  <Text
                    style={{
                      fontSize: "13px",
                      color: "#8b949e",
                      margin: "4px 0 0",
                    }}
                  >
                    +{servicesNeedingAttention.length - 5} more alerts
                  </Text>
                )}
              </Section>
            )}

            {/* ── New Detections ── */}
            {newDetections.length > 0 && (
              <Section className="mb-8">
                <Heading
                  as="h2"
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#e6edf3",
                    margin: "0 0 12px",
                    borderBottom: "1px solid #21262d",
                    paddingBottom: "8px",
                  }}
                >
                  🆕 New Detections This Month
                </Heading>
                {newDetections.slice(0, 8).map((svc, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#161b22",
                      border: "1px solid #21262d",
                      borderRadius: "6px",
                      padding: "10px 14px",
                      marginBottom: "6px",
                      display: "flex",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#e6edf3",
                        margin: "0",
                        flex: "1",
                      }}
                    >
                      {svc.serviceName}
                      <span
                        style={{
                          fontWeight: "400",
                          color: "#8b949e",
                          marginLeft: "6px",
                        }}
                      >
                        · {svc.provider}
                      </span>
                    </Text>
                    <Text
                      style={{
                        fontSize: "11px",
                        color: "#8b949e",
                        margin: "0",
                        textTransform: "capitalize",
                      }}
                    >
                      {svc.category}
                    </Text>
                  </div>
                ))}
                {newDetections.length > 8 && (
                  <Text
                    style={{ fontSize: "13px", color: "#8b949e", margin: "4px 0 0" }}
                  >
                    +{newDetections.length - 8} more detected
                  </Text>
                )}
              </Section>
            )}

            {/* ── Empty state ── */}
            {servicesNeedingAttention.length === 0 && newDetections.length === 0 && (
              <Section className="mb-8">
                <div
                  style={{
                    background: "#161b22",
                    border: "1px solid #21262d",
                    borderRadius: "8px",
                    padding: "24px",
                    textAlign: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "24px",
                      margin: "0 0 8px",
                    }}
                  >
                    ✅
                  </Text>
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#8b949e",
                      margin: "0",
                    }}
                  >
                    Everything looks good! No new detections or alerts this month.
                  </Text>
                </div>
              </Section>
            )}

            {/* ── CTA ── */}
            <Section className="mb-8 text-center">
              <Button
                href={`${baseUrl}/dashboard`}
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  padding: "12px 28px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Open CloudLens Dashboard →
              </Button>
            </Section>

            <Hr className="border-[#21262d] my-6" />

            {/* ── Footer ── */}
            <Section>
              <Text
                style={{
                  fontSize: "12px",
                  color: "#8b949e",
                  margin: "0",
                  lineHeight: "1.6",
                  textAlign: "center",
                }}
              >
                You're receiving this because notifications are enabled for{" "}
                <strong>{userEmail}</strong>.
                <br />
                <Link
                  href={`${baseUrl}/dashboard/settings`}
                  style={{ color: "#2563eb" }}
                >
                  Manage notification settings
                </Link>{" "}
                ·{" "}
                <Link
                  href={`${baseUrl}/dashboard/settings`}
                  style={{ color: "#8b949e" }}
                >
                  Unsubscribe
                </Link>
              </Text>
              <Text
                style={{
                  fontSize: "11px",
                  color: "#484f58",
                  margin: "12px 0 0",
                  textAlign: "center",
                }}
              >
                CloudLens · Intelligent Cloud Service Visibility
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

// Default props for preview
MonthlyDigest.PreviewProps = {
  userName: "Anshul",
  userEmail: "anshul@example.com",
  monthLabel: "August 2026",
  totalServices: 12,
  totalRepositories: 5,
  activeAlerts: 3,
  newDetections: [
    { serviceName: "Neon", provider: "Neon", category: "database", confidenceScore: 0.95 },
    { serviceName: "Vercel", provider: "Vercel", category: "hosting", confidenceScore: 0.98 },
    { serviceName: "Stripe", provider: "Stripe", category: "payments", confidenceScore: 0.92 },
  ],
  servicesNeedingAttention: [
    { title: "my-api has been inactive for 45 days", severity: "warning", type: "inactivity" },
    { title: "Vercel service disruption", severity: "critical", type: "outage" },
  ],
} satisfies MonthlyDigestProps;
