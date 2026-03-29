import { Octokit } from "octokit";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Get an authenticated Octokit instance for a user
 */
export async function getOctokit(userId: string): Promise<Octokit> {
  const account = await db
    .select({ accessToken: accounts.access_token })
    .from(accounts)
    .where(
      and(eq(accounts.userId, userId), eq(accounts.provider, "github"))
    )
    .limit(1);

  if (!account.length || !account[0].accessToken) {
    throw new Error("No GitHub access token found for user");
  }

  return new Octokit({ auth: account[0].accessToken });
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string | null;
}

/**
 * Fetch all repositories for the authenticated user
 */
export async function fetchUserRepos(octokit: Octokit): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "pushed",
      direction: "desc",
      per_page: perPage,
      page,
      type: "owner",
    });

    repos.push(
      ...data.map((r) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        private: r.private,
        default_branch: r.default_branch,
        language: r.language,
        stargazers_count: r.stargazers_count,
        pushed_at: r.pushed_at,
      }))
    );

    if (data.length < perPage) break;
    page++;

    // Safety limit: max 500 repos
    if (repos.length >= 500) break;
  }

  return repos;
}

export interface FileTreeItem {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

/**
 * Fetch the file tree for a repository
 */
export async function fetchRepoTree(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string = "main"
): Promise<FileTreeItem[]> {
  try {
    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: "true",
    });

    return data.tree
      .filter((item) => item.type === "blob" || item.type === "tree")
      .map((item) => ({
        path: item.path!,
        type: item.type as "blob" | "tree",
        size: item.size,
      }));
  } catch (error) {
    console.error(`Failed to fetch tree for ${owner}/${repo}:`, error);
    return [];
  }
}

/**
 * Fetch file content from a repository
 */
export async function fetchFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  branch: string = "main"
): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if ("content" in data && data.encoding === "base64") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return null;
  } catch {
    return null;
  }
}
