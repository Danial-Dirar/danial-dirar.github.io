"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { commitFiles, type PendingFile } from "@/lib/admin/github";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  buildPostFile,
  deriveExcerpt,
  imageExtension,
  imagePublicPath,
  retargetImagePaths,
  slugify,
  uniqueSlug,
} from "@/lib/admin/post-file";
import type { RepoTarget } from "@/lib/admin/vault";

type Attachment = {
  /** File name inside public/blog/<slug>/ */
  name: string;
  base64: string;
  previewUrl: string;
};

const inputClass =
  "w-full rounded-lg border border-border/60 bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:border-primary";
const labelClass = "mb-1.5 block font-mono text-[11px] text-muted-foreground";

/** Strip the `data:<mime>;base64,` prefix a FileReader data URL carries. */
const stripDataUrl = (dataUrl: string) => dataUrl.slice(dataUrl.indexOf(",") + 1);

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(stripDataUrl(reader.result as string));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export function Composer({
  token,
  target,
  existingSlugs,
  onPublished,
}: {
  token: string;
  target: RepoTarget;
  existingSlugs: string[];
  onPublished: (slug: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [cover, setCover] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const draftSlug = uniqueSlug(slugify(title || "post"), existingSlugs);

  function insertAtCursor(snippet: string) {
    const field = bodyRef.current;
    if (!field) {
      setBody((current) => `${current}\n${snippet}\n`);
      return;
    }
    const { selectionStart, selectionEnd } = field;
    setBody(
      (current) =>
        `${current.slice(0, selectionStart)}${snippet}${current.slice(selectionEnd)}`,
    );
    // Restore focus after React commits the new value.
    requestAnimationFrame(() => {
      field.focus();
      const caret = selectionStart + snippet.length;
      field.setSelectionRange(caret, caret);
    });
  }

  async function addFiles(files: FileList | File[]) {
    setError("");
    const accepted: Attachment[] = [];

    for (const file of Array.from(files)) {
      const extension = imageExtension(file.type);
      if (!extension) {
        setError(`${file.name}: only JPG, PNG, WebP and GIF are supported.`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError(
          `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${
            MAX_IMAGE_BYTES / 1024 / 1024
          } MB.`,
        );
        continue;
      }

      const base = slugify(file.name.replace(/\.[^.]+$/, ""));
      const taken = new Set([...attachments, ...accepted].map((a) => a.name));
      let name = `${base}.${extension}`;
      let n = 2;
      while (taken.has(name)) name = `${base}-${n++}.${extension}`;

      accepted.push({
        name,
        base64: await readAsBase64(file),
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (accepted.length === 0) return;
    setAttachments((current) => [...current, ...accepted]);
    insertAtCursor(
      accepted
        .map((file) => `\n![](${imagePublicPath(draftSlug, file.name)})\n`)
        .join(""),
    );
  }

  function removeAttachment(name: string) {
    setAttachments((current) => {
      const match = current.find((a) => a.name === name);
      if (match) URL.revokeObjectURL(match.previewUrl);
      return current.filter((a) => a.name !== name);
    });
    if (cover.endsWith(`/${name}`)) setCover("");
  }

  async function handlePublish() {
    setError("");
    if (!title.trim()) return setError("Give the post a title.");
    if (!body.trim()) return setError("Write something first.");

    setBusy(true);
    try {
      const slug = uniqueSlug(slugify(title), existingSlugs);
      const finalBody = retargetImagePaths(
        body,
        attachments.map((a) => a.name),
        slug,
      );
      const finalCover = cover
        ? imagePublicPath(slug, cover.split("/").pop() ?? "")
        : undefined;

      const mdx = buildPostFile({
        title: title.trim(),
        body: finalBody,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        excerpt: excerpt.trim() || deriveExcerpt(finalBody),
        cover: finalCover,
        date: new Date().toISOString().slice(0, 10),
      });

      const files: PendingFile[] = [
        { path: `content/blog/${slug}.mdx`, encoding: "utf-8", content: mdx },
        ...attachments.map(
          (file): PendingFile => ({
            path: `public/blog/${slug}/${file.name}`,
            encoding: "base64",
            content: file.base64,
          }),
        ),
      ];

      await commitFiles(token, target, `blog: ${title.trim()}`, files);

      attachments.forEach((a) => URL.revokeObjectURL(a.previewUrl));
      setTitle("");
      setBody("");
      setTags("");
      setExcerpt("");
      setCover("");
      setAttachments([]);
      onPublished(slug);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 grid gap-5">
      <div>
        <label className={labelClass} htmlFor="title">
          title
        </label>
        <input
          id="title"
          className={`${inputClass} text-base`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give it a title…"
          autoComplete="off"
        />
        {title.trim() && (
          <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
            /blog/{draftSlug}
          </p>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void addFiles(e.dataTransfer.files);
        }}
      >
        <label className={labelClass} htmlFor="body">
          what&apos;s on your mind? (markdown — drop images anywhere here)
        </label>
        <textarea
          id="body"
          ref={bodyRef}
          className={`${inputClass} min-h-56 resize-y ${
            dragging ? "border-primary" : ""
          }`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="# headings, **bold**, `code`, [links](url)…"
        />
      </div>

      <div>
        <input
          id="images"
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById("images")?.click()}
        >
          Add image
        </Button>

        {attachments.length > 0 && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {attachments.map((file) => {
              const isCover = cover.endsWith(`/${file.name}`);
              return (
                <div
                  key={file.name}
                  className="flex items-center gap-3 rounded-lg border border-border/60 p-2"
                >
                  {/* Local object URL for preview only; next/image adds nothing here. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.previewUrl}
                    alt=""
                    className="size-12 shrink-0 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[12px]">{file.name}</p>
                    <div className="mt-1 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCover(
                            isCover ? "" : imagePublicPath(draftSlug, file.name),
                          )
                        }
                        className="font-mono text-[11px] text-muted-foreground hover:text-primary"
                      >
                        {isCover ? "cover ✓" : "set as cover"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAttachment(file.name)}
                        className="font-mono text-[11px] text-muted-foreground hover:text-destructive"
                      >
                        remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {cover && (
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            Cover images are cropped to 16:8 — portrait images look better left
            inline.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="tags">
            tags (comma separated)
          </label>
          <input
            id="tags"
            className={inputClass}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="ml, notes"
            autoComplete="off"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="excerpt">
            excerpt (optional)
          </label>
          <input
            id="excerpt"
            className={inputClass}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Auto-generated from the body if left blank"
            autoComplete="off"
          />
        </div>
      </div>

      {tags.trim() && (
        <div className="flex flex-wrap gap-1.5">
          {tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .map((t) => (
              <Badge key={t} variant="outline" className="font-mono text-[11px]">
                #{t}
              </Badge>
            ))}
        </div>
      )}

      {error && <p className="font-mono text-[13px] text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="button" size="lg" onClick={handlePublish} disabled={busy}>
          {busy ? "Publishing…" : "Post"}
        </Button>
        <span className="font-mono text-[11px] text-muted-foreground">
          commits to {target.owner}/{target.repo} — live in ~1 min
        </span>
      </div>
    </div>
  );
}
