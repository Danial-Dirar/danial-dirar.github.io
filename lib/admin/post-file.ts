/**
 * Turning composer fields into the `.mdx` file the blog reads.
 *
 * Deliberately mirrors `studio/server.mjs` so a post written from the phone and
 * a post written from the local studio produce byte-identical frontmatter.
 */

export type PostDraft = {
  title: string;
  body: string;
  tags: string[];
  excerpt: string;
  cover?: string;
};

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "post"
  );
}

/** Append -2, -3, … until the slug is free. */
export function uniqueSlug(base: string, taken: readonly string[]): string {
  const existing = new Set(taken);
  if (!existing.has(base)) return base;
  let n = 2;
  while (existing.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/**
 * Auto-excerpt: drop Markdown syntax but keep the words — hyphens inside words
 * survive ("San Francisco-based") — and end on a word boundary.
 */
export function deriveExcerpt(body: string, max = 160): string {
  const text = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  const end = cut.lastIndexOf(" ");
  const clipped = end > max * 0.6 ? cut.slice(0, end) : text.slice(0, max);
  return `${clipped.replace(/[\s,;:.—-]+$/, "")}…`;
}

/** YAML frontmatter with JSON-quoted scalars — valid YAML, safely escaped. */
export function buildFrontmatter(
  draft: PostDraft & { date: string },
): string {
  const lines = [
    `title: ${JSON.stringify(draft.title)}`,
    `date: ${JSON.stringify(draft.date)}`,
    `tags: [${draft.tags.map((t) => JSON.stringify(t)).join(", ")}]`,
    `excerpt: ${JSON.stringify(draft.excerpt)}`,
  ];
  if (draft.cover) lines.push(`cover: ${JSON.stringify(draft.cover)}`);
  return `---\n${lines.join("\n")}\n---\n`;
}

export function buildPostFile(draft: PostDraft & { date: string }): string {
  return `${buildFrontmatter(draft)}\n${draft.body.trim()}\n`;
}

/** Unwrap a YAML scalar. Our own writer emits JSON strings; hand-written posts
 * may use single quotes or none at all. */
function parseScalar(raw: string): string {
  const value = raw.trim();
  if (value.startsWith('"')) {
    try {
      return JSON.parse(value) as string;
    } catch {
      return value.slice(1, -1);
    }
  }
  if (value.startsWith("'")) return value.slice(1, -1).replace(/''/g, "'");
  return value;
}

function parseList(raw: string): string[] {
  const value = raw.trim();
  if (!value.startsWith("[")) return [];
  const inner = value.slice(1, value.endsWith("]") ? -1 : undefined);
  return inner
    .split(",")
    .map((item) => parseScalar(item))
    .filter(Boolean);
}

/**
 * Read back a post file into composer fields.
 *
 * This parses the subset of YAML the blog actually uses — flat `key: value`
 * pairs plus an inline or block `tags` list — rather than pulling in a YAML
 * library, since `gray-matter` is server-only and this runs in the browser.
 */
export function parsePostFile(raw: string): PostDraft & { date: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  const body = match ? raw.slice(match[0].length) : raw;
  const fields: Record<string, string> = {};
  const tags: string[] = [];

  if (match) {
    const lines = match[1].split(/\r?\n/);
    let collectingTags = false;

    for (const line of lines) {
      const blockItem = /^\s*-\s+(.*)$/.exec(line);
      if (collectingTags && blockItem) {
        tags.push(parseScalar(blockItem[1]));
        continue;
      }
      collectingTags = false;

      const pair = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
      if (!pair) continue;
      const [, key, value] = pair;
      if (key === "tags") {
        if (value.trim() === "") collectingTags = true;
        else tags.push(...parseList(value));
        continue;
      }
      fields[key] = parseScalar(value);
    }
  }

  return {
    title: fields.title ?? "",
    date: fields.date ?? new Date().toISOString().slice(0, 10),
    tags,
    excerpt: fields.excerpt ?? "",
    cover: fields.cover || undefined,
    body: body.replace(/^\r?\n/, "").trimEnd(),
  };
}

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const ACCEPTED_IMAGE_TYPES = Object.keys(IMAGE_EXTENSIONS);

/** Max bytes per image. GitHub's blob API is fine well past this; the limit is
 * about keeping the repo and the page weight sane. */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function imageExtension(mimeType: string): string | undefined {
  return IMAGE_EXTENSIONS[mimeType];
}

/** `public/blog/<slug>/<name>` → the URL the post references. */
export function imagePublicPath(slug: string, fileName: string): string {
  return `/blog/${slug}/${fileName}`;
}

/**
 * Point every reference to `fileNames` at `slug`'s image directory.
 *
 * Images are inserted into the body using whatever slug the title implied at
 * that moment. Editing the title afterwards changes the slug, which would
 * otherwise leave the body pointing at a directory that never gets committed.
 */
export function retargetImagePaths(
  body: string,
  fileNames: readonly string[],
  slug: string,
): string {
  return fileNames.reduce((text, fileName) => {
    const escaped = fileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`/blog/[^)\\s]*?/${escaped}`, "g");
    return text.replace(pattern, imagePublicPath(slug, fileName));
  }, body);
}
