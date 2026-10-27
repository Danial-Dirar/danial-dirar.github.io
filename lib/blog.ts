import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Post, PostMeta } from "./posts";

export type { Post, PostMeta } from "./posts";
export { formatDate } from "./posts";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function parseFile(fileName: string): Post {
  const slug = fileName.replace(/\.mdx?$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, fileName), "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "1970-01-01",
    tags: data.tags ?? [],
    excerpt: data.excerpt ?? "",
    cover: data.cover,
    content,
  };
}

/** All posts, newest first. */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map(parseFile)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of getAllPosts()) for (const t of post.tags) tags.add(t);
  return [...tags].sort();
}

/** Rough reading time at ~220 words a minute, never less than a minute. */
export function readingMinutes(post: Post): number {
  const words = post.content.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

const MD_IMAGE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)\s*/;
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The image a feed shows under a post, Facebook-style, and the body without
 * it so it isn't shown twice: the cover if there is one (dropping a copy of
 * it from the body), otherwise the first image in the body.
 */
export function splitLeadMedia(post: Post): {
  media?: { src: string; alt: string };
  body: string;
} {
  if (post.cover) {
    const copy = new RegExp(`!\\[[^\\]]*\\]\\(${escapeRegExp(post.cover)}[^)]*\\)\\s*`);
    return { media: { src: post.cover, alt: "" }, body: post.content.replace(copy, "") };
  }
  const first = MD_IMAGE.exec(post.content);
  if (!first) return { body: post.content };
  return {
    media: { src: first[2], alt: first[1] },
    body: post.content.replace(first[0], ""),
  };
}

/** A post without its body — what client components need. */
export function postMeta(p: Post): PostMeta {
  return { slug: p.slug, title: p.title, date: p.date, tags: p.tags, excerpt: p.excerpt, cover: p.cover };
}
