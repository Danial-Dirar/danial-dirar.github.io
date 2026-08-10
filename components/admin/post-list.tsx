"use client";

import { useState } from "react";
import { commitFiles } from "@/lib/admin/github";
import { formatDate } from "@/lib/posts";
import type { RepoTarget } from "@/lib/admin/vault";
import type { ManagedPost } from "@/components/admin/admin-app";

/** Published posts, with edit and delete. */
export function PostList({
  token,
  target,
  posts,
  editingSlug,
  onEdit,
  onChanged,
}: {
  token: string;
  target: RepoTarget;
  posts: ManagedPost[];
  editingSlug?: string;
  onEdit: (post: ManagedPost) => void;
  onChanged: () => void;
}) {
  const [busySlug, setBusySlug] = useState("");
  const [error, setError] = useState("");

  async function handleDelete(post: ManagedPost) {
    if (
      !confirm(
        `Delete "${post.draft.title || post.slug}"? This commits the removal.`,
      )
    ) {
      return;
    }
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
              className={`flex items-center justify-between gap-4 rounded-lg border px-3 py-2 ${
                editingSlug === post.slug
                  ? "border-primary/50 bg-primary/5"
                  : "border-border/60"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-[14px]">
                  {post.draft.title || post.slug}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  {post.draft.date ? formatDate(post.draft.date) : "—"} ·{" "}
                  {post.slug}
                  {post.draft.tags.length > 0 &&
                    ` · ${post.draft.tags.map((t) => `#${t}`).join(" ")}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => onEdit(post)}
                  className="font-mono text-[11px] text-muted-foreground hover:text-primary"
                >
                  edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(post)}
                  disabled={busySlug === post.slug}
                  className="font-mono text-[11px] text-muted-foreground hover:text-destructive disabled:opacity-50"
                >
                  {busySlug === post.slug ? "deleting…" : "delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
