import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PostBody } from "@/components/mdx/post-body";
import { AuthorCard, SideList } from "@/components/blog/author-card";
import { formatDate, getAllPosts, getPost } from "@/lib/blog";
import { site } from "@/lib/site";
import { asset } from "@/lib/asset";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: post.cover ? { images: [post.cover] } : undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="relative pt-28 pb-20 md:pt-36">
      <div className="absolute inset-0 -z-10 bg-grid mask-fade" />
      <div className="container-page">
        <div className="grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,46rem)_17rem] xl:justify-between">
          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <AuthorCard />
          </aside>
          <div className="min-w-0">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 font-mono text-[13px] text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-3.5" />
          cd ../blog
        </Link>

        <header className="mt-6">
          <p className="font-mono text-sm text-muted-foreground">
            {formatDate(post.date)} · {site.name}
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="outline" className="cursor-pointer font-mono text-[11px]">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        </header>

        {post.cover && (
          <div className="relative mt-8 aspect-[16/8] overflow-hidden rounded-xl border border-border/60">
            <Image
              src={asset(post.cover)}
              alt=""
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="prose-blog mt-8">
          <PostBody source={post.content} />
        </div>
          </div>
          <aside className="hidden xl:sticky xl:top-24 xl:block">
            <SideList
              title="tail blog.log"
              items={getAllPosts()
                .filter((p) => p.slug !== post.slug)
                .slice(0, 5)
                .map((p) => ({ href: `/blog/${p.slug}`, label: p.title, meta: formatDate(p.date) }))}
            />
          </aside>
        </div>
      </div>
    </article>
  );
}
