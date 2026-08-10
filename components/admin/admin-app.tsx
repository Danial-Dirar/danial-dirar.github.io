"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { SetupForm } from "@/components/admin/setup-form";
import { UnlockForm } from "@/components/admin/unlock-form";
import { Composer } from "@/components/admin/composer";
import { PostList } from "@/components/admin/post-list";
import {
  fetchFileText,
  listPosts,
  type BlogFileEntry,
} from "@/lib/admin/github";
import { parsePostFile, type PostDraft } from "@/lib/admin/post-file";
import {
  readVault,
  readVaultOnServer,
  subscribeToVault,
} from "@/lib/admin/vault";

/** Drop the in-memory token after this long without interaction. */
const IDLE_LOCK_MS = 15 * 60 * 1000;

/** A published post with its parsed fields, ready to list or load for editing. */
export type ManagedPost = BlogFileEntry & {
  draft: PostDraft & { date: string };
};

export function AdminApp() {
  // localStorage is an external store: subscribing to it keeps this in sync
  // across tabs, and the `undefined` server snapshot means neither form is
  // rendered into the static HTML before the real value is known.
  const vault = useSyncExternalStore(
    subscribeToVault,
    readVault,
    readVaultOnServer,
  );

  const [token, setToken] = useState("");
  const [posts, setPosts] = useState<ManagedPost[]>([]);
  const [editing, setEditing] = useState<ManagedPost | null>(null);
  const [notice, setNotice] = useState("");
  const [loadError, setLoadError] = useState("");

  // Loading is driven by events — unlocking, publishing, deleting — rather than
  // by an effect, so the token is passed in explicitly: the caller often has a
  // fresher one than the state it just set.
  const loadPosts = useCallback(
    async (activeToken: string) => {
      if (!vault) return;
      try {
        const entries = await listPosts(activeToken, vault);
        // One extra request per post to read its frontmatter. Fine for a
        // personal blog; revisit if the archive ever gets large.
        const next = await Promise.all(
          entries.map(async (entry) => ({
            ...entry,
            draft: parsePostFile(
              await fetchFileText(activeToken, vault, entry.path),
            ),
          })),
        );
        setPosts(next);
        setLoadError("");
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : "Could not load published posts.",
        );
      }
    },
    [vault],
  );

  // Auto-lock: any interaction restarts the timer; on expiry the token is gone
  // from memory and the password is needed again.
  useEffect(() => {
    if (!token) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setToken("");
        setNotice("Locked after 15 minutes of inactivity.");
      }, IDLE_LOCK_MS);
    };
    const events = ["pointerdown", "keydown", "focus"] as const;
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [token]);

  const heading = (
    <header>
      <h1 className="font-mono text-2xl font-semibold tracking-tight md:text-3xl">
        <span className="text-primary">$ </span>studio
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Write a post and publish it straight to the repo. The site rebuilds
        itself.
      </p>
    </header>
  );

  if (vault === undefined) return heading;

  if (vault === null) {
    return (
      <>
        {heading}
        <SetupForm
          onReady={(freshToken) => {
            setToken(freshToken);
            setNotice("");
            void loadPosts(freshToken);
          }}
        />
      </>
    );
  }

  if (!token) {
    return (
      <>
        {heading}
        {notice && (
          <p className="mt-4 font-mono text-[12px] text-muted-foreground">
            {notice}
          </p>
        )}
        <UnlockForm
          vault={vault}
          onUnlocked={(unlocked) => {
            setToken(unlocked);
            setNotice("");
            void loadPosts(unlocked);
          }}
          onForget={() => {
            setToken("");
            setPosts([]);
          }}
        />
      </>
    );
  }

  return (
    <>
      {heading}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setToken("");
            setNotice("Locked.");
          }}
          className="font-mono text-[12px] text-muted-foreground hover:text-primary"
        >
          lock
        </button>
        <span className="font-mono text-[11px] text-muted-foreground">
          {vault.owner}/{vault.repo}
        </span>
      </div>

      {notice && (
        <p className="mt-4 font-mono text-[12px] text-primary">{notice}</p>
      )}
      {loadError && (
        <p className="mt-4 font-mono text-[12px] text-destructive">{loadError}</p>
      )}

      <Composer
        // Remounting on slug change re-seeds the fields from the post being
        // edited without an effect that syncs props into state.
        key={editing?.slug ?? "new"}
        token={token}
        target={vault}
        existingSlugs={posts.map((p) => p.slug)}
        editing={
          editing
            ? { slug: editing.slug, path: editing.path, draft: editing.draft }
            : undefined
        }
        onPublished={(slug, wasEdit) => {
          setNotice(
            wasEdit
              ? `Updated /blog/${slug} — live in about a minute.`
              : `Published /blog/${slug} — live in about a minute.`,
          );
          setEditing(null);
          void loadPosts(token);
        }}
        onCancelEdit={() => setEditing(null)}
      />

      <PostList
        token={token}
        target={vault}
        posts={posts}
        editingSlug={editing?.slug}
        onEdit={(post) => {
          setEditing(post);
          setNotice("");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onChanged={() => {
          setEditing(null);
          void loadPosts(token);
        }}
      />
    </>
  );
}
