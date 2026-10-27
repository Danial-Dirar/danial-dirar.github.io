"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/shared/post-card";
import { Reveal } from "@/components/motion/reveal";
import type { PostMeta } from "@/lib/posts";

type FeedProps = { posts: PostMeta[]; tags: string[] };

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

/** The feed for a given tag. Also the static fallback, before params are read. */
export function BlogFeedView({ posts, tags, activeTag }: FeedProps & { activeTag: string | null }) {
  const visible = posts.filter((p) => !activeTag || p.tags.includes(activeTag));

  return (
    <>
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

      <div className="mt-8 grid gap-4">
        {visible.map((post, i) => (
          <Reveal key={post.slug} delay={Math.min(i, 5) * 0.05}>
            <PostCard post={post} />
          </Reveal>
        ))}
        {visible.length === 0 && (
          <p className="font-mono text-sm text-muted-foreground">
            — no posts{activeTag ? ` tagged #${activeTag}` : ""} yet —
          </p>
        )}
      </div>
    </>
  );
}
