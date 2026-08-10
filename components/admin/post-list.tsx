"use client";

import { useState } from "react";
import { commitFiles, type BlogFileEntry } from "@/lib/admin/github";
import type { RepoTarget } from "@/lib/admin/vault";

/** Published posts, with delete. Editing is deliberately not offered — delete
 * and repost covers it, and an editor would need the raw file fetched back. */
export function PostList({
  token,
  target,
  posts,
  onChanged,
}: {
  token: string;
  target: RepoTarget;
  posts: BlogFileEntry[];
  onChanged: () => void;
}) {
  const [busySlug, setBusySlug] = useState("");
  const [error, setError] = useState("");

  async function handleDelete(post: BlogFileEntry) {
    if (!confirm(`Delete "${post.slug}"? This commits the removal.`)) return;
    setError("");
    setBusySlug(post.slug);
    try {
      await commitFiles(
        token,
        target,
        `blog: remove ${post.slug}`,
        [],
        [post.path],
      );
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusySlug("");
    }
  }

  return (
    <div className="mt-12">
      <h2 className="font-mono text-[13px] text-muted-foreground">
        published ({posts.length})
      </h2>

      {error && (
        <p className="mt-2 font-mono text-[13px] text-destructive">{error}</p>
      )}

      {posts.length === 0 ? (
        <p className="mt-3 font-mono text-[13px] text-muted-foreground">
          Nothing published yet.
        </p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="flex items-center justify-between gap-4 rounded-lg border border-border/60 px-3 py-2"
            >
              <span className="truncate font-mono text-[13px]">{post.slug}</span>
              <button
                type="button"
                onClick={() => handleDelete(post)}
                disabled={busySlug === post.slug}
                className="shrink-0 font-mono text-[11px] text-muted-foreground hover:text-destructive disabled:opacity-50"
              >
                {busySlug === post.slug ? "deleting…" : "delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
