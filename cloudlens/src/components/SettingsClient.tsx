"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ── Toggle switch component ── */
interface ToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function Toggle({ id, label, description, checked, onChange, disabled = false }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <label
          htmlFor={id}
          className={cn(
            "text-body-sm font-medium cursor-pointer",
            disabled ? "text-ink-subtle" : "text-ink",
          )}
        >
          {label}
        </label>
        {description && (
          <p className="text-caption text-ink-subtle mt-0.5">{description}</p>
        )}
      </div>
      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-accent-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas outline-none",
          checked ? "bg-accent-blue" : "bg-surface-3",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-out",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}

/* ── Props ── */
interface SettingsClientProps {
  userName: string | null | undefined;
  userEmail: string | null | undefined;
  userImage: string | null | undefined;
}

export function SettingsClient({
  userName,
  userEmail,
  userImage,
}: SettingsClientProps) {
  // Placeholder notification preferences
  const [emailDigest, setEmailDigest] = React.useState(true);
  const [scanAlerts, setScanAlerts] = React.useState(true);
  const [outageAlerts, setOutageAlerts] = React.useState(false);
  const [securityAlerts, setSecurityAlerts] = React.useState(true);

  // Danger-zone confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  return (
    <div className="space-y-8 max-w-3xl">
      {/* ── Profile Section ── */}
      <section className="rounded-lg border border-[rgba(178,182,189,0.1)] bg-surface-1 p-6">
        <h2 className="text-subhead text-ink mb-5">Profile</h2>
        <div className="flex items-start gap-5">
          {/* Avatar */}
          {userImage ? (
            <img
              src={userImage}
              alt={userName ?? "User avatar"}
              className="w-16 h-16 rounded-full border-2 border-[rgba(178,182,189,0.1)] shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-surface-2 border-2 border-[rgba(178,182,189,0.1)] flex items-center justify-center text-ink-subtle shrink-0">
              <svg width="24" height="24" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M8 2a3 3 0 100 6 3 3 0 000-6zM3 13a5 5 0 0110 0"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          {/* Info fields */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-medium text-ink-subtle uppercase tracking-wider">
                  Username
                </label>
                <p className="text-body-sm text-ink mt-1">{userName ?? "—"}</p>
              </div>
              <div>
                <label className="text-[11px] font-medium text-ink-subtle uppercase tracking-wider">
                  Email
                </label>
                <p className="text-body-sm text-ink mt-1">{userEmail ?? "—"}</p>
              </div>
            </div>
            <p className="text-caption text-ink-subtle">
              Profile details are synced from your GitHub account and cannot be edited here.
            </p>
          </div>
        </div>
      </section>

      {/* ── Connected Accounts ── */}
      <section className="rounded-lg border border-[rgba(178,182,189,0.1)] bg-surface-1 p-6">
        <h2 className="text-subhead text-ink mb-5">Connected Accounts</h2>
        <div className="flex items-center justify-between py-3 border-b border-[rgba(178,182,189,0.06)] last:border-b-0">
          <div className="flex items-center gap-3">
            {/* GitHub icon */}
            <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center text-ink">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M8 1C4.13 1 1 4.13 1 8c0 3.1 2.01 5.73 4.79 6.65.35.06.48-.15.48-.34 0-.17-.01-.71-.01-1.29-1.75.32-2.2-.43-2.34-.82-.08-.2-.42-.82-.71-.98-.24-.13-.59-.46-.01-.47.55-.01.94.51 1.07.71.63 1.05 1.63.76 2.03.58.06-.46.24-.76.44-.93-1.55-.18-3.17-.78-3.17-3.46 0-.76.27-1.39.71-1.88-.07-.18-.31-.89.07-1.85 0 0 .58-.19 1.9.71a6.5 6.5 0 013.44 0c1.32-.9 1.9-.71 1.9-.71.38.96.14 1.67.07 1.85.44.49.71 1.11.71 1.88 0 2.69-1.63 3.28-3.18 3.45.25.22.47.64.47 1.29 0 .93-.01 1.68-.01 1.91 0 .19.13.41.48.34A7.01 7.01 0 0015 8c0-3.87-3.13-7-7-7z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div>
              <p className="text-body-sm font-medium text-ink">GitHub</p>
              <p className="text-caption text-ink-subtle">
                Connected as <span className="font-medium text-ink-muted">{userName ?? "Unknown"}</span>
              </p>
            </div>
          </div>

          {/* Status + Disconnect */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-semantic-success">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Connected
            </span>
            <button
              onClick={() => {
                // Placeholder — actual disconnect logic in a future phase
                alert("Disconnect functionality will be available in a future update.");
              }}
              className="text-caption text-ink-subtle hover:text-semantic-error transition-colors duration-150 underline underline-offset-2"
            >
              Disconnect
            </button>
          </div>
        </div>
      </section>

      {/* ── Notification Preferences ── */}
      <section className="rounded-lg border border-[rgba(178,182,189,0.1)] bg-surface-1 p-6">
        <div className="mb-4">
          <h2 className="text-subhead text-ink">Notification Preferences</h2>
          <p className="text-caption text-ink-subtle mt-1">
            Configure how CloudLens notifies you. Email delivery will be enabled in Phase 6.
          </p>
        </div>

        <div className="divide-y divide-[rgba(178,182,189,0.06)]">
          <Toggle
            id="email-digest"
            label="Monthly Email Digest"
            description="Receive a summary of your cloud services, costs, and alerts on the 1st of each month."
            checked={emailDigest}
            onChange={setEmailDigest}
          />
          <Toggle
            id="scan-alerts"
            label="Scan Completion Alerts"
            description="Get notified when a repository scan completes or fails."
            checked={scanAlerts}
            onChange={setScanAlerts}
          />
          <Toggle
            id="outage-alerts"
            label="Service Outage Alerts"
            description="Receive alerts when a cloud provider you use reports an outage."
            checked={outageAlerts}
            onChange={setOutageAlerts}
          />
          <Toggle
            id="security-alerts"
            label="Security Findings"
            description="Get alerted about exposed API keys, credentials, or security risks detected in your repos."
            checked={securityAlerts}
            onChange={setSecurityAlerts}
          />
        </div>
      </section>

      {/* ── Danger Zone ── */}
      <section className="rounded-lg border border-[rgba(230,43,30,0.2)] bg-[rgba(230,43,30,0.03)] p-6">
        <h2 className="text-subhead text-semantic-error mb-2">Danger Zone</h2>
        <p className="text-body-sm text-ink-muted mb-5">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-[14px] font-semibold text-semantic-error bg-[rgba(230,43,30,0.09)] border border-[rgba(230,43,30,0.2)] hover:bg-[rgba(230,43,30,0.15)] transition-colors duration-150 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 10a1 1 0 001 1h6a1 1 0 001-1l1-10"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Delete Account
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-body-sm text-semantic-error font-medium">
              Are you sure? This is irreversible.
            </p>
            <button
              onClick={() => {
                // Placeholder — actual delete logic in a future phase
                alert("Account deletion will be implemented in a future update.");
                setShowDeleteConfirm(false);
              }}
              className="inline-flex items-center px-4 py-2 rounded-md text-[13px] font-semibold text-white bg-semantic-error hover:opacity-90 transition-opacity duration-150 cursor-pointer"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="inline-flex items-center px-4 py-2 rounded-md text-[13px] font-semibold text-ink-muted bg-surface-2 hover:bg-surface-3 transition-colors duration-150 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
