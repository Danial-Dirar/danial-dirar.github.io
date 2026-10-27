import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { projects } from "@/lib/data/projects";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${site.url}${path}`;
  return [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    { url: url("/projects"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/research"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/blog"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/about"), changeFrequency: "monthly", priority: 0.8 },
    ...projects.map((p) => ({
      url: url(`/projects/${p.slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...getAllPosts().map((post) => ({
      url: url(`/blog/${post.slug}`),
      lastModified: post.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
