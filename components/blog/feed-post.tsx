"use client";

import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { asset } from "@/lib/asset";
import { founderPhoto } from "@/lib/data/founder";
import { formatDate, type PostMeta } from "@/lib/posts";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** The tag the feed is filtered to, if any — set by BlogFeed. */
export const ActiveTagContext = createContext<string | null>(null);

/** Collapsed body height: about eight lines of prose. */
const CLAMP_PX = 224;
/** Don't hide less than this — a "See more" for two lines is silly. */
const SLACK_PX = 56;

type Mode = "full" | "clamped" | "opening" | "open";

/**
 * One post in the feed, laid out like a social post: author, date, title,
 * the body clamped with "See more", then the post's image full width.
 *
 * The clamp is only applied once the script has measured that the body is
 * long enough, so without JavaScript every post simply shows in full.
 */
export function FeedPost({
  post,
  minutes,
  media,
  children,
}: {
  post: PostMeta;
  minutes: number;
  media?: { src: string; alt: string };
  children: React.ReactNode;
}) {
  const activeTag = useContext(ActiveTagContext);
  const [mode, setMode] = useState<Mode>("full");
  const [openHeight, setOpenHeight] = useState<number>();
  const [copied, setCopied] = useState(false);
  const inner = useRef<HTMLDivElement>(null);
  const bodyId = `post-body-${useId().replace(/[^\w-]/g, "")}`;

  // Measure the body (again whenever it resizes, e.g. as images load) and
  // clamp it only if it is clearly longer than the collapsed height.
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setMode((m) =>
        m === "open" || m === "opening" ? m : el.scrollHeight > CLAMP_PX + SLACK_PX ? "clamped" : "full",
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const expand = () => {
    const el = inner.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setMode("open");
    setOpenHeight(el.scrollHeight);
    setMode("opening");
  };

  const share = async () => {
    const url = `${window.location.origin}${asset(`/blog/${post.slug}`)}`;
    if (navigator.share) {
      await navigator.share({ title: post.title, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.assign(url);
    }
  };

  const hidden = Boolean(activeTag && !post.tags.includes(activeTag));
  const maxHeight = mode === "clamped" ? CLAMP_PX : mode === "opening" ? openHeight : undefined;

  return (
    <article
      hidden={hidden}
      data-post={post.slug}
      className="overflow-hidden rounded-xl border border-border/60 bg-card/60"
    >
      <header className="flex items-center gap-3 px-4 pt-4 md:px-5 md:pt-5">
        <span className="relative size-10 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
          <Image
            src={asset(founderPhoto.src)}
            alt=""
            fill
            sizes="40px"
            className="object-cover"
            style={{ objectPosition: "50% 45%" }}
          />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-semibold">
            {site.name} <span className="font-mono text-xs font-normal text-muted-foreground">@{site.handle}</span>
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            <time dateTime={post.date}>{formatDate(post.date)}</time> · {minutes} min read
          </p>
        </div>
      </header>

      <div className="px-4 pt-3 md:px-5">
        <h2 className="font-heading text-lg leading-snug font-semibold tracking-tight md:text-xl">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary">
            {post.title}
          </Link>
        </h2>

        <div
          id={bodyId}
          className={cn("feed-body relative", mode === "clamped" && "is-clamped")}
          style={{ maxHeight }}
          onTransitionEnd={(e) => {
            if (e.propertyName === "max-height" && mode === "opening") setMode("open");
          }}
        >
          <div ref={inner} className="prose-blog prose-feed">
            {children}
          </div>
        </div>

        {mode === "clamped" && (
          <button
            type="button"
            onClick={expand}
            aria-expanded={false}
            aria-controls={bodyId}
            className="mt-1 font-mono text-[13px] font-semibold text-primary hover:underline hover:underline-offset-4"
          >
            See more
          </button>
        )}
      </div>

      {media && (
        <div className="mt-4 border-y border-border/50 bg-black/30">
          {/* eslint-disable-next-line @next/next/no-img-element -- post images have unknown sizes */}
          <img
            src={asset(media.src)}
            alt={media.alt}
            loading="lazy"
            className="mx-auto max-h-[34rem] w-full object-contain"
          />
        </div>
      )}

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pt-4 md:px-5">
          {post.tags.map((tag) => (
            <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`} replace scroll={false}>
              <Badge variant="outline" className="cursor-pointer font-mono text-[11px]">
                #{tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <footer className="mt-4 grid grid-cols-2 border-t border-border/50 font-mono text-[13px] text-muted-foreground">
        <Link
          href={`/blog/${post.slug}`}
          className="flex items-center justify-center gap-1.5 py-2.5 transition-colors hover:bg-accent/40 hover:text-foreground"
        >
          <ArrowUpRight className="size-4" aria-hidden />
          open post
        </Link>
        <button
          type="button"
          onClick={share}
          className="flex items-center justify-center gap-1.5 border-l border-border/50 py-2.5 transition-colors hover:bg-accent/40 hover:text-foreground"
        >
          {copied ? <Check className="size-4 text-primary" aria-hidden /> : <Share2 className="size-4" aria-hidden />}
          <span aria-live="polite">{copied ? "link copied" : "share"}</span>
        </button>
      </footer>
    </article>
  );
}
