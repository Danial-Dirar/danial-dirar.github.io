/**
 * Minimal GitHub client for publishing from the browser.
 *
 * Uses the Git Data API rather than the Contents API: the Contents API writes
 * one file per call, so a post with two images would land as three commits and
 * kick off three Pages rebuilds. Building a tree lets a post and all of its
 * images go in as one commit, one rebuild.
 */

import type { RepoTarget } from "./vault";

const API = "https://api.github.com";

export type BlogFileEntry = { slug: string; path: string };

/** A file to write in the next commit. `content` is raw text or base64 bytes. */
export type PendingFile =
  | { path: string; encoding: "utf-8"; content: string }
  | { path: string; encoding: "base64"; content: string };

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

async function request<T>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const detail = await res
      .json()
      .then((body: { message?: string }) => body.message)
      .catch(() => undefined);
    throw new GitHubError(
      detail || `GitHub returned ${res.status}.`,
      res.status,
    );
  }
  return res.json() as Promise<T>;
}

/** Verify the token works and has push rights before we ask for a password. */
export async function checkAccess(
  token: string,
  target: RepoTarget,
): Promise<void> {
  const repo = await request<{ permissions?: { push?: boolean } }>(
    token,
    `/repos/${target.owner}/${target.repo}`,
  );
  if (!repo.permissions?.push) {
    throw new Error(
      "That token can read the repo but not write to it. Give it Contents: Read and write.",
    );
  }
}

export async function listPosts(
  token: string,
  target: RepoTarget,
): Promise<BlogFileEntry[]> {
  let entries: { name: string; path: string; type: string }[];
  try {
    entries = await request(
      token,
      `/repos/${target.owner}/${target.repo}/contents/content/blog?ref=${target.branch}`,
    );
  } catch (err) {
    // An empty blog directory does not exist in git; treat that as no posts.
    if (err instanceof GitHubError && err.status === 404) return [];
    throw err;
  }
  return entries
    .filter((e) => e.type === "file" && /\.mdx?$/.test(e.name))
    .map((e) => ({ slug: e.name.replace(/\.mdx?$/, ""), path: e.path }))
    .sort((a, b) => b.slug.localeCompare(a.slug));
}

type TreeEntry = {
  path: string;
  mode: "100644";
  type: "blob";
  sha: string | null;
};

/**
 * Commit `files` (and delete `deletions`) as a single commit on the target
 * branch. Returns the new commit SHA.
 */
export async function commitFiles(
  token: string,
  target: RepoTarget,
  message: string,
  files: PendingFile[],
  deletions: string[] = [],
): Promise<string> {
  const base = `/repos/${target.owner}/${target.repo}/git`;

  const ref = await request<{ object: { sha: string } }>(
    token,
    `${base}/ref/heads/${target.branch}`,
  );
  const headSha = ref.object.sha;

  const headCommit = await request<{ tree: { sha: string } }>(
    token,
    `${base}/commits/${headSha}`,
  );

  const blobs = await Promise.all(
    files.map(async (file) => {
      const blob = await request<{ sha: string }>(token, `${base}/blobs`, {
        method: "POST",
        body: JSON.stringify({
          content: file.content,
          encoding: file.encoding,
        }),
      });
      return { path: file.path, sha: blob.sha };
    }),
  );

  const tree: TreeEntry[] = [
    ...blobs.map(({ path, sha }) => ({
      path,
      mode: "100644" as const,
      type: "blob" as const,
      sha,
    })),
    // A null sha removes the path from the tree.
    ...deletions.map((path) => ({
      path,
      mode: "100644" as const,
      type: "blob" as const,
      sha: null,
    })),
  ];

  const newTree = await request<{ sha: string }>(token, `${base}/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: headCommit.tree.sha, tree }),
  });

  const commit = await request<{ sha: string }>(token, `${base}/commits`, {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: newTree.sha,
      parents: [headSha],
    }),
  });

  await request(token, `${base}/refs/heads/${target.branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });

  return commit.sha;
}
