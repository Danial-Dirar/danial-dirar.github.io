import type { Metadata } from "next";
import { Suspense } from "react";
import { Reveal } from "@/components/motion/reveal";
import { BlogFeed, BlogFeedView } from "@/components/blog/blog-feed";
import { FeedPost } from "@/components/blog/feed-post";
import { PostBody } from "@/components/mdx/post-body";
import {
  getAllPosts,
  getAllTags,
  postMeta,
  readingMinutes,
  splitLeadMedia,
} from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on machine learning, generative AI, and building local AI for business.",
};

export default function BlogPage() {
  const tags = getAllTags();
  const all = getAllPosts();
  // The client only needs metadata to filter; bodies are rendered here, on
  // the server, and passed in as children.
  const posts = all.map(postMeta);

  // The whole feed, rendered once: each post in full, social-post style.
  const feed = all.map((post) => {
    const { media, body } = splitLeadMedia(post);
    return (
      <FeedPost key={post.slug} post={postMeta(post)} minutes={readingMinutes(post)} media={media}>
        <PostBody source={body} />
      </FeedPost>
    );
  });

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

        {/* Search params are only known in the browser: the static HTML
            carries the unfiltered feed, then the client applies ?tag=. */}
        <Suspense
          fallback={
            <BlogFeedView posts={posts} tags={tags} activeTag={null}>
              {feed}
            </BlogFeedView>
          }
        >
          <BlogFeed posts={posts} tags={tags}>
            {feed}
          </BlogFeed>
        </Suspense>
      </div>
    </section>
  );
}
