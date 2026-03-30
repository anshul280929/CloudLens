import { Octokit } from "octokit";

export function createGitHubClient(accessToken: string) {
  return new Octokit({ auth: accessToken });
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

export interface GitHubTreeItem {
  path: string;
  type: string;
  sha: string;
  size?: number;
}

/**
 * Fetch all repositories for the authenticated user
 */
export async function fetchUserRepos(
  octokit: Octokit,
  perPage = 100
): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;

  while (true) {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: perPage,
      page,
      sort: "pushed",
      direction: "desc",
    });

    if (data.length === 0) break;

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

    // Safety limit: max 5 pages (500 repos)
    if (page > 5) break;
  }

  return repos;
}

/**
 * Fetch the file tree for a repository (recursive)
 */
export async function fetchRepoTree(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string
): Promise<GitHubTreeItem[]> {
  try {
    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: "true",
    });

    return (data.tree || [])
      .filter((item) => item.type === "blob" && item.path)
      .map((item) => ({
        path: item.path!,
        type: item.type!,
        sha: item.sha!,
        size: item.size,
      }));
  } catch (error: any) {
    // Empty repo or access denied
    if (error.status === 404 || error.status === 409) {
      return [];
    }
    throw error;
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
  branch?: string
): Promise<string | null> {
  try {
    const params: any = { owner, repo, path };
    if (branch) params.ref = branch;

    const { data } = await octokit.rest.repos.getContent(params);

    if ("content" in data && data.encoding === "base64") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return null;
  } catch (error: any) {
    // File not found or too large
    if (error.status === 404 || error.status === 403) {
      return null;
    }
    throw error;
  }
}

/**
 * Rate limit aware wrapper - checks remaining rate limit
 */
export async function checkRateLimit(octokit: Octokit) {
  const { data } = await octokit.rest.rateLimit.get();
  return {
    remaining: data.rate.remaining,
    limit: data.rate.limit,
    resetAt: new Date(data.rate.reset * 1000),
  };
}
