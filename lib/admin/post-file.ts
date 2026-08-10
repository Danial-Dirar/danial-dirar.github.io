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

/** Auto-excerpt: strip Markdown punctuation, collapse whitespace, clamp. */
export function deriveExcerpt(body: string): string {
  return body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/[#>*`_\-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
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
