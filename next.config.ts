import type { NextConfig } from "next";

// When deployed to a GitHub *project* page (e.g. danial-dirar.github.io/portfolio)
// the site lives under a sub-path. Set PAGES_BASE_PATH="/portfolio" in that case.
// For a user site (danial-dirar.github.io) leave it empty. The Pages workflow
// injects this automatically.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Static HTML export so the site can be served from GitHub Pages.
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  // GitHub Pages has no image-optimization server; serve images as-is.
  images: { unoptimized: true },
  // Expose the base path to client code that builds asset URLs by hand.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // React <ViewTransition>: project covers morph from card to case study.
  experimental: { viewTransition: true },
  turbopack: {
    // A stray lockfile exists in the home directory; pin the workspace root.
    root: __dirname,
  },
};

export default nextConfig;
