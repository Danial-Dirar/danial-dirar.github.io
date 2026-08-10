import { asset } from "@/lib/asset";

/**
 * `<img>` replacement for MDX bodies.
 *
 * MDX renders Markdown images to a bare `<img>`, which never picks up the
 * deployment base path — so `/blog/foo/bar.jpg` 404s while the site is served
 * from a project page at `/portfolio`. Routing the src through `asset()` fixes
 * that, and is a no-op once the site moves to the root URL.
 *
 * `next/image` is not used here: post images have unknown intrinsic dimensions
 * and `images.unoptimized` means it would buy nothing anyway.
 */
export function MdxImage({
  src,
  alt,
  ...props
}: React.ComponentProps<"img">) {
  const resolved = typeof src === "string" ? asset(src) : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={resolved}
      alt={alt ?? ""}
      loading="lazy"
      className="mx-auto h-auto max-w-full rounded-xl border border-border/60"
    />
  );
}
