import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { BlogFeed } from "@/components/blog/blog-feed";
import { getAllPosts, getAllTags, type PostMeta } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on machine learning, generative AI, and building local AI for business.",
};

export default function BlogPage() {
  const tags = getAllTags();
  // Strip MDX bodies — the feed only needs metadata, and this keeps the
  // client payload small.
  const posts: PostMeta[] = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    tags: p.tags,
    excerpt: p.excerpt,
    cover: p.cover,
  }));

  return (
    <section className="relative pt-28 pb-20 md:pt-36">
      <div className="absolute inset-0 -z-10 bg-grid mask-fade" />
      <div className="container-page max-w-3xl">
        <Reveal>
          <h1 className="font-mono text-2xl font-semibold tracking-tight md:text-3xl">
            <span className="text-primary">$ </span>cat blog.log
          </h1>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-5 text-muted-foreground">
            Notes on ML, generative AI, and local AI for business — with the
            occasional build log.
          </p>
        </Reveal>

        <BlogFeed posts={posts} tags={tags} />
      </div>
    </section>
  );
}
