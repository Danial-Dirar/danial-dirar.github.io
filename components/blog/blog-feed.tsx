"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { ActiveTagContext } from "@/components/blog/feed-post";
import type { PostMeta } from "@/lib/posts";

type FeedProps = { posts: PostMeta[]; tags: string[]; children: React.ReactNode };

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
}: FeedProps & { activeTag: string | null }) {
  const visible = posts.filter((p) => !activeTag || p.tags.includes(activeTag)).length;

  return (
    <ActiveTagContext.Provider value={activeTag}>
      {tags.length > 0 && (
        <Reveal delay={0.1}>
          <nav aria-label="Filter posts by tag" className="mt-6 flex flex-wrap gap-2">
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
        </Reveal>
      )}

      <div className="mt-8 grid max-w-2xl gap-5">
        {children}
        {visible === 0 && (
          <p className="font-mono text-sm text-muted-foreground">
            — no posts{activeTag ? ` tagged #${activeTag}` : ""} yet —
          </p>
        )}
      </div>
    </ActiveTagContext.Provider>
  );
}
