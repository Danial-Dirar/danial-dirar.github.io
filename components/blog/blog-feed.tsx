"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ActiveTagContext } from "@/components/blog/feed-post";
import type { PostMeta } from "@/lib/posts";

type FeedProps = {
  posts: PostMeta[];
  tags: string[];
  children: React.ReactNode;
  /** Left rail (author) and right rail (below the tags), shown on wide screens. */
  left?: React.ReactNode;
  right?: React.ReactNode;
};

const tagHref = (tag: string | null) =>
  tag ? `/blog?tag=${encodeURIComponent(tag)}` : "/blog";

/**
 * Tag filtering lives in the URL (`/blog?tag=…`), so a tag clicked on a post
 * page lands here already filtered and a filtered view can be shared. Read on
 * the client so the /blog page stays fully static for GitHub Pages.
 */
export function BlogFeed(props: FeedProps) {
  const activeTag = useSearchParams().get("tag");
  return <BlogFeedView {...props} activeTag={activeTag} />;
}

/**
 * The feed for a given tag. Also the static fallback, before params are read.
 * The posts arrive as server-rendered children; each one hides itself when it
 * doesn't carry the active tag.
 */
export function BlogFeedView({
  posts,
  tags,
  activeTag,
  children,
  left,
  right,
}: FeedProps & { activeTag: string | null }) {
  const visible = posts.filter((p) => !activeTag || p.tags.includes(activeTag)).length;
  const tagNav = (
          <nav aria-label="Filter posts by tag" className="flex flex-wrap gap-2">
            <Link href={tagHref(null)} replace scroll={false} aria-current={!activeTag ? "page" : undefined}>
              <Badge
                variant={activeTag ? "outline" : "default"}
                className="cursor-pointer font-mono text-[11px]"
              >
                all
              </Badge>
            </Link>
            {tags.map((t) => (
              <Link
                key={t}
                href={tagHref(activeTag === t ? null : t)}
                replace
                scroll={false}
                aria-current={activeTag === t ? "page" : undefined}
              >
                <Badge
                  variant={activeTag === t ? "default" : "outline"}
                  className="cursor-pointer font-mono text-[11px]"
                >
                  #{t}
                </Badge>
              </Link>
            ))}
          </nav>
  );

  return (
    <ActiveTagContext.Provider value={activeTag}>
      {/* Social-feed layout: author on the left, posts in the middle, topics
          on the right. Rails drop away on narrower screens. */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,44rem)_17rem] xl:justify-between">
        {left && <aside className="hidden lg:sticky lg:top-24 lg:block">{left}</aside>}

        <div className="min-w-0">
          {tags.length > 0 && <div className="mb-6 xl:hidden">{tagNav}</div>}
          <div className="grid gap-5">
            {children}
            {visible === 0 && (
              <p className="font-mono text-sm text-muted-foreground">
                — no posts{activeTag ? ` tagged #${activeTag}` : ""} yet —
              </p>
            )}
          </div>
        </div>

        <aside className="hidden space-y-5 xl:sticky xl:top-24 xl:block">
          {tags.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-card/60 p-4">
              <h2 className="mb-3 font-mono text-[12px] text-muted-foreground">
                <span className="text-primary">$ </span>ls topics/
              </h2>
              {tagNav}
            </div>
          )}
          {right}
        </aside>
      </div>
    </ActiveTagContext.Provider>
  );
}
