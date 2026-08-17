"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RepoCard } from "@/components/RepoCard";
import { SkeletonRepoCard } from "@/components/SkeletonRepoCard";
import { syncRepositories, scanRepositoryAction } from "@/app/actions";

interface Repository {
  id: string;
  name: string;
  fullName: string;
  owner: string;
  isPrivate: boolean;
  language: string | null;
  scanStatus: "pending" | "scanning" | "complete" | "failed";
  lastScannedAt: Date | null;
  lastCommitAt: Date | null;
  description: string | null;
  htmlUrl: string;
}

interface RepositoryListProps {
  initialRepos: Repository[];
}

function Select({
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative flex items-center bg-surface-1 border border-[rgba(178,182,189,0.1)] rounded-md h-10 transition-all duration-150 focus-within:border-accent-blue focus-within:shadow-[0_0_0_1px_var(--accent-blue)] min-w-[150px]">
      <select
        className={
          "bg-transparent border-none outline-none text-ink text-[14px] font-medium pl-[14px] pr-8 cursor-pointer appearance-none w-full h-full " +
          className
        }
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-3.5 pointer-events-none text-ink-subtle flex items-center">
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function formatTimeAgo(dateInput: Date | string | null): string {
  if (!dateInput) return "Never scanned";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export function RepositoryList({ initialRepos }: RepositoryListProps) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [languageFilter, setLanguageFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("lastCommit");

  // Track which repos are currently being scanned (optimistic UI)
  const [scanningRepos, setScanningRepos] = React.useState<Set<string>>(
    new Set()
  );

  // Get unique languages for filter dropdown
  const uniqueLanguages = React.useMemo(() => {
    const langs = new Set<string>();
    initialRepos.forEach((repo) => {
      if (repo.language) langs.add(repo.language);
    });
    return Array.from(langs).sort();
  }, [initialRepos]);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await syncRepositories();
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to sync repositories. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Trigger a scan for a single repository.
   * Optimistically sets the badge to "Scanning" with pulse,
   * then refreshes the page data when the scan completes.
   */
  const handleScan = async (repoId: string) => {
    // Optimistic: immediately show as scanning
    setScanningRepos((prev) => new Set(prev).add(repoId));

    try {
      const result = await scanRepositoryAction(repoId);
      // Refresh server data to pick up new scan status + service counts
      router.refresh();
    } catch (err) {
      console.error("Scan failed:", err);
      // Refresh anyway so the UI picks up the "failed" status from the DB
      router.refresh();
    } finally {
      setScanningRepos((prev) => {
        const next = new Set(prev);
        next.delete(repoId);
        return next;
      });
    }
  };

  // Filter and sort repositories
  const filteredRepos = React.useMemo(() => {
    let result = [...initialRepos];

    // Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (repo) =>
          repo.name.toLowerCase().includes(q) ||
          (repo.description && repo.description.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((repo) => {
        if (statusFilter === "never-scanned") {
          return repo.scanStatus === "pending";
        }
        return repo.scanStatus === statusFilter;
      });
    }

    // Language filter
    if (languageFilter !== "all") {
      result = result.filter((repo) => repo.language === languageFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      // default: lastCommit
      const timeA = a.lastCommitAt ? new Date(a.lastCommitAt).getTime() : 0;
      const timeB = b.lastCommitAt ? new Date(b.lastCommitAt).getTime() : 0;
      return timeB - timeA;
    });

    return result;
  }, [initialRepos, searchQuery, statusFilter, languageFilter, sortBy]);

  /**
   * Compute the effective scan status for a repo, taking into
   * account the optimistic `scanningRepos` set.
   */
  const getEffectiveStatus = (
    repo: Repository
  ): "complete" | "scanning" | "failed" | "never-scanned" => {
    if (scanningRepos.has(repo.id)) return "scanning";
    if (repo.scanStatus === "pending") return "never-scanned";
    return repo.scanStatus;
  };

  return (
    <div className="space-y-6">
      {/* Search and filter toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-1/40 p-4 rounded-lg border border-[rgba(178,182,189,0.1)]">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-xs"
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="never-scanned">Never Scanned</option>
            <option value="scanning">Scanning</option>
            <option value="complete">Scanned</option>
            <option value="failed">Failed</option>
          </Select>

          <Select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
          >
            <option value="all">All Languages</option>
            {uniqueLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="lastCommit">Sort by Recent Commit</option>
            <option value="name">Sort by Name</option>
          </Select>

          <Button
            variant="primary"
            onClick={handleSync}
            loading={isSyncing}
            disabled={isSyncing}
          >
            Sync Repos
          </Button>
        </div>
      </div>

      {/* Repositories grid */}
      {isSyncing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonRepoCard key={idx} />
          ))}
        </div>
      ) : filteredRepos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map((repo) => {
            const effectiveStatus = getEffectiveStatus(repo);
            const isCurrentlyScanning = effectiveStatus === "scanning";

            return (
              <div key={repo.id} className="relative group">
                <RepoCard
                  name={repo.name}
                  owner={repo.owner}
                  status={effectiveStatus}
                  // Services populated from detected services (future: pass real data)
                  services={[]}
                  serviceCount={0}
                  updatedAt={
                    isCurrentlyScanning
                      ? "Scanning…"
                      : formatTimeAgo(repo.lastScannedAt)
                  }
                  onViewClick={() => {
                    if (!isCurrentlyScanning) {
                      router.push(`/dashboard/repositories/${repo.id}`);
                    }
                  }}
                />

                {/* Scan Now button — shown when not currently scanning */}
                {!isCurrentlyScanning && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScan(repo.id);
                      }}
                    >
                      {repo.scanStatus === "complete" ? "Re-scan" : "Scan Now"}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center border border-dashed border-hairline rounded-lg p-12 text-center bg-surface-1/10">
          <div className="w-12 h-12 rounded-full bg-surface-2 border border-[rgba(178,182,189,0.1)] flex items-center justify-center mb-4 text-ink-subtle">
            <svg
              width="22"
              height="20"
              viewBox="0 0 22 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 5H3C1.89543 5 1 5.89543 1 7V17C1 18.1046 1.89543 19 3 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1 11H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 1H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-subhead text-ink mb-2">
            No Repositories Connected
          </h3>
          <p className="text-body-sm text-ink-subtle max-w-sm mb-6">
            {searchQuery || statusFilter !== "all" || languageFilter !== "all"
              ? "No repositories match your active search filters. Try clearing them to see all repos."
              : "Sync your GitHub profile to load public and private repositories, and begin scanning for cloud services."}
          </p>
          {!(searchQuery || statusFilter !== "all" || languageFilter !== "all") && (
            <Button variant="primary" onClick={handleSync} loading={isSyncing}>
              Sync Repositories
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

